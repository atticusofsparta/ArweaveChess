"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractDefinitionLoader = void 0;
const _smartweave_1 = require("../../..");
const WasmSrc_1 = require("./wasm/WasmSrc");
const supportedSrcContentTypes = ['application/javascript', 'application/wasm'];
class ContractDefinitionLoader {
    constructor(arweave, 
    // TODO: cache should be removed from the core layer and implemented in a wrapper of the core implementation
    cache) {
        this.arweave = arweave;
        this.cache = cache;
        this.logger = _smartweave_1.LoggerFactory.INST.create('ContractDefinitionLoader');
        this.arweaveWrapper = new _smartweave_1.ArweaveWrapper(arweave);
    }
    async load(contractTxId, evolvedSrcTxId) {
        var _a, _b, _c;
        if (!evolvedSrcTxId && ((_a = this.cache) === null || _a === void 0 ? void 0 : _a.contains(contractTxId))) {
            this.logger.debug('ContractDefinitionLoader: Hit from cache!');
            return Promise.resolve((_b = this.cache) === null || _b === void 0 ? void 0 : _b.get(contractTxId));
        }
        const benchmark = _smartweave_1.Benchmark.measure();
        const contract = await this.doLoad(contractTxId, evolvedSrcTxId);
        this.logger.info(`Contract definition loaded in: ${benchmark.elapsed()}`);
        (_c = this.cache) === null || _c === void 0 ? void 0 : _c.put(contractTxId, contract);
        return contract;
    }
    async doLoad(contractTxId, forcedSrcTxId) {
        const benchmark = _smartweave_1.Benchmark.measure();
        const contractTx = await this.arweaveWrapper.tx(contractTxId);
        const owner = await this.arweave.wallets.ownerToAddress(contractTx.owner);
        this.logger.debug('Contract tx and owner', benchmark.elapsed());
        benchmark.reset();
        const contractSrcTxId = forcedSrcTxId ? forcedSrcTxId : (0, _smartweave_1.getTag)(contractTx, _smartweave_1.SmartWeaveTags.CONTRACT_SRC_TX_ID);
        const minFee = (0, _smartweave_1.getTag)(contractTx, _smartweave_1.SmartWeaveTags.MIN_FEE);
        this.logger.debug('Tags decoding', benchmark.elapsed());
        benchmark.reset();
        const contractSrcTx = await this.arweaveWrapper.tx(contractSrcTxId);
        const srcContentType = (0, _smartweave_1.getTag)(contractSrcTx, _smartweave_1.SmartWeaveTags.CONTENT_TYPE);
        if (supportedSrcContentTypes.indexOf(srcContentType) == -1) {
            throw new Error(`Contract source content type ${srcContentType} not supported`);
        }
        const contractType = srcContentType == 'application/javascript' ? 'js' : 'wasm';
        const src = contractType == 'js'
            ? await this.arweaveWrapper.txDataString(contractSrcTxId)
            : await this.arweaveWrapper.txData(contractSrcTxId);
        let srcWasmLang;
        let wasmSrc;
        let srcMetaData;
        if (contractType == 'wasm') {
            wasmSrc = new WasmSrc_1.WasmSrc(src);
            srcWasmLang = (0, _smartweave_1.getTag)(contractSrcTx, _smartweave_1.SmartWeaveTags.WASM_LANG);
            if (!srcWasmLang) {
                throw new Error(`Wasm lang not set for wasm contract src ${contractSrcTxId}`);
            }
            srcMetaData = JSON.parse((0, _smartweave_1.getTag)(contractSrcTx, _smartweave_1.SmartWeaveTags.WASM_META));
        }
        this.logger.debug('Contract src tx load', benchmark.elapsed());
        benchmark.reset();
        const s = await this.evalInitialState(contractTx);
        this.logger.debug('init state', s);
        const initState = JSON.parse(await this.evalInitialState(contractTx));
        this.logger.debug('Parsing src and init state', benchmark.elapsed());
        return {
            txId: contractTxId,
            srcTxId: contractSrcTxId,
            src: contractType == 'js' ? src : null,
            srcBinary: contractType == 'wasm' ? wasmSrc.wasmBinary() : null,
            srcWasmLang,
            initState,
            minFee,
            owner,
            contractType,
            metadata: srcMetaData,
            contractTx: contractTx.toJSON(),
            srcTx: contractSrcTx.toJSON()
        };
    }
    async evalInitialState(contractTx) {
        if ((0, _smartweave_1.getTag)(contractTx, _smartweave_1.SmartWeaveTags.INIT_STATE)) {
            return (0, _smartweave_1.getTag)(contractTx, _smartweave_1.SmartWeaveTags.INIT_STATE);
        }
        else if ((0, _smartweave_1.getTag)(contractTx, _smartweave_1.SmartWeaveTags.INIT_STATE_TX)) {
            const stateTX = (0, _smartweave_1.getTag)(contractTx, _smartweave_1.SmartWeaveTags.INIT_STATE_TX);
            return this.arweaveWrapper.txDataString(stateTX);
        }
        else {
            return this.arweaveWrapper.txDataString(contractTx.id);
        }
    }
}
exports.ContractDefinitionLoader = ContractDefinitionLoader;
//# sourceMappingURL=ContractDefinitionLoader.js.map