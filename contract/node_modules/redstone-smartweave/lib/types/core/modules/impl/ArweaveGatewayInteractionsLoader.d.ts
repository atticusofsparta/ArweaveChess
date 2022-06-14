import { EvaluationOptions, GQLEdgeInterface, InteractionsLoader } from '../../..';
import Arweave from 'arweave';
interface TagFilter {
    name: string;
    values: string[];
}
interface BlockFilter {
    min?: number;
    max: number;
}
export interface GqlReqVariables {
    tags: TagFilter[];
    blockFilter: BlockFilter;
    first: number;
    after?: string;
}
export declare function bundledTxsFilter(tx: GQLEdgeInterface): boolean;
export declare class ArweaveGatewayInteractionsLoader implements InteractionsLoader {
    protected readonly arweave: Arweave;
    private readonly logger;
    private static readonly query;
    private static readonly _30seconds;
    private readonly arweaveWrapper;
    constructor(arweave: Arweave);
    load(contractId: string, fromBlockHeight: number, toBlockHeight: number, evaluationOptions: EvaluationOptions): Promise<GQLEdgeInterface[]>;
    private loadPages;
    private getNextPage;
}
export {};
//# sourceMappingURL=ArweaveGatewayInteractionsLoader.d.ts.map