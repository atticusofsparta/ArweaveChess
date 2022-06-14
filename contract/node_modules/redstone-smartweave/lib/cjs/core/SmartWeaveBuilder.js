"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartWeaveBuilder = exports.R_GW_URL = void 0;
const _smartweave_1 = require("..");
exports.R_GW_URL = 'https://d1o5nlqr4okus2.cloudfront.net';
class SmartWeaveBuilder {
    constructor(_arweave) {
        this._arweave = _arweave;
        this._useRedstoneGwInfo = false;
    }
    setDefinitionLoader(value) {
        this._definitionLoader = value;
        return this;
    }
    setInteractionsLoader(value) {
        this._interactionsLoader = value;
        return this;
    }
    setCacheableInteractionsLoader(value, maxStoredInMemoryBlockHeights = 1) {
        this._interactionsLoader = new _smartweave_1.CacheableContractInteractionsLoader(value, new _smartweave_1.MemBlockHeightSwCache(maxStoredInMemoryBlockHeights));
        return this;
    }
    setInteractionsSorter(value) {
        this._interactionsSorter = value;
        return this;
    }
    setExecutorFactory(value) {
        this._executorFactory = value;
        return this;
    }
    setStateEvaluator(value) {
        this._stateEvaluator = value;
        return this;
    }
    overwriteSource(sourceCode) {
        if (this._executorFactory == null) {
            throw new Error('Set base ExecutorFactory first');
        }
        this._executorFactory = new _smartweave_1.DebuggableExecutorFactory(this._executorFactory, sourceCode);
        return this.build();
    }
    useRedStoneGateway(confirmationStatus = null, source = null, address = exports.R_GW_URL) {
        this._interactionsLoader = new _smartweave_1.RedstoneGatewayInteractionsLoader(address, confirmationStatus, source);
        this._definitionLoader = new _smartweave_1.RedstoneGatewayContractDefinitionLoader(address, this._arweave, new _smartweave_1.MemCache());
        this._useRedstoneGwInfo = true;
        return this;
    }
    useArweaveGateway() {
        this._definitionLoader = new _smartweave_1.ContractDefinitionLoader(this._arweave, new _smartweave_1.MemCache());
        this._interactionsLoader = new _smartweave_1.CacheableContractInteractionsLoader(new _smartweave_1.ArweaveGatewayInteractionsLoader(this._arweave), new _smartweave_1.MemBlockHeightSwCache(1));
        this._useRedstoneGwInfo = false;
        return this;
    }
    useRedStoneGwInfo() {
        this._useRedstoneGwInfo = true;
        return this;
    }
    build() {
        return new _smartweave_1.SmartWeave(this._arweave, this._definitionLoader, this._interactionsLoader, this._interactionsSorter, this._executorFactory, this._stateEvaluator, this._useRedstoneGwInfo);
    }
}
exports.SmartWeaveBuilder = SmartWeaveBuilder;
//# sourceMappingURL=SmartWeaveBuilder.js.map