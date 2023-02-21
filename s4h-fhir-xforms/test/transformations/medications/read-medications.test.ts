/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import { readOnlyMockedRecordsSdk, readOnlyMockedSdk } from "../../../src/utils/sdk-mocks";
import { apiReadMedicationList } from "../../../src/transformations/medications/public-api";

import { consoleLogInspect, hasErrors, shouldDot, shouldDump, writeGraph } from "../../utils";


describe("public API: medications", () => {

    it("empty account", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: []
        });

        const [ issues, result ] = await apiReadMedicationList({ sdk });

        expect(result.model).to.eql({
            modelType: "MedicationList/1",
            medicationStatements: []
        });

        expect(hasErrors(issues)).to.be.false;
    });

    it("one MedicationStatement and one Medication", async () => {
        const sdk = readOnlyMockedRecordsSdk({
            userId: "dummy",
            records: [{
                id: "medplan-plus-de-med-statement-example-1",
                fhirResource: {
                    "resourceType": "MedicationStatement",
                    "id": "medplan-plus-de-med-statement-example-1",
                    "meta": {
                        "profile": [
                            "http://fhir.smart4health.eu/StructureDefinition/s4h-medicationstatement"
                        ]
                    },
                    "status": "active",
                    "medicationReference": {
                        "identifier": {
                            "system": "http://fhir.smart4health.eu/CodeSystem/medication-id",
                            "value":  "medplan-plus-de-medication-example-1"
                        }
                    },
                    "subject": {
                        "display": "Marie Lux-Brennard"
                    },
                    "effectivePeriod": {
                        "start": "2017-08-08"
                    },
                    "reasonCode": [{
                        "text": "Aua!"
                    }],
                    "dosage": [{
                        "timing": {
                            "code": {
                                "coding": [{
                                    "system": "http://terminology.hl7.org/CodeSystem/v3-TimingEvent",
                                    "code": "CV"
                                }]
                            }
                        },
                        "site": {
                            "coding": [{
                                "system": "http://snomed.info/sct",
                                "code": "1910005",
                                "display": "Ear"
                            }]
                        },
                        "method": {
                            "coding": [{
                                "system": "http://snomed.info/sct",
                                "code": "419652001",
                                "display": "Take"
                            }]
                        },
                        "doseAndRate": [{
                            "doseQuantity": {
                                "value": 1,
                                "system": "http://fhir.de/CodeSystem/kbv/s-bmp-dosiereinheit",
                                "code": "1"
                            }
                        }],
                        "route": {
                            "coding": [
                            {
                                "system": "http://standardterms.edqm.eu",
                                "code": "20053000"
                            }
                            ]
                        }
                    }]
                } as unknown,
                customCreationDate: new Date("2000-01-01T12:00:00Z"),
                updatedDate: new Date("2021-08-25T12:34:56Z")
            },
            {
                id: "ips-medication-example",
                fhirResource: {
                    "resourceType": "Medication",
                    "id": "ips-medication-example",
                    "meta": {
                        "profile": [ "http://hl7.org/fhir/uv/ips/StructureDefinition/Medication-uv-ips" ]
                    },
                    "identifier": [{
                        "system": "http://fhir.smart4health.eu/CodeSystem/medication-id",
                        "value":  "medplan-plus-de-medication-example-1"
                    }],
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
                                "code": "10219000"
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
                } as unknown,
                updatedDate: new Date("2021-08-20T16:56:56Z")
            }]
        });

        const [ issues, result ] = await apiReadMedicationList({ sdk });

        if (result.dot && shouldDot()) {
            await writeGraph(result.dot, "medications-1.pdf");
        }

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result, 10);
        }

        expect(result.model).to.eql({
            modelType: "MedicationList/1",
            medicationStatements: [{
                medicationStatementId: "medplan-plus-de-med-statement-example-1",
                medicationId: "ips-medication-example",

                medicationIdentifier: [{
                    system: "http://fhir.smart4health.eu/CodeSystem/medication-id",
                    value:  "medplan-plus-de-medication-example-1"
                }],

                medicationStatementIdentifier: undefined,

                period: {
                    min: 1502150400000, // millisecond epoch
                    max: Infinity
                },
                code: {
                    codeableConcept: {
                        coding: [
                            { system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "757704", display: "Simvastatin 40 MG Disintegrating Oral Tablet" },
                            { system: "http://www.whocc.no/atc", code: "C10AA01", display: "simvastatin" }
                        ],
                        text: "Fluspiral 50 mcg"
                    },
                    resolvedText: "Fluspiral 50 mcg"
                },
                form: {
                    codeableConcept: {
                        coding: [{
                                system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                                code: "1294713",
                                display: "Disintegrating Oral Product"
                            },
                            {
                                system: "http://standardterms.edqm.eu",
                                code: "10219000"
                            }
                        ]
                    },
                    resolvedText: "Tablet"
                },
                ingredients: [{
                    ingredient: {
                        codeableConcept: {
                            coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "36567", display: "Simvastatin" }]
                        },
                        resolvedText: "Simvastatin"
                    },
                    strength: "40 mcg/1 tablet"
                }],
                dosages: [{
                    text: undefined,
                    timing: {
                        code: {
                            codeableConcept: {
                                coding: [{
                                    system: "http://terminology.hl7.org/CodeSystem/v3-TimingEvent",
                                    code: "CV"
                                }]
                            },
                            resolvedText: "dinner"
                        },
                        repeat: undefined
                    },
                    route: {
                        codeableConcept: {
                            coding: [{
                                  system: "http://standardterms.edqm.eu",
                                  code: "20053000"
                            }]
                        },
                        resolvedText: "Oral use"
                    },
                    site: {
                        codeableConcept: {
                            coding: [{
                                system: "http://snomed.info/sct",
                                code: "1910005",
                                display: "Ear"
                            }]
                        },
                        resolvedText: "Ear"
                    },
                    method: {
                        codeableConcept: {
                            coding: [{
                                system: "http://snomed.info/sct",
                                code: "419652001",
                                display: "Take"
                            }]
                        },
                        resolvedText: "Take"
                    },
                    doseAndRate: [{
                        doseQuantity: {
                            value: 1,
                            unit: {
                                codeableConcept: {
                                    coding: [{
                                        system: "http://fhir.de/CodeSystem/kbv/s-bmp-dosiereinheit",
                                        code: "1",
                                        display: undefined
                                    }]
                                },
                                resolvedText: undefined
                            }
                        }
                    }]
                }]
            }]
        });

        expect(result.lastCreated).to.eql(946728000000);
        expect(result.lastUpdated).to.eql(1629894896000);
    });

    it("two MedicationStatements and two Medications", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [
                {
                    "resourceType": "MedicationStatement",
                    "id": "zib-nl-med-statement-example-1",
                    "meta": {
                        "profile": [
                            "http://fhir.smart4health.eu/StructureDefinition/s4h-medicationstatement"
                        ]
                    },
                    "identifier": [{
                        "system": "urn:oid:2.16.840.1.113883.2.4.3.11.999.77.6.1",
                        "value": "#MB_01i1#GE_01"
                    }],
                    "status": "active",
                    "category": {
                        "coding": [{
                            "system": "urn:oid:2.16.840.1.113883.2.4.3.11.60.20.77.5.3",
                            "code": "6",
                            "display": "Medicatiegebruik"
                        }],
                        "text": "Medicatiegebruik"
                    },
                    "medicationReference": {
                        "display": "PARACETAMOL TABLET 500MG",
                        "identifier": {
                            "system": "http://fhir.smart4health.eu/CodeSystem/medication-id",
                            "value":  "zib-nl-medication-example-2"
                            }
                    },
                    "effectivePeriod": {
                        "start": "2020-07-21",
                        "end": "2020-08-20"
                    },
                    "dateAsserted": "2020-07-21",
                    "subject": {
                        "display": "Marie Lux-Brennard"
                    },
                    "derivedFrom": [{
                        "identifier": {
                            "system": "urn:oid:2.16.840.1.113883.2.4.3.11.999.77.16076005.1",
                            "value": "#MB_01i1#MA_01"
                        },
                        "display": "relatie naar medicatieafspraak"
                    }],
                    "dosage": [{
                        "sequence": 1,
                        "text": "Vanaf 21 jul 2020, gedurende 30 dagen, zo nodig maal per dag 1 à 2 stuks , maximaal 6 stuks per dag, ORAAL",
                        "timing": {
                            "repeat": {
                                "frequencyMax": 4,
                                "period": 1,
                                "periodUnit": "d",
                                "when": [
                                    "MORN", "PC", "FOO"
                                ]
                            }
                        },
                        "asNeededCodeableConcept": {
                            "coding": [{
                                "system": "https://referentiemodel.nhg.org/tabellen/nhg-tabel-25-gebruiksvoorschrift#aanvullend-numeriek",
                                "code": "1137",
                                "display": "zo nodig"
                            }]
                        },
                        "route": {
                            "coding": [{
                                "system": "urn:oid:2.16.840.1.113883.2.4.4.9",
                                "code": "9",
                                "display": "ORAAL"
                            }]
                        },
                        "doseAndRate": [{
                            "doseRange": {
                                "low": {
                                    "value": 1,
                                    "unit": "Stuk",
                                    "system": "urn:oid:2.16.840.1.113883.2.4.4.1.900.2",
                                    "code": "245"
                                },
                                "high": {
                                    "value": 2,
                                    "unit": "Stuk",
                                    "system": "urn:oid:2.16.840.1.113883.2.4.4.1.900.2",
                                    "code": "245"
                                }
                            }
                        }],
                        "maxDosePerPeriod": {
                            "numerator": {
                                "value": 6,
                                "unit": "Stuk",
                                "system": "urn:oid:2.16.840.1.113883.2.4.4.1.900.2",
                                "code": "245"
                            },
                            "denominator": {
                                "value": 1,
                                "unit": "dag",
                                "system": "http://unitsofmeasure.org",
                                "code": "d"
                            }
                        }
                    }]
                },
                {
                    "resourceType": "Medication",
                    "id": "zib-nl-medication-example-2",
                    "meta": {
                        "profile": [ "http://hl7.org/fhir/uv/ips/StructureDefinition/Medication-uv-ips" ]
                    },
                    "identifier": [{
                        "system": "http://fhir.smart4health.eu/CodeSystem/medication-id",
                        "value":  "zib-nl-medication-example-2"
                    }],
                    "text": {
                        "status": "extensions",
                        "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table><tbody><tr><th>Code</th><td><span title=\"PARACETAMOL TABLET 500MG (67903 - G-Standaard PRK)\">PARACETAMOL TABLET 500MG</span></td></tr></tbody></table></div>"
                    },
                    "code": {
                        "coding": [{
                                "system": "urn:oid:2.16.840.1.113883.2.4.4.10",
                                "code": "67903",
                                "display": "PARACETAMOL TABLET 500MG",
                                "userSelected": true
                            },
                            {
                                "system": "urn:oid:2.16.840.1.113883.2.4.4.1",
                                "code": "2194",
                                "display": "PARACETAMOL TABLET 500MG"
                            }
                        ],
                        "text": "PARACETAMOL TABLET 500MG"
                    }
                },
                ///
                {
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
                        "identifier": {
                            "system": "http://fhir.smart4health.eu/CodeSystem/medication-id",
                            "value":  "mii-de-medication-example-4"
                        }
                    },
                    "status": "completed",
                    "subject": {
                        "display": "Marie Lux-Brennard"
                    }
                },
                {
                    "resourceType": "Medication",
                    "id": "mii-de-medication-example-4",
                    "meta": {
                        "profile": [ "http://hl7.org/fhir/uv/ips/StructureDefinition/Medication-uv-ips" ]
                    },
                    "identifier": [{
                        "system": "http://fhir.smart4health.eu/CodeSystem/medication-id",
                        "value":  "mii-de-medication-example-4"
                    }],
                    "code": {
                        "coding": [{
                                "code": "03705422",
                                "display": "Glucose 5% B.braun Ecoflac Plus",
                                "system": "http://fhir.de/CodeSystem/ifa/pzn"
                            },
                            {
                                "code": "V06DC01",
                                "display": "Glucose",
                                "system": "http://fhir.de/CodeSystem/dimdi/atc"
                            },
                            {
                                "code": "V06DC01",
                                "display": "glucose",
                                "system": "http://www.whocc.no/atc"
                            }
                        ]
                    },
                    "form": {
                        "coding": [{
                            "code": "11210000",
                            "display": "Solution for infusion",
                            "system": "http://standardterms.edqm.eu"
                        }]
                    },
                    "ingredient": [{
                            "isActive": true,
                            "itemCodeableConcept": {
                                "coding": [{
                                        "code": "12829",
                                        "display": "Glucose",
                                        "system": "http://fhir.de/CodeSystem/ask"
                                    },
                                    {
                                        "code": "50-99-7",
                                        "display": "Glucose",
                                        "system": "urn:oid:2.16.840.1.113883.6.61"
                                    },
                                    {
                                        "code": "5SL0G7R0OK",
                                        "display": "ANHYDROUS DEXTROSE",
                                        "system": "http://fdasis.nlm.nih.gov"
                                    },
                                    {
                                        "code": "67079006",
                                        "display": "Glucose (substance)",
                                        "system": "http://snomed.info/sct"
                                    }
                                ]
                            },
                            "strength": {
                                "denominator": {
                                    "code": "ml",
                                    "system": "http://unitsofmeasure.org",
                                    "unit": "ml",
                                    "value": 1000
                                },
                                "numerator": {
                                    "code": "g",
                                    "system": "http://unitsofmeasure.org",
                                    "unit": "g",
                                    "value": 50
                                }
                            }
                        },
                        {
                            "isActive": false,
                            "itemCodeableConcept": {
                                "coding": [{
                                        "code": "00343",
                                        "display": "Wasser für Injektionszwecke",
                                        "system": "http://fhir.de/CodeSystem/ask"
                                    },
                                    {
                                        "code": "7732-18-5",
                                        "display": "WATER",
                                        "system": "urn:oid:2.16.840.1.113883.6.61"
                                    },
                                    {
                                        "code": "059QF0KO0R",
                                        "display": "WATER",
                                        "system": "http://fdasis.nlm.nih.gov"
                                    },
                                    {
                                        "code": "11713004",
                                        "display": "Water (substance)",
                                        "system": "http://snomed.info/sct"
                                    }
                                ]
                            }
                        }
                    ],
                    "status": "active"
                }
            ]
        });

        const [ issues, result ] = await apiReadMedicationList({ sdk });

        if (result.dot && shouldDot()) {
            await writeGraph(result.dot, "medications-2.pdf");
        }

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result.model, 10);
        }

        expect(result.model.medicationStatements).to.have.length(2);

        expect(result.model.medicationStatements[0]).to.eql({
            medicationStatementId: "zib-nl-med-statement-example-1",
            medicationStatementIdentifier: [{
                system: "urn:oid:2.16.840.1.113883.2.4.3.11.999.77.6.1",
                value: "#MB_01i1#GE_01"
            }],

            medicationId: "zib-nl-medication-example-2",
            medicationIdentifier: [{
                system: "http://fhir.smart4health.eu/CodeSystem/medication-id",
                value:  "zib-nl-medication-example-2"
            }],

            period: {
                min: 1595289600000, // millisecond epoch
                max: 1597967999999
            },
            code: {
                codeableConcept: {
                    coding: [{
                            system: "urn:oid:2.16.840.1.113883.2.4.4.10",
                            code: "67903",
                            display: "PARACETAMOL TABLET 500MG",
                            userSelected: true
                        },
                        {
                            system: "urn:oid:2.16.840.1.113883.2.4.4.1",
                            code: "2194",
                            display: "PARACETAMOL TABLET 500MG"
                        }
                    ],
                    text: "PARACETAMOL TABLET 500MG"
                },
                resolvedText: "PARACETAMOL TABLET 500MG"
            },
            form: undefined,
            ingredients: [], // no ingredients specified
            dosages: [{
                text: "Vanaf 21 jul 2020, gedurende 30 dagen, zo nodig maal per dag 1 à 2 stuks , maximaal 6 stuks per dag, ORAAL",
                timing: {
                    code: undefined,
                    repeat: {
                        // frequencyMax: 4,
                        frequency: undefined,
                        period: 1,
                        periodUnit: {
                            codeableConcept: {
                                coding: [{
                                    system: "http://unitsofmeasure.org",
                                    code: "d",
                                    display: "day"
                                }]
                            },
                            resolvedText: "day"
                        },
                        when: [{
                            codeableConcept: {
                                coding: [{
                                    system: "http://hl7.org/fhir/event-timing",
                                    code: "MORN",
                                    display: "morning"
                                }]
                            },
                            resolvedText: "morning"
                        }, {
                            codeableConcept: {
                                coding: [{
                                    system: "http://terminology.hl7.org/CodeSystem/v3-TimingEvent",
                                    code: "PC",
                                    display: "after meal"
                                }]
                            },
                            resolvedText: "after meal"
                        }, {
                            codeableConcept: {
                                coding: [{
                                    code: "FOO"
                                }]
                            },
                            resolvedText: "FOO"
                        }]
                    }
                },
                route: {
                    codeableConcept: {
                        coding: [{
                            system: "urn:oid:2.16.840.1.113883.2.4.4.9",
                            code: "9",
                            display: "ORAAL"
                        }]
                    },
                    resolvedText: "ORAAL"
                },
                site: undefined,
                method: undefined,
                doseAndRate: [{
                    doseRange: {
                        low: {
                            value: 1,
                            unit: {
                                codeableConcept: {
                                    coding: [{
                                        display: "Stuk",
                                        system: "urn:oid:2.16.840.1.113883.2.4.4.1.900.2",
                                        code: "245"
                                    }]
                                },
                                resolvedText: "Stuk"
                            }
                        },
                        high: {
                            value: 2,
                            unit: {
                                codeableConcept: {
                                    coding: [{
                                        display: "Stuk",
                                        system: "urn:oid:2.16.840.1.113883.2.4.4.1.900.2",
                                        code: "245"
                                    }]
                                },
                                resolvedText: "Stuk"
                            }
                        }
                    }
                }]
            }]
        });

        expect(result.model.medicationStatements[1]).to.eql({
            medicationStatementId: "mii-de-med-statement-example-1",
            medicationStatementIdentifier: undefined,

            medicationId: "mii-de-medication-example-4",
            medicationIdentifier: [{
                system: "http://fhir.smart4health.eu/CodeSystem/medication-id",
                value:  "mii-de-medication-example-4"
            }],

            period: {
                min: 1527292800000, // millisecond epoch
                max: 1527379199999
            },
            code: {
                codeableConcept: {
                    "coding": [{
                            "code": "03705422",
                            "display": "Glucose 5% B.braun Ecoflac Plus",
                            "system": "http://fhir.de/CodeSystem/ifa/pzn"
                        },
                        {
                            "code": "V06DC01",
                            "display": "Glucose",
                            "system": "http://fhir.de/CodeSystem/dimdi/atc"
                        },
                        {
                            "code": "V06DC01",
                            "display": "glucose",
                            "system": "http://www.whocc.no/atc"
                        }
                    ]
                },
                resolvedText: "Glucose 5% B.braun Ecoflac Plus"
            },
            form: {
                codeableConcept: {
                    "coding": [{
                        "code": "11210000",
                        "display": "Solution for infusion",
                        "system": "http://standardterms.edqm.eu"
                    }]
                },
                resolvedText: "Solution for infusion"
            },
            ingredients: [{
                ingredient: {
                    codeableConcept: {
                        "coding": [{
                                "code": "12829",
                                "display": "Glucose",
                                "system": "http://fhir.de/CodeSystem/ask"
                            },
                            {
                                "code": "50-99-7",
                                "display": "Glucose",
                                "system": "urn:oid:2.16.840.1.113883.6.61"
                            },
                            {
                                "code": "5SL0G7R0OK",
                                "display": "ANHYDROUS DEXTROSE",
                                "system": "http://fdasis.nlm.nih.gov"
                            },
                            {
                                "code": "67079006",
                                "display": "Glucose (substance)",
                                "system": "http://snomed.info/sct"
                            }
                        ]
                    },
                    resolvedText: "Glucose"
                },
                strength: "50 g/1000 ml"
            }, {
                ingredient: {
                    codeableConcept: {
                        "coding": [{
                                "code": "00343",
                                "display": "Wasser für Injektionszwecke",
                                "system": "http://fhir.de/CodeSystem/ask"
                            },
                            {
                                "code": "7732-18-5",
                                "display": "WATER",
                                "system": "urn:oid:2.16.840.1.113883.6.61"
                            },
                            {
                                "code": "059QF0KO0R",
                                "display": "WATER",
                                "system": "http://fdasis.nlm.nih.gov"
                            },
                            {
                                "code": "11713004",
                                "display": "Water (substance)",
                                "system": "http://snomed.info/sct"
                            }
                        ]
                    },
                    resolvedText: "Wasser für Injektionszwecke"
                },
                strength: undefined
            }],
            dosages: [{
                text: "Parenterale Applikation von 2.400 mg bis unter 2.600 mg Thiotepa",
                timing: undefined,
                route: {
                    codeableConcept: {
                        coding: [{
                            code: "20045000",
                            display: "Intravenous use",
                            system: "http://standardterms.edqm.eu"
                        }]
                    },
                    resolvedText: "Intravenous use"
                },
                site: undefined,
                method: undefined,
                doseAndRate: [{
                    doseRange: {
                        high: {
                            value: 2600.0,
                            unit: {
                                codeableConcept: {
                                    coding: [{
                                        code: "mg",
                                        system: "http://unitsofmeasure.org",
                                        display: "milligram"
                                    }]
                                },
                                resolvedText: "milligram"
                            }
                        }
                    }
                }]
            }]
        });

    });

    it("ordering of statements", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [
                {
                    resourceType: "MedicationStatement", status: "active", subject: { display: "Henry Jones" },
                    id: "A",
                    medicationReference: { identifier: { system: "http://fhir.smart4health.eu/CodeSystem/medication-id", value:  "med-A" } },
                    effectivePeriod: {
                        start: "2020-01-01"
                    }
                },
                {
                    resourceType: "Medication",
                    id: "id-med-A",
                    identifier: [{ system: "http://fhir.smart4health.eu/CodeSystem/medication-id", value:  "med-A" }],
                    code: { text: "Red pill and Blue pill" }
                },

                {
                    resourceType: "MedicationStatement", status: "active", subject: { display: "Henry Jones" },
                    id: "B",
                    medicationReference: { identifier: { system: "http://fhir.smart4health.eu/CodeSystem/medication-id", value:  "med-B" } },
                    effectivePeriod: {
                        start: "2020-01-01"
                    }
                },
                {
                    resourceType: "Medication",
                    id: "id-med-B",
                    identifier: [{ system: "http://fhir.smart4health.eu/CodeSystem/medication-id", value:  "med-B" }],
                    code: { text: "ASS Akut" }
                },

                {
                    resourceType: "MedicationStatement", status: "active", subject: { display: "Henry Jones" },
                    id: "C",
                    medicationReference: { identifier: { system: "http://fhir.smart4health.eu/CodeSystem/medication-id", value:  "med-C" } },
                    effectivePeriod: {
                        start: "2000-06-01",
                        end:   "2000-11-30"
                    }
                },
                {
                    resourceType: "Medication",
                    id: "id-med-C",
                    identifier: [{ system: "http://fhir.smart4health.eu/CodeSystem/medication-id", value:  "med-C" }],
                    code: { text: "ASS Akut" }
                }

            ]
        });

        const [ issues, result ] = await apiReadMedicationList({ sdk });

        if (result.dot && shouldDot()) {
            await writeGraph(result.dot, "medications-order.pdf");
        }

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result.model, 10);
        }

        expect(result.model.medicationStatements).to.have.length(3);

        expect(result.model.medicationStatements[0]).to.eql({
            ingredients: [],
            dosages: [],
            medicationStatementId: "B",
            medicationId: "id-med-B",
            medicationStatementIdentifier: undefined,
            medicationIdentifier: [{ system: "http://fhir.smart4health.eu/CodeSystem/medication-id", value:  "med-B" }],
            period: {
                min:  1577836800000,
                max: +Infinity
            },
            code: { codeableConcept: { text: "ASS Akut" }, resolvedText: "ASS Akut" },
            form: undefined
        });

        expect(result.model.medicationStatements[1]).to.eql({
            ingredients: [],
            dosages: [],
            medicationStatementId: "A",
            medicationId: "id-med-A",
            medicationStatementIdentifier: undefined,
            medicationIdentifier: [{ system: "http://fhir.smart4health.eu/CodeSystem/medication-id", value:  "med-A" }],
            period: {
                min:  1577836800000,
                max: +Infinity
            },
            code: { codeableConcept: { text: "Red pill and Blue pill" }, resolvedText: "Red pill and Blue pill" },
            form: undefined
        });

        expect(result.model.medicationStatements[2]).to.eql({
            ingredients: [],
            dosages: [],
            medicationStatementId: "C",
            medicationId: "id-med-C",
            medicationStatementIdentifier: undefined,
            medicationIdentifier: [{ system: "http://fhir.smart4health.eu/CodeSystem/medication-id", value:  "med-C" }],
            period: {
                min: 959817600000,
                max: 975628799999
            },
            code: { codeableConcept: { text: "ASS Akut" }, resolvedText: "ASS Akut" },
            form: undefined
        });

    });

    it("one MedicationStatement w/ coded medication", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [{
                "resourceType": "MedicationStatement",
                "id": "medplan-plus-de-med-statement-example-1",
                "meta": {
                    "profile": [
                        "http://fhir.smart4health.eu/StructureDefinition/s4h-medicationstatement"
                    ]
                },
                "status": "active",
                "medicationCodeableConcept": {
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
                "subject": {
                    "display": "Marie Lux-Brennard"
                },
                "effectivePeriod": {
                    "start": "2017-08-08"
                },
                "reasonCode": [{
                    "text": "Aua!"
                }],
                "dosage": [{
                    "timing": {
                        "code": {
                            "coding": [{
                                "system": "http://terminology.hl7.org/CodeSystem/v3-TimingEvent",
                                "code": "CV"
                            }]
                        }
                    },
                    "site": {
                        "coding": [{
                            "system": "http://snomed.info/sct",
                            "code": "1910005",
                            "display": "Ear"
                        }]
                    },
                    "method": {
                        "coding": [{
                            "system": "http://snomed.info/sct",
                            "code": "419652001",
                            "display": "Take"
                        }]
                    },
                    "doseAndRate": [{
                        "doseQuantity": {
                            "value": 1,
                            "system": "http://fhir.de/CodeSystem/kbv/s-bmp-dosiereinheit",
                            "code": "1"
                        }
                    }]
                }]
            }]
        });

        const [ issues, result ] = await apiReadMedicationList({ sdk });

        if (result.dot && shouldDot()) {
            await writeGraph(result.dot, "medications-1.pdf");
        }

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result.model, 10);
        }

        expect(result.model).to.eql({
            modelType: "MedicationList/1",
            medicationStatements: [{
                medicationStatementId: "medplan-plus-de-med-statement-example-1",
                medicationId: undefined,
                medicationStatementIdentifier: undefined,
                medicationIdentifier: undefined,
                period: {
                    min: 1502150400000, // millisecond epoch
                    max: Infinity
                },
                code: {
                    codeableConcept: {
                        coding: [
                            { system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "757704", display: "Simvastatin 40 MG Disintegrating Oral Tablet" },
                            { system: "http://www.whocc.no/atc", code: "C10AA01", display: "simvastatin" }
                        ],
                        text: "Fluspiral 50 mcg"
                    },
                    resolvedText: "Fluspiral 50 mcg"
                },
                form: undefined,
                ingredients: [],
                dosages: [{
                    text: undefined,
                    timing: {
                        code: {
                            codeableConcept: {
                                coding: [{
                                    system: "http://terminology.hl7.org/CodeSystem/v3-TimingEvent",
                                    code: "CV"
                                }]
                            },
                            resolvedText: "dinner"
                        },
                        repeat: undefined
                    },
                    route: undefined,
                    site: {
                        codeableConcept: {
                            coding: [{
                                system: "http://snomed.info/sct",
                                code: "1910005",
                                display: "Ear"
                            }]
                        },
                        resolvedText: "Ear"
                    },
                    method: {
                        codeableConcept: {
                            coding: [{
                                system: "http://snomed.info/sct",
                                code: "419652001",
                                display: "Take"
                            }]
                        },
                        resolvedText: "Take"
                    },
                    doseAndRate: [{
                        doseQuantity: {
                            value: 1,
                            unit: {
                                codeableConcept: {
                                    coding: [{
                                        system: "http://fhir.de/CodeSystem/kbv/s-bmp-dosiereinheit",
                                        code: "1",
                                        display: undefined
                                    }]
                                },
                                resolvedText: undefined
                            }
                        }
                    }]
                }]
            }]
        });
    });

});
