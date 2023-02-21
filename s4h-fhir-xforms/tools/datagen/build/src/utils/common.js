"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leftPadZero = exports.referenceToIdentifier = exports.second = exports.first = void 0;
const first = ([a, _]) => a;
exports.first = first;
const second = ([_, b]) => b;
exports.second = second;
function referenceToIdentifier(ref) {
    const pipeIdx = ref.indexOf("|");
    if (pipeIdx !== -1) {
        return { system: "__internal__", value: ref.substring(0, pipeIdx) };
    }
    else {
        return { system: "__internal__", value: ref };
    }
}
exports.referenceToIdentifier = referenceToIdentifier;
function leftPadZero(width, n) {
    return ("" + n).padStart(width, "0");
}
exports.leftPadZero = leftPadZero;
