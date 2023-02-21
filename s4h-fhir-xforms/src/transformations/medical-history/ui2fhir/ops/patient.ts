import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

import { err, info, msg } from "../../../../utils/issues";
import { EitherIssueResult } from "../../../../utils/fp-tools";
import { TauDateTime } from "../../../../fhir-resources/utils/tau";
import { FHIR_Patient_A } from "../../../../fhir-resources/individuals/patient";

import { ResourceDelta } from "../../../syncer/defs";

import { PersonalData_A } from "../../defs";


// eslint-disable-next-line max-params
export function handlePatientUpdate (oldModelPart: PersonalData_A, newModelPart: O.Option<PersonalData_A>, patient: FHIR_Patient_A, _now: TauDateTime):
    EitherIssueResult<ResourceDelta[]> {

    if (O.isNone(newModelPart)) {
        return E.left([ err({ ...msg("unsupported operation: remove personal data") }) ]);
    }

    if (!isValid(newModelPart.value)) {
        return E.left([ err({ ...msg("Patient values invalid or missing") }) ]);
    }

    if (hasChanges(oldModelPart, newModelPart.value)) {

        const updatedPatient: FHIR_Patient_A = {
            ...patient,

            resourceType: "Patient",
            id:            patient.id,

            // identifier will be added by the syncer logic.

            gender:      newModelPart.value.gender,
            birthDate:   newModelPart.value.dateOfBirth,
            name: [{
                family:  newModelPart.value.lastName,
                given: [ newModelPart.value.firstName ]
            }]
        };

        return E.right([ [], [{ op: "update", resource: updatedPatient }] ]);
    }

    return E.right([ [ info({ ...msg("no weight update") }) ], [] ]);
}

function hasChanges (oldPatient: PersonalData_A, newPatient: PersonalData_A): boolean {
    return (oldPatient.firstName !== newPatient.firstName) ||
           (oldPatient.lastName !== newPatient.lastName) ||
           (oldPatient.gender !== newPatient.gender) ||
           (oldPatient.dateOfBirth !== newPatient.dateOfBirth);
}

function isValid (patient: PersonalData_A | undefined): boolean {
    if (typeof patient !== "undefined") {
        return (typeof patient.firstName === "string") &&
               (typeof patient.lastName === "string") &&
               (typeof patient.dateOfBirth !== "undefined") &&
               (typeof patient.gender === "string");
    }
    return false;
}
