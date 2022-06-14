"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileBlockHeightSwCache = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cache_1 = require("../index");
const logging_1 = require("../../logging/index");
const safe_stable_stringify_1 = __importDefault(require("safe-stable-stringify"));
/**
 * An implementation of {@link BlockHeightSwCache} that stores its data in JSON files.
 *
 * Main use-case is the per block height state cache for contracts.
 *
 * This class extends standard {@link MemBlockHeightSwCache} and add features of
 * 1. Loading cache from files to memory (during initialization)
 * 2. Flushing cache to files (only the "last" (ie. highest) block stored currently in memory
 * is being saved).
 *
 * A separate file is created for each block height - otherwise it was common to
 * hit 16 megabytes file size limit for json files.
 *
 * The files are organised in the following structure:
 * --/basePath
 *   --/contractTxId_1
 *     --1.cache.json
 *     --2.cache.json
 *     --<blockHeight>.cache.json
 *     --...
 *     --748832.cache.json
 *   --/contractTxId_2
 *     --1.cache.json
 *     --323332.cache.json
 * ...etc.
 *
 * Note: this is not performance-optimized for reading LARGE amount of contracts.
 * Note: BSON has issues with top-level arrays - https://github.com/mongodb/js-bson/issues/319
 * - so moving back to plain JSON...
 *
 * @Deprecated - a more mature persistent cache, based on LevelDB (or similar storage)
 * should be implemented.
 */
class FileBlockHeightSwCache extends cache_1.MemBlockHeightSwCache {
    constructor(basePath = path_1.default.join(__dirname, 'storage', 'state'), maxStoredInMemoryBlockHeights = Number.MAX_SAFE_INTEGER) {
        super(maxStoredInMemoryBlockHeights);
        this.basePath = basePath;
        this.fLogger = logging_1.LoggerFactory.INST.create('FileBlockHeightSwCache');
        this.isFlushing = false;
        this.isDirty = false;
        this.saveCache = this.saveCache.bind(this);
        this.flush = this.flush.bind(this);
        if (!fs_1.default.existsSync(this.basePath)) {
            fs_1.default.mkdirSync(this.basePath);
        }
        const contracts = fs_1.default.readdirSync(this.basePath);
        this.fLogger.info('Loading cache from files');
        contracts.forEach((contract) => {
            const cacheDirPath = path_1.default.join(this.basePath, contract);
            if (this.storage[contract] == null) {
                this.storage[contract] = new Map();
            }
            const benchmark = logging_1.Benchmark.measure();
            const files = fs_1.default.readdirSync(cacheDirPath);
            files.forEach((file) => {
                const cacheFilePath = path_1.default.join(cacheDirPath, file);
                const height = file.split('.')[0];
                // FIXME: "state" and "validity" should be probably split into separate json files
                const cacheValue = JSON.parse(fs_1.default.readFileSync(path_1.default.join(cacheFilePath), 'utf-8'));
                this.putSync({ cacheKey: contract, blockHeight: +height }, cacheValue);
            });
            this.fLogger.info(`loading cache for ${contract}`, benchmark.elapsed());
            this.fLogger.debug(`Amount of elements loaded for ${contract} to mem: ${this.storage[contract].size}`);
        });
        this.fLogger.debug('Storage keys', this.storage);
    }
    async saveCache() {
        this.isFlushing = true;
        this.fLogger.info(`==== Persisting cache ====`);
        // TODO: switch to async, as currently writing cache files may slow down contract execution.
        try {
            const directoryPath = this.basePath;
            for (const key of Object.keys(this.storage)) {
                const directory = key;
                if (!fs_1.default.existsSync(path_1.default.join(directoryPath, directory))) {
                    fs_1.default.mkdirSync(path_1.default.join(directoryPath, directory));
                }
                // store only highest cached height
                const toStore = await this.getLast(key);
                // this check is a bit paranoid, since we're iterating on storage keys..
                if (toStore !== null) {
                    const { cachedHeight, cachedValue } = toStore;
                    fs_1.default.writeFileSync(path_1.default.join(directoryPath, directory, `${cachedHeight}.cache.json`), (0, safe_stable_stringify_1.default)(cachedValue));
                }
            }
            this.isDirty = false;
        }
        catch (e) {
            this.fLogger.error('Error while flushing cache', e);
        }
        finally {
            this.isFlushing = false;
            this.fLogger.info(`==== Cache persisted ====`);
        }
    }
    async put({ cacheKey, blockHeight }, value) {
        this.isDirty = true;
        return super.put({ cacheKey, blockHeight }, value);
    }
    async flush() {
        if (this.isFlushing || !this.isDirty) {
            return;
        }
        await this.saveCache();
    }
}
exports.FileBlockHeightSwCache = FileBlockHeightSwCache;
//# sourceMappingURL=FileBlockHeightCache.js.map