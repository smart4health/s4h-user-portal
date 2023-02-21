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
exports.pickValueSetUrlVersionLanguage = void 0;
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const function_1 = require("fp-ts/function");
const pickValueSetUrlVersionLanguage = (valueSets) => (valueSetUrl, version, language) => {
    const res = function_1.pipe(valueSets, A.filter(vs => vs.url === valueSetUrl), A.filter(propEq("version")(version)), A.filter(propEq("language")(language)));
    if (res.length === 0) {
        return O.none;
    }
    if (res.length === 1) {
        return O.some(res[0]);
    }
    // TODO: Implement remaining logic
    return O.some(res[0]);
};
exports.pickValueSetUrlVersionLanguage = pickValueSetUrlVersionLanguage;
const propEq = (propName) => value => vs => {
    if (O.isNone(value)) {
        return true;
    }
    const propValue = vs[propName];
    if (typeof propValue !== "undefined") {
        return propValue === value.value;
    }
    return true;
};
