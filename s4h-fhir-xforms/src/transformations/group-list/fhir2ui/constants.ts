import * as O from "fp-ts/Option";

import { FHIR_Coding_A } from "../../../fhir-resources/types";


export const MERGEABLE_TYPES = [
    "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire",
    "http://fhir.smart4health.eu/Questionnaire/post-training-questionnaire",
    "http://fhir.smart4health.eu/Questionnaire/back-pain-prevention"
];

export const NA = "N/A";

export const QUESTIONNAIRE_PRE_SESSION_TYPE   = "http://fhir.smart4health.eu/Questionnaire/pre-session-questionnaire";
export const QUESTIONNAIRE_POST_SESSION_TYPE  = "http://fhir.smart4health.eu/Questionnaire/post-session-questionnaire";
export const QUESTIONNAIRE_PRE_TRAINING_TYPE  = "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire";
export const QUESTIONNAIRE_POST_TRAINING_TYPE = "http://fhir.smart4health.eu/Questionnaire/post-training-questionnaire";
export const QUESTIONNAIRE_BACKPAIN_PREVENTION_TYPE = "http://fhir.smart4health.eu/Questionnaire/back-pain-prevention";

export const QUESTIONNAIRE_PRE_SESSION_SHORT_TEXT   = "Pre";
export const QUESTIONNAIRE_POST_SESSION_SHORT_TEXT  = "Post";
export const QUESTIONNAIRE_PRE_TRAINING_SHORT_TEXT  = "Pre-training";
export const QUESTIONNAIRE_POST_TRAINING_SHORT_TEXT = "Post-training";

export const UNKNOWN_QUESTIONNAIRE_URL = "unknown";

export type SpecialScale = {
    extensionCoding: FHIR_Coding_A,
    valueMappings:   Record<string, number>,
    getNumericValue (coding: FHIR_Coding_A): O.Option<number>,
    axisLabels:      Record<string, Record<string, string>>
};

const VALUE_MAPPINGS = {
    "http://loinc.org/LA6111-4":   0,
    "http://loinc.org/LA6112-2":   1,
    "http://loinc.org/LA6113-0":   2,
    "http://loinc.org/LA6114-8":   3,
    "http://loinc.org/LA6115-5":   4,
    "http://loinc.org/LA10137-0":  5,
    "http://loinc.org/LA10138-8":  6,
    "http://loinc.org/LA10139-6":  7,
    "http://loinc.org/LA10140-4":  8,
    "http://loinc.org/LA10141-2":  9,
    "http://loinc.org/LA13942-0": 10
};

export const MIN_LABEL = "PAIN_MIN_LABEL";
export const MAX_LABEL = "PAIN_MAX_LABEL";

export const SPECIAL_SCALES: SpecialScale[] = [
    {
        extensionCoding: {
            system: "http://fhir.smart4health.eu/CodeSystem/questionnaire-ui-codes",
            code:   "painscalewithlabels"
        },

        valueMappings: VALUE_MAPPINGS,

        getNumericValue (coding: FHIR_Coding_A): O.Option<number> {
            return O.fromNullable(VALUE_MAPPINGS[`${coding.system}/${coding.code}`]);
        },

        axisLabels: {
            "en": {
                [ MIN_LABEL ]: "no pain",
                [ MAX_LABEL ]: "worst pain"
            },
            "de": {
                [ MIN_LABEL ]: "schmerzfrei",
                [ MAX_LABEL ]: "starke Schmerzen"
            }
        }
    },
    {
        extensionCoding: {
            system: "http://fhir.smart4health.eu/CodeSystem/questionnaire-ui-codes",
            code:   "wellbeingscalewithlabels"
        },

        valueMappings: VALUE_MAPPINGS,

        getNumericValue (coding: FHIR_Coding_A): O.Option<number> {
            return O.fromNullable(VALUE_MAPPINGS[`${coding.system}/${coding.code}`]);
        },

        axisLabels: {
            "en": {
                [ MIN_LABEL ]: "all well",
                [ MAX_LABEL ]: "all bad"
            },
            "de": {
                [ MIN_LABEL ]: "alles bestens",
                [ MAX_LABEL ]: "alles schlecht"
            }
        }
    }
];

export const i18n = (dicts: Record<string, Record<string, string>>): (language: string, field: string) => O.Option<string> => (language, field) => {
    const dict = dicts[language];
    if (!dict) {
        return O.none;
    }

    return O.fromNullable(dict[field]);
};

export const na = (): string => "N/A";

export const DEFAULT_LANGUAGE = "en";

export const UNKNOWN_GROUP_TYPE = "$$UNKNOWN$$";
export const GROUP_TYPE_MAPPINGS = [
    {
        system: "http://fhir.smart4health.eu/CodeSystem/s4h-encounter-type",
        code:   "back-pain-treatment",
        display: O.some("$$BACK_PAIN_TREATMENT$$")
    },
    {
        system: "http://fhir.smart4health.eu/CodeSystem/s4h-encounter-type",
        code:   "back-pain-prevention",
        display: O.some("$$BACK_PAIN_PREVENTION$$")
    }
];
