import { SmartWeaveTags } from '..';
import { HandlerBasedContract } from './index';
export class PstContractImpl extends HandlerBasedContract {
    async currentBalance(target) {
        const interactionResult = await this.viewState({ function: 'balance', target });
        if (interactionResult.type !== 'ok') {
            throw Error(interactionResult.errorMessage);
        }
        return interactionResult.result;
    }
    async currentState() {
        return (await super.readState()).state;
    }
    async transfer(transfer) {
        return await this.writeInteraction({ function: 'transfer', ...transfer });
    }
    async evolve(newSrcTxId) {
        return await this.writeInteraction({ function: 'evolve', value: newSrcTxId });
    }
    async saveNewSource(newContractSource) {
        if (!this.signer) {
            throw new Error("Wallet not connected. Use 'connect' method first.");
        }
        const { arweave } = this.smartweave;
        const tx = await arweave.createTransaction({ data: newContractSource });
        tx.addTag(SmartWeaveTags.APP_NAME, 'SmartWeaveContractSource');
        tx.addTag(SmartWeaveTags.APP_VERSION, '0.3.0');
        tx.addTag('Content-Type', 'application/javascript');
        await this.signer(tx);
        await arweave.transactions.post(tx);
        return tx.id;
    }
}
//# sourceMappingURL=PstContractImpl.js.map