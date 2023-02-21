import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { FHIR_ValueSet_A, FHIR_ValueSet_T } from "../../../../fhir-resources/types";

import { pickValueSetUrlVersionLanguage } from "../../logic";

// import VS0 from "./resources/s4h-standard-doc-types-en.valueset.json";

// import VS1 from "./resources/document-classcodes.valueset.json";

// import VS2de from "./resources/c80-practice-codes.de.valueset.json";
// import VS2en from "./resources/c80-practice-codes.en.valueset.json";
// import VS2fr from "./resources/c80-practice-codes.fr.valueset.json";
// import VS2it from "./resources/c80-practice-codes.it.valueset.json";
// import VS2nl from "./resources/c80-practice-codes.nl.valueset.json";
// import VS2pt from "./resources/c80-practice-codes.pt.valueset.json";

// import VS3de from "./resources/s4h-user-doc-types.de.valueset.json";
// import VS3en from "./resources/s4h-user-doc-types.en.valueset.json";

// import VS4 from "./resources/administrative-gender.json";
// import VS5 from "./resources/blood-groups.json";
// import VS6 from "./resources/rhesus-factors.json";
// import VS7 from "./resources/edqm-medicine-route-of-administration.json";
// import VS8 from "./resources/edqm-medicine-doseform.json";


const CANNED_VALUE_SETS: FHIR_ValueSet_A[] = pipe([ /*VS0, VS1, VS2en, VS2de, VS2pt, VS2fr, VS2it, VS2nl, VS3en, VS3de, VS4, VS5, VS6, VS7, VS8*/ ],
    A.map(FHIR_ValueSet_T.decode),
    A.map(O.fromEither), A.compact
);

export function getValueSet (valueSetUrl: string, version: O.Option<string>, language: O.Option<string>): O.Option<FHIR_ValueSet_A> {
    return pickValueSetUrlVersionLanguage(CANNED_VALUE_SETS)(valueSetUrl, version, language);
}

export function installValueSet (valueSet: FHIR_ValueSet_A): void {
    CANNED_VALUE_SETS.push(valueSet);
}
