import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { Eq, struct } from "fp-ts/Eq";
import { pipe } from "fp-ts/function";
import { deleteAt } from "fp-ts/Record";
import { Eq as eqString } from "fp-ts/string";

import { curriedFlip } from "../../../../utils/fp-tools";
import { TauDateTime_toString } from "../../../../fhir-resources/utils/tau";
import { AnnotatedCodeableConcept_A, FHIR_CodeableConcept_A, FHIR_Coding, FHIR_Identifier_A, FHIR_dateTime_A } from "../../../../fhir-resources/types";

import { DecimalResponse, FileGroupItem_A, GroupItem_A, Group_A, IntegerResponse, QuestionnaireResponse, QuestionnaireSection_A, ScaleResponse, TextResponse } from "../../defs";

import { GROUP_TYPE_MAPPINGS, UNKNOWN_GROUP_TYPE } from "../constants";


export type ProtoGroup = ProtoSimpleDocumentGroup | ProtoComplexCourseGroup;

export type ProtoSimpleDocumentGroup = {
    sourceType: "Document";
    id:          string;
    identifier:  FHIR_Identifier_A[],
    title:       string;
    date:        O.Option<FHIR_dateTime_A>;
    items:       ProtoFileGroupItem[];
}

export type ProtoComplexCourseGroup = {
    sourceType: "Course";
    id:    string;
    encounterTypes: FHIR_CodeableConcept_A[];
    date:  O.Option<FHIR_dateTime_A>;
    items: ProtoGroupItem[];
    inputResourceIds: string[];
    inputResourceIdentifiers: FHIR_Identifier_A[][];
}


export type ProtoBaseGroupItem = {
    id:            string;
    identifier:    FHIR_Identifier_A[];
    date:          O.Option<FHIR_dateTime_A>;
    encounter:     O.Option<string>;
    encounterType: O.Option<FHIR_CodeableConcept_A[]>;
};

export type ProtoQuestionnaireGroupItem = ProtoBaseGroupItem & {
    type: "Questionnaire";

    sections:       ProtoQuestionnaireSection[];
    trainingNumber: O.Option<number>;
    shortText:      O.Option<string>;
}

export type ProtoQuestionnaireSection = {
    title: string;
    type:  string;
    questionnaireId: string;
    questionnaireResponseId: string;
    date:  O.Option<FHIR_dateTime_A>;

    responses: ProtoQuestionnaireResponse[];
};


export type ProtoBaseQuestionnaireResponse = {
    linkId: string;
};

export type ProtoScaleResponse   = ProtoBaseQuestionnaireResponse & ScaleResponse;
export type ProtoTextResponse    = ProtoBaseQuestionnaireResponse & TextResponse;
export type ProtoIntegerResponse = ProtoBaseQuestionnaireResponse & IntegerResponse;
export type ProtoDecimalResponse = ProtoBaseQuestionnaireResponse & DecimalResponse;

export type ProtoQuestionnaireResponse = ProtoScaleResponse | ProtoTextResponse | ProtoIntegerResponse | ProtoDecimalResponse;

export type ProtoFileGroupItem = ProtoBaseGroupItem & {
    type: "File";

    category:   O.Option<AnnotatedCodeableConcept_A>[];
    docRefType: O.Option<AnnotatedCodeableConcept_A>;
    fileId:     string;
    title:      string;
    specialty:  O.Option<AnnotatedCodeableConcept_A>;
}

export type ProtoGroupItem = ProtoQuestionnaireGroupItem | ProtoFileGroupItem;

export function trainingNumberFromGroupItem (item: ProtoGroupItem): O.Option<number> {
    if (item.type === "File") { return O.none; }
    if (item.sections.length === 0) { return O.none; }

    return trainingNumberFromResponses(item.sections[0].responses);
}

export function trainingNumberFromResponses (responses: ProtoBaseQuestionnaireResponse[]): O.Option<number> {
    const integerResponse = (r: ProtoQuestionnaireResponse): r is ProtoIntegerResponse => r.type === "Integer";
    return pipe(responses,
        A.filter(integerResponse),
        A.filter(r => r.linkId === "training_no"),
        A.map(r => r.responseNumber),
        n => n.length === 1 ? O.some(n[0]) : O.none
    );
}

