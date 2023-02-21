/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-nested-callbacks */
import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import D4LSDK from "@d4l/js-sdk";

import { EitherIssueResult } from "../../utils/fp-tools";
import { Issue_A, ctx, err, msg, warn } from "../../utils/issues";

import { SupportedResource_A } from "../../fhir-resources/base/resource";
import { FHIR_Condition_T } from "../../fhir-resources/summary/condition";
import { FHIR_Patient_T } from "../../fhir-resources/individuals/patient";
import { FHIR_Provenance_T } from "../../fhir-resources/security/provenance";
import { FHIR_Encounter_T } from "../../fhir-resources/management/encounter";
import { FHIR_Observation_T } from "../../fhir-resources/diagnostics/observation";
import { decodeDocumentReference } from "../../fhir-resources/documents/document-reference";
import { FHIR_AllergyIntolerance_T } from "../../fhir-resources/summary/allergy-intolerance";
import { FHIR_QuestionnaireResponse_T } from "../../fhir-resources/diagnostics/questionnaire-response";
import { FHIR_MedicationStatement_T, FHIR_Medication_T } from "../../fhir-resources/medications/medication-statement";


export type ResourcePoolOptions = {
    sdk: typeof D4LSDK;
    clientId?: string;
    resourceTypes?: string[];
};

export type TimedResourcePoolOptions = ResourcePoolOptions & {
    dateTime: Date;
};

export function getResources (options: ResourcePoolOptions): T.Task<EitherIssueResult<SupportedResource_A[]>> {

    return async () => {
        const D4LSDK = options.sdk;

        const userId = D4LSDK.getCurrentUserId();
        if (typeof userId !== "string") {
            return E.left([ err({ ...msg("SDK error: not logged in") }) ]);
        }

        try {
            let resources: E.Either<Issue_A, SupportedResource_A>[] = [];

            if (typeof options.resourceTypes !== "undefined") {
                for (const resourceType of options.resourceTypes) {
                    const fetchResults = await D4LSDK.fetchResources(userId, { limit: Number.MAX_SAFE_INTEGER, resourceType });

                    resources = [ ...resources, ...parseResources(pipe(fetchResults.records,
                        A.map(x => ({
                            ...x.fhirResource,
                            __phdpCreated: pipe(x.customCreationDate, O.fromNullable, O.map(dt => dt.toISOString()), O.getOrElse(() => undefined)),
                            __phdpUpdated: pipe(x.updatedDate,        O.fromNullable, O.map(dt => dt.toISOString()), O.getOrElse(() => undefined))
                        }) )
                    )) ];
                }

            } else {
                const fetchResults = await D4LSDK.fetchResources(userId, { limit: Number.MAX_SAFE_INTEGER });
                resources = parseResources(pipe(fetchResults.records, A.map(x => x.fhirResource)));
            }

            return E.right([ A.lefts(resources), A.rights(resources) ]);

        } catch (error) {
            return E.left([ err({ ...msg("SDK error: could not fetch resources; see context"), ...ctx({ error }) }) ]);
        }

    };
}

function parseResources (resources: fhir.Resource[]): E.Either<Issue_A, SupportedResource_A>[] {
    return pipe(resources,
        // eslint-disable-next-line complexity
        A.map(r => {
            switch (r.resourceType) {
                case "Patient":               return E.mapLeft(e => err({ ...msg("parsing error"), ...ctx({ errors: e }) }))(FHIR_Patient_T.decode(r));
                case "DocumentReference":     return E.mapLeft(e => err({ ...msg("parsing error"), ...ctx({ errors: e }) }))(decodeDocumentReference(r));
                case "Encounter":             return E.mapLeft(e => err({ ...msg("parsing error"), ...ctx({ errors: e }) }))(FHIR_Encounter_T.decode(r));
                case "Observation":           return E.mapLeft(e => err({ ...msg("parsing error"), ...ctx({ errors: e }) }))(FHIR_Observation_T.decode(r));
                case "QuestionnaireResponse": return E.mapLeft(e => err({ ...msg("parsing error"), ...ctx({ errors: e }) }))(FHIR_QuestionnaireResponse_T.decode(r));
                case "Medication":            return E.mapLeft(e => err({ ...msg("parsing error"), ...ctx({ errors: e }) }))(FHIR_Medication_T.decode(r));
                case "MedicationStatement":   return E.mapLeft(e => err({ ...msg("parsing error"), ...ctx({ errors: e }) }))(FHIR_MedicationStatement_T.decode(r));
                case "Condition":             return E.mapLeft(e => err({ ...msg("parsing error"), ...ctx({ errors: e }) }))(FHIR_Condition_T.decode(r));
                case "AllergyIntolerance":    return E.mapLeft(e => err({ ...msg("parsing error"), ...ctx({ errors: e }) }))(FHIR_AllergyIntolerance_T.decode(r));
                case "Provenance":            return E.mapLeft(e => err({ ...msg("parsing error"), ...ctx({ errors: e }) }))(FHIR_Provenance_T.decode(r));
                default: return E.left(warn({ ...msg(`unknown FHIR resource type: ${(r as any).resourceType}`) }));
            }
        })
    );
}
