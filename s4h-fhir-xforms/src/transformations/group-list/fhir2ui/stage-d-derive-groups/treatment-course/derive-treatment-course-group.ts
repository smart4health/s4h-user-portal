import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import { contramap } from "fp-ts/Ord";
import { flow, pipe } from "fp-ts/function";
import { groupBy } from "fp-ts/NonEmptyArray";

import { first, second } from "../../../../../utils/common";
import { arrayContains } from "../../../../../utils/fp-tools";

import { FHIR_Identifier_A } from "../../../../../fhir-resources/types";
import { referenceToIdentifier } from "../../../../../fhir-resources/utils";
import { maxAllOrNone, ordTau } from "../../../../../fhir-resources/utils/tau";
import { FHIR_Encounter_T } from "../../../../../fhir-resources/management/encounter";
import { BoxedDocumentReference, FHIR_DocumentReference_T } from "../../../../../fhir-resources/documents/document-reference-r4";
import { FHIR_Questionnaire_A, FHIR_Questionnaire_Item, FHIR_Questionnaire_T } from "../../../../../fhir-resources/definitional-artifacts/questionnaire";
import { FHIR_QuestionnaireResponse_A, FHIR_QuestionnaireResponse_Item, FHIR_QuestionnaireResponse_T, IValueDecimal, IValueInteger } from "../../../../../fhir-resources/diagnostics/questionnaire-response";

import { IssueList_A, ctx, err, msg, warn } from "../../../../../utils/issues";
import { RefEdge, RefGraph, RefNode, RefNodeList, idString } from "../../../../../fhir-resources/utils/graph";
import { makeDocumentReferenceGroupItems } from "../document-reference/derive-single-document-reference-group";
import { DEFAULT_LANGUAGE, MAX_LABEL, MIN_LABEL, SPECIAL_SCALES, SpecialScale, UNKNOWN_QUESTIONNAIRE_URL, i18n, na } from "../../constants";
import { URL_ITEM_CONTROL_EXTENSION, getDisplayFromValueSet, getQuestionnaireItemForLinkId, getValueSetFromQuestionnaire, isExtension } from "./fhir-helper";
import { ProtoDecimalResponse, ProtoGroup, ProtoGroupItem, ProtoIntegerResponse, ProtoQuestionnaireResponse, ProtoQuestionnaireSection, ProtoScaleResponse, ProtoTextResponse, trainingNumberFromResponses } from "../defs";
import { BSupportedResource } from "../../../../../fhir-resources/base/resource";


/**
 * This function attempts to derive a course of treatment group from the subgraph of `g` induced by `nodes`.
 *
 * As an example, consider [./docs/img/example/graph.png]: Graph `g` is the entire image, `nodes` is a gray subset.
 *
 * @param g     The graph built from all the resources
 * @param nodes The nodes of a disconnected component that is attempted to be turned into a Group
 *
 * @return      In case of hard error(s): an issue list containing those errors; else a pair of (soft) issues and the group
 */
