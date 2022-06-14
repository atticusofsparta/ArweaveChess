import { Benchmark, canBeCached, EvalStateResult, LoggerFactory, TagsParser } from '../../..';
import { ProofHoHash } from '@idena/vrf-js';
import elliptic from 'elliptic';
const EC = new elliptic.ec('secp256k1');
/**
 * This class contains the base functionality of evaluating the contracts state - according
 * to the SmartWeave protocol.
 * Marked as abstract - as without help of any cache - the evaluation in real-life applications
 * would be really slow - so using this class without any caching ({@link CacheableStateEvaluator})
 * mechanism built on top makes no sense.
 */
export class DefaultStateEvaluator {
    constructor(arweave, executionContextModifiers = []) {
        this.arweave = arweave;
        this.executionContextModifiers = executionContextModifiers;
        this.logger = LoggerFactory.INST.create('DefaultStateEvaluator');
        this.tagsParser = new TagsParser();
    }
    async eval(executionContext, currentTx) {
        return this.doReadState(executionContext.sortedInteractions, new EvalStateResult(executionContext.contractDefinition.initState, {}), executionContext, currentTx);
    }
    async doReadState(missingInteractions, baseState, executionContext, currentTx) {
        const { ignoreExceptions, stackTrace, internalWrites } = executionContext.evaluationOptions;
        const { contract, contractDefinition, sortedInteractions } = executionContext;
        let currentState = baseState.state;
        const validity = baseState.validity;
        executionContext === null || executionContext === void 0 ? void 0 : executionContext.handler.initState(currentState);
        this.logger.debug(`Evaluating state for ${contractDefinition.txId} [${missingInteractions.length} non-cached of ${sortedInteractions.length} all]`);
        let errorMessage = null;
        let lastConfirmedTxState = null;
        const missingInteractionsLength = missingInteractions.length;
        executionContext.handler.initState(currentState);
        for (let i = 0; i < missingInteractionsLength; i++) {
            const missingInteraction = missingInteractions[i];
            const singleInteractionBenchmark = Benchmark.measure();
            const interactionTx = missingInteraction.node;
            if (interactionTx.vrf) {
                if (!this.verifyVrf(interactionTx.vrf, interactionTx.sortKey, this.arweave)) {
                    throw new Error('Vrf verification failed.');
                }
            }
            this.logger.debug(`[${contractDefinition.txId}][${missingInteraction.node.id}][${missingInteraction.node.block.height}]: ${missingInteractions.indexOf(missingInteraction) + 1}/${missingInteractions.length} [of all:${sortedInteractions.length}]`);
            const isInteractWrite = this.tagsParser.isInteractWrite(missingInteraction, contractDefinition.txId);
            // other contract makes write ("writing contract") on THIS contract
            if (isInteractWrite && internalWrites) {
                // evaluating txId of the contract that is writing on THIS contract
                const writingContractTxId = this.tagsParser.getContractTag(missingInteraction);
                this.logger.debug('Loading writing contract', writingContractTxId);
                const interactionCall = contract
                    .getCallStack()
                    .addInteractionData({ interaction: null, interactionTx, currentTx });
                // creating a Contract instance for the "writing" contract
                const writingContract = executionContext.smartweave.contract(writingContractTxId, executionContext.contract, interactionTx);
                this.logger.debug('Reading state of the calling contract', interactionTx.block.height);
                /**
                 Reading the state of the writing contract.
                 This in turn will cause the state of THIS contract to be
                 updated in cache - see {@link ContractHandlerApi.assignWrite}
                 */
                await writingContract.readState(interactionTx.block.height, [
                    ...(currentTx || []),
                    {
                        contractTxId: contractDefinition.txId,
                        interactionTxId: missingInteraction.node.id
                    }
                ]);
                // loading latest state of THIS contract from cache
                const newState = await this.latestAvailableState(contractDefinition.txId, interactionTx.block.height);
                this.logger.debug('New state:', {
                    height: interactionTx.block.height,
                    newState,
                    txId: contractDefinition.txId
                });
                if (newState !== null) {
                    currentState = newState.cachedValue.state;
                    // we need to update the state in the wasm module
                    executionContext === null || executionContext === void 0 ? void 0 : executionContext.handler.initState(currentState);
                    validity[interactionTx.id] = newState.cachedValue.validity[interactionTx.id];
                    const toCache = new EvalStateResult(currentState, validity);
                    // TODO: probably a separate hook should be created here
                    // to fix https://github.com/redstone-finance/redstone-smartcontracts/issues/109
                    await this.onStateUpdate(interactionTx, executionContext, toCache);
                    if (canBeCached(interactionTx)) {
                        lastConfirmedTxState = {
                            tx: interactionTx,
                            state: toCache
                        };
                    }
                }
                else {
                    validity[interactionTx.id] = false;
                }
                interactionCall.update({
                    cacheHit: false,
                    intermediaryCacheHit: false,
                    outputState: stackTrace.saveState ? currentState : undefined,
                    executionTime: singleInteractionBenchmark.elapsed(true),
                    valid: validity[interactionTx.id],
                    errorMessage: errorMessage,
                    gasUsed: 0 // TODO...
                });
                this.logger.debug('New state after internal write', { contractTxId: contractDefinition.txId, newState });
            }
            else {
                // "direct" interaction with this contract - "standard" processing
                const inputTag = this.tagsParser.getInputTag(missingInteraction, executionContext.contractDefinition.txId);
                if (!inputTag) {
                    this.logger.error(`Skipping tx - Input tag not found for ${interactionTx.id}`);
                    continue;
                }
                const input = this.parseInput(inputTag);
                if (!input) {
                    this.logger.error(`Skipping tx - invalid Input tag - ${interactionTx.id}`);
                    continue;
                }
                const interaction = {
                    input,
                    caller: interactionTx.owner.address
                };
                const interactionData = {
                    interaction,
                    interactionTx,
                    currentTx
                };
                this.logger.debug('Interaction:', interaction);
                const interactionCall = contract.getCallStack().addInteractionData(interactionData);
                const result = await executionContext.handler.handle(executionContext, new EvalStateResult(currentState, validity), interactionData);
                errorMessage = result.errorMessage;
                this.logResult(result, interactionTx, executionContext);
                this.logger.debug('Interaction evaluation', singleInteractionBenchmark.elapsed());
                interactionCall.update({
                    cacheHit: false,
                    intermediaryCacheHit: false,
                    outputState: stackTrace.saveState ? currentState : undefined,
                    executionTime: singleInteractionBenchmark.elapsed(true),
                    valid: validity[interactionTx.id],
                    errorMessage: errorMessage,
                    gasUsed: result.gasUsed
                });
                if (result.type === 'exception' && ignoreExceptions !== true) {
                    throw new Error(`Exception while processing ${JSON.stringify(interaction)}:\n${result.errorMessage}`);
                }
                validity[interactionTx.id] = result.type === 'ok';
                currentState = result.state;
                const toCache = new EvalStateResult(currentState, validity);
                if (canBeCached(interactionTx)) {
                    lastConfirmedTxState = {
                        tx: interactionTx,
                        state: toCache
                    };
                }
                await this.onStateUpdate(interactionTx, executionContext, toCache, i);
            }
            // I'm really NOT a fan of this "modify" feature, but I don't have idea how to better
            // implement the "evolve" feature
            for (const { modify } of this.executionContextModifiers) {
                executionContext = await modify(currentState, executionContext);
            }
        }
        //this.logger.info('State evaluation total:', stateEvaluationBenchmark.elapsed());
        const evalStateResult = new EvalStateResult(currentState, validity);
        // state could have been fully retrieved from cache
        // or there were no interactions below requested block height
        if (lastConfirmedTxState !== null) {
            await this.onStateEvaluated(lastConfirmedTxState.tx, executionContext, lastConfirmedTxState.state);
        }
        return evalStateResult;
    }
    verifyVrf(vrf, sortKey, arweave) {
        const keys = EC.keyFromPublic(vrf.pubkey, 'hex');
        let hash;
        try {
            // ProofHoHash throws its own 'invalid vrf' exception
            hash = ProofHoHash(keys.getPublic(), arweave.utils.stringToBuffer(sortKey), arweave.utils.b64UrlToBuffer(vrf.proof));
        }
        catch (e) {
            return false;
        }
        return arweave.utils.bufferTob64Url(hash) == vrf.index;
    }
    logResult(result, currentTx, executionContext) {
        if (result.type === 'exception') {
            this.logger.error(`Executing of interaction: [${executionContext.contractDefinition.txId} -> ${currentTx.id}] threw exception:`, `${result.errorMessage}`);
        }
        if (result.type === 'error') {
            this.logger.warn(`Executing of interaction: [${executionContext.contractDefinition.txId} -> ${currentTx.id}] returned error:`, result.errorMessage);
        }
    }
    parseInput(inputTag) {
        try {
            return JSON.parse(inputTag.value);
        }
        catch (e) {
            this.logger.error(e);
            return null;
        }
    }
}
//# sourceMappingURL=DefaultStateEvaluator.js.map