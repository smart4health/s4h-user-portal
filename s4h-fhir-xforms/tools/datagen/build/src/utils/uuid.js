"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuidv4 = void 0;
function uuidv4() {
    function randomByte() {
        var _a;
        if (typeof ((_a = globalThis.crypto) === null || _a === void 0 ? void 0 : _a.getRandomValues) === "function") {
            return globalThis.crypto.getRandomValues(new Uint8Array(1))[0];
        }
        else {
            return Math.round(Math.random() * 256);
        }
    }
    const randomHexDigit = () => (randomByte() >> 4).toString(16);
    const randomVariant = () => ((randomByte() >> 6) | 0x08).toString(16);
    const pat = "xxxxxxxx-xxxx-4xxx-Yxxx-xxxxxxxxxxxx";
    return pat.replace(/x/g, randomHexDigit).replace("Y", randomVariant);
}
exports.uuidv4 = uuidv4;
