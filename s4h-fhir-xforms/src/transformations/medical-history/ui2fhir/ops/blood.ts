import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

import { uuidv4 } from "../../../../utils/uuid";
import { err, info, msg } from "../../../../utils/issues";
import { EitherIssueResult } from "../../../../utils/fp-tools";

import { FHIR_Coding_A } from "../../../../fhir-resources/types";
import { TauDateTime } from "../../../../fhir-resources/utils/tau";
import { FHIR_Patient_A } from "../../../../fhir-resources/individuals/patient";
import { FHIR_Observation_A } from "../../../../fhir-resources/diagnostics/observation";

import { ResourceDelta } from "../../../syncer/defs";

import { PersonalData_A } from "../../defs";
import { CODINGS_BLOOD_GROUP, CODINGS_BLOOD_RH } from "../../defs";


// eslint-disable-next-line max-params
export function handleBloodGroupUpdate (oldModelPart: O.Option<PersonalData_A>, newModelPart: O.Option<PersonalData_A>, patient: FHIR_Patient_A, now: TauDateTime):
    EitherIssueResult<ResourceDelta[]> {

    if (O.isNone(newModelPart)) {
        return E.left([ err({ ...msg("unsupported operation: remove personal data") }) ]);
    }

    if (!isValid(newModelPart.value.bloodGroup)) {
        return E.left([ err({ ...msg("new blood group value invalid or missing") }) ]);
    }

    if (O.isNone(oldModelPart) || hasChanges(oldModelPart.value.bloodGroup, newModelPart.value.bloodGroup)) {

        const bloodGroupObservation: FHIR_Observation_A = {
            resourceType: "Observation",
            id: uuidv4(),
            status: "amended",

            subject: {
                ...(patient.identifier ? { identifier: patient.identifier[0] } : { reference: `Patient/${patient.id}` })
            },

            code: { coding: CODINGS_BLOOD_GROUP },

            _effectiveTag: "effectiveDateTime",
            effectiveDateTime: now,

            _valueTag: "valueCodeableConcept",
            valueCodeableConcept: { coding: [ newModelPart.value.bloodGroup ] }
            };

        return E.right([ [], [{ op: "create", resource: bloodGroupObservation }] ]);
    }

    return E.right([ [ info({ ...msg("no blood group update") }) ], [] ]);
}

// eslint-disable-next-line max-params
export function handleBloodRhesusUpdate (oldModelPart: O.Option<PersonalData_A>, newModelPart: O.Option<PersonalData_A>, patient: FHIR_Patient_A, now: TauDateTime):
    EitherIssueResult<ResourceDelta[]> {

    if (O.isNone(newModelPart)) {
        return E.left([ err({ ...msg("unsupported operation: remove personal data") }) ]);
    }

    if (!isValid(newModelPart.value.bloodRhesus)) {
        return E.left([ err({ ...msg("new blood rhesus value invalid or missing") }) ]);
    }

    if (O.isNone(oldModelPart) || hasChanges(oldModelPart.value.bloodRhesus, newModelPart.value.bloodRhesus)) {

        const bloodGroupObservation: FHIR_Observation_A = {
            resourceType: "Observation",
            id: uuidv4(),
            status: "amended",

            subject: {
                ...(patient.identifier ? { identifier: patient.identifier[0] } : { reference: `Patient/${patient.id}` })
            },

            code: { coding: CODINGS_BLOOD_RH },

            _effectiveTag: "effectiveDateTime",
            effectiveDateTime: now,

            _valueTag: "valueCodeableConcept",
            valueCodeableConcept: { coding: [ newModelPart.value.bloodRhesus ] }
            };

        return E.right([ [], [{ op: "create", resource: bloodGroupObservation }] ]);
    }

    return E.right([ [ info({ ...msg("no blood group update") }) ], [] ]);
}


function hasChanges (oldValue: FHIR_Coding_A | undefined, newValue: FHIR_Coding_A): boolean {
    if (typeof oldValue === "undefined") {
        return true;
    }

    return (oldValue.system !== newValue.system) || (oldValue.code !== newValue.code);
}

function isValid (coding: FHIR_Coding_A | undefined): boolean {
    if (typeof coding !== "undefined") {
        return (typeof coding.system === "string") && (typeof coding.code === "string");
    }
    return false;
}
