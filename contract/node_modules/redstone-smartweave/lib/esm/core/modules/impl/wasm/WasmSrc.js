import { LoggerFactory } from '../../../..';
import { unzip } from 'unzipit';
import { Buffer } from 'redstone-isomorphic';
export class WasmSrc {
    constructor(src) {
        this.src = src;
        this.logger = LoggerFactory.INST.create('WasmSrc');
        this.splitted = this.splitBuffer(src);
        this.logger.debug(`Buffer splitted into ${this.splitted.length} parts`);
    }
    wasmBinary() {
        return this.splitted[0];
    }
    async sourceCode() {
        const { entries } = await unzip(this.splitted[1]);
        const result = new Map();
        for (const [name, entry] of Object.entries(entries)) {
            if (entry.isDirectory) {
                continue;
            }
            const content = await entry.text();
            result.set(name, content);
        }
        return result;
    }
    additionalCode() {
        if (this.splitted.length == 2) {
            return null;
        }
        return this.splitted[2].toString();
    }
    splitBuffer(inputBuffer) {
        let header = '';
        const elements = parseInt(inputBuffer.toString('utf8', 0, 1));
        this.logger.debug(`Number of elements: ${elements}`);
        const l = inputBuffer.length;
        let delimiters = 0;
        let dataStart = 0;
        for (let i = 2; i < l; i++) {
            const element = inputBuffer.toString('utf8', i, i + 1);
            if (element == '|') {
                delimiters++;
            }
            if (delimiters == elements) {
                dataStart = i + 1;
                break;
            }
            header += element;
        }
        this.logger.debug(`Parsed:`, {
            header,
            dataStart
        });
        const lengths = header.split('|').map((l) => parseInt(l));
        this.logger.debug('Lengths', lengths);
        const result = [];
        for (const length of lengths) {
            const buffer = Buffer.alloc(length);
            const end = dataStart + length;
            inputBuffer.copy(buffer, 0, dataStart, end);
            dataStart = end;
            result.push(buffer);
        }
        return result;
    }
}
//# sourceMappingURL=WasmSrc.js.map