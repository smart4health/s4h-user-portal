/* eslint-disable max-nested-callbacks */
import { PathReporter } from "io-ts/PathReporter";

import { FHIR_Patient_T } from "../../../src/fhir-resources/individuals/patient";
import { assertEitherRight, consoleLogInspect, shouldDump } from "../../utils";


describe("Patient suite", () => {

    it("Marie Lux-Brennard", () => {
        const marieRaw = {
            "resourceType": "Patient",
            "id": "s4h-patient-example",
            "meta": {
                "profile":  [
                    "http://fhir.smart4health.eu/StructureDefinition/s4h-patient"
                ]
            },
            "name":  [
                {
                    "text": "Marie Lux-Brennard",
                    "family": "Lux-Brennard",
                    "given":  [
                        "Marie"
                    ]
                }
            ],
            "telecom":  [
                {
                    "system": "phone",
                    "value": "123-456-789",
                    "use": "home"
                },
                {
                    "system": "email",
                    "value": "malubr@example.com"
                }
            ],
            "gender": "female",
            "birthDate": "1998-04-17",
            "address":  [
                {
                    "use": "home",
                    "line":  [
                        "Beispielstr. 17"
                    ],
                    "city": "Bärstadt",
                    "postalCode": "12345",
                    "country": "Germany"
                }
            ],
            "contact":  [
                {
                    "relationship":  [
                        {
                            "coding":  [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
                                    "code": "N",
                                    "display": "Next-of-Kin"
                                }
                            ]
                        }
                    ],
                    "name": {
                        "text": "Annabel Lux-Brennard",
                        "family": "Lux-Brennard",
                        "given":  [
                            "Annabel"
                        ]
                    },
                    "telecom":  [
                        {
                            "system": "phone",
                            "value": "987-654-321",
                            "use": "home"
                        }
                    ]
                }
            ]
        };

        const marieParsed = FHIR_Patient_T.decode(marieRaw);

        if (shouldDump()) {
            consoleLogInspect(PathReporter.report(marieParsed));
        }

        assertEitherRight(marieParsed);
    });

});
