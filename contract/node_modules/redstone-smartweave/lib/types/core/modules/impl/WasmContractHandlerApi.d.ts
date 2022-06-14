import { ContractDefinition, EvalStateResult, ExecutionContext, HandlerApi, InteractionData, InteractionResult, SmartWeaveGlobal } from '../../..';
export declare class WasmContractHandlerApi<State> implements HandlerApi<State> {
    private readonly swGlobal;
    private readonly contractDefinition;
    private readonly wasmExports;
    private readonly contractLogger;
    private readonly logger;
    constructor(swGlobal: SmartWeaveGlobal, contractDefinition: ContractDefinition<State>, wasmExports: any);
    handle<Input, Result>(executionContext: ExecutionContext<State>, currentResult: EvalStateResult<State>, interactionData: InteractionData<Input>): Promise<InteractionResult<State, Result>>;
    initState(state: State): void;
    private doHandle;
    private doGetCurrentState;
    private assignReadContractState;
    private assignWrite;
}
//# sourceMappingURL=WasmContractHandlerApi.d.ts.map