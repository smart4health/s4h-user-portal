import * as t from "io-ts";
import * as E from "fp-ts/Either";

import { ERRORS as ERR } from "../../utils/errors";
import { IssueList_A, ctx, err, info, msg, name, tags } from "../../utils/issues";

import { BoxedResource } from "../base/boxed";
import { RefGraph, RefNode } from "../utils/graph";
import { FHIR_ValueSet_T } from "../terminology/value-set";
import { FHIR_boolean_T, FHIR_canonical_T, FHIR_integer_T, FHIR_string_T, FHIR_uri_T } from "../base/primitives";
import { FHIR_Coding_T, FHIR_DomainResource_T, FHIR_Extension_T, FHIR_Identifier_A, FHIR_Identifier_T } from "../base/general-special-purpose";


export const FHIR_Questionnaire_Item_T = t.intersection([
    t.type({
        linkId: FHIR_string_T,
        type:   t.keyof({
            "group":       null,
            "display":     null,
            "boolean":     null,
            "decimal":     null,
            "integer":     null,
            "date":        null,
            "dateTime":    null,
            "time":        null,
            "string":      null,
            "text":        null,
            "choice":      null,
            "open-choice": null,
            "attachment":  null,
            "reference":   null,
            "quantity":    null
        })
    }),
    t.partial({
        definition: FHIR_uri_T,
        code:       t.array(FHIR_Coding_T),
        prefix:     FHIR_string_T,
        text:       FHIR_string_T,
        enableBehavior: t.keyof({
            "all": null,
            "any": null
        }),
        required:       FHIR_boolean_T,
        repeats:        FHIR_boolean_T,
        readOnly:       FHIR_boolean_T,
        maxLength:      FHIR_integer_T,
        answerValueSet: FHIR_canonical_T,
        extension: t.array(FHIR_Extension_T)
    })
]);

export type FHIR_Questionnaire_Item = t.TypeOf<typeof FHIR_Questionnaire_Item_T>;


export const FHIR_Questionnaire_T = t.intersection([
    FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("Questionnaire"),
        title:        FHIR_string_T
    }),
    t.partial({
        url:        FHIR_uri_T,
        identifier: t.array(FHIR_Identifier_T),
        item:       t.array(FHIR_Questionnaire_Item_T),
        contained:  t.array(FHIR_ValueSet_T)
    })
]);

export type FHIR_Questionnaire_A = t.TypeOf<  typeof FHIR_Questionnaire_T>;
export type FHIR_Questionnaire   = t.OutputOf<typeof FHIR_Questionnaire_T>;

export type BoxedQuestionnaire = BoxedResource<FHIR_Questionnaire_A>;

export function insertQuestionnaireResource (g: RefGraph, boxedQuestionnaire: BoxedQuestionnaire): IssueList_A {
    const issues: IssueList_A = [];

    const idUrl = { system: "__internal__", value: boxedQuestionnaire.boxed.url };
    issues.push(info({
        ...msg(`adding internal identifier to resource ${boxedQuestionnaire.boxed.url}`),
        ...ctx({ additionalIdentifier: idUrl }),
        ...tags("insertQuestionnaireResource")
    }));

    const ids: FHIR_Identifier_A[] = [ idUrl, ...(boxedQuestionnaire.boxed.identifier ?? []) ];
    const e = g.addNode(new RefNode(ids, boxedQuestionnaire));
    if (E.isLeft(e)) {
        issues.push(err({
            ...msg("could not add Questionnaire to graph"),
            ...ctx({ cause: e.left }),
            ...tags("insertQuestionnaireResource"),
            ...name(ERR.GRAPH_INSERT)
        }));
    }

    return issues;
}

export function boxQuestionnaireResource (res: FHIR_Questionnaire_A): BoxedQuestionnaire {
    return {
        boxed: res,
        period: {
            min: -Infinity,
            max: +Infinity
        }
    };
}
