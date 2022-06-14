import Arweave from 'arweave';
import { GQLNodeInterface, GQLTagInterface, SigningFunction } from '..';
import Transaction from 'arweave/node/lib/transaction';
import { BlockData } from 'arweave/node/blocks';
export declare function createTx(arweave: Arweave, signer: SigningFunction, contractId: string, input: any, tags: {
    name: string;
    value: string;
}[], target?: string, winstonQty?: string, bundle?: boolean): Promise<Transaction>;
export declare function createDummyTx(tx: Transaction, from: string, block: BlockData): GQLNodeInterface;
export declare function unpackTags(tx: Transaction): GQLTagInterface[];
//# sourceMappingURL=create-tx.d.ts.map