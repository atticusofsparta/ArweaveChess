"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedstoneGatewayContractDefinitionLoader = void 0;
const _smartweave_1 = require("../../..");
const ContractDefinitionLoader_1 = require("./ContractDefinitionLoader");
require("redstone-isomorphic");
const WasmSrc_1 = require("./wasm/WasmSrc");
const transaction_1 = __importDefault(require("arweave/node/lib/transaction"));
/**
 * An extension to {@link ContractDefinitionLoader} that makes use of
 * Redstone Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * to load Contract Data.
 *
 * If the contract data is not available on RedStone Gateway - it fallbacks to default implementation
 * in {@link ContractDefinitionLoader} - i.e. loads the definition from Arweave gateway.
 */
class RedstoneGatewayContractDefinitionLoader extends ContractDefinitionLoader_1.ContractDefinitionLoader {
    constructor(baseUrl, arweave, cache) {
        super(arweave, cache);
        this.baseUrl = baseUrl;
        this.rLogger = _smartweave_1.LoggerFactory.INST.create('RedstoneGatewayContractDefinitionLoader');
        this.baseUrl = (0, _smartweave_1.stripTrailingSlash)(baseUrl);
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
                const wasmSrc = new WasmSrc_1.WasmSrc(result.srcBinary);
                result.srcBinary = wasmSrc.wasmBinary();
                let sourceTx;
                if (result.srcTx) {
                    sourceTx = new transaction_1.default({ ...result.srcTx });
                }
                else {
                    sourceTx = await this.arweaveWrapper.tx(result.srcTxId);
                }
                const srcMetaData = JSON.parse((0, _smartweave_1.getTag)(sourceTx, _smartweave_1.SmartWeaveTags.WASM_META));
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
exports.RedstoneGatewayContractDefinitionLoader = RedstoneGatewayContractDefinitionLoader;
//# sourceMappingURL=RedstoneGatewayContractDefinitionLoader.js.map