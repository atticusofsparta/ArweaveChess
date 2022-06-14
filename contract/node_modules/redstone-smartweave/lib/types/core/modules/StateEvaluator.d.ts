import { BlockHeightCacheResult, CurrentTx, ExecutionContext, GQLNodeInterface } from '../..';
/**
 * Implementors of this class are responsible for evaluating contract's state
 * - based on the {@link ExecutionContext}.
 */
export interface StateEvaluator {
    eval<State>(executionContext: ExecutionContext<State>, currentTx: CurrentTx[]): Promise<EvalStateResult<State>>;
    /**
     * a hook that is called on each state update (i.e. after evaluating state for each interaction transaction)
     */
    onStateUpdate<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>, nthInteraction?: number): Promise<void>;
    /**
     * a hook that is called after state has been fully evaluated
     */
    onStateEvaluated<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>): Promise<void>;
    /**
     * a hook that is called after performing internal write between contracts
     */
    onInternalWriteStateUpdate<State>(transaction: GQLNodeInterface, contractTxId: string, state: EvalStateResult<State>): Promise<void>;
    /**
     * a hook that is called before communicating with other contract.
     * note to myself: putting values into cache only "onContractCall" may degrade performance.
     * For example:
     * 1. block 722317 - contract A calls B
     * 2. block 722727 - contract A calls B
     * 3. block 722695 - contract B calls A
     * If we update cache only on contract call - for the last above call (B->A)
     * we would retrieve state cached for 722317. If there are any transactions
     * between 722317 and 722695 - the performance will be degraded.
     */
    onContractCall<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>): Promise<void>;
    /**
     * loads latest available state for given contract for given blockHeight.
     * - implementors should be aware that there might multiple interactions
     * for single block - and sort them according to protocol specification.
     */
    latestAvailableState<State>(contractTxId: string, blockHeight: number): Promise<BlockHeightCacheResult<EvalStateResult<State>> | null>;
    /**
     * allows to manually flush state cache into underneath storage.
     */
    flushCache(): Promise<void>;
    /**
     * allows to syncState with an external state source (like RedStone Distributed Execution Network)
     */
    syncState(contractTxId: string, blockHeight: number, transactionId: string, state: any, validity: any): Promise<void>;
}
export declare class EvalStateResult<State> {
    readonly state: State;
    readonly validity: Record<string, boolean>;
    readonly transactionId?: string;
    readonly blockId?: string;
    constructor(state: State, validity: Record<string, boolean>, transactionId?: string, blockId?: string);
}
export declare class DefaultEvaluationOptions implements EvaluationOptions {
    ignoreExceptions: boolean;
    waitForConfirmation: boolean;
    updateCacheForEachInteraction: boolean;
    internalWrites: boolean;
    maxCallDepth: number;
    maxInteractionEvaluationTimeSeconds: number;
    stackTrace: {
        saveState: boolean;
    };
    bundlerUrl: string;
    gasLimit: number;
    useFastCopy: boolean;
    manualCacheFlush: boolean;
    useVM2: boolean;
    allowUnsafeClient: boolean;
    walletBalanceUrl: string;
}
export interface EvaluationOptions {
    ignoreExceptions: boolean;
    waitForConfirmation: boolean;
    updateCacheForEachInteraction: boolean;
    internalWrites: boolean;
    maxCallDepth: number;
    maxInteractionEvaluationTimeSeconds: number;
    stackTrace: {
        saveState: boolean;
    };
    bundlerUrl: string;
    gasLimit: number;
    useFastCopy: boolean;
    manualCacheFlush: boolean;
    useVM2: boolean;
    allowUnsafeClient: boolean;
    walletBalanceUrl: string;
}
//# sourceMappingURL=StateEvaluator.d.ts.map