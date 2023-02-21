import * as t from "io-ts";
import * as E from "fp-ts/Either";

import { IssueList_A, ctx, err, msg, tags } from "../../utils/issues";
import { DistributiveOmit, makeTaggedUnionTypeClass } from "../../utils/fp-tools";

import { randomId } from "../utils";
import { BoxedResource } from "../base/boxed";
import { referenceToIdentifier } from "../utils";
import { RefGraph, RefNode } from "../utils/graph";
import { FHIR_Attachment_T, FHIR_Coding_T, FHIR_DomainResource_T, FHIR_Identifier_T, FHIR_Quantity_T, FHIR_Reference_T } from "../base/general-special-purpose";
import { FHIR_boolean_T, FHIR_canonical_T, FHIR_dateTime_T, FHIR_date_T, FHIR_decimal_T, FHIR_integer_T, FHIR_string_T, FHIR_time_T, FHIR_uri_T } from "../base/primitives";


export const TValueInteger = t.type({ _valueTag: t.literal("valueInteger"), valueInteger: FHIR_integer_T }, "valueInteger");
export const TValueDecimal = t.type({ _valueTag: t.literal("valueDecimal"), valueDecimal: FHIR_decimal_T }, "valueDecimal");
export const TValueCoding  = t.type({ _valueTag: t.literal("valueCoding"),  valueCoding:  FHIR_Coding_T  }, "valueCoding" );

export type IValueInteger = t.TypeOf<typeof TValueInteger>;
export type IValueDecimal = t.TypeOf<typeof TValueDecimal>;
export type IValueCoding  = t.TypeOf<typeof TValueCoding>;

export const FHIR_QuestionnaireResponse_Item_Value_internal_T = t.union([
    t.type({ _valueTag: t.literal("none") }),

    TValueDecimal,
    TValueInteger,
    TValueCoding,

    t.type({ _valueTag: t.literal("valueBoolean"),    valueBoolean:    FHIR_boolean_T    }, "valueBoolean"    ),
    t.type({ _valueTag: t.literal("valueDate"),       valueDate:       FHIR_date_T       }, "valueDate"       ),
    t.type({ _valueTag: t.literal("valueDateTime"),   valueDateTime:   FHIR_dateTime_T   }, "valueDateTime"   ),
    t.type({ _valueTag: t.literal("valueTime"),       valueTime:       FHIR_time_T       }, "valueTime"       ),
    t.type({ _valueTag: t.literal("valueString"),     valueString:     FHIR_string_T     }, "valueString"     ),
    t.type({ _valueTag: t.literal("valueUri"),        valueUri:        FHIR_uri_T        }, "valueUri"        ),
    t.type({ _valueTag: t.literal("valueAttachment"), valueAttachment: FHIR_Attachment_T }, "valueAttachment" ),
    t.type({ _valueTag: t.literal("valueQuantity"),   valueQuantity:   FHIR_Quantity_T   }, "valueQuantity"   ),
    t.type({ _valueTag: t.literal("valueReference"),  valueReference:  FHIR_Reference_T  }, "valueReference"  )
]);

export type FHIR_QuestionnaireResponse_Item_Value_internal = t.TypeOf<typeof FHIR_QuestionnaireResponse_Item_Value_internal_T>;

export type FHIR_QuestionnaireResponse_Item_Value = DistributiveOmit<FHIR_QuestionnaireResponse_Item_Value_internal, "_valueTag">;



export const FHIR_QuestionnaireResponse_Item_Value_T = makeTaggedUnionTypeClass<
    FHIR_QuestionnaireResponse_Item_Value_internal,
    FHIR_QuestionnaireResponse_Item_Value,
    typeof FHIR_QuestionnaireResponse_Item_Value_internal_T>(
    FHIR_QuestionnaireResponse_Item_Value_internal_T,
    "FHIR_QuestionnaireResponse_Item_Value_T",
    "_valueTag"
);



export const FHIR_QuestionnaireResponse_item_T = t.intersection([
    t.type({
        linkId: FHIR_string_T
    }),
    t.partial({
        text:   FHIR_string_T,
        answer: t.array(FHIR_QuestionnaireResponse_Item_Value_T)
    })
]);

export type FHIR_QuestionnaireResponse_Item = t.TypeOf<typeof FHIR_QuestionnaireResponse_item_T>;

export const Internal_FHIR_QuestionnaireResponse_T = t.intersection([
    FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("QuestionnaireResponse"),
        status: t.keyof({
            "in-progress":      null,
            "completed":        null,
            "amended":          null,
            "entered-in-error": null,
            "stopped":          null
        })
    }),
    t.partial({
        identifier:    FHIR_Identifier_T,
        questionnaire: FHIR_canonical_T,
        encounter:     FHIR_Reference_T,
        subject:       FHIR_Reference_T,
        authored:      FHIR_dateTime_T,
        item:          t.array(FHIR_QuestionnaireResponse_item_T)
    })
]);

type Internal_FHIR_QuestionnaireResponse_A = t.TypeOf<  typeof Internal_FHIR_QuestionnaireResponse_T>;
type Internal_FHIR_QuestionnaireResponse   = t.OutputOf<typeof Internal_FHIR_QuestionnaireResponse_T>;

export const FHIR_QuestionnaireResponse_T = new t.Type<Internal_FHIR_QuestionnaireResponse_A, Internal_FHIR_QuestionnaireResponse, unknown>(
    "FHIR_QuestionnaireResponse_T",
    Internal_FHIR_QuestionnaireResponse_T.is,
    Internal_FHIR_QuestionnaireResponse_T.decode,

    (obj: Internal_FHIR_QuestionnaireResponse_A) => {
        const enc = Internal_FHIR_QuestionnaireResponse_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        return enc;
    }
);

export type FHIR_QuestionnaireResponse_A = t.TypeOf<  typeof FHIR_QuestionnaireResponse_T>;
export type FHIR_QuestionnaireResponse   = t.OutputOf<typeof FHIR_QuestionnaireResponse_T>;



export type BoxedQuestionnaireResponse = BoxedResource<FHIR_QuestionnaireResponse_A>;

export function insertQuestionnaireResponseResource (g: RefGraph, boxres: BoxedQuestionnaireResponse): IssueList_A {
    const res = boxres.boxed;

    const nodeId = res.identifier ?? randomId();
    const e = g.addNode(new RefNode([ nodeId ], boxres));
    if (E.isLeft(e)) {
        return [ err({ ...msg("could not add QuestionnaireResponse to graph"), ...ctx({ cause: e.left }), ...tags("insertQuestionnaireResponseResource") }) ];
    }

    if (res.encounter?.identifier) {
        g.addEdge(nodeId, res.encounter.identifier, "context");
    }

    if (res.questionnaire) {
        g.addEdge(nodeId, referenceToIdentifier(res.questionnaire), "questionnaire");
    }

    return [];
}

export function boxQuestionnaireResponseResource (res: FHIR_QuestionnaireResponse_A): BoxedQuestionnaireResponse {
    return {
        boxed: res,
        period: {
            min: -Infinity,
            max: +Infinity
        }
    };
}
