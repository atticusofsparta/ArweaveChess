"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCreateContract = void 0;
/* eslint-disable */
const core_1 = require("../../index");
const logging_1 = require("../../../logging/index");
const go_wasm_imports_1 = require("./wasm/go-wasm-imports");
const redstone_wasm_metering_1 = __importDefault(require("redstone-wasm-metering"));
const fs_1 = __importDefault(require("fs"));
const wasm_bindgen_tools_1 = require("./wasm/wasm-bindgen-tools");
const lodash_1 = require("lodash");
const wasmTypeMapping = new Map([
    [1, 'assemblyscript'],
    [2, 'rust'],
    [3, 'go']
    /*[4, 'swift'],
    [5, 'c']*/
]);
class DefaultCreateContract {
    constructor(arweave) {
        this.arweave = arweave;
        this.logger = logging_1.LoggerFactory.INST.create('DefaultCreateContract');
        this.deployFromSourceTx = this.deployFromSourceTx.bind(this);
    }
    async deploy(contractData, useBundler = false) {
        this.logger.debug('Creating new contract');
        const { wallet, src, initState, tags, transfer, wasmSrcCodeDir, wasmGlueCode } = contractData;
        const contractType = src instanceof Buffer ? 'wasm' : 'js';
        let srcTx;
        let wasmLang = null;
        let wasmVersion = null;
        const metadata = {};
        const data = [];
        if (contractType == 'wasm') {
            const meteredWasmBinary = redstone_wasm_metering_1.default.meterWASM(src, {
                meterType: 'i32'
            });
            data.push(meteredWasmBinary);
            const wasmModule = await WebAssembly.compile(src);
            const moduleImports = WebAssembly.Module.imports(wasmModule);
            let lang;
            if (this.isGoModule(moduleImports)) {
                const go = new go_wasm_imports_1.Go(null);
                const module = new WebAssembly.Instance(wasmModule, go.importObject);
                // DO NOT await here!
                go.run(module);
                lang = go.exports.lang();
                wasmVersion = go.exports.version();
            }
            else {
                const module = await WebAssembly.instantiate(src, dummyImports(moduleImports));
                // @ts-ignore
                if (!module.instance.exports.lang) {
                    throw new Error(`No info about source type in wasm binary. Did you forget to export "lang" function?`);
                }
                // @ts-ignore
                lang = module.instance.exports.lang();
                // @ts-ignore
                wasmVersion = module.instance.exports.version();
                if (!wasmTypeMapping.has(lang)) {
                    throw new Error(`Unknown wasm source type ${lang}`);
                }
            }
            wasmLang = wasmTypeMapping.get(lang);
            if (wasmSrcCodeDir == null) {
                throw new Error('No path to original wasm contract source code');
            }
            const zippedSourceCode = await this.zipContents(wasmSrcCodeDir);
            data.push(zippedSourceCode);
            if (wasmLang == 'rust') {
                if (!wasmGlueCode) {
                    throw new Error('No path to generated wasm-bindgen js code');
                }
                const wasmBindgenSrc = fs_1.default.readFileSync(wasmGlueCode, 'utf-8');
                const dtor = (0, wasm_bindgen_tools_1.matchMutClosureDtor)(wasmBindgenSrc);
                metadata['dtor'] = (0, lodash_1.parseInt)(dtor);
                data.push(Buffer.from(wasmBindgenSrc));
            }
        }
        const allData = contractType == 'wasm' ? this.joinBuffers(data) : src;
        srcTx = await this.arweave.createTransaction({ data: allData }, wallet);
        srcTx.addTag(core_1.SmartWeaveTags.APP_NAME, 'SmartWeaveContractSource');
        // TODO: version should be taken from the current package.json version.
        srcTx.addTag(core_1.SmartWeaveTags.APP_VERSION, '0.3.0');
        srcTx.addTag(core_1.SmartWeaveTags.SDK, 'RedStone');
        srcTx.addTag(core_1.SmartWeaveTags.CONTENT_TYPE, contractType == 'js' ? 'application/javascript' : 'application/wasm');
        if (contractType == 'wasm') {
            srcTx.addTag(core_1.SmartWeaveTags.WASM_LANG, wasmLang);
            srcTx.addTag(core_1.SmartWeaveTags.WASM_LANG_VERSION, wasmVersion);
            srcTx.addTag(core_1.SmartWeaveTags.WASM_META, JSON.stringify(metadata));
        }
        await this.arweave.transactions.sign(srcTx, wallet);
        this.logger.debug('Posting transaction with source');
        // note: in case of useBundler = true, we're posting both
        // src tx and contract tx in one request.
        let responseOk = true;
        if (!useBundler) {
            const response = await this.arweave.transactions.post(srcTx);
            responseOk = response.status === 200 || response.status === 208;
        }
        if (responseOk) {
            return await this.deployFromSourceTx({
                srcTxId: srcTx.id,
                wallet,
                initState,
                tags,
                transfer
            }, useBundler, srcTx);
        }
        else {
            throw new Error(`Unable to write Contract Source`);
        }
    }
    async deployFromSourceTx(contractData, useBundler = false, srcTx = null) {
        this.logger.debug('Creating new contract from src tx');
        const { wallet, srcTxId, initState, tags, transfer } = contractData;
        let contractTX = await this.arweave.createTransaction({ data: initState }, wallet);
        if (+(transfer === null || transfer === void 0 ? void 0 : transfer.winstonQty) > 0 && transfer.target.length) {
            this.logger.debug('Creating additional transaction with AR transfer', transfer);
            contractTX = await this.arweave.createTransaction({
                data: initState,
                target: transfer.target,
                quantity: transfer.winstonQty
            }, wallet);
        }
        if (tags === null || tags === void 0 ? void 0 : tags.length) {
            for (const tag of tags) {
                contractTX.addTag(tag.name.toString(), tag.value.toString());
            }
        }
        contractTX.addTag(core_1.SmartWeaveTags.APP_NAME, 'SmartWeaveContract');
        contractTX.addTag(core_1.SmartWeaveTags.APP_VERSION, '0.3.0');
        contractTX.addTag(core_1.SmartWeaveTags.CONTRACT_SRC_TX_ID, srcTxId);
        contractTX.addTag(core_1.SmartWeaveTags.SDK, 'RedStone');
        contractTX.addTag(core_1.SmartWeaveTags.CONTENT_TYPE, 'application/json');
        await this.arweave.transactions.sign(contractTX, wallet);
        let responseOk;
        if (useBundler) {
            const result = await this.post(contractTX, srcTx);
            this.logger.debug(result);
            responseOk = true;
        }
        else {
            const response = await this.arweave.transactions.post(contractTX);
            responseOk = response.status === 200 || response.status === 208;
        }
        if (responseOk) {
            return contractTX.id;
        }
        else {
            throw new Error(`Unable to write Contract`);
        }
    }
    async post(contractTx, srcTx = null) {
        let body = {
            contractTx
        };
        if (srcTx) {
            body = {
                ...body,
                srcTx
            };
        }
        const response = await fetch(`https://gateway.redstone.finance/gateway/contracts/deploy`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        });
        if (response.ok) {
            return response.json();
        }
        else {
            throw new Error(`Error while posting contract ${response.statusText}`);
        }
    }
    isGoModule(moduleImports) {
        return moduleImports.some((moduleImport) => {
            return moduleImport.module == 'env' && moduleImport.name.startsWith('syscall/js');
        });
    }
    joinBuffers(buffers) {
        const length = buffers.length;
        const result = [];
        result.push(Buffer.from(length.toString()));
        result.push(Buffer.from('|'));
        buffers.forEach((b) => {
            result.push(Buffer.from(b.length.toString()));
            result.push(Buffer.from('|'));
        });
        result.push(...buffers);
        return result.reduce((prev, b) => Buffer.concat([prev, b]));
    }
    async zipContents(source) {
        const archiver = require('archiver'), streamBuffers = require('stream-buffers');
        const outputStreamBuffer = new streamBuffers.WritableStreamBuffer({
            initialSize: 1000 * 1024,
            incrementAmount: 1000 * 1024 // grow by 1000 kilobytes each time buffer overflows.
        });
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        archive.on('error', function (err) {
            throw err;
        });
        archive.pipe(outputStreamBuffer);
        archive.directory(source.toString(), source.toString());
        await archive.finalize();
        outputStreamBuffer.end();
        return outputStreamBuffer.getContents();
    }
}
exports.DefaultCreateContract = DefaultCreateContract;
function dummyImports(moduleImports) {
    const imports = {};
    moduleImports.forEach((moduleImport) => {
        if (!Object.prototype.hasOwnProperty.call(imports, moduleImport.module)) {
            imports[moduleImport.module] = {};
        }
        imports[moduleImport.module][moduleImport.name] = function () { };
    });
    return imports;
}
//# sourceMappingURL=DefaultCreateContract.js.map