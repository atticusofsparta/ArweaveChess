import { BlockHeightKey, MemBlockHeightSwCache } from '../index';
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
export declare class FileBlockHeightSwCache<V = any> extends MemBlockHeightSwCache<V> {
    private readonly basePath;
    private readonly fLogger;
    private isFlushing;
    private isDirty;
    constructor(basePath?: string, maxStoredInMemoryBlockHeights?: number);
    private saveCache;
    put({ cacheKey, blockHeight }: BlockHeightKey, value: V): Promise<void>;
    flush(): Promise<void>;
}
//# sourceMappingURL=FileBlockHeightCache.d.ts.map