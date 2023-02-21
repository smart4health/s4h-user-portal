/* eslint-disable max-len */
/* eslint-disable max-nested-callbacks */
import { expect } from "chai";
import { consoleLogInspect, shouldDump } from "../../../utils";

import * as O from "fp-ts/Option";

import { parseTauDateTime } from "../../../../src/fhir-resources/utils/tau";
import { mergeGroupItemSections } from "../../../../src/transformations/group-list/fhir2ui/stage-e-merge-sections";
import { ProtoGroup, ProtoQuestionnaireGroupItem } from "../../../../src/transformations/group-list/fhir2ui/stage-d-derive-groups/defs";


describe("merge-sections suite", () => {

    it("empty group, no merging", () => {
        const inputGroup: ProtoGroup = {
            sourceType: "Course",
            id: "1",
            date: O.none,
            encounterTypes: [],
            inputResourceIds: [],
            inputResourceIdentifiers: [],
            items: []
        };

        const [ issues, outputGroup ] = mergeGroupItemSections(inputGroup);

        expect(issues).to.have.length(0);
        expect(outputGroup).to.eql(inputGroup);
    });

    it("no merge if types do not fit", () => {
        const inputGroup: ProtoGroup = {
            sourceType: "Course",
            id: "100",
            date: O.none,
            encounterTypes: [],
            inputResourceIds: [],
            inputResourceIdentifiers: [],
            items: [
                {
                    type: "Questionnaire", id: "100-1", date: O.fromEither(parseTauDateTime("2020-10-10")),
                    identifier: [{ system: "foo", value: "100-1" }],
                    encounter: O.some("enc:1"), encounterType: O.none,
                    trainingNumber: O.none, shortText: O.none,
                    sections: [
                        {
                            title: "Questionnaire 100-1",
                            questionnaireId: "100-1",
                            questionnaireResponseId: "100-1-QR",
                            type: "unknown",
                            date: O.none,
                            responses: [
                                { type: "Integer", linkId: "training_no", questionTitle: "What?", responseNumber: 1 }
                            ]
                        }
                    ]
                },
                {
                    type: "Questionnaire", id: "100-2", date: O.fromEither(parseTauDateTime("2020-10-10")),
                    identifier: [{ system: "foo", value: "100-2" }],
                    encounter: O.some("enc:1"), encounterType: O.none,
                    trainingNumber: O.none, shortText: O.none,
                    sections: [
                        {
                            title: "Questionnaire 100-2",
                            questionnaireId: "100-2",
                            questionnaireResponseId: "100-2-QR",
                            type: "unknown",
                            date: O.none,
                            responses: [
                                { type: "Integer", linkId: "training_no", questionTitle: "What?", responseNumber: 1 }
                            ]
                        }
                    ]
                }
            ]
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [ issues, outputGroup ] = mergeGroupItemSections(inputGroup);

        expect(outputGroup).to.eql(inputGroup);
    });


    it("merge two items", () => {

        const inputGroup: ProtoGroup = {
            sourceType: "Course",
            id: "100",
            date: O.none,
            encounterTypes: [],
            inputResourceIds: [],
            inputResourceIdentifiers: [],
            items: [
                {
                    type: "Questionnaire", id: "100-A", date: O.fromEither(parseTauDateTime("2005-10-10")),
                    identifier: [{ system: "foo", value: "100-A" }],
                    encounter: O.some("enc:1"), encounterType: O.none,
                    trainingNumber: O.none, shortText: O.none,
                    sections: [
                        {
                            title: "Questionnaire 100-A",
                            questionnaireId: "100-A",
                            questionnaireResponseId: "100-A-QR",
                            type: "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire",
                            date: O.none,
                            responses: [
                                { type: "Integer", linkId: "training_no", questionTitle: "What?",    responseNumber:  5 },
                                { type: "Integer", linkId: "age",         questionTitle: "How old?", responseNumber: 40 },
                                { type: "Text",    linkId: "okay",        questionTitle: "Alright?", responseText:  [ "yes" ] }
                            ]
                        }
                    ]
                },

                {
                    type: "Questionnaire", id: "100-B", date: O.fromEither(parseTauDateTime("2005-10-01")),
                    identifier: [{ system: "foo", value: "100-B" }],
                    encounter: O.some("enc:1"), encounterType: O.none,
                    trainingNumber: O.none, shortText: O.none,
                    sections: [
                        {
                            title: "Questionnaire 100-B",
                            questionnaireId: "100-B",
                            questionnaireResponseId: "100-B-QR",
                            type: "http://fhir.smart4health.eu/Questionnaire/post-training-questionnaire",
                            date: O.none,
                            responses: [
                                { type: "Integer", linkId: "training_no", questionTitle: "What?",      responseNumber:  5 },
                                { type: "Integer", linkId: "weight",      questionTitle: "How heavy?", responseNumber: 77 }
                            ]
                        }
                    ]
                },

                {
                    type: "File", id: "100-C", date: O.fromEither(parseTauDateTime("2000-01-01")),
                    identifier: [{ system: "foo", value: "100-C" }],
                    encounter: O.some("enc:1"), encounterType: O.none,
                    fileId: "1234",
                    category: [],
                    docRefType: O.none,
                    title: "File 1234",
                    specialty: O.none
                },

                {
                    type: "Questionnaire", id: "100-D", date: O.fromEither(parseTauDateTime("2001-01-01")),
                    identifier: [{ system: "foo", value: "100-D" }],
                    encounter: O.some("enc:2"), encounterType: O.none,
                    trainingNumber: O.none, shortText: O.none,
                    sections: [
                        {
                            title: "Questionnaire 100-D",
                            questionnaireId: "100-D",
                            questionnaireResponseId: "100-D-QR",
                            type: "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire",
                            date: O.none,
                            responses: [
                                { type: "Integer", linkId: "training_no", questionTitle: "What?",      responseNumber:  5 },
                                { type: "Integer", linkId: "weight",      questionTitle: "How heavy?", responseNumber: 77 }
                            ]
                        }
                    ]
                },

                {
                    type: "Questionnaire", id: "100-E", date: O.fromEither(parseTauDateTime("2002-01-01")),
                    identifier: [{ system: "foo", value: "100-E" }],
                    encounter: O.some("enc:1"), encounterType: O.none,
                    trainingNumber: O.none, shortText: O.none,
                    sections: [
                        {
                            title: "Questionnaire 100-E",
                            questionnaireId: "100-E",
                            questionnaireResponseId: "100-E-QR",
                            type: "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire",
                            date: O.none,
                            responses: [
                                { type: "Integer", linkId: "training_no", questionTitle: "What?",      responseNumber:  7 },
                                { type: "Integer", linkId: "weight",      questionTitle: "How heavy?", responseNumber: 77 }
                            ]
                        }
                    ]
                },

                {
                    type: "Questionnaire", id: "100-F", date: O.fromEither(parseTauDateTime("2003-01-01")),
                    identifier: [{ system: "foo", value: "100-F" }],
                    encounter: O.some("enc:1"), encounterType: O.none,
                    trainingNumber: O.none, shortText: O.none,
                    sections: [
                        {
                            title: "Questionnaire 100-F",
                            questionnaireId: "100-F",
                            questionnaireResponseId: "100-F-QR",
                            type: "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire",
                            date: O.none,
                            responses: [
                                { type: "Integer", linkId: "weight", questionTitle: "How heavy?", responseNumber: 77 }
                            ]
                        }
                    ]
                },

                {
                    type: "Questionnaire", id: "100-G", date: O.fromEither(parseTauDateTime("2006-01-01")),
                    identifier: [{ system: "foo", value: "100-G" }],
                    encounter: O.some("enc:2"), encounterType: O.none,
                    trainingNumber: O.none, shortText: O.none,
                    sections: [
                        {
                            title: "Questionnaire 100-G",
                            questionnaireId: "100-G",
                            questionnaireResponseId: "100-G-QR",
                            type: "http://fhir.smart4health.eu/Questionnaire/post-training-questionnaire",
                            date: O.fromEither(parseTauDateTime("2006-01-01")),
                            responses: [
                                { type: "Integer", linkId: "training_no", questionTitle: "What?",      responseNumber:  7 },
                                { type: "Integer", linkId: "weight",      questionTitle: "How heavy?", responseNumber: 77 }
                            ]
                        }
                    ]
                },

                {
                    type: "Questionnaire", id: "100-H", date: O.none,
                    identifier: [{ system: "foo", value: "100-H1" }, { system: "foo", value: "100-H2" }],
                    encounter: O.some("enc:2"), encounterType: O.none,
                    trainingNumber: O.none, shortText: O.none,
                    sections: [
                        {
                            title: "Questionnaire 100-H",
                            questionnaireId: "100-H",
                            questionnaireResponseId: "100-H-QR",
                            type: "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire",
                            date: O.none,
                            responses: [
                                { type: "Integer", linkId: "training_no", questionTitle: "What?",      responseNumber:  7 },
                                { type: "Integer", linkId: "weight",      questionTitle: "How heavy?", responseNumber: 77 }
                            ]
                        }
                    ]
                },

                {
                    type: "Questionnaire", id: "100-I", date: O.fromEither(parseTauDateTime("2004-01-01")),
                    identifier: [{ system: "foo", value: "100-I" }],
                    encounter: O.some("enc:2"), encounterType: O.none,
                    trainingNumber: O.none, shortText: O.none,
                    sections: [
                        {
                            title: "Questionnaire 100-I",
                            questionnaireId: "100-I",
                            questionnaireResponseId: "100-I-QR",
                            type: "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire",
                            date: O.fromEither(parseTauDateTime("2004-01-01")),
                            responses: [
                                { type: "Integer", linkId: "training_no", questionTitle: "What?",      responseNumber:  7 },
                                { type: "Integer", linkId: "weight",      questionTitle: "How heavy?", responseNumber: 77 }
                            ]
                        }
                    ]
                },

                {
                    type: "Questionnaire", id: "100-J", date: O.fromEither(parseTauDateTime("2007-01-01")),
                    identifier: [{ system: "foo", value: "100-J" }],
                    encounter: O.some("enc:2"), encounterType: O.none,
                    trainingNumber: O.none, shortText: O.none,
                    sections: [
                        {
                            title: "Questionnaire 100-J",
                            questionnaireId: "100-J",
                            questionnaireResponseId: "100-J-QR",
                            type: "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire-XXXX",
                            date: O.none,
                            responses: [
                                { type: "Integer", linkId: "training_no", questionTitle: "What?",      responseNumber:  7 },
                                { type: "Integer", linkId: "weight",      questionTitle: "How heavy?", responseNumber: 77 }
                            ]
                        }
                    ]
                }
            ]
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [ issues, outputGroup ] = mergeGroupItemSections(inputGroup);

        if (shouldDump()) {
            consoleLogInspect(outputGroup);
        }

        expect( outputGroup.items).to.have.length(7);

        expect( outputGroup.items[0]).to.eql(inputGroup.items[2]); // 100-C
        expect( outputGroup.items[1]).to.eql(inputGroup.items[3]); // 100-D
        expect( outputGroup.items[2]).to.eql(inputGroup.items[4]); // 100-E
        expect( outputGroup.items[3]).to.eql(inputGroup.items[5]); // 100-F


        // first new item (merge of 100-G, 100-H, 100-I)
        expect( outputGroup.items[4].type).to.eql("Questionnaire");
        expect( outputGroup.items[4].date).to.eql(O.some({ kind: "YYYY-MM-DD", year: 2004, month: 1, day: 1 }));  // "2004-01-01T00:00:00.000Z"
        expect( outputGroup.items[4].encounter).to.eql(O.some("enc:2"));
        expect((outputGroup.items[4] as ProtoQuestionnaireGroupItem).sections).to.have.length(3);
        expect((outputGroup.items[4] as ProtoQuestionnaireGroupItem).trainingNumber).to.eql(O.some(7));
        expect((outputGroup.items[4] as ProtoQuestionnaireGroupItem).shortText).to.eql(O.some("#7"));

        expect((outputGroup.items[4] as ProtoQuestionnaireGroupItem).sections[0]).to.eql((inputGroup.items[7] as ProtoQuestionnaireGroupItem).sections[0]); // 100-H (first because of no date)
        expect((outputGroup.items[4] as ProtoQuestionnaireGroupItem).sections[1]).to.eql((inputGroup.items[8] as ProtoQuestionnaireGroupItem).sections[0]); // 100-I
        expect((outputGroup.items[4] as ProtoQuestionnaireGroupItem).sections[2]).to.eql((inputGroup.items[6] as ProtoQuestionnaireGroupItem).sections[0]); // 100-G

        expect((outputGroup.items[4] as ProtoQuestionnaireGroupItem).identifier).to.eql([
            { system: "foo", value: "100-G" },
            { system: "foo", value: "100-H1" },
            { system: "foo", value: "100-H2" },
            { system: "foo", value: "100-I" }
        ]);


        // second new item (merge of 100-A, 100-B)
        expect( outputGroup.items[5].type).to.eql("Questionnaire");
        expect( outputGroup.items[5].date).to.eql(O.some({ kind: "YYYY-MM-DD", year: 2005, month: 10, day: 1 }));  // "2005-10-01T00:00:00.000Z"
        expect( outputGroup.items[5].encounter).to.eql(O.some("enc:1"));
        expect((outputGroup.items[5] as ProtoQuestionnaireGroupItem).sections).to.have.length(2);
        expect((outputGroup.items[5] as ProtoQuestionnaireGroupItem).trainingNumber).to.eql(O.some(5));
        expect((outputGroup.items[5] as ProtoQuestionnaireGroupItem).shortText).to.eql(O.some("#5"));

        expect((outputGroup.items[5] as ProtoQuestionnaireGroupItem).sections[0]).to.eql((inputGroup.items[0] as ProtoQuestionnaireGroupItem).sections[0]); // 100-A
        expect((outputGroup.items[5] as ProtoQuestionnaireGroupItem).sections[1]).to.eql((inputGroup.items[1] as ProtoQuestionnaireGroupItem).sections[0]); // 100-B

        expect((outputGroup.items[5] as ProtoQuestionnaireGroupItem).identifier).to.eql([
            { system: "foo", value: "100-A" },
            { system: "foo", value: "100-B" }
        ]);

        expect( outputGroup.items[6]).to.eql(inputGroup.items[9]); // 100-J
    });

});
