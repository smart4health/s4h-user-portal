/* eslint-disable max-nested-callbacks */
import { assertEitherRight, consoleLogInspect, shouldDump } from "../../utils";

import { FHIR_MedicationStatement_T, FHIR_Medication_T } from "../../../src/fhir-resources/medications/medication-statement";


describe("MedicationStatement suite", () => {

    describe("decode", () => {

        it("example 1", () => {

            const value = FHIR_MedicationStatement_T.decode({
                "resourceType": "MedicationStatement",
                "id": "mii-de-med-statement-example-1",
                "meta": {
                    "profile": [
                        "http://fhir.smart4health.eu/StructureDefinition/s4h-medicationstatement"
                    ]
                },
                "dosage": [{
                    "doseAndRate": [{
                        "doseRange": {
                            "high": {
                                "code": "mg",
                                "system": "http://unitsofmeasure.org",
                                "unit": "milligram",
                                "value": 2600.0
                            },
                            "low": {
                                "code": "mg",
                                "system": "http://unitsofmeasure.org",
                                "unit": "milligram",
                                "value": 2400.0
                            }
                        }
                    }],
                    "route": {
                        "coding": [{
                            "code": "20045000",
                            "display": "Intravenous use",
                            "system": "http://standardterms.edqm.eu"
                        }]
                    },
                    "text": "Parenterale Applikation von 2.400 mg bis unter 2.600 mg Thiotepa"
                }],
                "effectiveDateTime": "2018-05-26",
                "medicationReference": {
                    "reference": "Medication/mii-de-medication-example-5"
                },
                "status": "completed",
                "subject": {
                    "display": "Marie Lux-Brennard"
                }
            });

            if (shouldDump()) {
                consoleLogInspect(value);
            }

            assertEitherRight(value);
            // assertEitherRightValueDeep(value, { valueInteger: 1234, _valueTag: "valueInteger" });
        });

    });

});

describe("Medication suite", () => {

    describe("decode", () => {

        it("example 1", async () => {

            const value = FHIR_Medication_T.decode({
                "resourceType": "Medication",
                "id": "ips-medication-example",
                "meta": {
                    "profile": [ "http://hl7.org/fhir/uv/ips/StructureDefinition/Medication-uv-ips" ]
                },
                "text": {
                    "status": "generated",
                    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n\t\t\t<p>Simvastatin 40 MG Disintegrating Oral Tablet</p>\n\t\t</div>"
                },
                "code": {
                    "coding": [{
                            "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                            "code": "757704",
                            "display": "Simvastatin 40 MG Disintegrating Oral Tablet"
                        },
                        {
                            "system": "http://www.whocc.no/atc",
                            "code": "C10AA01",
                            "display": "simvastatin"
                        }
                    ],
                    "text": "Fluspiral 50 mcg"
                },
                "form": {
                    "coding": [{
                            "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                            "code": "1294713",
                            "display": "Disintegrating Oral Product"
                        },
                        {
                            "system": "http://standardterms.edqm.eu",
                            "code": "10219000",
                            "display": "Tablet"
                        }
                    ]
                },
                "ingredient": [{
                    "itemCodeableConcept": {
                        "coding": [{
                            "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                            "code": "36567",
                            "display": "Simvastatin"
                        }]
                    },
                    "strength": {
                        "numerator": {
                            "value": 40,
                            "unit": "mcg",
                            "system": "http://unitsofmeasure.org",
                            "code": "mg"
                        },
                        "denominator": {
                            "value": 1,
                            "unit": "tablet",
                            "system": "http://unitsofmeasure.org",
                            "code": "{tablet}"
                        }
                    }
                }]
            });

            if (shouldDump()) {
                consoleLogInspect(value);
            }

            assertEitherRight(value);
        });

    });

});
