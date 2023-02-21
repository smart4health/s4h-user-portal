/* eslint-disable max-nested-callbacks */
import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { uuidv4 } from "../../../utils/uuid";
import { EitherIssueResult } from "../../../utils/fp-tools";
import { ctx, err, msg, warn } from "../../../utils/issues";

import { TauInstant } from "../../../fhir-resources/utils/tau";
import { parseTauInstant } from "../../../fhir-resources/utils/tau/parse";
import { FHIR_Patient_A, FHIR_Patient_T } from "../../../fhir-resources/individuals/patient";
import { SupportedResource_A, SupportedResource_T } from "../../../fhir-resources/base/resource";

import { getResources } from "../../syncer/resource-pool";
import { ModelWriterOptions, commitResourceDeltas } from "../../syncer";
import { ModelWriterTaskMaker, ResourceDelta } from "../../syncer/defs";
import { hasMetaTag } from "../../group-list/fhir2ui/stage-d-derive-groups/treatment-course/fhir-helper";

import { MedicalHistory_A } from "../defs";
import { fhirToMedicalHistory } from "../fhir2ui";

import { handleWeightUpdate } from "./ops/weight";
import { handleHeightUpdate } from "./ops/height";
import { handlePatientUpdate } from "./ops/patient";
import { handleOccupationUpdate } from "./ops/occupation";
import { handleBloodGroupUpdate, handleBloodRhesusUpdate } from "./ops/blood";


export function writeMedicalHistory (newModel: MedicalHistory_A, options: ModelWriterOptions): T.Task<EitherIssueResult<MedicalHistory_A>> {
    // eslint-disable-next-line complexity
    return async () => {
        const tauInstant = parseTauInstant(options.dateTime.toISOString());
        if (E.isLeft(tauInstant)) {
            return E.left([ err({ ...msg("parsing of dateTime failed; see context"), ...ctx({ errors: tauInstant.left }) }) ]);
        }

        const resourcesBefore = await getResources({
            sdk: options.sdk,
            resourceTypes: [ "Observation", "Patient" ]
        })();
        if (E.isLeft(resourcesBefore)) {
            return resourcesBefore;
        }

        const currentModel = await fhirToMedicalHistory(pipe(resourcesBefore.right[1], A.map(SupportedResource_T.encode)));
        if (E.isLeft(currentModel)) {
            return E.left([ ...resourcesBefore.right[0], ...currentModel.left ]);
        }

        const resourceDeltas = await modelDiffToResourceDeltas(resourcesBefore.right[1], currentModel.right[1], newModel, tauInstant.right)(resourcesBefore.right[1])();
        if (E.isLeft(resourceDeltas)) {
            return E.left([ ...resourcesBefore.right[0], ...currentModel.right[0], ...resourceDeltas.left ]);
        }

        const res = await commitResourceDeltas({ sdk: options.sdk, dateTime: options.dateTime })(resourceDeltas.right[1])();
        if (E.isLeft(res)) {
            return E.left([ ...resourcesBefore.right[0], ...currentModel.right[0], ...resourceDeltas.right[0], ...res.left ]);
        }

        const resourcesPost = await getResources({
            sdk: options.sdk,
            resourceTypes: [ "Observation", "Patient" ]
        })();
        if (E.isLeft(resourcesPost)) {
            return E.left([ ...resourcesBefore.right[0], ...currentModel.right[0], ...resourceDeltas.right[0], ...res.right[0], ...resourcesPost.left ]);
        }

        const afterModel = await fhirToMedicalHistory(pipe(resourcesPost.right[1], A.map(SupportedResource_T.encode)));
        if (E.isLeft(afterModel)) {
            return E.left([ ...resourcesBefore.right[0], ...currentModel.right[0], ...resourceDeltas.right[0], ...res.right[0], ...resourcesPost.right[0], ...afterModel.left ]);
        }

        return E.right([
            [ ...resourcesBefore.right[0], ...currentModel.right[0], ...resourceDeltas.right[0], ...res.right[0], ...resourcesPost.right[0], ...afterModel.right[0] ],
            afterModel.right[1]
        ]);
    };
}


