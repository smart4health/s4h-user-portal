/* eslint-disable max-nested-callbacks */
import { expect } from "chai";
import { consoleLogInspect, hasErrors, shouldDump } from "../../utils";

import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";

import { readOnlyMockedSdk } from "../../../src/utils/sdk-mocks";

import { reverse } from "fp-ts/Ord";
import { ordCriticality } from "../../../src/transformations/problem-list/fhir2ui";
import { apiReadAllergyIntoleranceList } from "../../../src/transformations/problem-list/public-api";


describe("public API: allergy intolerance list", () => {

    it("empty account", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: []
        });

        const [ issues, result ] = await apiReadAllergyIntoleranceList({ sdk });

        expect(result.model).to.eql({
            modelType: "AllergyIntoleranceList/1",
            allergyIntolerances: []
        });

        expect(hasErrors(issues)).to.be.false;
    });

    it("one A/I", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [{
                "resourceType": "AllergyIntolerance",
                "id": "example",
                "identifier": [{
                    "system": "http://acme.com/ids/patients/risks",
                    "value": "49476534"
                }],
                "clinicalStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                        "code": "active",
                        "display": "Active"
                    }]
                },
                "verificationStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                        "code": "confirmed",
                        "display": "Confirmed"
                    }]
                },
                "type": "allergy",
                "category": [ "food" ],
                "criticality": "high",
                "code": {
                    "coding": [{
                        "system": "http://snomed.info/sct",
                        "code": "227493005",
                        "display": "Cashew nuts"
                    }]
                },
                "patient": {
                    "reference": "Patient/example"
                },
                "onsetDateTime": "2004",
                "recordedDate": "2014-10-09T14:58:00+11:00",
                "recorder": {
                    "reference": "Practitioner/example"
                },
                "asserter": {
                    "reference": "Patient/example"
                },
                "lastOccurrence": "2012-06",
                "note": [{
                    "text": "The criticality is high becasue of the observed anaphylactic reaction when challenged with cashew extract."
                }],
                "reaction": [{
                    "substance": {
                        "coding": [{
                            "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                            "code": "1160593",
                            "display": "cashew nut allergenic extract Injectable Product"
                        }]
                    },
                    "manifestation": [{
                        "coding": [{
                            "system": "http://snomed.info/sct",
                            "code": "39579001",
                            "display": "Anaphylactic reaction"
                        }]
                    }],
                    "description": "Challenge Protocol. Severe reaction to subcutaneous cashew extract. Epinephrine administered",
                    "onset": "2012-06-12",
                    "severity": "severe",
                    "exposureRoute": {
                        "coding": [{
                            "system": "http://snomed.info/sct",
                            "code": "34206005",
                            "display": "Subcutaneous route"
                        }]
                    }
                }, {
                    "manifestation": [{
                        "coding": [{
                            "system": "http://snomed.info/sct",
                            "code": "64305001",
                            "display": "Urticaria"
                        }]
                    }, {
                        "coding": [{
                            "system": "http://snomed.info/sct",
                            "code": "12345678",
                            "display": "Foobar"
                        }]
                    }],
                    "onset": "2004",
                    "severity": "moderate",
                    "note": [{
                        "text": "The patient reports that the onset of urticaria was within 15 minutes of eating cashews."
                    }]
                }]
            }]
        });

        const [ issues, result ] = await apiReadAllergyIntoleranceList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result.model, 10);
        }

        expect(result.model).to.eql({
            modelType: "AllergyIntoleranceList/1",
            allergyIntolerances: [{
                period: {
                    min: 1412827080000,
                    max: +Infinity
                },
                allergyIntoleranceId: "example",
                allergyIntoleranceIdentifier: [{
                    system: "http://acme.com/ids/patients/risks",
                    value: "49476534"
                }],
                clinicalStatus: {
                    codeableConcept: {
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                            code: "active",
                            display: "Active"
                        }]
                    },
                    resolvedText: "Active"
                },
                verificationStatus: {
                    codeableConcept: {
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                            code: "confirmed",
                            display: "Confirmed"
                        }]
                    },
                    resolvedText: "Confirmed"
                },
                code: {
                    codeableConcept: {
                        coding: [{
                            system: "http://snomed.info/sct",
                            code: "227493005",
                            display: "Cashew nuts"
                        }]
                    },
                    resolvedText: "Cashew nuts"
                },
                criticality: "high",
                criticalityConcept: {
                    codeableConcept: {
                        coding: [{
                            system: "http://hl7.org/fhir/allergy-intolerance-criticality",
                            code: "high"
                        }]
                    },
                    resolvedText: "High"
                },
                reactions: [{
                    manifestations: [{
                        codeableConcept: {
                            coding: [{
                                system: "http://snomed.info/sct",
                                code: "39579001",
                                display: "Anaphylactic reaction"
                            }]
                        },
                        resolvedText: "Anaphylactic reaction"
                    }],
                    onset: 1339459200000,
                    severity: "severe",
                    substance: {
                        codeableConcept: {
                            coding: [{
                                system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                                code: "1160593",
                                display: "cashew nut allergenic extract Injectable Product"
                            }]
                        },
                        resolvedText: "cashew nut allergenic extract Injectable Product"
                    },
                    exposureRoute: {
                        codeableConcept: {
                            coding: [{
                                system: "http://snomed.info/sct",
                                code: "34206005",
                                display: "Subcutaneous route"
                            }]
                        },
                        resolvedText: "Subcutaneous route"
                    }
                }, {
                    manifestations: [{
                        codeableConcept: {
                            coding: [{
                                system: "http://snomed.info/sct",
                                code: "64305001",
                                display: "Urticaria"
                            }]
                        },
                        resolvedText: "Urticaria"
                    }, {
                        codeableConcept: {
                            coding: [{
                                system: "http://snomed.info/sct",
                                code: "12345678",
                                display: "Foobar"
                            }]
                        },
                        resolvedText: "Foobar"
                    }],
                    onset: 1072915200000,
                    severity: "moderate",
                    substance: undefined,
                    exposureRoute: undefined
                }]
            }]
        });
    });

    it("one A/I, unknown criticality", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [{
                "resourceType": "AllergyIntolerance",
                "id": "example",
                "identifier": [{
                    "system": "http://acme.com/ids/patients/risks",
                    "value": "49476534"
                }],
                "clinicalStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                        "code": "active",
                        "display": "Active"
                    }]
                },
                "verificationStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                        "code": "confirmed",
                        "display": "Confirmed"
                    }]
                },
                "type": "allergy",
                "category": [ "food" ],
                "criticality": "foobar",
                "code": {
                    "coding": [{
                        "system": "http://snomed.info/sct",
                        "code": "227493005",
                        "display": "Cashew nuts"
                    }]
                },
                "patient": {
                    "reference": "Patient/example"
                },
                "onsetDateTime": "2004",
                "recordedDate": "2014-10-09T14:58:00+11:00",
                "recorder": {
                    "reference": "Practitioner/example"
                },
                "asserter": {
                    "reference": "Patient/example"
                },
                "lastOccurrence": "2012-06"
            }]
        });

        const [ issues, result ] = await apiReadAllergyIntoleranceList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result.model, 10);
        }

        expect(result.model).to.eql({
            modelType: "AllergyIntoleranceList/1",
            allergyIntolerances: [{
                period: {
                    min: 1412827080000,
                    max: +Infinity
                },
                allergyIntoleranceId: "example",
                allergyIntoleranceIdentifier: [{
                    system: "http://acme.com/ids/patients/risks",
                    value: "49476534"
                }],
                clinicalStatus: {
                    codeableConcept: {
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                            code: "active",
                            display: "Active"
                        }]
                    },
                    resolvedText: "Active"
                },
                verificationStatus: {
                    codeableConcept: {
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                            code: "confirmed",
                            display: "Confirmed"
                        }]
                    },
                    resolvedText: "Confirmed"
                },
                code: {
                    codeableConcept: {
                        coding: [{
                            system: "http://snomed.info/sct",
                            code: "227493005",
                            display: "Cashew nuts"
                        }]
                    },
                    resolvedText: "Cashew nuts"
                },
                criticality: "foobar",
                criticalityConcept: {
                    codeableConcept: {
                        coding: [{
                            system: "http://hl7.org/fhir/allergy-intolerance-criticality",
                            code: "foobar"
                        }]
                    },
                    resolvedText: undefined
                }
            }]
        });
    });


    it("text-only code", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [{
                "resourceType": "AllergyIntolerance",
                "id": "s4h-medication-allergy-text-only-example",
                "meta": {
                    "profile": [ "http://fhir.smart4health.eu/StructureDefinition/s4h-allergyintolerance" ]
                },
                "clinicalStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                        "code": "active"
                    }]
                },
                "verificationStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                        "code": "confirmed"
                    }]
                },
                "code": {
                    "text": "CODEÍNA + FENILTOLOXAMINA"
                },
                "patient": {
                    "display": "John Doe"
                }
            }]
        });

        const [ issues, result ] = await apiReadAllergyIntoleranceList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result.model, 10);
        }

        expect(result.model).to.eql({
            modelType: "AllergyIntoleranceList/1",
            allergyIntolerances: [{
                period: {
                    min: -Infinity,
                    max: +Infinity
                },
                allergyIntoleranceId: "s4h-medication-allergy-text-only-example",
                allergyIntoleranceIdentifier: undefined,
                clinicalStatus: {
                    codeableConcept: {
                        coding: [{
                              system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                              code: "active"
                        }]
                    },
                    resolvedText: "Active"
                },
                verificationStatus: {
                    codeableConcept: {
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                            code: "confirmed"
                        }]
                    },
                    resolvedText: "Confirmed"
                },
                code: {
                    codeableConcept: {
                        text: "CODEÍNA + FENILTOLOXAMINA"
                    },
                    resolvedText: "CODEÍNA + FENILTOLOXAMINA"
                },
                criticality: undefined,
                criticalityConcept: undefined
            }]
        });
    });

    it("single reaction", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [{
                "resourceType": "AllergyIntolerance",
                "id": "s4h-allergy-with-reaction-example",
                "meta": {
                    "profile": [ "http://fhir.smart4health.eu/StructureDefinition/s4h-allergyintolerance" ]
                },
                "clinicalStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                        "code": "active"
                    }]
                },
                "verificationStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                        "code": "confirmed"
                    }]
                },
                "code": {
                    "coding": [{
                        "system": "http://snomed.info/sct",
                        "code": "294238000",
                        "display": "Allergy to gold (finding)"
                    }]
                },
                "criticality": "unable-to-assess",
                "patient": {
                    "display": "John Doe"
                },
                "reaction": [{
                    "manifestation": [{
                        "coding": [{
                            "system": "http://snomed.info/sct",
                            "code": "16932000",
                            "display": "Nausea and vomiting"
                        }]
                    }],
                    "severity": "severe"
                }]
            }]
        });

        const [ issues, result ] = await apiReadAllergyIntoleranceList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result.model, 10);
        }

        expect(result.model).to.eql({
            modelType: "AllergyIntoleranceList/1",
            allergyIntolerances: [{
                period: {
                    min: -Infinity,
                    max: +Infinity
                },
                allergyIntoleranceId: "s4h-allergy-with-reaction-example",
                allergyIntoleranceIdentifier: undefined,
                clinicalStatus: {
                    codeableConcept: {
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                            code: "active"
                        }]
                    },
                    resolvedText: "Active"
                },
                verificationStatus: {
                    codeableConcept: {
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                            code: "confirmed"
                        }]
                    },
                    resolvedText: "Confirmed"
                },
                code: {
                    codeableConcept: {
                        coding: [{
                            system: "http://snomed.info/sct",
                            code: "294238000",
                            display: "Allergy to gold (finding)"
                        }]
                    },
                    resolvedText: "Allergy to gold (finding)"
                },
                criticality: "unable-to-assess",
                criticalityConcept: {
                    codeableConcept: {
                        coding: [{
                            system: "http://hl7.org/fhir/allergy-intolerance-criticality",
                            code: "unable-to-assess"
                        }]
                    },
                    resolvedText: "Unable to Assess Risk"
                },
                reactions: [{
                    manifestations: [{
                        codeableConcept: {
                            coding: [{
                                system: "http://snomed.info/sct",
                                code: "16932000",
                                display: "Nausea and vomiting"
                            }]
                        },
                        resolvedText: "Nausea and vomiting"
                    }],
                    onset: undefined,
                    severity: "severe",
                    substance: undefined,
                    exposureRoute: undefined
                }]
            }]
        });
    });

    describe("criticality order", () => {

        const CASES: { desc: string, input: O.Option<string>[]; output: O.Option<string>[] }[] = [
            {
                desc: "1",
                input:  [ O.some("low"), O.some("high") ],
                output: [ O.some("low"), O.some("high") ]
            },
            {
                desc: "2",
                input:  [ O.some("high"), O.some("low") ],
                output: [ O.some("low"), O.some("high") ]
            },
            {
                desc: "3",
                input:  [ O.some("high"), O.some("unable-to-assess"), O.some("low"), O.some("high") ],
                output: [ O.some("unable-to-assess"), O.some("low"), O.some("high"), O.some("high") ]
            },
            {
                desc: "4",
                input:  [ O.some("high"), O.some("unable-to-assess"), O.some("low"), O.some("low"), O.some("unable-to-assess") ],
                output: [ O.some("unable-to-assess"), O.some("unable-to-assess"), O.some("low"), O.some("low"), O.some("high") ]
            },
            {
                desc: "5",
                input:  [ O.some("high"), O.none ],
                output: [ O.none, O.some("high") ]
            },
            {
                desc: "6",
                input:  [ O.none, O.some("high"), O.some("unable-to-assess"), O.some("low"), O.none, O.some("low"), O.some("unable-to-assess"), O.none ],
                output: [ O.none, O.none, O.none, O.some("unable-to-assess"), O.some("unable-to-assess"), O.some("low"), O.some("low"), O.some("high") ]
            },
            {
                desc: "7",
                input:  [ O.some("high"), O.some("foo") ],
                output: [ O.some("foo"), O.some("high") ]
            },
            {
                desc: "8",
                input:  [ O.none, O.some("high"), O.some("unable-to-assess"), O.some("foo"), O.some("low"), O.none, O.some("low"), O.some("unable-to-assess"), O.none, O.some("foo") ],
                output: [ O.none, O.none, O.none, O.some("foo"), O.some("foo"), O.some("unable-to-assess"), O.some("unable-to-assess"), O.some("low"), O.some("low"), O.some("high") ]
            }
        ];

        for (const c of CASES) {
            it(c.desc, () => {
                expect(A.sort(ordCriticality)(c.input)).to.eql(c.output);
            });
        }

        it("reverse test", () => {
            const input =  [ O.none, O.some("high"), O.some("unable-to-assess"), O.some("foo"), O.some("low"), O.none, O.some("low"), O.some("unable-to-assess"), O.none, O.some("foo") ];
            const output = [ O.some("high"), O.some("low"), O.some("low"), O.some("unable-to-assess"), O.some("unable-to-assess"), O.some("foo"), O.some("foo"), O.none, O.none, O.none ];

            expect(A.sort(reverse(ordCriticality))(input)).to.eql(output);
        });

        it("multiple issues, check order", async () => {
            const sdk = readOnlyMockedSdk({
                userId: "dummy",
                resources: [
                    {
                        "resourceType": "AllergyIntolerance",
                        "id": "ai-0",
                        "patient": { "display": "you" },
                        "criticality": "high",
                        "recordedDate": "2013-01-01"
                    },
                    {
                        "resourceType": "AllergyIntolerance",
                        "id": "ai-1",
                        "patient": { "display": "you" }
                    },
                    {
                        "resourceType": "AllergyIntolerance",
                        "id": "ai-2",
                        "patient": { "display": "you" },
                        "criticality": "low"
                    },
                    {
                        "resourceType": "AllergyIntolerance",
                        "id": "ai-3",
                        "patient": { "display": "you" },
                        "recordedDate": "2013-01-01",
                        "criticality": "unable-to-assess"
                    },
                    {
                        "resourceType": "AllergyIntolerance",
                        "id": "ai-4",
                        "patient": { "display": "you" },
                        "recordedDate": "2013-01-01",
                        "criticality": "foo"
                    },
                    {
                        "resourceType": "AllergyIntolerance",
                        "id": "ai-5",
                        "patient": { "display": "you" },
                        "recordedDate": "2010-01-01",
                        "criticality": "high"
                    }
                ]
            });

            const [ issues, result ] = await apiReadAllergyIntoleranceList({ sdk });

            if (shouldDump()) {
                consoleLogInspect(issues, 10);
                consoleLogInspect(result.model, 10);
            }

            expect(result.model.allergyIntolerances).to.have.length(6);

            expect(result.model.allergyIntolerances[0].allergyIntoleranceId).to.equal("ai-0");
            expect(result.model.allergyIntolerances[1].allergyIntoleranceId).to.equal("ai-5");
            expect(result.model.allergyIntolerances[2].allergyIntoleranceId).to.equal("ai-2");
            expect(result.model.allergyIntolerances[3].allergyIntoleranceId).to.equal("ai-3");
            expect(result.model.allergyIntolerances[4].allergyIntoleranceId).to.equal("ai-4");
            expect(result.model.allergyIntolerances[5].allergyIntoleranceId).to.equal("ai-1");
        });

    });

});
