"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartWeaveNodeFactory = void 0;
const core_1 = require("../index");
const plugins_1 = require("../../plugins/index");
const cache_1 = require("../../cache/index");
const KnexStateCache_1 = require("../../cache/impl/KnexStateCache");
/**
 * A {@link SmartWeave} factory that can be safely used only in Node.js env.
 */
class SmartWeaveNodeFactory extends core_1.SmartWeaveWebFactory {
    /**
     * Returns a fully configured, memcached {@link SmartWeave} that is suitable for tests with ArLocal
     */
    static forTesting(arweave) {
        return this.memCachedBased(arweave).useArweaveGateway().build();
    }
    /**
     * Returns a fully configured {@link SmartWeave} that is using file-based cache for {@link StateEvaluator} layer
     * and mem cache for the rest.
     *
     * @param cacheBasePath - path where cache files will be stored
     * @param maxStoredInMemoryBlockHeights - how many cache entries per contract will be stored in
     * the underneath mem-cache
     *
     */
    static fileCached(arweave, cacheBasePath, maxStoredInMemoryBlockHeights = 10) {
        return this.fileCachedBased(arweave, cacheBasePath, maxStoredInMemoryBlockHeights).build();
    }
    /**
     * Returns a preconfigured, fileCached {@link SmartWeaveBuilder}, that allows for customization of the SmartWeave instance.
     * Use {@link SmartWeaveBuilder.build()} to finish the configuration.
     * @param cacheBasePath - see {@link fileCached.cacheBasePath}
     * @param maxStoredInMemoryBlockHeights - see {@link fileCached.maxStoredInMemoryBlockHeights}
     *
     */
    static fileCachedBased(arweave, cacheBasePath, maxStoredInMemoryBlockHeights = 10, confirmationStatus = { notCorrupted: true }) {
        const interactionsLoader = new core_1.RedstoneGatewayInteractionsLoader(core_1.R_GW_URL, confirmationStatus);
        const definitionLoader = new core_1.RedstoneGatewayContractDefinitionLoader(core_1.R_GW_URL, arweave, new cache_1.MemCache());
        const executorFactory = new plugins_1.CacheableExecutorFactory(arweave, new core_1.HandlerExecutorFactory(arweave), new cache_1.MemCache());
        const stateEvaluator = new core_1.CacheableStateEvaluator(arweave, new cache_1.FileBlockHeightSwCache(cacheBasePath, maxStoredInMemoryBlockHeights), [new plugins_1.Evolve(definitionLoader, executorFactory)]);
        const interactionsSorter = new core_1.LexicographicalInteractionsSorter(arweave);
        return core_1.SmartWeave.builder(arweave)
            .setDefinitionLoader(definitionLoader)
            .setInteractionsLoader(interactionsLoader)
            .useRedStoneGwInfo()
            .setInteractionsSorter(interactionsSorter)
            .setExecutorFactory(executorFactory)
            .setStateEvaluator(stateEvaluator);
    }
    static async knexCached(arweave, dbConnection, maxStoredInMemoryBlockHeights = 10) {
        return (await this.knexCachedBased(arweave, dbConnection, maxStoredInMemoryBlockHeights)).build();
    }
    /**
     */
    static async knexCachedBased(arweave, dbConnection, maxStoredInMemoryBlockHeights = 10, confirmationStatus = { notCorrupted: true }) {
        const interactionsLoader = new core_1.RedstoneGatewayInteractionsLoader(core_1.R_GW_URL, confirmationStatus);
        const definitionLoader = new core_1.RedstoneGatewayContractDefinitionLoader(core_1.R_GW_URL, arweave, new cache_1.MemCache());
        const executorFactory = new plugins_1.CacheableExecutorFactory(arweave, new core_1.HandlerExecutorFactory(arweave), new cache_1.MemCache());
        const stateEvaluator = new core_1.CacheableStateEvaluator(arweave, await KnexStateCache_1.KnexStateCache.init(dbConnection, maxStoredInMemoryBlockHeights), [new plugins_1.Evolve(definitionLoader, executorFactory)]);
        const interactionsSorter = new core_1.LexicographicalInteractionsSorter(arweave);
        return core_1.SmartWeave.builder(arweave)
            .setDefinitionLoader(definitionLoader)
            .setInteractionsLoader(interactionsLoader)
            .useRedStoneGwInfo()
            .setInteractionsSorter(interactionsSorter)
            .setExecutorFactory(executorFactory)
            .setStateEvaluator(stateEvaluator);
    }
}
exports.SmartWeaveNodeFactory = SmartWeaveNodeFactory;
//# sourceMappingURL=SmartWeaveNodeFactory.js.map