"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartWeaveWebFactory = void 0;
const plugins_1 = require("../../plugins/index");
const core_1 = require("../index");
const cache_1 = require("../../cache/index");
/**
 * A factory that simplifies the process of creating different versions of {@link SmartWeave}.
 * All versions use the {@link Evolve} plugin.
 * SmartWeave instances created by this factory can be safely used in a web environment.
 */
class SmartWeaveWebFactory {
    /**
     * Returns a fully configured {@link SmartWeave} that is using mem cache for all layers.
     */
    static memCached(arweave, maxStoredBlockHeights = 10) {
        return this.memCachedBased(arweave, maxStoredBlockHeights).build();
    }
    /**
     * Returns a preconfigured, memCached {@link SmartWeaveBuilder}, that allows for customization of the SmartWeave instance.
     * Use {@link SmartWeaveBuilder.build()} to finish the configuration.
     */
    static memCachedBased(arweave, maxStoredBlockHeights = 10, confirmationStatus = { notCorrupted: true }) {
        const interactionsLoader = new core_1.RedstoneGatewayInteractionsLoader(core_1.R_GW_URL, confirmationStatus);
        const definitionLoader = new core_1.RedstoneGatewayContractDefinitionLoader(core_1.R_GW_URL, arweave, new cache_1.MemCache());
        const executorFactory = new plugins_1.CacheableExecutorFactory(arweave, new core_1.HandlerExecutorFactory(arweave), new cache_1.MemCache());
        const stateEvaluator = new core_1.CacheableStateEvaluator(arweave, new cache_1.MemBlockHeightSwCache(maxStoredBlockHeights), [new plugins_1.Evolve(definitionLoader, executorFactory)]);
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
exports.SmartWeaveWebFactory = SmartWeaveWebFactory;
//# sourceMappingURL=SmartWeaveWebFactory.js.map