import { getTag, LoggerFactory, SmartWeaveTags, stripTrailingSlash } from '../../..';
import { ContractDefinitionLoader } from './ContractDefinitionLoader';
import 'redstone-isomorphic';
import { WasmSrc } from './wasm/WasmSrc';
import Transaction from 'arweave/node/lib/transaction';
/**
 * An extension to {@link ContractDefinitionLoader} that makes use of
 * Redstone Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * to load Contract Data.
 *
 * If the contract data is not available on RedStone Gateway - it fallbacks to default implementation
 * in {@link ContractDefinitionLoader} - i.e. loads the definition from Arweave gateway.
 */
export class RedstoneGatewayContractDefinitionLoader extends ContractDefinitionLoader {
    constructor(baseUrl, arweave, cache) {
        super(arweave, cache);
        this.baseUrl = baseUrl;
        this.rLogger = LoggerFactory.INST.create('RedstoneGatewayContractDefinitionLoader');
        this.baseUrl = stripTrailingSlash(baseUrl);
    }
    async doLoad(contractTxId, forcedSrcTxId) {
        if (forcedSrcTxId) {
            // no support for the evolve yet..
            return await super.doLoad(contractTxId, forcedSrcTxId);
        }
        try {
            const result = await fetch(`${this.baseUrl}/gateway/contracts/${contractTxId}`)
                .then((res) => {
                return res.ok ? res.json() : Promise.reject(res);
            })
                .catch((error) => {
                var _a, _b;
                if ((_a = error.body) === null || _a === void 0 ? void 0 : _a.message) {
                    this.rLogger.error(error.body.message);
                }
                throw new Error(`Unable to retrieve contract data. Redstone gateway responded with status ${error.status}:${(_b = error.body) === null || _b === void 0 ? void 0 : _b.message}`);
            });
            if (result.srcBinary != null && !(result.srcBinary instanceof Buffer)) {
                result.srcBinary = Buffer.from(result.srcBinary.data);
            }
            if (result.srcBinary) {
                const wasmSrc = new WasmSrc(result.srcBinary);
                result.srcBinary = wasmSrc.wasmBinary();
                let sourceTx;
                if (result.srcTx) {
                    sourceTx = new Transaction({ ...result.srcTx });
                }
                else {
                    sourceTx = await this.arweaveWrapper.tx(result.srcTxId);
                }
                const srcMetaData = JSON.parse(getTag(sourceTx, SmartWeaveTags.WASM_META));
                result.metadata = srcMetaData;
            }
            result.contractType = result.src ? 'js' : 'wasm';
            return result;
        }
        catch (e) {
            this.rLogger.warn('Falling back to default contracts loader', e);
            return await super.doLoad(contractTxId, forcedSrcTxId);
        }
    }
}
//# sourceMappingURL=RedstoneGatewayContractDefinitionLoader.js.map