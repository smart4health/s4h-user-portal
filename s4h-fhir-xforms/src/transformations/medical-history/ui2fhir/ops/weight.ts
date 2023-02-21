import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

import { uuidv4 } from "../../../../utils/uuid";
import { EitherIssueResult } from "../../../../utils/fp-tools";
import { IssueList_A, err, info, msg, warn } from "../../../../utils/issues";

import { TauDateTime } from "../../../../fhir-resources/utils/tau";
import { FHIR_Patient_A } from "../../../../fhir-resources/individuals/patient";
import { FHIR_Observation_A } from "../../../../fhir-resources/diagnostics/observation";

import { ResourceDelta } from "../../../syncer/defs";

import { PersonalData_A } from "../../defs";
import { CODINGS_BODY_WEIGHT, UnitValue_A } from "../../defs";


const WHITELISTED_WEIGHT_UNITS = [
    "kg"
];

// eslint-disable-next-line max-params
export function handleWeightUpdate (oldModelPart: O.Option<PersonalData_A>, newModelPart: O.Option<PersonalData_A>, patient: FHIR_Patient_A, now: TauDateTime):
    EitherIssueResult<ResourceDelta[]> {

    if (O.isNone(newModelPart)) {
        return E.left([ err({ ...msg("unsupported operation: remove personal data") }) ]);
    }

    if (!isValid(newModelPart.value.weight)) {
        return E.left([ err({ ...msg("no weight value invalid or missing") }) ]);
    }

    if (O.isNone(oldModelPart) || (!oldModelPart.value.weight) || hasChanges(oldModelPart.value.weight, newModelPart.value.weight)) {

        const issues: IssueList_A = [];
        if (WHITELISTED_WEIGHT_UNITS.indexOf(newModelPart.value.weight.unit) === -1) {
            issues.push(warn({ ...msg(`unsupported weight unit: ${newModelPart.value.weight.unit}`) }));
        }

        const weightObservation: FHIR_Observation_A = {
            resourceType: "Observation",
            id: uuidv4(),
            status: "amended",

            subject: {
                ...(patient.identifier ? { identifier: patient.identifier[0] } : { reference: `Patient/${patient.id}` })
            },

            code: { coding: CODINGS_BODY_WEIGHT },

            _effectiveTag: "effectiveDateTime",
            effectiveDateTime: now,

            _valueTag: "valueQuantity",
            valueQuantity: {
                value: newModelPart.value.weight.value,
                unit:  newModelPart.value.weight.unit
            }
        };

        return E.right([ issues, [{ op: "create", resource: weightObservation }] ]);
    }

    return E.right([ [ info({ ...msg("no weight update") }) ], [] ]);
}

function hasChanges (oldWeight: UnitValue_A, newWeight: UnitValue_A): boolean {
    return (oldWeight.unit !== newWeight.unit) || (oldWeight.value !== newWeight.value);
}

function isValid (weight: UnitValue_A | undefined): boolean {
    if (typeof weight !== "undefined") {
        return (typeof weight.value === "number") && (typeof weight.unit === "string");
    }
    return false;
}
