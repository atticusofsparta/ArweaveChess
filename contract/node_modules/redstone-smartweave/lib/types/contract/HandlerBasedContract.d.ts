import { ArTransfer, ArWallet, BenchmarkStats, Contract, ContractCallStack, CurrentTx, EvalStateResult, EvaluationOptions, GQLNodeInterface, InteractionResult, SigningFunction, SmartWeave, Tags } from '..';
import { NetworkInfoInterface } from 'arweave/node/network';
/**
 * An implementation of {@link Contract} that is backwards compatible with current style
 * of writing SW contracts (ie. using the "handle" function).
 *
 * It requires {@link ExecutorFactory} that is using {@link HandlerApi} generic type.
 */
export declare class HandlerBasedContract<State> implements Contract<State> {
    private readonly _contractTxId;
    protected readonly smartweave: SmartWeave;
    private readonly _parentContract;
    private readonly _callingInteraction;
    private readonly logger;
    private _callStack;
    private _evaluationOptions;
    /**
     * current Arweave networkInfo that will be used for all operations of the SmartWeave protocol.
     * Only the 'root' contract call should read this data from Arweave - all the inner calls ("child" contracts)
     * should reuse this data from the parent ("calling") contract.
     */
    private _networkInfo?;
    private _rootBlockHeight;
    private readonly _innerWritesEvaluator;
    private readonly _callDepth;
    private _benchmarkStats;
    private readonly _arweaveWrapper;
    /**
     * wallet connected to this contract
     */
    protected signer?: SigningFunction;
    constructor(_contractTxId: string, smartweave: SmartWeave, _parentContract?: Contract, _callingInteraction?: GQLNodeInterface);
    readState(blockHeight?: number, currentTx?: CurrentTx[]): Promise<EvalStateResult<State>>;
    readStateSequencer(blockHeight: number, upToTransactionId: string, currentTx?: CurrentTx[]): Promise<EvalStateResult<State>>;
    viewState<Input, View>(input: Input, blockHeight?: number, tags?: Tags, transfer?: ArTransfer): Promise<InteractionResult<State, View>>;
    viewStateForTx<Input, View>(input: Input, interactionTx: GQLNodeInterface): Promise<InteractionResult<State, View>>;
    dryWrite<Input>(input: Input, caller?: string, tags?: Tags, transfer?: ArTransfer): Promise<InteractionResult<State, unknown>>;
    dryWriteFromTx<Input>(input: Input, transaction: GQLNodeInterface, currentTx?: CurrentTx[]): Promise<InteractionResult<State, unknown>>;
    writeInteraction<Input>(input: Input, tags?: Tags, transfer?: ArTransfer, strict?: boolean): Promise<string | null>;
    bundleInteraction<Input>(input: Input, options?: {
        tags: Tags;
        strict: boolean;
        vrf: boolean;
    }): Promise<any | null>;
    private createInteraction;
    txId(): string;
    getCallStack(): ContractCallStack;
    getNetworkInfo(): Partial<NetworkInfoInterface>;
    connect(signer: ArWallet | SigningFunction): Contract<State>;
    setEvaluationOptions(options: Partial<EvaluationOptions>): Contract<State>;
    getRootBlockHeight(): number;
    private waitForConfirmation;
    private createExecutionContext;
    private createExecutionContextFromTx;
    private maybeResetRootContract;
    private callContract;
    private callContractForTx;
    private evalInteraction;
    parent(): Contract | null;
    callDepth(): number;
    evaluationOptions(): EvaluationOptions;
    lastReadStateStats(): BenchmarkStats;
    stateHash(state: State): string;
    syncState(nodeAddress: string): Promise<Contract>;
}
//# sourceMappingURL=HandlerBasedContract.d.ts.map