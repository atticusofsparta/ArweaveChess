import Arweave from 'arweave';
import { ConfirmationStatus, DefinitionLoader, ExecutorFactory, HandlerApi, InteractionsLoader, InteractionsSorter, SmartWeave, SourceType, StateEvaluator } from '..';
export declare const R_GW_URL = "https://d1o5nlqr4okus2.cloudfront.net";
export declare class SmartWeaveBuilder {
    private readonly _arweave;
    private _definitionLoader?;
    private _interactionsLoader?;
    private _interactionsSorter?;
    private _executorFactory?;
    private _stateEvaluator?;
    private _useRedstoneGwInfo;
    constructor(_arweave: Arweave);
    setDefinitionLoader(value: DefinitionLoader): SmartWeaveBuilder;
    setInteractionsLoader(value: InteractionsLoader): SmartWeaveBuilder;
    setCacheableInteractionsLoader(value: InteractionsLoader, maxStoredInMemoryBlockHeights?: number): SmartWeaveBuilder;
    setInteractionsSorter(value: InteractionsSorter): SmartWeaveBuilder;
    setExecutorFactory(value: ExecutorFactory<HandlerApi<unknown>>): SmartWeaveBuilder;
    setStateEvaluator(value: StateEvaluator): SmartWeaveBuilder;
    overwriteSource(sourceCode: {
        [key: string]: string;
    }): SmartWeave;
    useRedStoneGateway(confirmationStatus?: ConfirmationStatus, source?: SourceType, address?: string): SmartWeaveBuilder;
    useArweaveGateway(): SmartWeaveBuilder;
    useRedStoneGwInfo(): SmartWeaveBuilder;
    build(): SmartWeave;
}
//# sourceMappingURL=SmartWeaveBuilder.d.ts.map