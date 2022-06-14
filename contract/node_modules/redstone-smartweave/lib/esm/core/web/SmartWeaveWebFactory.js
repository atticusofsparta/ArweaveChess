import { CacheableExecutorFactory, Evolve } from '../../plugins/index';
import { CacheableStateEvaluator, HandlerExecutorFactory, LexicographicalInteractionsSorter, R_GW_URL, RedstoneGatewayContractDefinitionLoader, RedstoneGatewayInteractionsLoader, SmartWeave } from '../index';
import { MemBlockHeightSwCache, MemCache } from '../../cache/index';
/**
 * A factory that simplifies the process of creating different versions of {@link SmartWeave}.
 * All versions use the {@link Evolve} plugin.
 * SmartWeave instances created by this factory can be safely used in a web environment.
 */
export class SmartWeaveWebFactory {
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
        const interactionsLoader = new RedstoneGatewayInteractionsLoader(R_GW_URL, confirmationStatus);
        const definitionLoader = new RedstoneGatewayContractDefinitionLoader(R_GW_URL, arweave, new MemCache());
        const executorFactory = new CacheableExecutorFactory(arweave, new HandlerExecutorFactory(arweave), new MemCache());
        const stateEvaluator = new CacheableStateEvaluator(arweave, new MemBlockHeightSwCache(maxStoredBlockHeights), [new Evolve(definitionLoader, executorFactory)]);
        const interactionsSorter = new LexicographicalInteractionsSorter(arweave);
        return SmartWeave.builder(arweave)
            .setDefinitionLoader(definitionLoader)
            .setInteractionsLoader(interactionsLoader)
            .useRedStoneGwInfo()
            .setInteractionsSorter(interactionsSorter)
            .setExecutorFactory(executorFactory)
            .setStateEvaluator(stateEvaluator);
    }
}
//# sourceMappingURL=SmartWeaveWebFactory.js.map