import { BlockHeightCacheResult, CurrentTx, EvalStateResult, ExecutionContext, ExecutionContextModifier, GQLEdgeInterface, GQLNodeInterface, HandlerApi, StateEvaluator } from '../../..';
import Arweave from 'arweave';
/**
 * This class contains the base functionality of evaluating the contracts state - according
 * to the SmartWeave protocol.
 * Marked as abstract - as without help of any cache - the evaluation in real-life applications
 * would be really slow - so using this class without any caching ({@link CacheableStateEvaluator})
 * mechanism built on top makes no sense.
 */
export declare abstract class DefaultStateEvaluator implements StateEvaluator {
    protected readonly arweave: Arweave;
    private readonly executionContextModifiers;
    private readonly logger;
    private readonly tagsParser;
    protected constructor(arweave: Arweave, executionContextModifiers?: ExecutionContextModifier[]);
    eval<State>(executionContext: ExecutionContext<State, HandlerApi<State>>, currentTx: CurrentTx[]): Promise<EvalStateResult<State>>;
    protected doReadState<State>(missingInteractions: GQLEdgeInterface[], baseState: EvalStateResult<State>, executionContext: ExecutionContext<State, HandlerApi<State>>, currentTx: CurrentTx[]): Promise<EvalStateResult<State>>;
    private verifyVrf;
    private logResult;
    private parseInput;
    abstract latestAvailableState<State>(contractTxId: string, blockHeight: number): Promise<BlockHeightCacheResult<EvalStateResult<State>> | null>;
    abstract onContractCall<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>): Promise<void>;
    abstract onInternalWriteStateUpdate<State>(transaction: GQLNodeInterface, contractTxId: string, state: EvalStateResult<State>): Promise<void>;
    abstract onStateEvaluated<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>): Promise<void>;
    abstract onStateUpdate<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>, nthInteraction?: number): Promise<void>;
    abstract flushCache(): Promise<void>;
    abstract syncState(contractTxId: string, blockHeight: number, transactionId: string, state: any, validity: any): Promise<void>;
}
//# sourceMappingURL=DefaultStateEvaluator.d.ts.map