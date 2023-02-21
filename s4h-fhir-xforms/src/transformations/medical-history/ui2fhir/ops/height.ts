import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

import { uuidv4 } from "../../../../utils/uuid";
import { EitherIssueResult } from "../../../../utils/fp-tools";
import { IssueList_A, err, info, msg, warn } from "../../../../utils/issues";

import { TauDateTime } from "../../../../fhir-resources/utils/tau";
import { FHIR_Patient_A } from "../../../../fhir-resources/individuals/patient";
import { FHIR_Observation_A } from "../../../../fhir-resources/diagnostics/observation";

import { ResourceDelta } from "../../../syncer/defs";

import { CODINGS_BODY_HEIGHT, UnitValue_A } from "../../defs";

import { PersonalData_A } from "../../defs";


const WHITELISTED_HEIGHT_UNITS = [
    "cm"
];

// eslint-disable-next-line max-params
export function handleHeightUpdate (oldModelPart: O.Option<PersonalData_A>, newModelPart: O.Option<PersonalData_A>, patient: FHIR_Patient_A, now: TauDateTime):
    EitherIssueResult<ResourceDelta[]> {

    if (O.isNone(newModelPart)) {
        return E.left([ err({ ...msg("unsupported operation: remove personal data") }) ]);
    }

    if (!isValid(newModelPart.value.height)) {
        return E.left([ err({ ...msg("no height value invalid or missing") }) ]);
    }

    if (O.isNone(oldModelPart) || (!oldModelPart.value.height) || hasChanges(oldModelPart.value.height, newModelPart.value.height)) {

        const issues: IssueList_A = [];
        if (WHITELISTED_HEIGHT_UNITS.indexOf(newModelPart.value.height.unit) === -1) {
            issues.push(warn({ ...msg(`unsupported height unit: ${newModelPart.value.height.unit}`) }));
        }

        const heightObservation: FHIR_Observation_A = {
            resourceType: "Observation",
            id: uuidv4(),
            status: "amended",

            subject: {
                ...(patient.identifier ? { identifier: patient.identifier[0] } : { reference: `Patient/${patient.id}` })
            },

            code: { coding: CODINGS_BODY_HEIGHT },

            _effectiveTag: "effectiveDateTime",
            effectiveDateTime: now,

            _valueTag: "valueQuantity",
            valueQuantity: {
                value: newModelPart.value.height.value,
                unit:  newModelPart.value.height.unit
            }
        };

        return E.right([ issues, [{ op: "create", resource: heightObservation }] ]);
    }

    return E.right([ [ info({ ...msg("no height update") }) ], [] ]);
}

function hasChanges (oldHeight: UnitValue_A, newHeight: UnitValue_A): boolean {
    return (oldHeight.unit !== newHeight.unit) || (oldHeight.value !== newHeight.value);
}

function isValid (height: UnitValue_A | undefined): boolean {
    if (typeof height !== "undefined") {
        return (typeof height.value === "number") && (typeof height.unit === "string");
    }
    return false;
}
