import * as t from "io-ts";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { ERRORS as ERR } from "../../../utils/errors";
import { FHIR_Resource_T } from "../../../fhir-resources/types";
import { BSupportedResource } from "../../../fhir-resources/base/resource";
import { Issue_A, ctx, err, msg, name, tags, warn } from "../../../utils/issues";
import { FHIR_Patient_T, boxPatientResource } from "../../../fhir-resources/individuals/patient";
import { FHIR_Observation_T, boxObservationResource } from "../../../fhir-resources/diagnostics/observation";


function decodeResource (index: number, res: unknown): E.Either<Issue_A, BSupportedResource> {
    const TAGS = tags("decodeResource");

    const mapIssue = (message: string) => E.mapLeft( (errors: t.Errors) => err({ ...msg(message), ...ctx({ errors, index }), ...TAGS, ...name(ERR.IOTS_DECODE_FAILED) }));

    if (!FHIR_Resource_T.is(res)) {
        return E.left(err({
            ...msg("no object, property resourceType missing, or wrong type"),
            ...ctx({ resource: res, index }),
            ...TAGS,
            ...name(ERR.IOTS_DECODE_FAILED)
        }));
    }

    // We spell out the different supported types to get better readable error messages.
    // (A single TSupportedResource.decode(...) would do the job.)

    switch (res.resourceType) {
        case "Patient":     return pipe(res,     FHIR_Patient_T.decode, mapIssue("error validating Patient"),     E.map(boxPatientResource    ));
        case "Observation": return pipe(res, FHIR_Observation_T.decode, mapIssue("error validating Observation"), E.map(boxObservationResource));

        default:
            return E.left(warn({ ...msg("unexpected FHIR resource type: " + res.resourceType), ...ctx({ resource: res, index }), ...TAGS }));
    }
}

export const decodeResources = A.mapWithIndex(decodeResource);
