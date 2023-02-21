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
exports.makeSequenceCodeSystems = void 0;
const T = __importStar(require("fp-ts/Task"));
const E = __importStar(require("fp-ts/Either"));
const issues_1 = require("../../../utils/issues");
function makeSequenceCodeSystems(config) {
    if (config.codeSystems.length === 0) {
        return {
            resolveCodings(codings, _language) {
                return T.of(fillArray(E.left([issues_1.issueWarningStageA("empty clients list")]))(codings.length));
            }
        };
    }
    else {
        return {
            resolveCodings(codings, language) {
                return () => __awaiter(this, void 0, void 0, function* () {
                    const results = new Array(codings.length);
                    const idxmap = [];
                    for (let i = 0; i < codings.length; i++) {
                        idxmap[i] = i;
                    }
                    let stageCodings = codings;
                    let nextStageCodings = [];
                    for (const codeSystems of config.codeSystems) {
                        const stageResult = yield codeSystems.resolveCodings(stageCodings, language)();
                        nextStageCodings = [];
                        for (let i = 0; i < stageResult.length; i++) {
                            const r = stageResult[i];
                            if (E.isRight(r)) {
                                results[idxmap[i]] = r;
                            }
                            else {
                                const curr = results[idxmap[i]];
                                if (!curr) {
                                    results[idxmap[i]] = r;
                                }
                                else if (E.isLeft(curr)) {
                                    results[idxmap[i]] = E.left([...curr.left, ...r.left]);
                                }
                                // The case curr being right "should not happen":
                                // We had a resolved coding, but asked the next service again (which returned an error for this coding).
                                // In such a case we just keep the existing resolved coding.
                                // TODO: decide whether emitting an error message
                                // Rewire the index for the next stage
                                idxmap[nextStageCodings.push(stageCodings[i]) - 1] = idxmap[i];
                            }
                        }
                        stageCodings = nextStageCodings;
                    }
                    return results;
                });
            }
        };
    }
}
exports.makeSequenceCodeSystems = makeSequenceCodeSystems;
const fillArray = (content) => size => {
    const a = new Array(size);
    for (let i = 0; i < size; i++) {
        a[i] = content;
    }
    return a;
};
