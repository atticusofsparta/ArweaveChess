import Arweave from 'arweave';
import { ContractDefinition, EvaluationOptions, ExecutorFactory } from '../core/index';
import { SwCache } from '../cache/index';
/**
 * An implementation of ExecutorFactory that adds caching capabilities
 */
export declare class CacheableExecutorFactory<Api> implements ExecutorFactory<Api> {
    private readonly arweave;
    private readonly baseImplementation;
    private readonly cache;
    private readonly logger;
    constructor(arweave: Arweave, baseImplementation: ExecutorFactory<Api>, cache: SwCache<string, Api>);
    create<State>(contractDefinition: ContractDefinition<State>, evaluationOptions: EvaluationOptions): Promise<Api>;
}
//# sourceMappingURL=CacheableExecutorFactory.d.ts.map