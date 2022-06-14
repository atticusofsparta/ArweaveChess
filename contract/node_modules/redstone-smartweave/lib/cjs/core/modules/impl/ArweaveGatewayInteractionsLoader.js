"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArweaveGatewayInteractionsLoader = exports.bundledTxsFilter = void 0;
const _smartweave_1 = require("../../..");
const MAX_REQUEST = 100;
function bundledTxsFilter(tx) {
    var _a, _b;
    return !((_a = tx.node.parent) === null || _a === void 0 ? void 0 : _a.id) && !((_b = tx.node.bundledIn) === null || _b === void 0 ? void 0 : _b.id);
}
exports.bundledTxsFilter = bundledTxsFilter;
class ArweaveGatewayInteractionsLoader {
    constructor(arweave) {
        this.arweave = arweave;
        this.logger = _smartweave_1.LoggerFactory.INST.create('ArweaveGatewayInteractionsLoader');
        this.arweaveWrapper = new _smartweave_1.ArweaveWrapper(arweave);
    }
    async load(contractId, fromBlockHeight, toBlockHeight, evaluationOptions) {
        this.logger.debug('Loading interactions for', { contractId, fromBlockHeight, toBlockHeight });
        const mainTransactionsVariables = {
            tags: [
                {
                    name: _smartweave_1.SmartWeaveTags.APP_NAME,
                    values: ['SmartWeaveAction']
                },
                {
                    name: _smartweave_1.SmartWeaveTags.CONTRACT_TX_ID,
                    values: [contractId]
                }
            ],
            blockFilter: {
                min: fromBlockHeight,
                max: toBlockHeight
            },
            first: MAX_REQUEST
        };
        const loadingBenchmark = _smartweave_1.Benchmark.measure();
        let interactions = await this.loadPages(mainTransactionsVariables);
        loadingBenchmark.stop();
        if (evaluationOptions.internalWrites) {
            const innerWritesVariables = {
                tags: [
                    {
                        name: _smartweave_1.SmartWeaveTags.INTERACT_WRITE,
                        values: [contractId]
                    }
                ],
                blockFilter: {
                    min: fromBlockHeight,
                    max: toBlockHeight
                },
                first: MAX_REQUEST
            };
            const innerWritesInteractions = await this.loadPages(innerWritesVariables);
            this.logger.debug('Inner writes interactions length:', innerWritesInteractions.length);
            interactions = interactions.concat(innerWritesInteractions);
        }
        this.logger.info('All loaded interactions:', {
            from: fromBlockHeight,
            to: toBlockHeight,
            loaded: interactions.length,
            time: loadingBenchmark.elapsed()
        });
        return interactions;
    }
    async loadPages(variables) {
        let transactions = await this.getNextPage(variables);
        // note: according to https://discord.com/channels/357957786904166400/756557551234973696/920918240702660638
        // protection against "bundledIn" should not be necessary..but..better safe than sorry :-)
        // note: it will be now necessary - with RedStone Sequencer
        const txInfos = transactions.edges.filter((tx) => bundledTxsFilter(tx));
        while (transactions.pageInfo.hasNextPage) {
            const cursor = transactions.edges[MAX_REQUEST - 1].cursor;
            variables = {
                ...variables,
                after: cursor
            };
            transactions = await this.getNextPage(variables);
            txInfos.push(...transactions.edges.filter((tx) => bundledTxsFilter(tx)));
        }
        return txInfos;
    }
    async getNextPage(variables) {
        const benchmark = _smartweave_1.Benchmark.measure();
        let response = await this.arweaveWrapper.gql(ArweaveGatewayInteractionsLoader.query, variables);
        this.logger.debug('GQL page load:', benchmark.elapsed());
        while (response.status === 403) {
            this.logger.warn(`GQL rate limiting, waiting ${ArweaveGatewayInteractionsLoader._30seconds}ms before next try.`);
            await (0, _smartweave_1.sleep)(ArweaveGatewayInteractionsLoader._30seconds);
            response = await this.arweaveWrapper.gql(ArweaveGatewayInteractionsLoader.query, variables);
        }
        if (response.status !== 200) {
            throw new Error(`Unable to retrieve transactions. Arweave gateway responded with status ${response.status}.`);
        }
        if (response.data.errors) {
            this.logger.error(response.data.errors);
            throw new Error('Error while loading interaction transactions');
        }
        const data = response.data;
        const txs = data.data.transactions;
        return txs;
    }
}
exports.ArweaveGatewayInteractionsLoader = ArweaveGatewayInteractionsLoader;
ArweaveGatewayInteractionsLoader.query = `query Transactions($tags: [TagFilter!]!, $blockFilter: BlockFilter!, $first: Int!, $after: String) {
    transactions(tags: $tags, block: $blockFilter, first: $first, sort: HEIGHT_ASC, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
          owner { address }
          recipient
          tags {
            name
            value
          }
          block {
            height
            id
            timestamp
          }
          fee { winston }
          quantity { winston }
          parent { id }
          bundledIn { id }
        }
        cursor
      }
    }
  }`;
ArweaveGatewayInteractionsLoader._30seconds = 30 * 1000;
//# sourceMappingURL=ArweaveGatewayInteractionsLoader.js.map