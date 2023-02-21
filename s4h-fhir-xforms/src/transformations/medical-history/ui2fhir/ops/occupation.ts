import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

import { uuidv4 } from "../../../../utils/uuid";
import { err, info, msg } from "../../../../utils/issues";
import { EitherIssueResult } from "../../../../utils/fp-tools";

import { TauDateTime } from "../../../../fhir-resources/utils/tau";
import { FHIR_Patient_A } from "../../../../fhir-resources/individuals/patient";
import { FHIR_Observation_A } from "../../../../fhir-resources/diagnostics/observation";

import { ResourceDelta } from "../../../syncer/defs";

import { PersonalData_A } from "../../defs";
import { CODINGS_OCCUPATION } from "../../defs";


// eslint-disable-next-line max-params
export function handleOccupationUpdate (oldModelPart: O.Option<PersonalData_A>, newModelPart: O.Option<PersonalData_A>, patient: FHIR_Patient_A, now: TauDateTime):
    EitherIssueResult<ResourceDelta[]> {

    if (O.isNone(newModelPart)) {
        return E.left([ err({ ...msg("unsupported operation: remove personal data") }) ]);
    }

    if (!isValid(newModelPart.value.occupation)) {
        return E.left([ err({ ...msg("new occupation value invalid or missing") }) ]);
    }

    if (O.isNone(oldModelPart) || hasChanges(oldModelPart.value.occupation, newModelPart.value.occupation)) {

        const occupationObservation: FHIR_Observation_A = {
            resourceType: "Observation",
            id: uuidv4(),
            status: "amended",

            subject: {
                ...(patient.identifier ? { identifier: patient.identifier[0] } : { reference: `Patient/${patient.id}` })
            },

            code: { coding: CODINGS_OCCUPATION },

            _effectiveTag: "effectiveDateTime",
            effectiveDateTime: now,

            _valueTag: "valueString",
            valueString: newModelPart.value.occupation
        };

        return E.right([ [], [{ op: "create", resource: occupationObservation }] ]);
    }

    return E.right([ [ info({ ...msg("no occupation update") }) ], [] ]);
}

function hasChanges (oldWeight: string, newWeight: string): boolean {
    return oldWeight !== newWeight;
}

function isValid (occupation: string| undefined): boolean {
    return typeof occupation === "string";
}