export function protoGroupToUiGroup (proto: ProtoGroup): Group_A {
    switch (proto.sourceType) {
    case "Document":
        return {
            groupType:   proto.sourceType,
            id:          proto.id,
            identifier:  proto.identifier,
            title:       proto.title,
            date:        pipe(proto.date, O.map(TauDateTime_toString), O.getOrElse(() => undefined)),
            items:       pipe(proto.items, A.map(protoFileGroupItemToUiFileGroupItem))
        };
    case "Course":
        return {
            groupType:   proto.sourceType,
            id:          proto.id,
            date:        pipe(proto.date, O.map(TauDateTime_toString), O.getOrElse(() => undefined)),
            items:       pipe(proto.items, A.map(protoGroupItemToUiGroupItem)),
            courseTypes: encounterTypesToGroupType(proto.encounterTypes),
            inputResourceIds:         proto.inputResourceIds,
            inputResourceIdentifiers: proto.inputResourceIdentifiers
        };
    }
}


function encounterTypesToGroupType (encounterTypes: FHIR_CodeableConcept_A[]): string[] {
    type C = { system: string; code: string; display: O.Option<string> };

    const eqSystemCode: Eq<C> = struct({
        system: eqString,
        code:   eqString
    });

    const toOptionC = (c: FHIR_Coding): O.Option<C> => {
        if (typeof c.system === "string" && typeof c.code === "string") {
            return O.some({
                system:  c.system,
                code:    c.code,
                display: O.fromNullable(c.display)
            });
        }
        return O.none;
    };

    return pipe(encounterTypes,
        A.map(cc => cc.coding || {}),
        A.flatten,
        A.map(toOptionC),
        A.compact,

        // We rely on a feature of `A.intersection` to use the elements of the last array in the result set
        // to determine the intersection members. The fp-ts documentation, however, says that
        // `A.intersection` uses the elements of the first array.  In case this is a bug which may be
        // fixed (that is, swapped) in the future, we have a test case in
        // `../test/intersection.spec.ts` checking for this.
        curriedFlip<C[], C[]>(A.intersection(eqSystemCode))(GROUP_TYPE_MAPPINGS),

        A.map(c => c.display),
        A.compact,
        types => types.length === 0 ? [ UNKNOWN_GROUP_TYPE ] : types
    );
}

function protoFileGroupItemToUiFileGroupItem (proto: ProtoFileGroupItem): FileGroupItem_A {
    return {
        type:      "File",
        id:         proto.id,
        identifier: proto.identifier,
        date:       pipe(proto.date, O.map(TauDateTime_toString), O.getOrElse(() => undefined)),
        fileId:     proto.fileId,
        category:   pipe(proto.category, A.compact),
        docRefType: O.getOrElse(() => undefined)(proto.docRefType),
        title:      proto.title,
        specialty:  pipe(proto.specialty, O.getOrElse(() => undefined))
    };
}


function protoGroupItemToUiGroupItem (proto: ProtoGroupItem): GroupItem_A {
    if (proto.type === "File") {
        return protoFileGroupItemToUiFileGroupItem(proto);
    }

    if (proto.type === "Questionnaire") {
        return {
            type:         "Questionnaire",
            id:            proto.id,
            identifier:    proto.identifier,
            date:          pipe(proto.date, O.map(TauDateTime_toString), O.getOrElse(() => undefined)),
            sections:      A.map(protoSectionToUiSection)(proto.sections),
            thumbnailText: O.getOrElse(() => undefined)(proto.shortText)
        };
    }
}

function protoSectionToUiSection (protoSection: ProtoQuestionnaireSection): QuestionnaireSection_A {
    return {
        title: protoSection.title,
        type:  protoSection.type,
        questionnaireId:         protoSection.questionnaireId,
        questionnaireResponseId: protoSection.questionnaireResponseId,

        // This is not the best way of typing, but I did not find a more elegant way.
        responses: A.map(deleteAt("linkId"))(protoSection.responses as ProtoBaseQuestionnaireResponse[]) as QuestionnaireResponse[]
    };
}
