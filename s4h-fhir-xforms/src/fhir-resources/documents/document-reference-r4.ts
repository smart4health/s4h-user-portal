import * as t from "io-ts";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { err, warn } from "../../utils/issues";
import { IssueList_A, Issue_A, ctx, msg, tags } from "../../utils/issues";

import { randomId } from "../utils";
import { ConceptResolver } from "../types";
import { RefGraph, RefNode } from "../utils/graph";
import { BoxedResource, Period } from "../base/boxed";
import { FHIR_PractitionerRole_T } from "../individuals/practitioner-role";
import { FHIR_code_T, FHIR_id_T, FHIR_instant_T, FHIR_string_T } from "../base/primitives";
import { AnnotatedCodeableConcept_A, FHIR_Attachment_T, FHIR_CodeableConcept_T, FHIR_Coding_T, FHIR_DomainResource_T, FHIR_Identifier_A, FHIR_Identifier_T, FHIR_Period_T, FHIR_Reference_T, FHIR_Resource_T } from "../base/general-special-purpose";


export const FHIR_DocumentReference_Content_T = t.intersection([
    t.type({
        attachment: FHIR_Attachment_T
    }),
    t.partial({
        format:     FHIR_Coding_T
    })
]);

export const FHIR_DocumentReference_Context_T = t.partial({
    encounter:         t.array(FHIR_Reference_T),
    event:             t.array(FHIR_CodeableConcept_T),
    period:            FHIR_Period_T,
    facilityType:      FHIR_CodeableConcept_T,
    practiceSetting:   FHIR_CodeableConcept_T,
    sourcePatientInfo: FHIR_Reference_T,
    related:           t.array(FHIR_Reference_T)
});

export const Internal_FHIR_DocumentReference_T = t.intersection([
    FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("DocumentReference"),
        id:           FHIR_id_T,    // mandatory here, opposed to FHIR standard
        status: t.keyof({
            "current":          null,
            "superseded":       null,
            "entered-in-error": null
        }),
        content: t.array(FHIR_DocumentReference_Content_T)
    }),
    t.partial({
        // Resource
        language:   FHIR_code_T,

        // DomainResource
        contained:  t.array(FHIR_Resource_T),

        // DocumentReference
        masterIdentifier: FHIR_Identifier_T,
        identifier: t.array(FHIR_Identifier_T),
        docStatus:  t.keyof({
            "preliminary":      null,
            "final":            null,
            "amended":          null,
            "entered-in-error": null
        }),
        type:          FHIR_CodeableConcept_T,
        category:      t.array(FHIR_CodeableConcept_T),
        subject:       FHIR_Reference_T,
        date:          FHIR_instant_T,
        author:        t.array(FHIR_Reference_T),
        authenticator: FHIR_Reference_T,
        custodian:     FHIR_Reference_T,
        relatesTo:     t.array(t.type({
            code:      FHIR_code_T,
            target:    FHIR_Reference_T
        })),
        description:   FHIR_string_T,
        securityLabel: t.array(FHIR_CodeableConcept_T),
        context:       FHIR_DocumentReference_Context_T
    })
]);

type Internal_FHIR_DocumentReference_A = t.TypeOf<  typeof Internal_FHIR_DocumentReference_T>;
type Internal_FHIR_DocumentReference   = t.OutputOf<typeof Internal_FHIR_DocumentReference_T>;

export const FHIR_DocumentReference_T = new t.Type<Internal_FHIR_DocumentReference_A, Internal_FHIR_DocumentReference, unknown>(
    "FHIR_DocumentReference_T",
    Internal_FHIR_DocumentReference_T.is,
    Internal_FHIR_DocumentReference_T.decode,

    (obj: Internal_FHIR_DocumentReference_A) => {
        const enc = Internal_FHIR_DocumentReference_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        return enc;
    }
);

export type FHIR_DocumentReference_A = t.TypeOf<  typeof FHIR_DocumentReference_T>;
export type FHIR_DocumentReference   = t.OutputOf<typeof FHIR_DocumentReference_T>;


export type BoxedDocumentReference = BoxedResource<FHIR_DocumentReference_A> & {
    type:      O.Option<AnnotatedCodeableConcept_A>;
    category:  O.Option<AnnotatedCodeableConcept_A>[];
    specialty: O.Option<AnnotatedCodeableConcept_A>;
};