// eslint-disable-next-line max-params
export function modelDiffToResourceDeltas (resources: SupportedResource_A[], oldModel: MedicalHistory_A, newModel: MedicalHistory_A, now: TauInstant): ModelWriterTaskMaker {
    return (resources: SupportedResource_A[]) => {
        // eslint-disable-next-line complexity
        return async () => {

            if ((typeof oldModel.personalData === "undefined") && (typeof newModel.personalData === "undefined")) {
                return E.right([ [ warn({ ...msg("new and old model are empty; doing nothing") }) ], [ /* do nothing */ ] ]);
            }

            if ((typeof oldModel.personalData !== "undefined") && (typeof newModel.personalData === "undefined")) {
                return E.left([ err({ ...msg("unsupported model operation: requested deletion of personal data") }) ]);
            }

            let patient: FHIR_Patient_A;
            let patientDelta: ResourceDelta[] = [];

            // no Patient resource in account (empty oldModel), OR
            // no tagged resource but at least one other (non-empty oldModel)
            // --> create new tagged Patient resource based on newModel
            if (isEmptyModel(oldModel) || modelFromUntaggedPatient(oldModel, resources)) {
                patient = {
                    resourceType: "Patient",
                    meta: {
                        tag: [{
                            system: "http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag",
                            code: "medical-history"
                        }]
                    },
                    id: uuidv4(), // will be overwritten by the SDK
                    identifier: [
                        {
                            system: "http://fhir.smart4health.eu/CodeSystem/patient",
                            value: uuidv4()
                        }
                    ],
                    gender:      newModel.personalData.gender,
                    birthDate:   newModel.personalData.dateOfBirth,
                    name: [{
                        family:  newModel.personalData.lastName,
                        given: [ newModel.personalData.firstName ]
                    }],

                    _deceasedTag:      "none",
                    _multipleBirthTag: "none"
                };

                patientDelta.push({
                    op: "create",
                    resource: patient
                });

            } else {
                const patientO = findPatient(resources);
                if (O.isNone(patientO)) {
                    return E.left([ err({ ...msg("did not find a fitting Patient resource") }) ]);
                }

                patient = patientO.value;

                const updatedPatient = handlePatientUpdate(oldModel.personalData, O.fromNullable(newModel.personalData), patient, now);
                if (E.isLeft(updatedPatient)) {
                    return updatedPatient;
                }

                patientDelta = updatedPatient.right[1];
            }

            const weightResourceDeltas = handleWeightUpdate(O.fromNullable(oldModel.personalData), O.fromNullable(newModel.personalData), patient, now);
            if (E.isLeft(weightResourceDeltas)) {
                return weightResourceDeltas;
            }

            const heightResourceDeltas = handleHeightUpdate(O.fromNullable(oldModel.personalData), O.fromNullable(newModel.personalData), patient, now);
            if (E.isLeft(heightResourceDeltas)) {
                return heightResourceDeltas;
            }

            const occupationResourceDeltas = handleOccupationUpdate(O.fromNullable(oldModel.personalData), O.fromNullable(newModel.personalData), patient, now);
            if (E.isLeft(occupationResourceDeltas)) {
                return occupationResourceDeltas;
            }

            const bloodGroupResourceDeltas = handleBloodGroupUpdate(O.fromNullable(oldModel.personalData), O.fromNullable(newModel.personalData), patient, now);
            if (E.isLeft(bloodGroupResourceDeltas)) {
                return bloodGroupResourceDeltas;
            }

            const bloodRhesusResourceDeltas = handleBloodRhesusUpdate(O.fromNullable(oldModel.personalData), O.fromNullable(newModel.personalData), patient, now);
            if (E.isLeft(bloodRhesusResourceDeltas)) {
                return bloodRhesusResourceDeltas;
            }

            return E.right([
                [
                    ...weightResourceDeltas.right[0],
                    ...heightResourceDeltas.right[0],
                    ...occupationResourceDeltas.right[0],
                    ...bloodGroupResourceDeltas.right[0],
                    ...bloodRhesusResourceDeltas.right[0]
                ],
                [
                    ...(patientDelta ?? []),
                    ...weightResourceDeltas.right[1],
                    ...heightResourceDeltas.right[1],
                    ...occupationResourceDeltas.right[1],
                    ...bloodGroupResourceDeltas.right[1],
                    ...bloodRhesusResourceDeltas.right[1]
                ]
            ]);
        };
    };
}

function isEmptyModel (model: MedicalHistory_A): boolean {
    return typeof model.personalData === "undefined";
}

function modelFromUntaggedPatient (model: MedicalHistory_A, resources: SupportedResource_A[]): boolean {
    if (isEmptyModel(model)) {
        return false;
    }

    const patients = pipe(resources, A.filter(FHIR_Patient_T.is));

    const taggedPatients = pipe(patients,
        A.filter(p => hasMetaTag("http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag", "medical-history")(p.meta))
    );

    const untaggedPatients = pipe(patients,
        A.filter(p => !hasMetaTag("http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag", "medical-history")(p.meta))
    );

    return (taggedPatients.length === 0) && (untaggedPatients.length > 0);
}


function findPatient (resources: SupportedResource_A[]): O.Option<FHIR_Patient_A> {
    const taggedPatients = pipe(resources,
        A.filter(FHIR_Patient_T.is),
        A.filter(p => hasMetaTag("http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag", "medical-history")(p.meta))
    );

    if (taggedPatients.length > 0) {
        return O.some(taggedPatients[0]);
    }

    return O.none;
}
