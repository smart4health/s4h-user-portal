import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { flow, pipe } from "fp-ts/function";

import { EitherIssueResult } from "../../../utils/fp-tools";
import { IssueList_A, hasErrors, info, msg } from "../../../utils/issues";
import { SupportedResource_T } from "../../../fhir-resources/base/resource";
import { makeDefaultCodeSystemsList, pickFirstMerger, resolveCodeableConceptTexts } from "../../../resolve-codings/concept-resolution";

import { ModelReaderOptions } from "../../syncer";
import { getResources } from "../../syncer/resource-pool";

import { CODINGS_BODY_HEIGHT, CODINGS_BODY_WEIGHT, CODINGS_OCCUPATION } from "../defs";
import { CODINGS_BLOOD_GROUP, CODINGS_BLOOD_RH, MedicalHistory_A, PersonalData_A } from "../defs";

import { resolvePatientData } from "./patient-data";
import { decodeResources } from "./stage-a-filter-resources";
import { getObservationValueCodeableConceptFirstCoding, getObservationValueQuantity, getObservationValueString } from "./vital-data";


export function readMedicalHistory (options: ModelReaderOptions): T.Task<EitherIssueResult<MedicalHistory_A>> {
    return async () => {
        const resources = await getResources({
            sdk: options.sdk,
            resourceTypes: [ "Observation", "Patient" ]
        })();
        if (E.isLeft(resources)) {
            return resources;
        }

        const res = await fhirToMedicalHistory(pipe(resources.right[1], A.map(SupportedResource_T.encode)));
        if (E.isLeft(res)) {
            return E.left([ ...res.left, ...resources.right[0] ]);
        }

        return E.right([ [ ...res.right[0], ...resources.right[0] ], res.right[1] ]);
    };
}

// eslint-disable-next-line complexity
export async function fhirToMedicalHistory (candidateResources: unknown[]): Promise<EitherIssueResult<MedicalHistory_A>> {
    // Early exit
    if (candidateResources.length === 0) {
        return E.right([
            [ info({ ...msg("no resources specified; assuming empty account") }) ],
            { modelType: "MedicalHistory/1", personalData: undefined }
        ]);
    }

    // Stage A
    const validatedResources = decodeResources(candidateResources);
    const issuesStageA = A.lefts(validatedResources);

    // Stage A.2
    const [ issuesStageA2, resolvedResources ] = await resolveCodeableConceptTexts({
        codeSystems: await makeDefaultCodeSystemsList(),
        textExtractionStrategy: pickFirstMerger
    })(A.rights(validatedResources));

    const patientDataResult = resolvePatientData(resolvedResources);
    if (E.isLeft(patientDataResult)) {
        if (hasErrors(patientDataResult.left)) {
            return patientDataResult;
        } else {
            return E.right([
                [ info({ ...msg("no resources specified; assuming empty account") }) ],
                { modelType: "MedicalHistory/1", personalData: undefined }
            ]);
        }
    }

    const bodyWeight  = getObservationValueQuantity("body weight", CODINGS_BODY_WEIGHT)(resolvedResources);
    const bodyHeight  = getObservationValueQuantity("body height", CODINGS_BODY_HEIGHT)(resolvedResources);
    const occupation  = getObservationValueString("occupation", CODINGS_OCCUPATION)(resolvedResources);
    const bloodGroup  = getObservationValueCodeableConceptFirstCoding("blood group", CODINGS_BLOOD_GROUP)(resolvedResources);
    const bloodRhesus = getObservationValueCodeableConceptFirstCoding("blood rhesus", CODINGS_BLOOD_RH)(resolvedResources);

    // Collect all issues
    const issues: IssueList_A = [
        ...issuesStageA,
        ...issuesStageA2,
        ...(E.isLeft(bodyHeight)  ? bodyHeight.left  : []),
        ...(E.isLeft(bodyWeight)  ? bodyWeight.left  : []),
        ...(E.isLeft(bloodGroup)  ? bloodGroup.left  : []),
        ...(E.isLeft(bloodRhesus) ? bloodRhesus.left : []),
        ...(E.isLeft(occupation)  ? occupation.left  : [])
    ];

    const personalData: PersonalData_A = {
        ...patientDataResult.right.patientData,

        bloodGroup:  pipe(bloodGroup,  E.map(x => x.coding), E.getOrElse(() => undefined)),
        bloodRhesus: pipe(bloodRhesus, E.map(x => x.coding), E.getOrElse(() => undefined)),

        weight:      pipe(bodyWeight, E.map(x => x.quantity), E.getOrElse(() => undefined)),
        height:      pipe(bodyHeight, E.map(x => x.quantity), E.getOrElse(() => undefined)),

        occupation:  pipe(occupation, E.map(x => x.value), E.getOrElse(() => undefined))
    };

    return E.right([ issues, {
        modelType: "MedicalHistory/1",
        personalData,
        inputResourceIds: pipe([ patientDataResult, bloodGroup, bloodRhesus, bodyWeight, bodyHeight, occupation ],
            A.map(E.map(x => x.resourceId)),
            A.map(O.fromEither),
            A.compact
        ),
        inputResourceIdentifiers: pipe([ patientDataResult, bloodGroup, bloodRhesus, bodyWeight, bodyHeight, occupation ],
            A.map(
                flow(
                    E.map(x => x.resourceIdentifier),
                    O.fromEither,
                    O.flatten
                )
            ),
            A.compact
        )
    }]);
}
