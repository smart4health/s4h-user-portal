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
exports.GROUP_TYPE_MAPPINGS = exports.UNKNOWN_GROUP_TYPE = exports.DEFAULT_LANGUAGE = exports.na = exports.i18n = exports.PAIN_MAX_LABEL = exports.PAIN_MIN_LABEL = exports.getNumericPainValue = exports.CODING_PAIN_SCALE = exports.UNKNOWN_QUESTIONNAIRE_URL = exports.QUESTIONNAIRE_POST_TRAINING_SHORT_TEXT = exports.QUESTIONNAIRE_PRE_TRAINING_SHORT_TEXT = exports.QUESTIONNAIRE_POST_SESSION_SHORT_TEXT = exports.QUESTIONNAIRE_PRE_SESSION_SHORT_TEXT = exports.QUESTIONNAIRE_POST_TRAINING_TYPE = exports.QUESTIONNAIRE_PRE_TRAINING_TYPE = exports.QUESTIONNAIRE_POST_SESSION_TYPE = exports.QUESTIONNAIRE_PRE_SESSION_TYPE = exports.NA = exports.MERGEABLE_TYPES = void 0;
const O = __importStar(require("fp-ts/Option"));
exports.MERGEABLE_TYPES = [
    "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire",
    "http://fhir.smart4health.eu/Questionnaire/post-training-questionnaire"
];
exports.NA = "N/A";
exports.QUESTIONNAIRE_PRE_SESSION_TYPE = "http://fhir.smart4health.eu/Questionnaire/pre-session-questionnaire";
exports.QUESTIONNAIRE_POST_SESSION_TYPE = "http://fhir.smart4health.eu/Questionnaire/post-session-questionnaire";
exports.QUESTIONNAIRE_PRE_TRAINING_TYPE = "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire";
exports.QUESTIONNAIRE_POST_TRAINING_TYPE = "http://fhir.smart4health.eu/Questionnaire/post-training-questionnaire";
exports.QUESTIONNAIRE_PRE_SESSION_SHORT_TEXT = "Pre";
exports.QUESTIONNAIRE_POST_SESSION_SHORT_TEXT = "Post";
exports.QUESTIONNAIRE_PRE_TRAINING_SHORT_TEXT = "Pre-training";
exports.QUESTIONNAIRE_POST_TRAINING_SHORT_TEXT = "Post-training";
exports.UNKNOWN_QUESTIONNAIRE_URL = "unknown";
exports.CODING_PAIN_SCALE = {
    system: "http://fhir.smart4health.eu/CodeSystem/questionnaire-ui-codes",
    code: "pain-scale-with-no-pain-worst-pain-labels"
};
const PAIN_MAPPING = {
    "http://loinc.org/LA6111-4": 0,
    "http://loinc.org/LA6112-2": 1,
    "http://loinc.org/LA6113-0": 2,
    "http://loinc.org/LA6114-8": 3,
    "http://loinc.org/LA6115-5": 4,
    "http://loinc.org/LA10137-0": 5,
    "http://loinc.org/LA10138-8": 6,
    "http://loinc.org/LA10139-6": 7,
    "http://loinc.org/LA10140-4": 8,
    "http://loinc.org/LA10141-2": 9,
    "http://loinc.org/LA13942-0": 10
};
function getNumericPainValue(coding) {
    return O.fromNullable(PAIN_MAPPING[`${coding.system}/${coding.code}`]);
}
exports.getNumericPainValue = getNumericPainValue;
const res = {
    "en": {
        "PAIN_MIN_LABEL": "no pain",
        "PAIN_MAX_LABEL": "worst pain"
    },
    "de": {
        "PAIN_MIN_LABEL": "schmerzfrei",
        "PAIN_MAX_LABEL": "starke Schmerzen"
    }
};
exports.PAIN_MIN_LABEL = "PAIN_MIN_LABEL";
exports.PAIN_MAX_LABEL = "PAIN_MAX_LABEL";
function i18n(language, field) {
    const dict = res[language];
    if (!dict) {
        return O.none;
    }
    return O.fromNullable(dict[field]);
}
exports.i18n = i18n;
const na = () => "N/A";
exports.na = na;
exports.DEFAULT_LANGUAGE = "en";
exports.UNKNOWN_GROUP_TYPE = "$$UNKNOWN$$";
exports.GROUP_TYPE_MAPPINGS = [
    {
        system: "http://fhir.smart4health.eu/CodeSystem/s4h-encounter-type",
        code: "back-pain-treatment",
        display: O.some("$$BACK_PAIN_TREATMENT$$")
    },
    {
        system: "http://fhir.smart4health.eu/CodeSystem/s4h-encounter-type",
        code: "back-pain-prevention",
        display: O.some("$$BACK_PAIN_PREVENTION$$")
    }
];
