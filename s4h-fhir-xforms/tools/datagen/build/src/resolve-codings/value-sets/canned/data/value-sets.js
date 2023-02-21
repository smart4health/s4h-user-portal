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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installValueSet = exports.getValueSet = void 0;
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const function_1 = require("fp-ts/function");
const types_1 = require("../../../../fhir-resources/types");
const s4h_standard_doc_types_en_valueset_json_1 = __importDefault(require("./resources/s4h-standard-doc-types-en.valueset.json"));
const document_classcodes_valueset_json_1 = __importDefault(require("./resources/document-classcodes.valueset.json"));
const c80_practice_codes_valueset_json_1 = __importDefault(require("./resources/c80-practice-codes.valueset.json"));
const s4h_user_doc_types_de_valueset_json_1 = __importDefault(require("./resources/s4h-user-doc-types.de.valueset.json"));
const s4h_user_doc_types_en_valueset_json_1 = __importDefault(require("./resources/s4h-user-doc-types.en.valueset.json"));
const logic_1 = require("../../logic");
const CANNED_VALUE_SETS = function_1.pipe([s4h_standard_doc_types_en_valueset_json_1.default, document_classcodes_valueset_json_1.default, c80_practice_codes_valueset_json_1.default, s4h_user_doc_types_en_valueset_json_1.default, s4h_user_doc_types_de_valueset_json_1.default], A.map(types_1.FHIR_ValueSet_T.decode), A.map(O.fromEither), A.compact);
function getValueSet(valueSetUrl, version, language) {
    return logic_1.pickValueSetUrlVersionLanguage(CANNED_VALUE_SETS)(valueSetUrl, version, language);
}
exports.getValueSet = getValueSet;
function installValueSet(valueSet) {
    CANNED_VALUE_SETS.push(valueSet);
}
exports.installValueSet = installValueSet;
