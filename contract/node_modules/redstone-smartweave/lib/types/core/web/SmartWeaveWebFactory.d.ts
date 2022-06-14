import Arweave from 'arweave';
import { ConfirmationStatus, SmartWeave, SmartWeaveBuilder } from '../index';
/**
 * A factory that simplifies the process of creating different versions of {@link SmartWeave}.
 * All versions use the {@link Evolve} plugin.
 * SmartWeave instances created by this factory can be safely used in a web environment.
 */
export declare class SmartWeaveWebFactory {
    /**
     * Returns a fully configured {@link SmartWeave} that is using mem cache for all layers.
     */
    static memCached(arweave: Arweave, maxStoredBlockHeights?: number): SmartWeave;
    /**
     * Returns a preconfigured, memCached {@link SmartWeaveBuilder}, that allows for customization of the SmartWeave instance.
     * Use {@link SmartWeaveBuilder.build()} to finish the configuration.
     */
    static memCachedBased(arweave: Arweave, maxStoredBlockHeights?: number, confirmationStatus?: ConfirmationStatus): SmartWeaveBuilder;
}
//# sourceMappingURL=SmartWeaveWebFactory.d.ts.map