export function deriveTreatmentCourseGroup (g: RefGraph, nodes: RefNodeList): E.Either<IssueList_A, [ IssueList_A, ProtoGroup ]> {
    if (nodes.length === 0) {
        return E.left([ warn({ ...msg("component is empty") }) ]);
    }

    // Helper functions
    const unknownName        = () => ({ name: () => "unknown" });
    const targetNodeName     = (e: RefEdge) => O.getOrElseW(unknownName)(subgraph.getNode(e[1])).name();
    const getSourceNode      = (e: RefEdge) => g.getNode(e[0]);
    const byDate             = contramap( (g: ProtoGroupItem) => g.date)(O.getOrd(ordTau));
    const getValue           = (_k: string, v: FHIR_Identifier_A[]) => v;
    const collectValues      = flow(R.collect(getValue), A.flatten);

    const subgraph    = g.getSubgraphFromNodes(nodes);
    const partOfEdges = subgraph.getEdgesByType("partOf");
    const rootEdges   = groupBy<RefEdge>(targetNodeName)(partOfEdges);

    // There should be only one root node
    const rootNodeNames = Object.keys(rootEdges);
    if (rootNodeNames.length === 0) {
        return E.left([ warn({ ...msg("subgraph has no root(s)") }) ]);
    }
    if (rootNodeNames.length > 1) {
        return E.left([ warn({ ...msg("subgraph is not a simple tree") }) ]);
    }

    const result = pipe(
        rootEdges[rootNodeNames[0]],  // get edges pointing to root node
        A.map(getSourceNode),         // get edges' source nodes (encounter; could be "none")
        A.compact,                    // keep only the "some" ones
        A.map(node => g.getChildren(node)), // get children of each node
        A.map(collectValues),         // list of children identifier lists
        A.flatten,                    // list of children identifiers
        A.map(groupItemsFromChild(g)) // derive GroupItem(s) for each child
    );

    const issues: IssueList_A[] = A.lefts(result);
    issues.push(pipe(result, A.rights, A.map(first), A.flatten));

    const group: ProtoGroup = {
        sourceType:    "Course",
        id:             rootNodeNames[0],
        date:           O.none, // none for the moment, updated below
        encounterTypes: [],     // empty for the moment, updated below
        items: pipe(result,
            A.rights,      // get the good results
            A.map(second), // extract the ProtoGroupItem lists
            A.flatten,     // list of ProtoGroupItems
            A.sort(byDate)
        ),
        inputResourceIds: pipe(subgraph.getNodes(),
            A.map(n => n.fhir()),
            A.compact,
            A.map(f => f.boxed.id)
        ),
        inputResourceIdentifiers: pipe(subgraph.getNodes(),
            A.map(n => n.fhir()),
            A.compact,
            A.map(identifierArray),
            A.compact
        )
    };

    // Set group's date to maximum of all its items' dates
    group.date = pipe(
        group.items,
        A.map(item => item.date),
        A.compact,
        maxAllOrNone
    );

    group.encounterTypes = pipe(group.items,
        A.map(item => item.encounterType),
        A.map(O.getOrElse(() => [])),
        A.flatten
    );

    return E.right([ A.flatten(issues), group ]);
}

const identifierArray = (b: BSupportedResource): O.Option<FHIR_Identifier_A[]> => {
    if (typeof b.boxed.identifier === "undefined") { return O.none; }

    if (b.boxed.identifier instanceof Array) {
        return O.some(b.boxed.identifier);
    } else {
        return O.some([ b.boxed.identifier ]);
    }
};

// eslint-disable-next-line complexity
const groupItemsFromChild = (g: RefGraph): (idChild: FHIR_Identifier_A) => E.Either<IssueList_A, [ IssueList_A, ProtoGroupItem[] ]> => idChild => {

    const issues: IssueList_A[] = [];
    const items:  ProtoGroupItem[] = [];

    const child = g.getNode(idChild);
    if (O.isNone(child)) {
        return E.left([ err({ ...msg(`no node for child ID ${idString(idChild)}`) }) ]);
    }

    const fhir = child.value.fhir();
    if (O.isNone(fhir)) {
        return E.left([ err({ ...msg(`no FHIR resource for child node ${child.value.name()} (${idString(idChild)})`) }) ]);
    }

    if (FHIR_QuestionnaireResponse_T.is(fhir.value.boxed)) {
        const parentEncounterNode = g.getNode(fhir.value.boxed.encounter.identifier);
        if (O.isNone(parentEncounterNode)) {
            return E.left([ err({ ...msg(`QuestionnaireResponse ${idString(idChild)}} has no parent encounterID`) }) ]);
        }
        const parentEncounter = pipe(parentEncounterNode.value.fhir(),
            O.map(res => res.boxed),
            O.filter(FHIR_Encounter_T.is)
        );

        const section = deriveQuestionnaireResponseSection(g, fhir.value.boxed);
        if (E.isLeft(section)) {
            issues.push(section.left);
        } else {
            issues.push(section.right[0]);
            items.push({
                type:          "Questionnaire",
                id:             fhir.value.boxed.id,
                identifier:     fhir.value.boxed.identifier ? [ fhir.value.boxed.identifier ] : [],
                date:           O.fromNullable(fhir.value.boxed.authored),
                trainingNumber: trainingNumberFromResponses(section.right[1].responses),
                shortText:      O.none, // used in downstream stages
                sections:       [ section.right[1] ],
                encounter:      pipe(parentEncounter, O.map(enc => enc.id)),
                encounterType:  pipe(parentEncounter, O.chain(enc => O.fromNullable(enc.type)))
            });
        }

    } else if (FHIR_DocumentReference_T.is(fhir.value.boxed)) {
        let parentEncounters: O.Option<RefNode>[] = [];
        if (fhir.value.boxed.context?.encounter) {
            parentEncounters = pipe(fhir.value.boxed.context.encounter,
                A.filter(elm => typeof elm.identifier !== "undefined"),
                A.map(elm => g.getNode(elm.identifier))
            );
        }

        items.push(...makeDocumentReferenceGroupItems(parentEncounters, fhir.value as BoxedDocumentReference));

    } else {
        issues.push([ warn({ ...msg("unsupported FHIR resource"), ...ctx({ res: fhir.value }) }) ]);
    }

    return E.right([ A.flatten(issues), items ]);
};

