import * as t from "io-ts";

import { AnnotatedCodeableConcept_T, FHIR_Identifier_T } from "../../fhir-resources/types";


export const ScaleResponse_T = t.type({
    type: t.literal("Scale"),
    questionTitle: t.string,

    scaleValue:         t.number,
    scaleMinValue:      t.number,
    scaleMaxValue:      t.number,
    scaleMinValueLabel: t.string,
    scaleMaxValueLabel: t.string
});

export type ScaleResponse_A = t.TypeOf<  typeof ScaleResponse_T>;
export type ScaleResponse   = t.OutputOf<typeof ScaleResponse_T>;


export const TextResponse_T = t.type({
    type: t.literal("Text"),
    questionTitle: t.string,
    responseText:  t.array(t.string)
});

export type TextResponse_A = t.TypeOf<  typeof TextResponse_T>;
export type TextResponse   = t.OutputOf<typeof TextResponse_T>;


export const IntegerResponse_T = t.type({
    type: t.literal("Integer"),
    questionTitle: t.string,
    responseNumber: t.number
});

export type IntegerResponse_A = t.TypeOf<  typeof IntegerResponse_T>;
export type IntegerResponse   = t.OutputOf<typeof IntegerResponse_T>;


export const DecimalResponse_T = t.type({
    type: t.literal("Decimal"),
    questionTitle: t.string,
    responseNumber: t.number
});

export type DecimalResponse_A = t.TypeOf<  typeof DecimalResponse_T>;
export type DecimalResponse   = t.OutputOf<typeof DecimalResponse_T>;


export const QuestionnaireResponse_T = t.union([
    ScaleResponse_T, TextResponse_T, IntegerResponse_T, DecimalResponse_T
]);

export type QuestionnaireResponse_A = t.TypeOf<  typeof QuestionnaireResponse_T>;
export type QuestionnaireResponse   = t.OutputOf<typeof QuestionnaireResponse_T>;


export const QuestionnaireSection_T = t.intersection([
    t.type({
        title: t.string,   // Questionnaire.title
        type:  t.string,
        questionnaireResponseId: t.string, // QuestionnaireResponse.id
        responses: t.array(QuestionnaireResponse_T)
    }),
    t.partial({
        questionnaireId: t.string // Questionnaire.id
    })
]);

export type QuestionnaireSection_A = t.TypeOf<  typeof QuestionnaireSection_T>;
export type QuestionnaireSection   = t.OutputOf<typeof QuestionnaireSection_T>;


export const BaseGroupItem_T = t.intersection([
    t.type({
        id:         t.string,
        identifier: t.array(FHIR_Identifier_T)
    }),
    t.partial({
        date:       t.string
    })
]);

export type BaseGroupItem_A = t.TypeOf<  typeof BaseGroupItem_T>;
export type BaseGroupItem   = t.OutputOf<typeof BaseGroupItem_T>;


export const QuestionnaireGroupItem_T = t.intersection([
    BaseGroupItem_T,
    t.type({
        type: t.literal("Questionnaire"),

        // One questionnaire in the UI can be presented in singular form (eg, pre-session training questionnaire).
        // But sometimes two questionnaires are a combined entity (eg, pre/post training questionnaires).
        // The sections collection allows for both cases
        sections: t.array(QuestionnaireSection_T)
    }),
    t.partial({
        thumbnailText: t.string
    })
]);

export type QuestionnaireGroupItem_A = t.TypeOf<  typeof QuestionnaireGroupItem_T>;
export type QuestionnaireGroupItem   = t.OutputOf<typeof QuestionnaireGroupItem_T>;


export const FileGroupItem_T = t.intersection([
    BaseGroupItem_T,
    t.type({
        type:       t.literal("File"),
        fileId:     t.string,
        category:   t.array(AnnotatedCodeableConcept_T),
        title:      t.string
    }),
    t.partial({
        docRefType: AnnotatedCodeableConcept_T,
        specialty:  AnnotatedCodeableConcept_T // contained PractitionerRole.specialty[0]
    })
]);

export type FileGroupItem_A = t.TypeOf<  typeof FileGroupItem_T>;
export type FileGroupItem   = t.OutputOf<typeof FileGroupItem_T>;


export const GroupItem_T = t.union([ QuestionnaireGroupItem_T, FileGroupItem_T ]);
export type GroupItem_A = t.TypeOf<  typeof GroupItem_T>;
export type GroupItem   = t.OutputOf<typeof GroupItem_T>;


export const SimpleDocumentGroup_T = t.intersection([
    t.type({
        groupType: t.literal("Document"),

        id:    t.string,  // DocumentReference.id

        title: t.string,

        items: t.array(FileGroupItem_T)
    }),
    t.partial({
        identifier: t.array(FHIR_Identifier_T), // DocumentReference.identifier
        date:       t.string   // DocumentReference.date
    })
]);

export type SimpleDocumentGroup_A = t.TypeOf<  typeof SimpleDocumentGroup_T>;
export type SimpleDocumentGroup   = t.OutputOf<typeof SimpleDocumentGroup_T>;


export const ComplexCourseGroup_T = t.intersection([
    t.type({
        groupType: t.literal("Course"),

        id:    t.string,

        // each group contains a list of items that can be of different types
        // for the back pain use case there are two types of items: questionnaires and files
        items: t.array(GroupItem_T),

        courseTypes: t.array(t.string),

        inputResourceIds:         t.array(t.string),
        inputResourceIdentifiers: t.array(t.array(FHIR_Identifier_T))
    }),
    t.partial({
        date: t.string // maximum date of all items' dates
    })
]);

export type ComplexCourseGroup_A = t.TypeOf<  typeof ComplexCourseGroup_T>;
export type ComplexCourseGroup   = t.OutputOf<typeof ComplexCourseGroup_T>;

// Entity in the left side list
export const Group_T = t.union([ SimpleDocumentGroup_T, ComplexCourseGroup_T ]);
export type Group_A = t.TypeOf<  typeof Group_T>;
export type Group   = t.OutputOf<typeof Group_T>;


// Collection of groups shown in the left side list
export const GroupList_T = t.array(Group_T);
export type GroupList_A = t.TypeOf<  typeof GroupList_T>;
export type GroupList   = t.OutputOf<typeof GroupList_T>;

export const GroupListModel_T = t.type({
    modelType: t.literal("GroupList/1"),
    groupList: GroupList_T
});
export type GroupListModel_A = t.TypeOf<  typeof GroupListModel_T>;
export type GroupListModel   = t.OutputOf<typeof GroupListModel_T>;


export const TransformationResult_T = t.intersection([
    t.type({
        model: GroupListModel_T
    }),
    t.partial({
        dot:   t.string
    })
]);
export type TransformationResult_A = t.TypeOf<  typeof TransformationResult_T>;
export type TransformationResult   = t.OutputOf<typeof TransformationResult_T>;
