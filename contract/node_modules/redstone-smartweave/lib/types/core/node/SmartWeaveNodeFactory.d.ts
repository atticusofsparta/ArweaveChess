import Arweave from 'arweave';
import { ConfirmationStatus, SmartWeave, SmartWeaveBuilder, SmartWeaveWebFactory } from '../index';
import { Knex } from 'knex';
/**
 * A {@link SmartWeave} factory that can be safely used only in Node.js env.
 */
export declare class SmartWeaveNodeFactory extends SmartWeaveWebFactory {
    /**
     * Returns a fully configured, memcached {@link SmartWeave} that is suitable for tests with ArLocal
     */
    static forTesting(arweave: Arweave): SmartWeave;
    /**
     * Returns a fully configured {@link SmartWeave} that is using file-based cache for {@link StateEvaluator} layer
     * and mem cache for the rest.
     *
     * @param cacheBasePath - path where cache files will be stored
     * @param maxStoredInMemoryBlockHeights - how many cache entries per contract will be stored in
     * the underneath mem-cache
     *
     */
    static fileCached(arweave: Arweave, cacheBasePath?: string, maxStoredInMemoryBlockHeights?: number): SmartWeave;
    /**
     * Returns a preconfigured, fileCached {@link SmartWeaveBuilder}, that allows for customization of the SmartWeave instance.
     * Use {@link SmartWeaveBuilder.build()} to finish the configuration.
     * @param cacheBasePath - see {@link fileCached.cacheBasePath}
     * @param maxStoredInMemoryBlockHeights - see {@link fileCached.maxStoredInMemoryBlockHeights}
     *
     */
    static fileCachedBased(arweave: Arweave, cacheBasePath?: string, maxStoredInMemoryBlockHeights?: number, confirmationStatus?: ConfirmationStatus): SmartWeaveBuilder;
    static knexCached(arweave: Arweave, dbConnection: Knex, maxStoredInMemoryBlockHeights?: number): Promise<SmartWeave>;
    /**
     */
    static knexCachedBased(arweave: Arweave, dbConnection: Knex, maxStoredInMemoryBlockHeights?: number, confirmationStatus?: ConfirmationStatus): Promise<SmartWeaveBuilder>;
}
//# sourceMappingURL=SmartWeaveNodeFactory.d.ts.map