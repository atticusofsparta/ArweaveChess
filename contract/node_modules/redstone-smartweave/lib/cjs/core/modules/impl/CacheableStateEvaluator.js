"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheableStateEvaluator = void 0;
const cache_1 = require("../../../cache/index");
const core_1 = require("../../index");
const logging_1 = require("../../../logging/index");
/**
 * An implementation of DefaultStateEvaluator that adds caching capabilities.
 *
 * The main responsibility of this class is to compute whether there are
 * any interaction transactions, for which the state hasn't been evaluated yet -
 * if so - it generates a list of such transactions and evaluates the state
 * for them - taking as an input state the last cached state.
 */
class CacheableStateEvaluator extends core_1.DefaultStateEvaluator {
    constructor(arweave, cache, executionContextModifiers = []) {
        super(arweave, executionContextModifiers);
        this.cache = cache;
        this.cLogger = logging_1.LoggerFactory.INST.create('CacheableStateEvaluator');
    }
    async eval(executionContext, currentTx) {
        var _a, _b;
        const requestedBlockHeight = executionContext.blockHeight;
        this.cLogger.debug(`Requested state block height: ${requestedBlockHeight}`);
        const cachedState = executionContext.cachedState;
        if ((cachedState === null || cachedState === void 0 ? void 0 : cachedState.cachedHeight) === requestedBlockHeight) {
            (_a = executionContext.handler) === null || _a === void 0 ? void 0 : _a.initState(cachedState.cachedValue.state);
            return cachedState.cachedValue;
        }
        this.cLogger.debug('executionContext.sortedInteractions', executionContext.sortedInteractions.length);
        const sortedInteractionsUpToBlock = executionContext.sortedInteractions.filter((tx) => {
            return tx.node.block.height <= executionContext.blockHeight;
        });
        let missingInteractions = sortedInteractionsUpToBlock.slice();
        this.cLogger.debug('missingInteractions', missingInteractions.length);
        // if there was anything to cache...
        if (sortedInteractionsUpToBlock.length > 0) {
            if (cachedState != null) {
                this.cLogger.debug(`Cached state for ${executionContext.contractDefinition.txId}`, {
                    cachedHeight: cachedState.cachedHeight,
                    requestedBlockHeight
                });
                // verify if for the requested block height there are any interactions
                // with higher block height than latest value stored in cache - basically if there are any non-cached interactions.
                missingInteractions = sortedInteractionsUpToBlock.filter(({ node }) => node.block.height > cachedState.cachedHeight && node.block.height <= requestedBlockHeight);
            }
            this.cLogger.debug(`Interactions until [${requestedBlockHeight}]`, {
                total: sortedInteractionsUpToBlock.length,
                cached: sortedInteractionsUpToBlock.length - missingInteractions.length
            });
            // TODO: this is tricky part, needs proper description
            // for now: it prevents from infinite loop calls between calls that are making
            // internal interact writes.
            for (const entry of currentTx || []) {
                if (entry.contractTxId === executionContext.contractDefinition.txId) {
                    const index = missingInteractions.findIndex((tx) => tx.node.id === entry.interactionTxId);
                    if (index !== -1) {
                        this.cLogger.debug('Inf. Loop fix - removing interaction', {
                            height: missingInteractions[index].node.block.height,
                            contractTxId: entry.contractTxId,
                            interactionTxId: entry.interactionTxId
                        });
                        missingInteractions.splice(index);
                    }
                }
            }
            // if cache is up-to date - return immediately to speed-up the whole process
            if (missingInteractions.length === 0 && cachedState) {
                this.cLogger.debug(`State up to requested height [${requestedBlockHeight}] fully cached!`);
                (_b = executionContext.handler) === null || _b === void 0 ? void 0 : _b.initState(cachedState.cachedValue.state);
                return cachedState.cachedValue;
            }
        }
        const baseState = cachedState == null ? executionContext.contractDefinition.initState : cachedState.cachedValue.state;
        const baseValidity = cachedState == null ? {} : cachedState.cachedValue.validity;
        // eval state for the missing transactions - starting from latest value from cache.
        return await this.doReadState(missingInteractions, new core_1.EvalStateResult(baseState, baseValidity), executionContext, currentTx);
    }
    async onStateEvaluated(transaction, executionContext, state) {
        const contractTxId = executionContext.contractDefinition.txId;
        this.cLogger.debug(`onStateEvaluated: cache update for contract ${contractTxId} [${transaction.block.height}]`);
        // this will be problematic if we decide to cache only "onStateEvaluated" and containsInteractionsFromSequencer = true
        // as a workaround, we're now caching every 100 interactions
        await this.putInCache(contractTxId, transaction, state, executionContext.blockHeight, executionContext.containsInteractionsFromSequencer);
        if (!executionContext.evaluationOptions.manualCacheFlush) {
            await this.cache.flush();
        }
    }
    async onStateUpdate(transaction, executionContext, state, nthInteraction) {
        if (executionContext.evaluationOptions.updateCacheForEachInteraction ||
            executionContext.evaluationOptions.internalWrites ||
            (nthInteraction || 1) % 100 == 0) {
            await this.putInCache(executionContext.contractDefinition.txId, transaction, state, executionContext.blockHeight, executionContext.containsInteractionsFromSequencer);
        }
    }
    async latestAvailableState(contractTxId, blockHeight) {
        this.cLogger.debug('Searching for', { contractTxId, blockHeight });
        const stateCache = (await this.cache.getLessOrEqual(contractTxId, blockHeight));
        this.cLogger.debug('Latest available state at', stateCache === null || stateCache === void 0 ? void 0 : stateCache.cachedHeight);
        if (stateCache == null) {
            return null;
        }
        return new cache_1.BlockHeightCacheResult(stateCache.cachedHeight, stateCache.cachedValue);
    }
    async onInternalWriteStateUpdate(transaction, contractTxId, state) {
        this.cLogger.debug('Internal write state update:', {
            height: transaction.block.height,
            contractTxId,
            state
        });
        await this.putInCache(contractTxId, transaction, state);
    }
    async onContractCall(transaction, executionContext, state) {
        await this.putInCache(executionContext.contractDefinition.txId, transaction, state);
    }
    async putInCache(contractTxId, transaction, state, requestedBlockHeight = null, containsInteractionsFromSequencer = false) {
        if (transaction.dry) {
            return;
        }
        if (transaction.confirmationStatus !== undefined && transaction.confirmationStatus !== 'confirmed') {
            return;
        }
        // example:
        // requested - 10
        // tx - 9, 10 - caching should be skipped
        const txBlockHeight = transaction.block.height;
        this.cLogger.debug(`requestedBlockHeight: ${requestedBlockHeight}, txBlockHeight: ${txBlockHeight}`);
        if (requestedBlockHeight !== null &&
            txBlockHeight >= requestedBlockHeight - 1 &&
            containsInteractionsFromSequencer) {
            this.cLogger.debug(`skipping caching of the last blocks`);
            return;
        }
        const transactionId = transaction.id;
        const stateToCache = new core_1.EvalStateResult(state.state, state.validity, transactionId, transaction.block.id);
        await this.cache.put(new cache_1.BlockHeightKey(contractTxId, txBlockHeight), stateToCache);
    }
    async flushCache() {
        return await this.cache.flush();
    }
    async syncState(contractTxId, blockHeight, transactionId, state, validity) {
        const stateToCache = new core_1.EvalStateResult(state, validity, transactionId);
        await this.cache.put(new cache_1.BlockHeightKey(contractTxId, blockHeight), stateToCache);
    }
}
exports.CacheableStateEvaluator = CacheableStateEvaluator;
//# sourceMappingURL=CacheableStateEvaluator.js.map