export function insertDocumentReferenceResource (g: RefGraph, boxdocRef: BoxedDocumentReference): IssueList_A {
    const issues: IssueList_A = [];
    const docRef = boxdocRef.boxed;

    if (docRef.identifier?.length > 0) {
        const e = g.addNode(new RefNode(docRef.identifier, boxdocRef));
        if (E.isLeft(e)) {
            return [ err({ ...msg("could not add DocumentReference to graph"), ...ctx({ cause: e.left }), ...tags("insertDocumentReferenceResource") }) ];
        }

        const ret = insertEncounterEdges(docRef, g, docRef.identifier[0]);
        if (E.isLeft(ret)) {
            issues.push(ret.left);
        }

    } else {
        const id = randomId();
        issues.push(warn({ ...msg("DocumentReference without identifier; creating random one: " + JSON.stringify(id)), ...ctx({ resource: docRef }) }));

        const n = new RefNode([ id ], boxdocRef);
        g.addNode(n);

        const ret = insertEncounterEdges(docRef, g, id);
        if (E.isLeft(ret)) {
            issues.push(ret.left);
        }
    }

    return issues;
}

function insertEncounterEdges (docRef: FHIR_DocumentReference_A, g: RefGraph, id: FHIR_Identifier_A): E.Either<Issue_A, void> {
    if (docRef.context?.encounter) {
        for (const ref of docRef.context.encounter) {
            if (ref.reference) {
                return E.left(err({ ...msg("context.encounter property with reference not supported yet") }));
            } else if (ref.identifier) {
                g.addEdge(id, ref.identifier, "context");
            }
        }
    }

    return E.right(void 0);
}

export function boxDocumentReferenceResource (res: FHIR_DocumentReference_A): BoxedDocumentReference {
    return {
        boxed:    res,
        ...getPeriodFromDocumentReference(res),

        type:     O.none,
        category: [],
        specialty: O.none
    };
}

export function resolveDocumentReferenceConceptTexts (resolver: ConceptResolver, res: BoxedDocumentReference): void {
    if (res.boxed.type) {
        resolver(res.boxed.type).then(os => {
            res.type = O.some({
                codeableConcept: res.boxed.type,
                // eslint-disable-next-line max-nested-callbacks
                resolvedText:    O.getOrElse(() => undefined)(os)
            });
        });
    }

    if (res.boxed.category) {
        Promise.all(A.map(resolver)(res.boxed.category))
            .then(texts => {
                for (let i = 0; i < texts.length; i++) {
                    const text = texts[i];
                    if (O.isSome(text)) {
                        res.category.push(O.some({
                            codeableConcept: res.boxed.category[i],
                            resolvedText:    text.value
                        }));
                    } else {
                        res.category.push(O.some({
                            codeableConcept: res.boxed.category[i]
                        }));
                    }
                }
        });
    }

    if (res.boxed.contained instanceof Array) {
        const pracRoles = pipe(res.boxed.contained,
            A.filter(FHIR_PractitionerRole_T.is)
        );

        if (pracRoles.length > 0) {
            if (pracRoles[0].specialty instanceof Array) {
                resolver(pracRoles[0].specialty[0]).then(os => {
                    if (O.isSome(os)) {
                        res.specialty = O.some({
                            codeableConcept: pracRoles[0].specialty[0],
                            // eslint-disable-next-line max-nested-callbacks
                            resolvedText:    O.getOrElse(() => undefined)(os)
                        });
                    } else {
                        res.specialty = O.some({
                            codeableConcept: pracRoles[0].specialty[0]
                        });
                    }
                });
            }
        }
    }
}


export function deepCopy (original: FHIR_DocumentReference_A): O.Option<FHIR_DocumentReference_A> {
    try {
        const s = JSON.parse(JSON.stringify(FHIR_DocumentReference_T.encode(original)));
        return O.fromEither(FHIR_DocumentReference_T.decode(s));

    } catch (ignore) {
        return O.none;
    }
}

function getPeriodFromDocumentReference (_res: FHIR_DocumentReference_A): Period {
    // Change this when actual intervals are needed.
    return {
        period: {
            min: -Infinity,
            max: +Infinity
        }
    };
}