function deriveQuestionnaireResponseSection (g: RefGraph, qr: FHIR_QuestionnaireResponse_A):
    E.Either<IssueList_A, [ IssueList_A, ProtoQuestionnaireSection ]> {

    if (!qr.questionnaire) {
        return E.left([ err({ ...msg("questionnaire reference not set") }) ]);
    }

    const questionnaireNode = g.getNode(referenceToIdentifier(qr.questionnaire));
    if (O.isNone(questionnaireNode)) {
        return E.left([ err({ ...msg("questionnaire reference not found in graph: " + JSON.stringify(qr.questionnaire)) }) ]);
    }

    const fhirQuestionnaire = questionnaireNode.value.fhir();
    if (O.isNone(fhirQuestionnaire)) {
        return E.left([ err({ ...msg("questionnaire node has no FHIR resource: " + qr.id) }) ]);
    }

    if (!FHIR_Questionnaire_T.is(fhirQuestionnaire.value.boxed)) {
        return E.left([ err({ ...msg("questionnaire node's FHIR resource is not a Questionnaire resource") }) ]);
    }

    if (!qr.item) {
        return E.left([ err({ ...msg("questionnaire response has no answers array") }) ]);
    }

    const responses = A.map(deriveResponse(fhirQuestionnaire.value.boxed))(qr.item);

    return E.right([
        // collect issues
        [ ...A.flatten(A.lefts(responses)), ...pipe(responses, A.rights, A.map(first), A.flatten) ],

        // collect derived responses
        {
            title:     fhirQuestionnaire.value.boxed.title,
            questionnaireId: fhirQuestionnaire.value.boxed.id,
            questionnaireResponseId: qr.id,
            type:      fhirQuestionnaire.value.boxed.url ?? UNKNOWN_QUESTIONNAIRE_URL,
            date:      O.fromNullable(qr.authored),
            responses: A.map(second)(A.rights(responses))
        }
    ]);
}


const deriveResponse = (q: FHIR_Questionnaire_A):
    (responseItem: FHIR_QuestionnaireResponse_Item) => E.Either<IssueList_A, [ IssueList_A, ProtoQuestionnaireResponse ]> => responseItem => {

    // Decide whether we deal with a ScaleResponse or a TextResponse.
    // (We do it in-place here, because we only have two response types, so making it generic would be unreasonable.)

    const questionnaireItem = getQuestionnaireItemForLinkId(q, responseItem.linkId);
    if (O.isNone(questionnaireItem)) {
        return E.left([ err({ ...msg("no item in questionnaire for linkId " + responseItem.linkId) }) ]);
    }

    // Determine ScaleResponse type (for now: pain or well-being)
    for (const scaleDesc of SPECIAL_SCALES) {
        if (arrayContains(isExtension(URL_ITEM_CONTROL_EXTENSION, scaleDesc.extensionCoding))(questionnaireItem.value.extension)) {
            return derivePainScaleResponse(q, questionnaireItem.value, responseItem, scaleDesc);
        }
    }

    // TextResponse is default
    return deriveScalarResponse(q, questionnaireItem.value, responseItem);
};

// eslint-disable-next-line max-params
function derivePainScaleResponse (q: FHIR_Questionnaire_A, qItem: FHIR_Questionnaire_Item, responseItem: FHIR_QuestionnaireResponse_Item, scaleDesc: SpecialScale):
    E.Either<IssueList_A, [ IssueList_A, ProtoScaleResponse ]> {

    const issues: IssueList_A = [];

    if (!responseItem.answer) {
        return E.left([ err({ ...msg("answer is undefined") }) ]);
    }

    if (responseItem.answer.length !== 1) {
        return E.left([ err({ ...msg("only one answer supported yet") }) ]);
    }

    if (responseItem.answer[0]._valueTag !== "valueCoding") {
        return E.left([ err({ ...msg("answer is not a value coding") }) ]);
    }

    const painValue = scaleDesc.getNumericValue(responseItem.answer[0].valueCoding);
    if (O.isNone(painValue)) {
        return E.left([ err({ ...msg("pain value not found") }) ]);
    }

    const lang = q.language ?? DEFAULT_LANGUAGE;

    let questionTitle = "";
    if (!qItem.text) {
        issues.push(warn({ ...msg(`item ${responseItem.linkId} in questionnaire ${q.id} is empty; using text of questionnaire response`) }));
    } else {
        questionTitle = qItem.text;
    }

    return E.right([ issues, {
        type:          "Scale",
        questionTitle,
        linkId:         responseItem.linkId,
        scaleValue:     painValue.value,
        scaleMinValue:  0,
        scaleMaxValue: 10,
        scaleMinValueLabel: O.getOrElse(na)(i18n(scaleDesc.axisLabels)(lang, MIN_LABEL)),
        scaleMaxValueLabel: O.getOrElse(na)(i18n(scaleDesc.axisLabels)(lang, MAX_LABEL))
    }]);
}

