/* eslint-disable max-nested-callbacks */
import { expect } from "chai";
import { consoleLogInspect, hasErrors, shouldDump } from "../../utils";

import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";

import { readOnlyMockedSdk } from "../../../src/utils/sdk-mocks";

import { apiReadProblemList } from "../../../src/transformations/problem-list/public-api";
import { ordClinicalStatus } from "../../../src/transformations/problem-list/fhir2ui";
import { AnnotatedCodeableConcept_A } from "../../../src/fhir-resources/types";


describe("public API: problem list", () => {

    it("empty account", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: []
        });

        const [ issues, result ] = await apiReadProblemList({ sdk });

        expect(result.model).to.eql({
            modelType: "ProblemList/1",
            problems: []
        });

        expect(hasErrors(issues)).to.be.false;
    });

    it("one problem", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [{
                "resourceType": "Condition",
                "id": "f203",
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative with Details</b></p><p><b>id</b>: f203</p><p><b>clinicalStatus</b>: Active <span>(Details : {http://terminology.hl7.org/CodeSystem/condition-clinical code 'active' = 'Active)</span></p><p><b>verificationStatus</b>: Confirmed <span>(Details : {http://terminology.hl7.org/CodeSystem/condition-ver-status code 'confirmed' = 'Confirmed)</span></p><p><b>category</b>: Problem <span>(Details : {SNOMED CT code '55607006' = 'Problem', given as 'Problem'}; {http://terminology.hl7.org/CodeSystem/condition-category code 'problem-list-item' = 'Problem List Item)</span></p><p><b>severity</b>: Moderate to severe <span>(Details : {SNOMED CT code '371924009' = 'Moderate to severe', given as 'Moderate to severe'})</span></p><p><b>code</b>: Bacterial sepsis <span>(Details : {SNOMED CT code '10001005' = 'Bacterial septicemia', given as 'Bacterial sepsis'})</span></p><p><b>bodySite</b>: Pulmonary vascular structure <span>(Details : {SNOMED CT code '281158006' = 'Pulmonary vascular structure', given as 'Pulmonary vascular structure'})</span></p><p><b>subject</b>: <a>Roel</a></p><p><b>encounter</b>: <a>Roel's encounter on March elevanth</a></p><p><b>onset</b>: 08/03/2013</p><p><b>recordedDate</b>: 11/03/2013</p><p><b>asserter</b>: <a>Practitioner/f201</a></p><h3>Evidences</h3><table><tr><td>-</td><td><b>Detail</b></td></tr><tr><td>*</td><td><a>Diagnostic report for Roel's sepsis</a></td></tr></table></div>"
                },
                "identifier": [{
                    "system": "foo", "value": "bar"
                }, {
                    "system": "wom", "value": "bat"
                }],
                "clinicalStatus": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                            "code": "active"
                        }
                    ]
                },
                "verificationStatus": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                            "code": "confirmed"
                        }
                    ]
                },
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "55607006",
                                "display": "Problem"
                            },
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                                "code": "problem-list-item"
                            }
                        ]
                    }
                ],
                "severity": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "371924009",
                            "display": "Moderate to severe"
                        }
                    ]
                },
                "code": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "10001005",
                            "display": "Bacterial sepsis"
                        }
                    ]
                },
                "bodySite": [
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "281158006",
                                "display": "Pulmonary vascular structure"
                            }
                        ]
                    }
                ],
                "subject": {
                    "reference": "Patient/f201",
                    "display": "Roel"
                },
                "encounter": {
                    "reference": "Encounter/f203",
                    "display": "Roel's encounter on March elevanth"
                },
                "onsetDateTime": "2013-03-08",
                "recordedDate": "2013-03-11",
                "asserter": {
                    "reference": "Practitioner/f201"
                },
                "evidence": [
                    {
                        "detail": [
                            {
                                "reference": "DiagnosticReport/f202",
                                "display": "Diagnostic report for Roel's sepsis"
                            }
                        ]
                    }
                ]
            }]
        });

        const [ issues, result ] = await apiReadProblemList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result.model, 10);
        }

        expect(result.model).to.eql({
            modelType: "ProblemList/1",
            problems: [{
                period: {
                    min: 1362960000000,
                    max: +Infinity
                },
                problemId: "f203",
                problemIdentifier: [{
                    system: "foo", value: "bar"
                }, {
                    system: "wom", value: "bat"
                }],
                clinicalStatus: {
                    codeableConcept: {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                                code: "active"
                            }
                        ]
                    },
                    resolvedText: "Active"
                },
                verificationStatus: {
                    codeableConcept: {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                                code: "confirmed"
                            }
                        ]
                    },
                    resolvedText: "Confirmed"
                },
                code: {
                    codeableConcept: {
                        coding: [
                            {
                                system: "http://snomed.info/sct",
                                code: "10001005",
                                display: "Bacterial sepsis"
                          }
                        ]
                    },
                    resolvedText: "Bacterial sepsis"
                },
                severity: {
                    codeableConcept: {
                        coding: [
                            {
                                system: "http://snomed.info/sct",
                                code: "371924009",
                                display: "Moderate to severe"
                            }
                        ]
                    },
                    resolvedText: "Moderate to severe"
                },
                category: [{
                    codeableConcept: {
                        coding: [
                            {
                                system: "http://snomed.info/sct",
                                code: "55607006",
                                display: "Problem"
                            },
                            {
                                system: "http://terminology.hl7.org/CodeSystem/condition-category",
                                code: "problem-list-item"
                            }
                        ]
                    },
                    resolvedText: "Problem"
                }]
        }] });
    });

    it("multiple problems, check order", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [
                {
                    "resourceType": "Condition",
                    "id": "cond-0",
                    "clinicalStatus": { "text": "foo" },
                    "verificationStatus": { "text": "bar" },
                    "subject": { "display": "you" },
                    "recordedDate": "2013-03-11"
                },
                {
                    "resourceType": "Condition",
                    "id": "cond-1",
                    "clinicalStatus": { "text": "foo" },
                    "verificationStatus": { "text": "bar" },
                    "subject": { "display": "you" }
                },
                {
                    "resourceType": "Condition",
                    "id": "cond-2",
                    "clinicalStatus": { "text": "foo" },
                    "verificationStatus": { "text": "bar" },
                    "subject": { "display": "you" },
                    "recordedDate": "2013-02-10"
                },
                {
                    "resourceType": "Condition",
                    "id": "cond-3",
                    "clinicalStatus": { "text": "foo" },
                    "verificationStatus": { "text": "bar" },
                    "subject": { "display": "you" },
                    "recordedDate": "2010-02-10"
                },
                {
                    "resourceType": "Condition",
                    "id": "cond-4",
                    "clinicalStatus": { "text": "foo" },
                    "verificationStatus": { "text": "bar" },
                    "subject": { "display": "you" }
                }
            ]
        });

        const [ issues, result ] = await apiReadProblemList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result.model, 10);
        }

        expect(result.model.problems).to.have.length(5);

        expect(result.model.problems[0].problemId).to.equal("cond-1");
        expect(result.model.problems[1].problemId).to.equal("cond-4");
        expect(result.model.problems[2].problemId).to.equal("cond-0");
        expect(result.model.problems[3].problemId).to.equal("cond-2");
        expect(result.model.problems[4].problemId).to.equal("cond-3");
    });

    describe("clinical status ord", () => {
        const CASES: { desc: string, input: O.Option<AnnotatedCodeableConcept_A>[]; output: O.Option<AnnotatedCodeableConcept_A>[] }[] = [
            {
                desc: "1",
                input:  [
                    O.some({ codeableConcept: {}, resolvedText: "1" }),
                    O.some({ codeableConcept: {}, resolvedText: "2" })
                ],
                output: [
                    O.some({ codeableConcept: {}, resolvedText: "1" }),
                    O.some({ codeableConcept: {}, resolvedText: "2" })
                ]
            },
            {
                desc: "2",
                input:  [
                    O.some({ codeableConcept: { coding: [{ code: "remission" }] }, resolvedText: "1" }),
                    O.some({ codeableConcept: {}, resolvedText: "2" })
                ],
                output: [
                    O.some({ codeableConcept: {}, resolvedText: "2" }),
                    O.some({ codeableConcept: { coding: [{ code: "remission" }] }, resolvedText: "1" })
                ]
            },
            {
                desc: "3",
                input:  [
                    O.some({ codeableConcept: { coding: [{ code: "active"    }] }, resolvedText: "1" }),
                    O.some({ codeableConcept: { coding: [{ code: "remission" }] }, resolvedText: "2" }),
                    O.some({ codeableConcept: { coding: [{ code: "relapse"   }] }, resolvedText: "3" }),
                    O.some({ codeableConcept: { coding: [{ code: "remission" }] }, resolvedText: "4" }),
                    O.some({ codeableConcept: { coding: [{ code: "foo"       }] }, resolvedText: "5" }),
                    O.some({ codeableConcept: {                                 }, resolvedText: "6" })
                ],
                output: [
                    O.some({ codeableConcept: {                                 }, resolvedText: "6" }),
                    O.some({ codeableConcept: { coding: [{ code: "foo"       }] }, resolvedText: "5" }),
                    O.some({ codeableConcept: { coding: [{ code: "remission" }] }, resolvedText: "2" }),
                    O.some({ codeableConcept: { coding: [{ code: "remission" }] }, resolvedText: "4" }),
                    O.some({ codeableConcept: { coding: [{ code: "relapse"   }] }, resolvedText: "3" }),
                    O.some({ codeableConcept: { coding: [{ code: "active"    }] }, resolvedText: "1" })
                ]
            }
        ];

        for (const c of CASES) {
            it(c.desc, () => {
                expect(A.sort(ordClinicalStatus)(c.input)).to.eql(c.output);
            });
        }

    });

    it("multiple problems, check order", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [
                {
                    "resourceType": "Condition",
                    "id": "c-0",
                    "subject": { "display": "you" },
                    "clinicalStatus": { coding: [{ code: "active" }] },
                    "recordedDate": "2020-10-01"
                },
                {
                    "resourceType": "Condition",
                    "id": "c-1",
                    "subject": { "display": "you" },
                    "clinicalStatus": { coding: [{ code: "active" }] },
                    "recordedDate": "2010-03-01"
                },
                {
                    "resourceType": "Condition",
                    "id": "c-2",
                    "subject": { "display": "you" },
                    "clinicalStatus": { coding: [{ code: "active" }] },
                    "recordedDate": "2015-03-01"
                },
                {
                    "resourceType": "Condition",
                    "id": "c-3",
                    "subject": { "display": "you" },
                    "clinicalStatus": { coding: [{ code: "remission" }] }
                },
                {
                    "resourceType": "Condition",
                    "id": "c-4",
                    "subject": { "display": "you" },
                    "clinicalStatus": { coding: [{ code: "active" }] }
                },
                {
                    "resourceType": "Condition",
                    "id": "c-5",
                    "subject": { "display": "you" },
                    "clinicalStatus": { coding: [{ code: "active" }] },
                    "recordedDate": "2000-01-01"
                },
                {
                    "resourceType": "Condition",
                    "id": "c-6",
                    "subject": { "display": "you" },
                    "clinicalStatus": { coding: [{ code: "relapse" }] },
                    "recordedDate": "2000-01-01"
                },
                {
                    "resourceType": "Condition",
                    "id": "c-7",
                    "subject": { "display": "you" },
                    "clinicalStatus": { coding: [{ code: "foo" }] },
                    "recordedDate": "2000-01-01"
                },
                {
                    "resourceType": "Condition",
                    "id": "c-8",
                    "subject": { "display": "you" },
                    "clinicalStatus": { coding: [{ code: "active" }] },
                    "recordedDate": "2000-01-01"
                },
                {
                    "resourceType": "Condition",
                    "id": "c-9",
                    "subject": { "display": "you" },
                    "clinicalStatus": { coding: [] },
                    "recordedDate": "2000-01-01"
                },
                {
                    "resourceType": "Condition",
                    "id": "c-10",
                    "subject": { "display": "you" },
                    "clinicalStatus": { coding: [{ code: "inactive" }] },
                    "recordedDate": "2000-01-01"
                }
            ]
        });

        const [ issues, result ] = await apiReadProblemList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result.model, 10);
        }

        expect(result.model.problems).to.have.length(11);

        expect(result.model.problems[0].problemId).to.equal("c-4");
        expect(result.model.problems[1].problemId).to.equal("c-3");
        expect(result.model.problems[2].problemId).to.equal("c-0");
        expect(result.model.problems[3].problemId).to.equal("c-2");
        expect(result.model.problems[4].problemId).to.equal("c-1");
        expect(result.model.problems[5].problemId).to.equal("c-5");
        expect(result.model.problems[6].problemId).to.equal("c-8");
        expect(result.model.problems[7].problemId).to.equal("c-6");
        expect(result.model.problems[8].problemId).to.equal("c-10");
        expect(result.model.problems[9].problemId).to.equal("c-7");
        expect(result.model.problems[10].problemId).to.equal("c-9");
    });

});
