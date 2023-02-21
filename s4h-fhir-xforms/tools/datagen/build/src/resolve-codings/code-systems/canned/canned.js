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
exports.makeCannedCodeSystems = void 0;
const T = __importStar(require("fp-ts/Task"));
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const E = __importStar(require("fp-ts/Either"));
const R = __importStar(require("fp-ts/Record"));
const function_1 = require("fp-ts/function");
const issues_1 = require("../../../utils/issues");
const canned_code_systems_1 = require("./data/canned-code-systems");
const key = (c) => c.system + "|" + c.code;
const DEFAULT_LANGUAGE = "en";
function makeCannedCodeSystems(config) {
    const notFoundIssue = (coding, language) => issues_1.issueWarning([
        `internal ${config.canName}: not found:`,
        `${coding.system} / ${coding.code} /`,
        O.getOrElse(() => "no language")(language)
    ].join(" "));
    const DB = loadCodings(O.getOrElse(() => [])(canned_code_systems_1.getCannedCodeSystem(config.canName)));
    return {
        resolveCodings(codings, language) {
            // Look up a single coding in DB
            function lookup(coding) {
                // (*) Get display texts for all languages of the coding
                const displayTexts = R.lookup(key(coding), DB);
                if (O.isNone(displayTexts)) {
                    return E.left([notFoundIssue(coding, language)]);
                }
                // If a desired language is given, try to find that.  If it does not exist, return error issue.
                if (O.isSome(language)) {
                    return function_1.pipe(R.lookup(language.value, displayTexts.value), O.map(display => ({ display, userSelected: coding.userSelected, language: language.value, version: "N/A" })), E.fromOption(() => [notFoundIssue(coding, language)]));
                }
                // If we arrive here, the coding has at least one display text in the DB and there is no special language requested.
                const languages = R.keys(displayTexts.value);
                if (languages.length === 0) {
                    // This case should not happen, because if there are no display texts, the lookup (*)
                    // should have failed already.  But technically, the response of (*) could be `O.some({})` instead if `O.none`.
                    return E.left([notFoundIssue(coding, language)]);
                }
                // If there is a display text for the default language, return it.
                // Else, return the first display text.
                return function_1.pipe(languages, A.findIndex(s => s === DEFAULT_LANGUAGE), O.getOrElse(() => 0), i => E.right({
                    display: displayTexts.value[languages[i]],
                    language: languages[i],
                    version: "N/A",
                    userSelected: coding.userSelected
                }));
            }
            return T.of(A.map(lookup)(codings));
        }
    };
}
exports.makeCannedCodeSystems = makeCannedCodeSystems;
function loadCodings(codings) {
    const db = {};
    for (const coding of codings) {
        const map = getOrMake(db, key(coding));
        map[coding.language] = coding.display;
    }
    return db;
}
const getOrMake = (map, key) => {
    if (!(key in map)) {
        map[key] = {};
    }
    return map[key];
};
