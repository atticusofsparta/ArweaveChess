/**
 *
 * This class is be exposed as a global for contracts
 * as 'SmartWeave' and provides an API for getting further
 * information or using utility and crypto functions from
 * inside the contracts execution.
 *
 * It provides an api:
 *
 * - SmartWeave.transaction.id
 * - SmartWeave.transaction.reward
 * - SmartWeave.block.height
 * - SmartWeave.block.timestamp
 * - etc
 *
 * and access to some of the arweave utils:
 * - SmartWeave.arweave.utils
 * - SmartWeave.arweave.crypto
 * - SmartWeave.arweave.wallets
 * - SmartWeave.arweave.ar
 *
 * as well as access to the potentially non-deterministic full client:
 * - SmartWeave.unsafeClient
 *
 */
export class SmartWeaveGlobal {
    constructor(arweave, contract, evaluationOptions) {
        this.gasUsed = 0;
        this.gasLimit = Number.MAX_SAFE_INTEGER;
        this.unsafeClient = arweave;
        this.arweave = {
            ar: arweave.ar,
            utils: arweave.utils,
            wallets: arweave.wallets,
            crypto: arweave.crypto
        };
        this.evaluationOptions = evaluationOptions;
        this.arweave.wallets.getBalance = async (address) => {
            if (!this._activeTx) {
                throw new Error('Cannot read balance - active tx is not set.');
            }
            if (!this.block.height) {
                throw new Error('Cannot read balance - block height not set.');
            }
            // http://nyc-1.dev.arweave.net:1984/block/height/914387/wallet/M-mpNeJbg9h7mZ-uHaNsa5jwFFRAq0PsTkNWXJ-ojwI/balance
            return await fetch(`${evaluationOptions.walletBalanceUrl}block/height/${this.block.height}/wallet/${address}/balance`)
                .then((res) => {
                return res.ok ? res.text() : Promise.reject(res);
            })
                .catch((error) => {
                var _a;
                throw new Error(`Unable to read wallet balance. ${error.status}. ${(_a = error.body) === null || _a === void 0 ? void 0 : _a.message}`);
            });
        };
        this.contract = contract;
        this.transaction = new Transaction(this);
        this.block = new Block(this);
        this.contracts = {
            readContractState: (contractId, height, returnValidity) => {
                throw new Error('Not implemented - should be set by HandlerApi implementor');
            },
            viewContractState: (contractId, input) => {
                throw new Error('Not implemented - should be set by HandlerApi implementor');
            },
            write: (contractId, input) => {
                throw new Error('Not implemented - should be set by HandlerApi implementor');
            },
            refreshState: () => {
                throw new Error('Not implemented - should be set by HandlerApi implementor');
            }
        };
        this.vrf = new Vrf(this);
        this.useGas = this.useGas.bind(this);
        this.getBalance = this.getBalance.bind(this);
    }
    useGas(gas) {
        if (gas < 0) {
            throw new Error(`[RE:GNE] Gas number exception - gas < 0.`);
        }
        this.gasUsed += gas;
        if (this.gasUsed > this.gasLimit) {
            throw new Error(`[RE:OOG] Out of gas! Used: ${this.gasUsed}, limit: ${this.gasLimit}`);
        }
    }
    async getBalance(address, height) {
        if (!this._activeTx) {
            throw new Error('Cannot read balance - active tx is not set.');
        }
        if (!this.block.height) {
            throw new Error('Cannot read balance - block height not set.');
        }
        const effectiveHeight = height || this.block.height;
        // http://nyc-1.dev.arweave.net:1984/block/height/914387/wallet/M-mpNeJbg9h7mZ-uHaNsa5jwFFRAq0PsTkNWXJ-ojwI/balance
        return await fetch(`${this.evaluationOptions.walletBalanceUrl}block/height/${effectiveHeight}/wallet/${address}/balance`)
            .then((res) => {
            return res.ok ? res.text() : Promise.reject(res);
        })
            .catch((error) => {
            var _a;
            throw new Error(`Unable to read wallet balance. ${error.status}. ${(_a = error.body) === null || _a === void 0 ? void 0 : _a.message}`);
        });
    }
}
// tslint:disable-next-line: max-classes-per-file
class Transaction {
    constructor(global) {
        this.global = global;
    }
    get id() {
        if (!this.global._activeTx) {
            throw new Error('No current Tx');
        }
        return this.global._activeTx.id;
    }
    get owner() {
        if (!this.global._activeTx) {
            throw new Error('No current Tx');
        }
        return this.global._activeTx.owner.address;
    }
    get target() {
        if (!this.global._activeTx) {
            throw new Error('No current Tx');
        }
        return this.global._activeTx.recipient;
    }
    get tags() {
        if (!this.global._activeTx) {
            throw new Error('No current Tx');
        }
        return this.global._activeTx.tags;
    }
    get quantity() {
        if (!this.global._activeTx) {
            throw new Error('No current Tx');
        }
        return this.global._activeTx.quantity.winston;
    }
    get reward() {
        if (!this.global._activeTx) {
            throw new Error('No current Tx');
        }
        return this.global._activeTx.fee.winston;
    }
}
// tslint:disable-next-line: max-classes-per-file
class Block {
    constructor(global) {
        this.global = global;
    }
    get height() {
        if (!this.global._activeTx) {
            throw new Error('No current Tx');
        }
        return this.global._activeTx.block.height;
    }
    get indep_hash() {
        if (!this.global._activeTx) {
            throw new Error('No current Tx');
        }
        return this.global._activeTx.block.id;
    }
    get timestamp() {
        if (!this.global._activeTx) {
            throw new Error('No current tx');
        }
        return this.global._activeTx.block.timestamp;
    }
}
class Vrf {
    constructor(global) {
        this.global = global;
    }
    get data() {
        return this.global._activeTx.vrf;
    }
    // returns the original generated random number as a BigInt string;
    get value() {
        return this.global._activeTx.vrf.bigint;
    }
    // returns a random value in a range from 1 to maxValue
    randomInt(maxValue) {
        if (!Number.isInteger(maxValue)) {
            throw new Error('Integer max value required for random integer generation');
        }
        const result = (BigInt(this.global._activeTx.vrf.bigint) % BigInt(maxValue)) + BigInt(1);
        if (result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER) {
            throw new Error('Random int cannot be cast to number');
        }
        return Number(result);
    }
}
//# sourceMappingURL=smartweave-global.js.map