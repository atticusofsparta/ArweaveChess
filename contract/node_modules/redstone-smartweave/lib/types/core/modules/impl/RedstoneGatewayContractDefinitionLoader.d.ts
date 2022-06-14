import { ContractDefinition, SwCache } from '../../..';
import Arweave from 'arweave';
import { ContractDefinitionLoader } from './ContractDefinitionLoader';
import 'redstone-isomorphic';
/**
 * An extension to {@link ContractDefinitionLoader} that makes use of
 * Redstone Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * to load Contract Data.
 *
 * If the contract data is not available on RedStone Gateway - it fallbacks to default implementation
 * in {@link ContractDefinitionLoader} - i.e. loads the definition from Arweave gateway.
 */
export declare class RedstoneGatewayContractDefinitionLoader extends ContractDefinitionLoader {
    private readonly baseUrl;
    private readonly rLogger;
    constructor(baseUrl: string, arweave: Arweave, cache?: SwCache<string, ContractDefinition<unknown>>);
    doLoad<State>(contractTxId: string, forcedSrcTxId?: string): Promise<ContractDefinition<State>>;
}
//# sourceMappingURL=RedstoneGatewayContractDefinitionLoader.d.ts.map