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
exports.makeValueSetSourcedCodeSystems = void 0;
const A = __importStar(require("fp-ts/Array"));
const E = __importStar(require("fp-ts/Either"));
const O = __importStar(require("fp-ts/Option"));
const function_1 = require("fp-ts/function");
const constants_1 = require("../../../transformations/fhir2ui/groups/constants");
const issues_1 = require("../../../utils/issues");
function makeValueSetSourcedCodeSystems(config) {
    const makeIssuesForCodings = (codings, message, fn) => function_1.pipe(codings, A.map(coding => E.left([fn(message, { coding })])));
    return {
        resolveCodings(codings, language) {
            return () => __awaiter(this, void 0, void 0, function* () {
                // (*) Exit early if a language is requested which does not match the value set's language
                if (O.isSome(language)) {
                    const vsLanguage = O.fromNullable(config.valueSet.language());
                    if (O.isSome(vsLanguage)) {
                        if (language.value !== vsLanguage.value) {
                            return makeIssuesForCodings(codings, `value set language mismatch: ${language.value} vs ${vsLanguage.value}`, issues_1.issueWarning);
                        }
                    }
                }
                // From now onward, we can ignore the language parameter:
                // - Either it is `O.none`, then it does not matter anyway.
                // - Or it is `O.some` and arriving here means that it matches the value set's language (if it has one).
                //   - If the lookups below are successful, then the language must match, because we checked above (*).
                //   - If the lookups below fail, then the language "of the unfound coding" does not matter.
                // Note: If the language parameter is `O.some` and the value set's language is `O.none`, we ignore the requested language.
                try {
                    const contents = yield config.valueSet.lookup({});
                    return function_1.pipe(codings, A.map(lookup(contents, O.fromNullable(config.valueSet.language()))));
                }
                catch (issues) {
                    return makeIssuesForCodings(codings, "value set empty", issues_1.issueWarning);
                }
            });
        }
    };
}
exports.makeValueSetSourcedCodeSystems = makeValueSetSourcedCodeSystems;
const lookup = (valueSetContents, valueSetLanguage) => coding => {
    return function_1.pipe(valueSetContents, A.filter(c => c.system === coding.system && c.code === coding.code), codings => codings.length === 0
        ? E.left([issues_1.issueWarning("not found: " + JSON.stringify(coding))])
        : E.right(Object.assign(Object.assign({}, codings[0]), { version: "N/A", language: O.getOrElse(constants_1.na)(valueSetLanguage) })));
};
