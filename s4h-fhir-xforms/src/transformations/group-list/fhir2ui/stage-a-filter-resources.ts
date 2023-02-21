import * as t from "io-ts";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { ERRORS as ERR } from "../../../utils/errors";
import { BSupportedResource } from "../../../fhir-resources/base/resource";
import { Issue_A, ctx, err, msg, name, tags, warn } from "../../../utils/issues";
import { decodeDocumentReference } from "../../../fhir-resources/documents/document-reference";
import { FHIR_Encounter_T, boxEncounterResource } from "../../../fhir-resources/management/encounter";
import { boxDocumentReferenceResource } from "../../../fhir-resources/documents/document-reference-r4";
import { FHIR_Questionnaire_T, boxQuestionnaireResource } from "../../../fhir-resources/definitional-artifacts/questionnaire";
import { FHIR_QuestionnaireResponse_T, boxQuestionnaireResponseResource } from "../../../fhir-resources/diagnostics/questionnaire-response";


function decodeResource (index: number, res: unknown): E.Either<Issue_A, BSupportedResource> {
    const TAGS = tags("decodeResource");

    const mapIssue = (message: string) => E.mapLeft( (errors: t.Errors) => err({ ...msg(message), ...ctx({ errors, index }), ...TAGS, ...name(ERR.IOTS_DECODE_FAILED) }));

    // We spell out the different supported types to get better readable error messages.
    // (A single TSupportedResource.decode(...) would do the job.)
    switch (res["resourceType"]) {
        case "Encounter":             return pipe(res,             FHIR_Encounter_T.decode, mapIssue("error validating Encounter"),             E.map(boxEncounterResource));
        case "DocumentReference":     return pipe(res,             decodeDocumentReference,                                                     E.map(boxDocumentReferenceResource));
        case "Questionnaire":         return pipe(res,         FHIR_Questionnaire_T.decode, mapIssue("error validating Questionnaire"),         E.map(boxQuestionnaireResource));
        case "QuestionnaireResponse": return pipe(res, FHIR_QuestionnaireResponse_T.decode, mapIssue("error validating QuestionnaireResponse"), E.map(boxQuestionnaireResponseResource));

        default:
            return E.left(warn({ ...msg("unsupported FHIR resource type: " + res["resourceType"]), ...ctx({ resource: res, index }), ...TAGS }));
    }
}

export const decodeResources = A.mapWithIndex(decodeResource);
