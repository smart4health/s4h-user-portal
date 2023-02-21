import * as O from "fp-ts/Option";

import { FHIR_CodeableConcept_A } from "./base/general-special-purpose";


export * from "./base/primitives";
export * from "./base/general-special-purpose";

export * from "./terminology/value-set";

export interface ConceptResolver {
    (concept: FHIR_CodeableConcept_A): Promise<O.Option<string>>;
}
