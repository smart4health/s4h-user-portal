import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import axios from "axios";

import { createSignal } from "../utils/signal";
import { IssueList_A, ctx, msg, tags, warn } from "../utils/issues";
import { BSupportedResource } from "../fhir-resources/base/resource";
import { ConceptResolver, FHIR_CodeableConcept_A, FHIR_Coding_A } from "../fhir-resources/types";
import { BoxedCondition, FHIR_Condition_T, resolveConditionConceptTexts } from "../fhir-resources/summary/condition";
import { BoxedEncounter, FHIR_Encounter_T, resolveEncounterConceptTexts } from "../fhir-resources/management/encounter";
import { BoxedObservation, FHIR_Observation_T, resolveObservationConceptTexts } from "../fhir-resources/diagnostics/observation";
import { BoxedConceptCollector, ConceptCollector_T, resolveConceptCollectorTexts } from "../fhir-resources/base/concept-collector";
import { BoxedAllergyIntolerance, FHIR_AllergyIntolerance_T, resolveAllergyIntoleranceConceptTexts } from "../fhir-resources/summary/allergy-intolerance";
import { BoxedDocumentReference, FHIR_DocumentReference_T, resolveDocumentReferenceConceptTexts } from "../fhir-resources/documents/document-reference-r4";
import { BoxedMedication, BoxedMedicationStatement, FHIR_MedicationStatement_T, FHIR_Medication_T, resolveMedicationConceptTexts, resolveMedicationStatementConceptTexts } from "../fhir-resources/medications/medication-statement";

import { makeCannedValueSet } from "./value-sets/canned/canned";
import { makeCannedCodeSystems } from "./code-systems/canned/canned";
import { ConceptResolutionOptions, TextMergerStrategy } from "./defs";
import { makeSequenceCodeSystems } from "./code-systems/sequence/sequence";
import { AugmentedResolvedCoding, CodeSystems, ResolvedCoding_A } from "./code-systems/defs";
import { makeValueSetSourcedCodeSystems } from "./code-systems/value-set-sourced/value-set-sourced";
import { makeStaticResourceCodeSystems } from "./code-systems/static-resource/static-resource";
import { BoxedProvenance, FHIR_Provenance_T, resolveProvenanceConceptTexts } from "../fhir-resources/security/provenance";


const ISS_FACILITY = "concept-resolve";

export const resolveCodeableConceptTexts = (options: ConceptResolutionOptions):
    (resources: BSupportedResource[]) => Promise<[ IssueList_A, BSupportedResource[] ]> => async resources => {

    let issues: IssueList_A = [];
    const lock = createSignal();

    const inputCodings: FHIR_Coding_A[] = [];
    let outputCodings:  E.Either<IssueList_A, ResolvedCoding_A>[] = [];

    const conceptPromises: Promise<O.Option<string>>[] = [];

    function resolveConceptText (concept: FHIR_CodeableConcept_A): Promise<O.Option<string>> {
        if (typeof concept.coding === "undefined") {
            if (typeof concept.text === "string") {
                return Promise.resolve(O.some(concept.text));
            } else {
                issues.push(warn({ ...msg("concept has neither text nor coding property"), ...ctx({ concept }), ...tags(ISS_FACILITY) }));
                return Promise.resolve(O.none);
            }
        }

        if (!(concept.coding instanceof Array)) {
            issues.push(warn({ ...msg("concept's coding property is not an array"), ...ctx({ concept }), ...tags(ISS_FACILITY) }));
            return Promise.resolve(O.none);
        }

        if (concept.coding.length === 0) {
            issues.push(warn({ ...msg("concept's coding array is empty"), ...ctx({ concept }), ...tags(ISS_FACILITY) }));
            return Promise.resolve(O.none);
        }

        const offset = inputCodings.length;
        const waiters: Promise<E.Either<IssueList_A, ResolvedCoding_A>>[] = [];
        for (const coding of concept.coding) {
            const idx = inputCodings.push(coding) - 1;
            waiters.push(lock.signal.then(() => outputCodings[idx]));
        }

        // Carry over the original display property and userSelected flag, so it can be used by a text merge strategy, if needed.
        const augment = A.mapWithIndex((i: number, c: E.Either<IssueList_A, ResolvedCoding_A>): AugmentedResolvedCoding => {
            if (E.isLeft(c)) {
                return {
                    resolvedDisplay: O.none,
                    originalDisplay: O.fromNullable(inputCodings[offset + i].display),
                    userSelected:    O.fromNullable(inputCodings[offset + i].userSelected)
                };
            } else {
                return {
                    resolvedDisplay: O.some(c.right.resolvedDisplay),
                    originalDisplay: O.fromNullable(inputCodings[offset + i].display),
                    userSelected:    O.fromNullable(inputCodings[offset + i].userSelected)
                };
            }
        });

        const conceptPromise = Promise.all(waiters)
            .then(resolvedConceptCodings => {
                issues = [ ...issues, ...pipe(resolvedConceptCodings, A.lefts, A.flatten) ];
                return extract(augment(resolvedConceptCodings), O.fromNullable(concept.text), options.textExtractionStrategy);
            });

        conceptPromises.push(conceptPromise);
        return conceptPromise;
    }

    const iss = A.map(resolveResourceConceptTexts(resolveConceptText))(resources);
    issues = [ ...issues, ...A.flatten(iss) ];

    // call service(s)
    outputCodings = await makeSequenceCodeSystems({ codeSystems: options.codeSystems }).resolveCodings(inputCodings, O.fromNullable(options.language))();

    // Trigger read outs of the concepts
    lock.trigger();
    await Promise.all(conceptPromises);

    return [ issues, resources ];
};



