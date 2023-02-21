"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignal = void 0;
/**
 * Creates a new [[Signal]] with the underlying promise pending.
 *
 * @returns new signal
 */
function createSignal() {
    let trigger;
    const signal = new Promise((resolve, _reject) => { trigger = resolve; });
    return { signal, trigger };
}
exports.createSignal = createSignal;