const deriveScalarResponse = (q: FHIR_Questionnaire_A, qItem: FHIR_Questionnaire_Item, responseItem: FHIR_QuestionnaireResponse_Item):
    E.Either<IssueList_A, [ IssueList_A, ProtoTextResponse | ProtoIntegerResponse | ProtoDecimalResponse ]> => {

    if (!responseItem.answer) {
        return E.left([ err({ ...msg("answer is undefined") }) ]);
    }

    // We support multiple answers here
    if (responseItem.answer[0]._valueTag === "valueCoding") {
        return deriveCodingResponse(q, qItem, responseItem);
    }

    // From now on only one answer supported
    if (responseItem.answer.length !== 1) {
        return E.left([ err({ ...msg("only one answer supported yet") }) ]);
    }

    if (responseItem.answer[0]._valueTag === "valueInteger") {
        return deriveIntegerResponse(responseItem, responseItem.answer[0]);
    }

    if (responseItem.answer[0]._valueTag === "valueDecimal") {
        return deriveDecimalResponse(responseItem, responseItem.answer[0]);
    }

    return E.left([ err({ ...msg(`answer type ${responseItem.answer[0]._valueTag} is not recognized for link ID: ${responseItem.linkId}`) }) ]);
};

const deriveIntegerResponse = (responseItem: FHIR_QuestionnaireResponse_Item, answer: IValueInteger):
    E.Either<IssueList_A, [ IssueList_A, ProtoIntegerResponse ]> => {

    return E.right([ [], {
        type:          "Integer",
        linkId:         responseItem.linkId,
        questionTitle:  responseItem.text ?? "",
        responseNumber: answer.valueInteger
    }]);
};

const deriveDecimalResponse = (responseItem: FHIR_QuestionnaireResponse_Item, answer: IValueDecimal):
    E.Either<IssueList_A, [ IssueList_A, ProtoDecimalResponse ]> => {

    return E.right([ [], {
        type:          "Decimal",
        linkId:         responseItem.linkId,
        questionTitle:  responseItem.text ?? "",
        responseNumber: answer.valueDecimal
    }]);
};

const deriveCodingResponse = (q: FHIR_Questionnaire_A, qItem: FHIR_Questionnaire_Item, responseItem: FHIR_QuestionnaireResponse_Item):
    E.Either<IssueList_A, [ IssueList_A, ProtoTextResponse ]> => {

    const issues: IssueList_A = [];

    const valueSet = getValueSetFromQuestionnaire(q, qItem.answerValueSet);
    if (O.isNone(valueSet)) {
        return E.left([ err({ ...msg(`value set could not be resolved: ${qItem.answerValueSet}`) }) ]);
    }

    let questionTitle = "";
    if (!qItem.text) {
        return E.left([ warn({ ...msg(`item ${responseItem.linkId} in questionnaire ${q.id} is empty; using text of questionnaire response`) }) ]);
    } else {
        questionTitle = qItem.text;
    }

    const answers: string[] = [];
    for (const answer of responseItem.answer) {
        // This check is already conducted in deriveScalarResponse, but it also acts as a type guard
        // and we need it at (*) below to get access to valueCoding.
        if (answer._valueTag !== "valueCoding") {
            issues.push(warn({ message: "answer is to of type Coding, see context", context: { answer } }));
            continue;
        }

        const display = getDisplayFromValueSet(valueSet.value, answer.valueCoding); // (*)
        if (E.isRight(display)) {
            answers.push(display.right);
        }
    }

    if (answers.length === 0) {
        return E.left([ err({ message: `no answer of response item ${responseItem.linkId} is of type Coding; se context`, context: { answers: responseItem.answer } }) ]);
    } else {
        return E.right([ [], {
            type:          "Text",
            linkId:         responseItem.linkId,
            questionTitle,
            responseText:   answers
        }]);
    }
};
