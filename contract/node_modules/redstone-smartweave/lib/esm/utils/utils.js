/* eslint-disable */
import cloneDeep from 'lodash/cloneDeep';
import copy from 'fast-copy';
export const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
export const deepCopy = (input, useFastCopy = false) => {
    return useFastCopy ? copy(input) : cloneDeep(input);
};
export const mapReplacer = (key, value) => {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries())
        };
    }
    else {
        return value;
    }
};
export const mapReviver = (key, value) => {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
};
export const asc = (a, b) => a - b;
export const ascS = (a, b) => +a - +b;
export const desc = (a, b) => b - a;
export const descS = (a, b) => +b - +a;
export function timeout(s) {
    let timeoutId = null;
    const timeoutPromise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject('timeout');
        }, s * 1000);
    });
    return {
        timeoutId,
        timeoutPromise
    };
}
export function stripTrailingSlash(str) {
    return str.endsWith('/') ? str.slice(0, -1) : str;
}
//# sourceMappingURL=utils.js.map