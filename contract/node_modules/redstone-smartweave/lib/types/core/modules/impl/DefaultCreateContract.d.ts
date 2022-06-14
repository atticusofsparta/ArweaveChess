import { ContractData, CreateContract, FromSrcTxContractData } from '../../index';
import Arweave from 'arweave';
import Transaction from 'arweave/node/lib/transaction';
export declare class DefaultCreateContract implements CreateContract {
    private readonly arweave;
    private readonly logger;
    constructor(arweave: Arweave);
    deploy(contractData: ContractData, useBundler?: boolean): Promise<string>;
    deployFromSourceTx(contractData: FromSrcTxContractData, useBundler?: boolean, srcTx?: Transaction): Promise<string>;
    private post;
    private isGoModule;
    private joinBuffers;
    private zipContents;
}
//# sourceMappingURL=DefaultCreateContract.d.ts.map