import * as A from "fp-ts/Array";

import { IssueList_A } from "../../../utils/issues";
import { RefGraph } from "../../../fhir-resources/utils/graph";
import { BSupportedResource } from "../../../fhir-resources/base/resource";
import { BoxedEncounter, FHIR_Encounter_T, insertEncounterResource } from "../../../fhir-resources/management/encounter";
import { BoxedQuestionnaire, FHIR_Questionnaire_T, insertQuestionnaireResource } from "../../../fhir-resources/definitional-artifacts/questionnaire";
import { BoxedDocumentReference, FHIR_DocumentReference_T, insertDocumentReferenceResource } from "../../../fhir-resources/documents/document-reference-r4";
import { BoxedQuestionnaireResponse, FHIR_QuestionnaireResponse_T, insertQuestionnaireResponseResource } from "../../../fhir-resources/diagnostics/questionnaire-response";


export function buildGraph (resources: BSupportedResource[]): [ IssueList_A, RefGraph ] {
    const issueLists: IssueList_A[] = [];
    const g = new RefGraph();

    for (const res of resources) {
        if (FHIR_Encounter_T.is(res.boxed)) {
            issueLists.push(insertEncounterResource(g, <BoxedEncounter>res));
        }

        if (FHIR_Questionnaire_T.is(res.boxed)) {
            issueLists.push(insertQuestionnaireResource(g, <BoxedQuestionnaire>res));
        }

        if (FHIR_QuestionnaireResponse_T.is(res.boxed)) {
            issueLists.push(insertQuestionnaireResponseResource(g, <BoxedQuestionnaireResponse>res));
        }

        if (FHIR_DocumentReference_T.is(res.boxed)) {
            issueLists.push(insertDocumentReferenceResource(g, <BoxedDocumentReference>res));
        }
    }

    return [ A.flatten(issueLists), g ];
}
