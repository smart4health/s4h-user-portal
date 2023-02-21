/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";

import { consoleLogInspect, shouldDot, shouldDump, writeGraph } from "../../test/utils";

import { IssueList_A } from "../../src/utils/issues";
import { refGraphToDot } from "../../src/fhir-resources/utils/graph/viz/render";
import { fhirToGroupLists } from "../../src/transformations/group-list/fhir2ui";
import { ComplexCourseGroup_A, FileGroupItem_A, QuestionnaireGroupItem_A, ScaleResponse, TransformationResult_A } from "../../src/transformations/group-list/defs";

import { RESOURCES, SINGLE_Q_GROUP } from "./fixtures/bigger-example/files";


describe("xforms suite", () => {

    it("no input resources", async () => {
        const [ issues, result ] = await fhirToGroupLists([ ]);
        expect(issues).to.have.length(1);
        expect(result.model.groupList).to.have.length(0);
    });

    it("broken single resource", async () => {
        const brokenDocRef = {
            resourceType: "DocumentReference"
            // missing everything
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [ issues, result ] = await fhirToGroupLists([ brokenDocRef ]);
        expect(issues.length).to.be.above(0);
    });

    it("single DocumentReference with no attachments", async () => {
        const [ _issues, result ] = await fhirToGroupLists([
            {
                "resourceType": "DocumentReference",
                "status": "current",
                "id": "E80F101C-B5B8-479B-A392-918F110FF7EB",
                "type": {
                    "coding": [{
                        "system": "http://foo.bar",
                        "code": "12345"
                    }]
                },
                "indexed": "2020-02-03T09:57:34.211Z",
                "content": []
            }
        ]);

        expect(result.model.groupList).to.have.length(0);
    });

    it("single DocumentReference with one attachment", async () => {
        const [ issues, result ] = await fhirToGroupLists([
            {
                "resourceType": "DocumentReference",
                "status": "current",
                "id": "E80F101C-B5B8-479B-A392-918F110FF7EB",
                "type": {
                    "coding": [{
                        "system": "http://loinc.org",
                        "code": "11524-6"
                    }]
                },
                "category": [{
                    "coding": [{
                        "system": "http://loinc.org",
                        "code": "11524-6"
                    }]
                }],
                "date": "2020-02-03T09:57:34.211Z",
                "content": [{
                    "attachment": {
                        "id": "9848EFFB-71B8-4DE1-846C-FF9358051B3D"
                    }
                }]
            }
        ]);

        expect(issues).to.have.length(1);
        expect(result.model.groupList).to.have.length(1);

        expect(result.model.groupList[0].id).to.eql("E80F101C-B5B8-479B-A392-918F110FF7EB");
        expect(result.model.groupList[0].date).to.eql("2020-02-03T09:57:34.211Z");
        expect(result.model.groupList[0].items).to.have.length(1);

        expect( result.model.groupList[0].items[0].id).to.eql("E80F101C-B5B8-479B-A392-918F110FF7EB");
        expect((result.model.groupList[0].items[0] as FileGroupItem_A).fileId).to.eql("9848EFFB-71B8-4DE1-846C-FF9358051B3D");

        expect((result.model.groupList[0].items[0] as FileGroupItem_A).category).to.eql([{
            codeableConcept: { coding: [{ system: "http://loinc.org", code: "11524-6"  }] },
            resolvedText: "EKG study"
        }]);

        expect((result.model.groupList[0].items[0] as FileGroupItem_A).docRefType).to.eql({
            codeableConcept: { coding: [{ system: "http://loinc.org", code: "11524-6"  }] },
            resolvedText: "EKG study"
        });
    });

    describe("single QuestionnaireResponse, answer removal", () => {

        it("w/o answer removal", async () => {
            const [ _issues, result ] = await fhirToGroupLists(SINGLE_Q_GROUP);

            if (shouldDump()) {
                consoleLogInspect(result);
            }

            expect(result.model.groupList).to.have.length(1);
            expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses).to.have.length(3);

            expect(pipe((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses, A.map(r => r.questionTitle))).to.eql([
                "Training Number",
                "Post-training condition",
                "Training weight recommendation for the next training."
            ]);
        });

        it("w/ answer removal", async () => {
            const [ _issues, result ] = await fhirToGroupLists(SINGLE_Q_GROUP, { removeAnswers: [ "training_no" ] });

            if (shouldDump()) {
                consoleLogInspect(result);
            }

            expect(result.model.groupList).to.have.length(1);
            expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses).to.have.length(2);

            expect(pipe((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses, A.map(r => r.questionTitle))).to.eql([
                "Post-training condition",
                "Training weight recommendation for the next training."
            ]);
        });
    });

    describe("bigger example", () => {
        let issues: IssueList_A;
        let result: TransformationResult_A;

        before(async () => {
            [ issues, result ] = await fhirToGroupLists(
                RESOURCES,
                { toDot: refGraphToDot, removeAnswers: [ "training_no" ] }
            );

            if (result.dot && shouldDot()) {
                await writeGraph(result.dot, "bigger-example.pdf");
            }

            if (shouldDump()) {
                consoleLogInspect(issues, 3);
                consoleLogInspect(result.model.groupList);
            }
        });

        it("general treatment group", () => {
            expect(result.model.groupList).to.have.length(1);
            expect(result.model.groupList[0].items).to.have.length(10);

            expect(result.model.groupList[0].groupType).to.eql("Course");
            expect(result.model.groupList[0].date).to.eql("2020-03-15T12:08:51.687Z");

            expect((result.model.groupList[0] as ComplexCourseGroup_A).courseTypes).to.eql([ "$$BACK_PAIN_TREATMENT$$" ]);

            expect((result.model.groupList[0] as ComplexCourseGroup_A).inputResourceIds).to.have.same.members([
                "s4h-treatment-series-final-force-test-docref-example",
                "s4h-treatment-series-initial-force-test-docref-example",

                "s4h-treatment-series-post-session-encounter-example",
                "s4h-treatment-series-pre-session-encounter-example",
                "s4h-treatment-series-training-encounter-example-1",
                "s4h-treatment-series-training-encounter-example-2",
                "s4h-treatment-series-training-encounter-example-3",
                "s4h-treatment-series-training-encounter-example-4",
                "s4h-treatment-series-training-encounter-example-5",
                "s4h-treatment-series-training-encounter-example-6",

                "s4h-treatment-series-post-session-response-example",
                "s4h-treatment-series-pre-session-response-example",

                "s4h-treatment-series-post-training-response-example-1",
                "s4h-treatment-series-post-training-response-example-2",
                "s4h-treatment-series-post-training-response-example-3",
                "s4h-treatment-series-post-training-response-example-4",
                "s4h-treatment-series-post-training-response-example-5",

                "s4h-treatment-series-pre-training-response-example-1",
                "s4h-treatment-series-pre-training-response-example-2",
                "s4h-treatment-series-pre-training-response-example-3",
                "s4h-treatment-series-pre-training-response-example-4",
                "s4h-treatment-series-pre-training-response-example-5",
                "s4h-treatment-series-pre-training-response-example-6"
            ]);

            expect((result.model.groupList[0] as ComplexCourseGroup_A).inputResourceIdentifiers).to.eql([
                [{
                    system: "http://fhir.smart4health.eu/CodeSystem/ittm-visit-id",
                    value: "test-initial"
                }],
                [{
                    system: "http://fhir.smart4health.eu/CodeSystem/ittm-visit-id",
                    value: "test-final"
                }],
                [{
                    system: "http://fhir.smart4health.eu/CodeSystem/ittm-visit-id",
                    value: "test-visit-1"
                }],
                [{
                    system: "http://fhir.smart4health.eu/CodeSystem/ittm-visit-id",
                    value: "test-visit-2"
                }],
                [{
                    system: "http://fhir.smart4health.eu/CodeSystem/ittm-visit-id",
                    value: "test-visit-3"
                }],
                [{
                    system: "http://fhir.smart4health.eu/CodeSystem/ittm-visit-id",
                    value: "test-visit-4"
                }],
                [{
                    system: "http://fhir.smart4health.eu/CodeSystem/ittm-visit-id",
                    value: "test-visit-5"
                }],
                [{
                    system: "http://fhir.smart4health.eu/CodeSystem/ittm-visit-id",
                    value: "test-visit-6"
                }]
            ]);
        });


        it("group item 0", () => {
            expect( result.model.groupList[0].items[0].id).to.eql("s4h-treatment-series-pre-session-response-example");
            expect( result.model.groupList[0].items[0].type).to.eql("Questionnaire");
            expect( result.model.groupList[0].items[0].date).to.eql("2020-02-03T14:15:00-05:00");

            expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).thumbnailText).to.eql("Pre");
            expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections).to.have.length(1);
            expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].title).to.eql("Pre-session treatment questionnaire");
            expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].type).to.eql("http://fhir.smart4health.eu/Questionnaire/pre-session-questionnaire");
            expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses).to.have.length(4);
        });

        it("group item 1", () => {
            expect( result.model.groupList[0].items[1].type).to.eql("Questionnaire");
            expect( result.model.groupList[0].items[1].date).to.eql("2020-02-06");

            expect((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).thumbnailText).to.eql("#1");
            expect((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections).to.have.length(2);
        });

        it("group item 2", () => {
            expect( result.model.groupList[0].items[2].id).to.eql("s4h-treatment-series-initial-force-test-docref-example");
            expect( result.model.groupList[0].items[2].type).to.eql("File");
            expect( result.model.groupList[0].items[2].date).to.eql("2020-02-06T12:08:51.687Z");

            expect((result.model.groupList[0].items[2] as FileGroupItem_A).fileId).to.eql("c270037d-e053-430e-888d-0b5db02b7d51");
            expect((result.model.groupList[0].items[2] as FileGroupItem_A).docRefType).to.eql({
                codeableConcept: {
                    coding: [{
                        system: "http://loinc.org",
                        code: "19002-5",
                        display: "Physical therapy service attachment"
                    }]
                },
                resolvedText: "Physical therapy service attachment"
            });
            expect((result.model.groupList[0].items[2] as FileGroupItem_A).title).to.eql("Initial force test documentation");
        });

        it("group item 3", () => {
            expect( result.model.groupList[0].items[3].type).to.eql("Questionnaire");
            expect( result.model.groupList[0].items[3].date).to.eql("2020-02-13");

            expect((result.model.groupList[0].items[3] as QuestionnaireGroupItem_A).thumbnailText).to.eql("#2");
            expect((result.model.groupList[0].items[3] as QuestionnaireGroupItem_A).sections).to.have.length(2);
        });

        it("group item 7", () => {
          expect( result.model.groupList[0].items[7].id).to.eql("s4h-treatment-series-pre-training-response-example-6");
          expect( result.model.groupList[0].items[7].type).to.eql("Questionnaire");
          expect( result.model.groupList[0].items[7].date).to.eql("2020-03-13");

          expect((result.model.groupList[0].items[7] as QuestionnaireGroupItem_A).thumbnailText).to.eql("Pre-training");
          expect((result.model.groupList[0].items[7] as QuestionnaireGroupItem_A).sections).to.have.length(1);
          expect((result.model.groupList[0].items[7] as QuestionnaireGroupItem_A).sections[0].responses).to.have.length(3);

          expect( (result.model.groupList[0].items[7] as QuestionnaireGroupItem_A).sections[0].responses[0].type).to.eql("Scale");
          expect(((result.model.groupList[0].items[7] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMinValueLabel).to.eql("no pain");
          expect(((result.model.groupList[0].items[7] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMaxValueLabel).to.eql("worst pain");
          expect(((result.model.groupList[0].items[7] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleValue).to.eql(4);

          expect( (result.model.groupList[0].items[7] as QuestionnaireGroupItem_A).sections[0].responses[1].type).to.eql("Scale");
          expect(((result.model.groupList[0].items[7] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMinValueLabel).to.eql("all well");
          expect(((result.model.groupList[0].items[7] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMaxValueLabel).to.eql("all bad");
          expect(((result.model.groupList[0].items[7] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleValue).to.eql(5);
        });

        it("group item 9", () => {
            expect( result.model.groupList[0].items[9].id).to.eql("s4h-treatment-series-final-force-test-docref-example");
            expect( result.model.groupList[0].items[9].type).to.eql("File");
            expect( result.model.groupList[0].items[9].date).to.eql("2020-03-15T12:08:51.687Z");

            expect((result.model.groupList[0].items[9] as FileGroupItem_A).fileId).to.eql("c270037d-e053-430e-888d-0b5db02b7d51");
            expect((result.model.groupList[0].items[9] as FileGroupItem_A).docRefType).to.eql({
                codeableConcept: {
                    coding: [{
                        system: "http://loinc.org",
                        code: "19002-5",
                        display: "Physical therapy service attachment"
                    }]
                },
                resolvedText: "Physical therapy service attachment"
            });
            expect((result.model.groupList[0].items[9] as FileGroupItem_A).title).to.eql("Physical therapy service attachment");
            expect((result.model.groupList[0].items[9] as FileGroupItem_A).specialty).to.eql({
                codeableConcept: { coding: [{ system: "http://snomed.info/sct", code: "408467006" }] },
                resolvedText: "Adult mental illness"
            });
        });

    });

});
