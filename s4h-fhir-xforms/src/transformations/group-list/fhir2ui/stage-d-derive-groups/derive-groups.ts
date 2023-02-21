import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

import { IssueList_A, ctx, info, msg, warn } from "../../../../utils/issues";
import { RefGraph, RefNode, RefNodeList } from "../../../../fhir-resources/utils/graph";
import { FHIR_Questionnaire_T } from "../../../../fhir-resources/definitional-artifacts/questionnaire";

import { ProtoGroup } from "./defs";
import { deriveTreatmentCourseGroup } from "./treatment-course/derive-treatment-course-group";
import { deriveDocumentGroup } from "./document-reference/derive-single-document-reference-group";


export const deriveGroup = (g: RefGraph): (nodes: RefNodeList) => E.Either<IssueList_A, [ IssueList_A, ProtoGroup ]> => nodes => {
    const issueLists: IssueList_A[] = [];

    // Do not try to derive a group from Questionnaire resources
    // (they happen to form singleton graph components)
    const qUrl = singleQuestionnaireResourceUrl(nodes);
    if (O.isSome(qUrl)) {
        return E.left([ info({ ...msg(`ignoring component with a single Questionnaire resource (${qUrl.value})`) }) ]);
    }

    let ret = deriveDocumentGroup(g, nodes);
    if (E.isRight(ret)) {
        return ret;
    } else {
        issueLists.push(ret.left);
    }

    ret = deriveTreatmentCourseGroup(g, nodes);
    if (E.isRight(ret)) {
        return ret;
    } else {
        issueLists.push(ret.left);
    }

    return E.left([ warn({ ...msg("could not derive group; see issues in context"), ...ctx({
        component: A.map((node: RefNode) => node.name())(nodes),
        issues:    A.flatten(issueLists)
    }) }) ]);
};

function singleQuestionnaireResourceUrl (nodes: RefNodeList): O.Option<string> {
    if (nodes.length === 1) {
        const fhir = nodes[0].fhir();
        if (O.isSome(fhir)) {
            if (FHIR_Questionnaire_T.is(fhir.value.boxed)) {
                return O.some(fhir.value.boxed.url);
            }
        }
    }

    // Arriving here might indicate a data issue (eg, a missing Questionnaire resource for a node).
    // But this is not the right place to handle it. If it is a real issue, it will be handled by
    // the group derivation functions later.
    return O.none;
}
