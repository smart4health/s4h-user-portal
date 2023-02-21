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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCannedValueSet = void 0;
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const function_1 = require("fp-ts/function");
const Ord_1 = require("fp-ts/Ord");
const value_sets_1 = require("./data/value-sets");
const issues_1 = require("../../../utils/issues");
function makeCannedValueSet(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const vs = value_sets_1.getValueSet(config.valueSetUrl, O.fromNullable(config.version), O.fromNullable(config.language));
        return {
            lookup(params) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (O.isNone(vs)) {
                        return [];
                    }
                    if (params.offset < 0) {
                        throw [issues_1.issueError("offset must not be negative")];
                    }
                    if (typeof vs.value.expansion === "undefined") {
                        throw [issues_1.issueError(`value set ${config.valueSetUrl} has no expansion`)];
                    }
                    const bySystem = Ord_1.contramap((c) => c.system)(Ord_1.ordString);
                    const byCode = Ord_1.contramap((c) => c.code)(Ord_1.ordString);
                    return function_1.pipe(vs.value.expansion.contains, A.sortBy([bySystem, byCode]), cs => { var _a; return cs.slice((_a = params.offset) !== null && _a !== void 0 ? _a : 0); }, cs => cs.slice(0, limit(params.limit)), A.map(c => ({
                        system: "" + c.system,
                        code: "" + c.code,
                        display: "" + c.display
                    })));
                });
            },
            search(_params) {
                return __awaiter(this, void 0, void 0, function* () {
                    throw [issues_1.issueError("search not implemented yet for canned value sets")];
                });
            },
            language() {
                return function_1.pipe(vs, O.mapNullable(vs => vs.language), O.getOrElse(() => undefined));
            }
        };
    });
}
exports.makeCannedValueSet = makeCannedValueSet;
const limit = (n) => {
    if (typeof n === "number" && n > 0) {
        return n;
    }
    return Number.MAX_SAFE_INTEGER;
};
