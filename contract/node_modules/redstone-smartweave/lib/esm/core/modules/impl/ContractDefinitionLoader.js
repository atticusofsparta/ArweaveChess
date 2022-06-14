import { ArweaveWrapper, Benchmark, getTag, LoggerFactory, SmartWeaveTags } from '../../..';
import { WasmSrc } from './wasm/WasmSrc';
const supportedSrcContentTypes = ['application/javascript', 'application/wasm'];
export class ContractDefinitionLoader {
    constructor(arweave, 
    // TODO: cache should be removed from the core layer and implemented in a wrapper of the core implementation
    cache) {
        this.arweave = arweave;
        this.cache = cache;
        this.logger = LoggerFactory.INST.create('ContractDefinitionLoader');
        this.arweaveWrapper = new ArweaveWrapper(arweave);
    }
    async load(contractTxId, evolvedSrcTxId) {
        var _a, _b, _c;
        if (!evolvedSrcTxId && ((_a = this.cache) === null || _a === void 0 ? void 0 : _a.contains(contractTxId))) {
            this.logger.debug('ContractDefinitionLoader: Hit from cache!');
            return Promise.resolve((_b = this.cache) === null || _b === void 0 ? void 0 : _b.get(contractTxId));
        }
        const benchmark = Benchmark.measure();
        const contract = await this.doLoad(contractTxId, evolvedSrcTxId);
        this.logger.info(`Contract definition loaded in: ${benchmark.elapsed()}`);
        (_c = this.cache) === null || _c === void 0 ? void 0 : _c.put(contractTxId, contract);
        return contract;
    }
    async doLoad(contractTxId, forcedSrcTxId) {
        const benchmark = Benchmark.measure();
        const contractTx = await this.arweaveWrapper.tx(contractTxId);
        const owner = await this.arweave.wallets.ownerToAddress(contractTx.owner);
        this.logger.debug('Contract tx and owner', benchmark.elapsed());
        benchmark.reset();
        const contractSrcTxId = forcedSrcTxId ? forcedSrcTxId : getTag(contractTx, SmartWeaveTags.CONTRACT_SRC_TX_ID);
        const minFee = getTag(contractTx, SmartWeaveTags.MIN_FEE);
        this.logger.debug('Tags decoding', benchmark.elapsed());
        benchmark.reset();
        const contractSrcTx = await this.arweaveWrapper.tx(contractSrcTxId);
        const srcContentType = getTag(contractSrcTx, SmartWeaveTags.CONTENT_TYPE);
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
            wasmSrc = new WasmSrc(src);
            srcWasmLang = getTag(contractSrcTx, SmartWeaveTags.WASM_LANG);
            if (!srcWasmLang) {
                throw new Error(`Wasm lang not set for wasm contract src ${contractSrcTxId}`);
            }
            srcMetaData = JSON.parse(getTag(contractSrcTx, SmartWeaveTags.WASM_META));
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
        if (getTag(contractTx, SmartWeaveTags.INIT_STATE)) {
            return getTag(contractTx, SmartWeaveTags.INIT_STATE);
        }
        else if (getTag(contractTx, SmartWeaveTags.INIT_STATE_TX)) {
            const stateTX = getTag(contractTx, SmartWeaveTags.INIT_STATE_TX);
            return this.arweaveWrapper.txDataString(stateTX);
        }
        else {
            return this.arweaveWrapper.txDataString(contractTx.id);
        }
    }
}
//# sourceMappingURL=ContractDefinitionLoader.js.map