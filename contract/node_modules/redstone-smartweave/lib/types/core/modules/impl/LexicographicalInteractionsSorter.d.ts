import { GQLEdgeInterface, InteractionsSorter } from '../../..';
import Arweave from 'arweave';
/**
 * implementation that is based on current's SDK sorting alg.
 */
export declare class LexicographicalInteractionsSorter implements InteractionsSorter {
    private readonly arweave;
    private readonly logger;
    constructor(arweave: Arweave);
    sort(transactions: GQLEdgeInterface[]): Promise<GQLEdgeInterface[]>;
    private addSortKey;
    createSortKey(blockId: string, transactionId: string, blockHeight: number): Promise<string>;
}
//# sourceMappingURL=LexicographicalInteractionsSorter.d.ts.map