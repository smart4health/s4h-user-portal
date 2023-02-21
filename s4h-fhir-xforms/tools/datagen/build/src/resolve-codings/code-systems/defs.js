"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolvedCoding_T = exports.CodingResolutionError_T = exports.SuccessfullyResolvedCoding_T = void 0;
const t = __importStar(require("io-ts"));
exports.SuccessfullyResolvedCoding_T = t.intersection([
    t.type({
        language: t.string,
        version: t.string,
        display: t.string
    }),
    t.partial({
        userSelected: t.boolean
    })
]);
exports.CodingResolutionError_T = t.type({
    errors: t.array(t.string)
});
exports.ResolvedCoding_T = t.union([
    exports.SuccessfullyResolvedCoding_T,
    exports.CodingResolutionError_T
]);
