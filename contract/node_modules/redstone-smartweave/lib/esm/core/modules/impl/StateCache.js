export function canBeCached(tx) {
    // in case of using non-redstone gateway
    if (tx.confirmationStatus === undefined) {
        return true;
    }
    else {
        return tx.confirmationStatus === 'confirmed';
    }
}
//# sourceMappingURL=StateCache.js.map