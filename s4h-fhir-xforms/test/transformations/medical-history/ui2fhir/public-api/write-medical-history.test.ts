/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import { consoleLogInspect, hasErrors, shouldDump } from "../../../../utils";
import { readOnlyMockedSdk, simpleMockedSdk } from "../../../../../src/utils/sdk-mocks";
import { apiWriteMedicalHistory } from "../../../../../src/transformations/medical-history/public-api";


describe("PersonalData suite", () => {

    it("everything empty", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: []
        });

        const result = await apiWriteMedicalHistory({
            modelType: "MedicalHistory/1"
        }, { sdk, dateTime: new Date() });

        if (shouldDump()) {
            consoleLogInspect(result, 10);
        }

        expect(result[1].personalData).to.be.undefined;
    });


    it("first update after empty account", async () => {
        const sdk = simpleMockedSdk({
            userId: "dummy",
            resources: []
        });

        const result = await apiWriteMedicalHistory({
            "modelType": "MedicalHistory/1",
            "personalData": {
                "firstName": "Henry",
                "lastName": "Jones",
                "gender": "male",
                "dateOfBirth": "1950-07-01",
                "bloodGroup": {
                    "system": "http://loinc.org",
                    "code": "LA19710-5"
                },
                "bloodRhesus": {
                    "system": "http://loinc.org",
                    "code": "LA6576-8"
                },
                "weight": {
                    "value": 80,
                    "unit": "kg"
                },
                "height": {
                    "value": 180,
                    "unit": "cm"
                },
                "occupation": "Adventurer"
            }
        }, { sdk, dateTime: new Date() });

        if (shouldDump()) {
            consoleLogInspect(result, 10);
        }

        expect(result[1].personalData).to.eql({
            "firstName": "Henry",
            "lastName": "Jones",
            "gender": "male",
            "dateOfBirth": "1950-07-01",
            "bloodGroup": {
                "display": "A",
                "system": "http://loinc.org",
                "code": "LA19710-5"
            },
            "bloodRhesus": {
                "display": "Positive",
                "system": "http://loinc.org",
                "code": "LA6576-8"
            },
            "weight": {
                "value": 80,
                "unit": "kg"
            },
            "height": {
                "value": 180,
                "unit": "cm"
            },
            "occupation": "Adventurer"
        });
    });

    it("updates on account with just untagged Patient resources", async () => {
        const sdk = simpleMockedSdk({
            userId: "dummy",
            resources: [{
                "resourceType": "Patient",
                "birthDate": "1950-07-15",
                "gender": "male",
                "id": "hjones-1",
                "name": [{
                    "family": "Jones",
                    "given": [ "Henry" ]
                }]
            }, {
                "resourceType": "Patient",
                "birthDate": "1950-07-15",
                "gender": "male",
                "id": "hjones-2",
                "name": [{
                    "family": "Jones II",
                    "given": [ "Henry II" ]
                }]
            }]
        });

        let result = await apiWriteMedicalHistory({
            "modelType": "MedicalHistory/1",
            "personalData": {
                "firstName": "Henry",
                "lastName": "Jones",
                "gender": "male",
                "dateOfBirth": "1950-07-15",
                "bloodGroup": {
                    "system": "http://loinc.org",
                    "code": "LA19710-5"
                },
                "bloodRhesus": {
                    "system": "http://loinc.org",
                    "code": "LA6576-8"
                },
                "weight": {
                    "value": 80,
                    "unit": "kg"
                },
                "height": {
                    "value": 180,
                    "unit": "cm"
                },
                "occupation": "Adventurer"
            }
        }, { sdk, dateTime: new Date() });

        if (shouldDump()) {
            consoleLogInspect(result, 10);
        }

        expect(result[1].personalData).to.eql({
            "firstName": "Henry",
            "lastName": "Jones",
            "gender": "male",
            "dateOfBirth": "1950-07-15",
            "bloodGroup": {
                "display": "A",
                "system": "http://loinc.org",
                "code": "LA19710-5"
            },
            "bloodRhesus": {
                "display": "Positive",
                "system": "http://loinc.org",
                "code": "LA6576-8"
            },
            "weight": {
                "value": 80,
                "unit": "kg"
            },
            "height": {
                "value": 180,
                "unit": "cm"
            },
            "occupation": "Adventurer"
        });

        result = await apiWriteMedicalHistory({
            "modelType": "MedicalHistory/1",
            "personalData": {
                "firstName": "Henry",
                "lastName": "Jones, II",
                "gender": "male",
                "dateOfBirth": "1950-07-16",
                "bloodGroup": {
                    "system": "http://loinc.org",
                    "code": "LA19710-5"
                },
                "bloodRhesus": {
                    "system": "http://loinc.org",
                    "code": "LA6576-8-invalid"
                },
                "weight": {
                    "value": 90,
                    "unit": "kg"
                },
                "height": {
                    "value": 200,
                    "unit": "cm"
                },
                "occupation": "Adventurer Expert"
            }
        }, { sdk, dateTime: new Date() });

        if (shouldDump()) {
            consoleLogInspect(result, 10);
        }

        expect(result[1].personalData).to.eql({
            "firstName": "Henry",
            "lastName": "Jones, II",
            "gender": "male",
            "dateOfBirth": "1950-07-16",
            "bloodGroup": {
                "display": "A",
                "system": "http://loinc.org",
                "code": "LA19710-5"
            },
            "bloodRhesus": undefined,
            "weight": {
                "value": 90,
                "unit": "kg"
            },
            "height": {
                "value": 200,
                "unit": "cm"
            },
            "occupation": "Adventurer Expert"
        });

        result = await apiWriteMedicalHistory({
            "modelType": "MedicalHistory/1",
            "personalData": {
                "firstName": "Henry",
                "lastName": "Jones, II",
                "gender": "male",
                "dateOfBirth": "1950-07-16",
                "bloodGroup": {
                    "system": "http://loinc.org",
                    "code": "LA19710-5"
                },
                "bloodRhesus": {
                    "display": "I will ignore this text",
                    "system": "http://loinc.org",
                    "code": "LA6577-6"
                },
                "weight": {
                    "value": 90,
                    "unit": "kg"
                },
                "height": {
                    "value": 200,
                    "unit": "cm"
                },
                "occupation": "Adventurer Expert"
            }
        }, { sdk, dateTime: new Date() });

        if (shouldDump()) {
            consoleLogInspect(result, 10);
        }

        expect(result[1].personalData).to.eql({
            "firstName": "Henry",
            "lastName": "Jones, II",
            "gender": "male",
            "dateOfBirth": "1950-07-16",
            "bloodGroup": {
                "display": "A",
                "system": "http://loinc.org",
                "code": "LA19710-5"
            },
            "bloodRhesus": {
                "display": "Negative",
                "system": "http://loinc.org",
                "code": "LA6577-6"
            },
            "weight": {
                "value": 90,
                "unit": "kg"
            },
            "height": {
                "value": 200,
                "unit": "cm"
            },
            "occupation": "Adventurer Expert"
        });

    });

    it("updates on account with multiple tagged Patient resources and one tagged resource", async () => {
        const sdk = simpleMockedSdk({
            userId: "dummy",
            resources: [{
                "resourceType": "Patient",
                "birthDate": "1950-07-15",
                "gender": "male",
                "id": "hjones-1",
                "name": [{
                    "family": "Jones I",
                    "given": [ "Henry I" ]
                }]
            }, {
                "resourceType": "Patient",
                "birthDate": "1950-07-15",
                "gender": "male",
                "id": "hjones-2",
                "name": [{
                    "family": "Jones II",
                    "given": [ "Henry II" ]
                }]
            }, {
                "resourceType": "Patient",
                "birthDate": "1950-07-15",
                "gender": "male",
                "id": "hjones-3",
                "meta": {
                    "tag": [{
                        "system": "http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag",
                        "code": "medical-history"
                    }]
                },
                "name": [{
                    "family": "Jones III",
                    "given": [ "Henry III" ]
                }]
            }]
        });

        const result = await apiWriteMedicalHistory({
            "modelType": "MedicalHistory/1",
            "personalData": {
                "firstName": "Henry",
                "lastName": "Jones",
                "gender": "male",
                "dateOfBirth": "1950-07-10",
                "bloodGroup": {
                    "system": "http://loinc.org",
                    "code": "LA19710-5"
                },
                "bloodRhesus": {
                    "system": "http://loinc.org",
                    "code": "LA6576-8"
                },
                "weight": {
                    "value": 80,
                    "unit": "kg"
                },
                "height": {
                    "value": 180,
                    "unit": "cm"
                },
                "occupation": "Adventurer"
            }
        }, { sdk, dateTime: new Date() });

        if (shouldDump()) {
            consoleLogInspect(result, 10);
        }

        expect(result[1].personalData).to.eql({
            "firstName": "Henry",
            "lastName": "Jones",
            "gender": "male",
            "dateOfBirth": "1950-07-10",
            "bloodGroup": {
                "display": "A",
                "system": "http://loinc.org",
                "code": "LA19710-5"
            },
            "bloodRhesus": {
                "display": "Positive",
                "system": "http://loinc.org",
                "code": "LA6576-8"
            },
            "weight": {
                "value": 80,
                "unit": "kg"
            },
            "height": {
                "value": 180,
                "unit": "cm"
            },
            "occupation": "Adventurer"
        });
    });


    it("all fields required", async () => {
        const sdk = simpleMockedSdk({
            userId: "dummy",
            resources: []
        });

        const result = await apiWriteMedicalHistory({
            modelType: "MedicalHistory/1",
            personalData: {
                "firstName": "Henry",
                "lastName": "Jones",
                "gender": "male",
                "dateOfBirth": "1950-07-01",
                "bloodGroup": {
                    "system": "http://loinc.org",
                    "code": "LA19710-5"
                },
                "bloodRhesus": {
                    "system": "http://loinc.org",
                    "code": "LA6576-8"
                },
                "weight": {
                    "value": 80,
                    "unit": "kg"
                },
                "height": {
                    "value": 180,
                    "unit": "cm"
                }
            }
        }, { sdk, dateTime: new Date() });

        if (shouldDump()) {
            consoleLogInspect(result, 10);
        }

        expect(hasErrors(result[0])).to.be.true;

        expect(result[1]).to.be.undefined;
    });

});
