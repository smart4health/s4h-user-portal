import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { IssueList_A, ctx, msg, warn } from "../../../../../utils/issues";

import { FHIR_CodeableConcept_A  } from "../../../../../fhir-resources/types";
import { FHIR_Encounter_T } from "../../../../../fhir-resources/management/encounter";
import { RefGraph, RefNode, RefNodeList } from "../../../../../fhir-resources/utils/graph";
import { BoxedDocumentReference, FHIR_DocumentReference_T } from "../../../../../fhir-resources/documents/document-reference-r4";

import { NA } from "../../constants";

import { ProtoFileGroupItem, ProtoGroup } from "../defs";


export function deriveDocumentGroup (g: RefGraph, nodes: RefNodeList): E.Either<IssueList_A, [ IssueList_A, ProtoGroup ]> {

    if (nodes.length !== 1) {
        return E.left([ warn({ ...msg("nodes length is not 1") }) ]);
    }

    const boxedRes = nodes[0].fhir();
    if (O.isNone(boxedRes)) {
        return E.left([ warn({ ...msg(`node ${nodes[0].name()} has no FHIR resource`) }) ]);
    }

    if (!FHIR_DocumentReference_T.is(boxedRes.value.boxed)) {
        return E.left([ warn({ ...msg(`node's FHIR resource (${boxedRes.value.boxed.id}) is not a DocumentReference`), ...ctx({ resource: boxedRes.value.boxed }) }) ]);
    }

    if (boxedRes.value.boxed.content.length === 0) {
        return E.left([ warn({ ...msg(`DocumentReference ${boxedRes.value.boxed.id} has no content`), ...ctx({ resource: boxedRes.value.boxed }) }) ]);
    }

    return E.right([ [], makeDocumentReferenceGroup(boxedRes.value as BoxedDocumentReference) ]);
}

export function makeDocumentReferenceGroup (boxedDocRef: BoxedDocumentReference): ProtoGroup {
    return {
        sourceType: "Document",
        id:          boxedDocRef.boxed.id,
        identifier:  pipe(boxedDocRef.boxed.identifier, O.fromNullable, O.getOrElse(() => [])),
        title:       getOptimalTitle(boxedDocRef),
        date:        O.fromNullable(boxedDocRef.boxed.date),
        items:       makeDocumentReferenceGroupItems([], boxedDocRef)
    };
}

export function makeDocumentReferenceGroupItems (parentEncounters: O.Option<RefNode>[], boxedDocRef: BoxedDocumentReference): ProtoFileGroupItem[] {

    const encounterTypes: FHIR_CodeableConcept_A[] = pipe(parentEncounters,
        A.compact,                                       // remove the none elements
        A.map((node: RefNode) => node.fhir()),           // get the associated FHIR resources (could be none)
        A.compact,                                       // again, remove the none elements
        A.map(res => {                                   // if Encounter, return the type array (which may be none)
            if (FHIR_Encounter_T.is(res.boxed)) {
                return O.fromNullable(res.boxed.type);
            } else {
                return O.none;
            }
        }),
        A.compact,                                       // again, remove the none elements
        A.flatten                                        // flatten [][] to []
    );

    return pipe(
        boxedDocRef.boxed.content,
        A.map(({ attachment }) => ({
            type:      "File",
            id:         boxedDocRef.boxed.id,
            identifier: boxedDocRef.boxed.identifier,
            date:       O.fromNullable(boxedDocRef.boxed.date),
            fileId:     attachment.id,
            category:   boxedDocRef.category,
            docRefType: boxedDocRef.type,
            encounter:  O.none, // can be none for DocumentReference-based items, because they will not be subject to merging
            encounterType: O.some(encounterTypes),
            title:      getOptimalTitle(boxedDocRef),
            specialty:  boxedDocRef.specialty
        }))
    );
}

function getOptimalTitle (boxedDocRef: BoxedDocumentReference): string {
    if (typeof boxedDocRef.boxed.description === "string") {
        return boxedDocRef.boxed.description;
    }

    if (O.isSome(boxedDocRef.type)) {
        if (typeof boxedDocRef.type.value.resolvedText !== "undefined") {
            return boxedDocRef.type.value.resolvedText;
        }
    }

    if (boxedDocRef.category.length > 0) {
        if (O.isSome(boxedDocRef.category[0])) {
            return boxedDocRef.category[0].value.resolvedText;
        }
    }

    return NA;
}
