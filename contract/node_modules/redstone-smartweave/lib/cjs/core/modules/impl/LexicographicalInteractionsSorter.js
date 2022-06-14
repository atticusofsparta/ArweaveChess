"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexicographicalInteractionsSorter = void 0;
const _smartweave_1 = require("../../..");
// note: this (i.e. padding to 13 digits) should be safe between years ~1966 and ~2286
const defaultArweaveMs = ''.padEnd(13, '9');
/**
 * implementation that is based on current's SDK sorting alg.
 */
class LexicographicalInteractionsSorter {
    constructor(arweave) {
        this.arweave = arweave;
        this.logger = _smartweave_1.LoggerFactory.INST.create('LexicographicalInteractionsSorter');
    }
    async sort(transactions) {
        const copy = [...transactions];
        const addKeysFuncs = copy.map((tx) => this.addSortKey(tx));
        await Promise.all(addKeysFuncs);
        return copy.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }
    async addSortKey(txInfo) {
        const { node } = txInfo;
        // might have been already set by the RedStone Sequencer
        if (txInfo.node.sortKey !== undefined && txInfo.node.source == _smartweave_1.SourceType.REDSTONE_SEQUENCER) {
            this.logger.debug('Using sortkey from sequencer', txInfo.node.sortKey);
            txInfo.sortKey = txInfo.node.sortKey;
        }
        else {
            txInfo.sortKey = await this.createSortKey(node.block.id, node.id, node.block.height);
        }
    }
    async createSortKey(blockId, transactionId, blockHeight) {
        const blockHashBytes = this.arweave.utils.b64UrlToBuffer(blockId);
        const txIdBytes = this.arweave.utils.b64UrlToBuffer(transactionId);
        const concatenated = this.arweave.utils.concatBuffers([blockHashBytes, txIdBytes]);
        const hashed = (0, _smartweave_1.arrayToHex)(await this.arweave.crypto.hash(concatenated));
        const blockHeightString = `${blockHeight}`.padStart(12, '0');
        return `${blockHeightString},${defaultArweaveMs},${hashed}`;
    }
}
exports.LexicographicalInteractionsSorter = LexicographicalInteractionsSorter;
//# sourceMappingURL=LexicographicalInteractionsSorter.js.map