// eslint-disable-next-line complexity
const resolveResourceConceptTexts = (resolver: ConceptResolver): (res: BSupportedResource) => IssueList_A => res => {

    if (FHIR_DocumentReference_T.is(res.boxed)) {
        resolveDocumentReferenceConceptTexts(resolver, res as BoxedDocumentReference);
        return [];
    }

    if (FHIR_Encounter_T.is(res.boxed)) {
        resolveEncounterConceptTexts(resolver, res as BoxedEncounter);
        return [];
    }

    if (FHIR_Observation_T.is(res.boxed)) {
        resolveObservationConceptTexts(resolver, res as BoxedObservation);
        return [];
    }

    if (FHIR_MedicationStatement_T.is(res.boxed)) {
        resolveMedicationStatementConceptTexts(resolver, res as BoxedMedicationStatement);
        return [];
    }

    if (FHIR_Medication_T.is(res.boxed)) {
        resolveMedicationConceptTexts(resolver, res as BoxedMedication);
        return [];
    }

    if (FHIR_Condition_T.is(res.boxed)) {
        resolveConditionConceptTexts(resolver, res as BoxedCondition);
        return [];
    }

    if (ConceptCollector_T.is(res.boxed)) {
        resolveConceptCollectorTexts(resolver, res as BoxedConceptCollector);
        return [];
    }

    if (FHIR_AllergyIntolerance_T.is(res.boxed)) {
        resolveAllergyIntoleranceConceptTexts(resolver, res as BoxedAllergyIntolerance);
        return [];
    }

    if (FHIR_Provenance_T.is(res.boxed)) {
        resolveProvenanceConceptTexts(resolver, res as BoxedProvenance);
        return [];
    }

    return [{ severity: "warning", message: "unrecognized/unsupported resource; see context", context: { resource: res }, tags: { "concept-resolution": null } }];
};


function extract (texts: AugmentedResolvedCoding[], defaultValue: O.Option<string>, merger: TextMergerStrategy): O.Option<string>  {
    if (texts.length === 0) {
        return defaultValue;
    }

    // Collect all codings that could be resolved
    const resolved = pipe(texts, A.map(x => O.isSome(x.resolvedDisplay) ? O.some({
        ...x, resolvedDisplay: x.resolvedDisplay.value
    }) : O.none ), A.compact);

    // If there are no resolved codings...
    if (resolved.length === 0) {
        // If no coding could be resolved, return the default value (the 'text' property), if present

        // Return default value, if given (typically the CC's text property)
        if (O.isSome(defaultValue)) {
            return defaultValue;
        }

        const originalDisplay = pipe(texts,
            A.filter(c => O.isSome(c.originalDisplay))
        );

        // Return none if there is no display string given for any coding
        if (originalDisplay.length === 0) {
            return O.none;
        }

        // If we arrive here, we have at least one coding with a display string.
        // Let's see whether we return those or a subset in case the userSelected flags are set.

        const userSelected = pipe(originalDisplay,
            A.filter(c => O.isSome(c.userSelected) && c.userSelected.value === true),
            A.map(x => x.originalDisplay),
            A.compact
        );

        if (userSelected.length > 0) {
            return O.some(merger(userSelected));
        }

        return O.some(merger(pipe(originalDisplay, A.map(x => x.originalDisplay), A.compact)));

    } else {
        const userSelected = pipe(resolved, A.filter(c => O.isSome(c.userSelected) && c.userSelected.value === true));
        if (userSelected.length > 0) {
            return O.some(pipe(userSelected, A.map(t => t.resolvedDisplay), merger));
        } else {
            return O.some(pipe(resolved, A.map(t => t.resolvedDisplay), merger));
        }
    }
}

export const nopMerger: TextMergerStrategy = (_texts) => "";

export const joinMerger = (sep: string): TextMergerStrategy => texts => texts.join(sep);

export const pickFirstMerger: TextMergerStrategy = texts => {
    if (texts.length === 0) {
        return "";
    } else {
        return texts[0];
    }
};


export async function makeDefaultCodeSystemsList (): Promise<CodeSystems[]> {
    return [
        makeCannedCodeSystems({ canName: "default" }),
        makeCannedCodeSystems({ canName: "timing" }),
        makeCannedCodeSystems({ canName: "ucum" }),
        makeCannedCodeSystems({ canName: "mini" }),
        makeSequenceCodeSystems({ codeSystems: [
            makeValueSetSourcedCodeSystems({ valueSet: await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/c80-practice-codes" }) }),
            makeValueSetSourcedCodeSystems({ valueSet: await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/document-classcodes" }) }),
            makeValueSetSourcedCodeSystems({ valueSet: await makeCannedValueSet({ valueSetUrl: "http://fhir.smart4health.eu/ValueSet/s4h-standard-document-types" }) }),
            makeValueSetSourcedCodeSystems({ valueSet: await makeCannedValueSet({ valueSetUrl: "http://fhir.smart4health.eu/ValueSet/s4h-user-doc-types" }) }),
            makeValueSetSourcedCodeSystems({ valueSet: await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/uv/ips/ValueSet/medicine-route-of-administration" }) }),
            makeValueSetSourcedCodeSystems({ valueSet: await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/uv/ips/ValueSet/medicine-doseform" }) })
        ] }),
        makeStaticResourceCodeSystems({ axios })
    ];
}
