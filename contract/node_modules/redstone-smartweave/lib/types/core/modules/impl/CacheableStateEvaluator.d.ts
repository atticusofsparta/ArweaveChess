import { BlockHeightCacheResult, BlockHeightSwCache } from '../../../cache/index';
import { DefaultStateEvaluator, EvalStateResult, ExecutionContext, ExecutionContextModifier, HandlerApi, StateCache } from '../../index';
import Arweave from 'arweave';
import { GQLNodeInterface } from '../../../legacy/index';
import { CurrentTx } from '../../../contract/index';
/**
 * An implementation of DefaultStateEvaluator that adds caching capabilities.
 *
 * The main responsibility of this class is to compute whether there are
 * any interaction transactions, for which the state hasn't been evaluated yet -
 * if so - it generates a list of such transactions and evaluates the state
 * for them - taking as an input state the last cached state.
 */
export declare class CacheableStateEvaluator extends DefaultStateEvaluator {
    private readonly cache;
    private readonly cLogger;
    constructor(arweave: Arweave, cache: BlockHeightSwCache<StateCache<unknown>>, executionContextModifiers?: ExecutionContextModifier[]);
    eval<State>(executionContext: ExecutionContext<State, HandlerApi<State>>, currentTx: CurrentTx[]): Promise<EvalStateResult<State>>;
    onStateEvaluated<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>): Promise<void>;
    onStateUpdate<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>, nthInteraction?: number): Promise<void>;
    latestAvailableState<State>(contractTxId: string, blockHeight: number): Promise<BlockHeightCacheResult<EvalStateResult<State>> | null>;
    onInternalWriteStateUpdate<State>(transaction: GQLNodeInterface, contractTxId: string, state: EvalStateResult<State>): Promise<void>;
    onContractCall<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>): Promise<void>;
    protected putInCache<State>(contractTxId: string, transaction: GQLNodeInterface, state: EvalStateResult<State>, requestedBlockHeight?: number, containsInteractionsFromSequencer?: boolean): Promise<void>;
    flushCache(): Promise<void>;
    syncState(contractTxId: string, blockHeight: number, transactionId: string, state: any, validity: any): Promise<void>;
}
//# sourceMappingURL=CacheableStateEvaluator.d.ts.map