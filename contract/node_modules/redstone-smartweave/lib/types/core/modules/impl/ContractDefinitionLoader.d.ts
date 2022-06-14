import { ArweaveWrapper, ContractDefinition, DefinitionLoader, SwCache } from '../../..';
import Arweave from 'arweave';
export declare class ContractDefinitionLoader implements DefinitionLoader {
    private readonly arweave;
    protected readonly cache?: SwCache<string, ContractDefinition<unknown>>;
    private readonly logger;
    protected arweaveWrapper: ArweaveWrapper;
    constructor(arweave: Arweave, cache?: SwCache<string, ContractDefinition<unknown>>);
    load<State>(contractTxId: string, evolvedSrcTxId?: string): Promise<ContractDefinition<State>>;
    doLoad<State>(contractTxId: string, forcedSrcTxId?: string): Promise<ContractDefinition<State>>;
    private evalInitialState;
}
//# sourceMappingURL=ContractDefinitionLoader.d.ts.map