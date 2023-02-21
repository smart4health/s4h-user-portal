import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { join } from "../../../utils/fp-tools";
import { IssueList_A, err, msg, warn } from "../../../utils/issues";
import { BSupportedResource, SupportedResource_A } from "../../../fhir-resources/base/resource";
import { FHIR_HumanName_A, FHIR_Identifier_A, FHIR_date_A } from "../../../fhir-resources/types";
import { FHIR_Patient_A, FHIR_Patient_T, FHIR_Patient_gender_A } from "../../../fhir-resources/individuals/patient";

import { hasMetaTag } from "../../group-list/fhir2ui/stage-d-derive-groups/treatment-course/fhir-helper";


export type PatientData = {
    firstName:   string;
    lastName:    string;
    dateOfBirth: FHIR_date_A;
    gender:      FHIR_Patient_gender_A;
    resourceIdentifier?: FHIR_Identifier_A[]
};

// eslint-disable-next-line max-len
export function resolvePatientData (resolvedResources: BSupportedResource[]): E.Either<IssueList_A, { patientData: PatientData, resourceId: string, resourceIdentifier: O.Option<FHIR_Identifier_A[]> }> {
    const patientO = findPatient(pipe(resolvedResources, A.map(bres => bres.boxed)));

    if (O.isNone(patientO)) {
        return E.left([ warn({ ...msg("expected 1 Patient resource, but got none") }) ]);
    }

    const patient = patientO.value;
    if (typeof patient.name === "undefined") {
        return E.left([ err({ ...msg("Patient resource has no name property") }) ]);
    }

    if (patient.name.length === 0) {
        return E.left([ err({ ...msg("Patient resource's name array is empty") }) ]);
    }

    const mostRecentName = getMostRecent(patient.name);
    if (O.isNone(mostRecentName)) {
        return E.left([ err({ ...msg("could not determine most recent Patient name") }) ]);
    }

    return E.right({
        patientData: {
            firstName: pipe([
                pipe(mostRecentName.value.prefix, O.fromNullable, O.map(join(" "))),
                pipe(mostRecentName.value.given,  O.fromNullable, O.map(join(" ")))
            ], A.compact, join(" ")),

            lastName: pipe([
                pipe(mostRecentName.value.family, O.fromNullable),
                pipe(mostRecentName.value.suffix, O.fromNullable, O.map(join(" ")))
            ], A.compact, join(" ")),

            gender: patient.gender,
            dateOfBirth: patient.birthDate
        },
        resourceId: patient.id,
        resourceIdentifier: O.fromNullable(patient.identifier)
    });
}

function getMostRecent (elements: FHIR_HumanName_A[]): O.Option<FHIR_HumanName_A> {
    if (elements.length === 0) {
        return O.none;
    }
    return O.some(elements[0]);
}

function findPatient (resources: SupportedResource_A[]): O.Option<FHIR_Patient_A> {
    const patients = pipe(resources, A.filter(FHIR_Patient_T.is));
    if (patients.length === 0) {
        return O.none;
    }

    const taggedPatients = pipe(patients,
        A.filter(p => hasMetaTag("http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag", "medical-history")(p.meta))
    );

    if (taggedPatients.length > 0) {
        return O.some(taggedPatients[0]);
    }

    const untaggedPatients = patients;

    if (untaggedPatients.length > 0) {
        return O.some(untaggedPatients[0]);
    }

    return O.none;
}
