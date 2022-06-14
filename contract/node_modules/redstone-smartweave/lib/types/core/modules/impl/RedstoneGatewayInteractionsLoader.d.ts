import { EvaluationOptions, GQLEdgeInterface, GQLNodeInterface, InteractionsLoader } from '../../..';
import 'redstone-isomorphic';
interface Paging {
    total: string;
    limit: number;
    items: number;
    page: number;
    pages: number;
}
interface Interaction {
    status: string;
    confirming_peers: string;
    confirmations: string;
    interaction: GQLNodeInterface;
}
export interface RedstoneGatewayInteractions {
    paging: Paging;
    interactions: Interaction[];
    message?: string;
}
export declare type ConfirmationStatus = {
    notCorrupted?: boolean;
    confirmed?: null;
} | {
    notCorrupted?: null;
    confirmed?: boolean;
};
export declare const enum SourceType {
    ARWEAVE = "arweave",
    REDSTONE_SEQUENCER = "redstone-sequencer"
}
/**
 * The aim of this implementation of the {@link InteractionsLoader} is to make use of
 * Redstone Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * endpoint and retrieve contracts' interactions.
 *
 * Optionally - it is possible to pass:
 * 1. {@link ConfirmationStatus.confirmed} flag - to receive only confirmed interactions - ie. interactions with
 * enough confirmations, whose existence is confirmed by at least 3 Arweave peers.
 * 2. {@link ConfirmationStatus.notCorrupted} flag - to receive both already confirmed and not yet confirmed (ie. latest)
 * interactions.
 * 3. {@link SourceType} - to receive interactions based on their origin ({@link SourceType.ARWEAVE} or {@link SourceType.REDSTONE_SEQUENCER}).
 * If not set, interactions from all sources will be loaded.
 *
 * Passing no flag is the "backwards compatible" mode (ie. it will behave like the original Arweave GQL gateway endpoint).
 * Note that this may result in returning corrupted and/or forked interactions
 * - read more {@link https://github.com/redstone-finance/redstone-sw-gateway#corrupted-transactions}.
 *
 * Please note that currently caching (ie. {@link CacheableContractInteractionsLoader} is switched off
 * for RedstoneGatewayInteractionsLoader due to the issue mentioned in the
 * following comment {@link https://github.com/redstone-finance/redstone-smartcontracts/pull/62#issuecomment-995249264}
 */
export declare class RedstoneGatewayInteractionsLoader implements InteractionsLoader {
    private readonly baseUrl;
    private readonly confirmationStatus;
    private readonly source;
    constructor(baseUrl: string, confirmationStatus?: ConfirmationStatus, source?: SourceType);
    private readonly logger;
    load(contractId: string, fromBlockHeight: number, toBlockHeight: number, evaluationOptions?: EvaluationOptions, upToTransactionId?: string): Promise<GQLEdgeInterface[]>;
}
export {};
//# sourceMappingURL=RedstoneGatewayInteractionsLoader.d.ts.map