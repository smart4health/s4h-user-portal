/* eslint-disable max-nested-callbacks */
import { expect } from "chai";
import { consoleLogInspect, hasErrors, shouldDump } from "../../../../utils";

import { readOnlyMockedSdk } from "../../../../../src/utils/sdk-mocks";
import { FHIR_Patient } from "../../../../../src/fhir-resources/individuals/patient";
import { apiReadMedicalHistory } from "../../../../../src/transformations/medical-history/public-api";
import { FHIR_Observation } from "../../../../../src/fhir-resources/diagnostics/observation";


describe("public API: medical history", () => {

    it("empty account", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: []
        });

        const [ issues, model ] = await apiReadMedicalHistory({ sdk });

        expect(model).to.eql({
            modelType: "MedicalHistory/1",
            personalData: undefined
        });

        expect(hasErrors(issues)).to.be.false;
    });

    it("Tagged Patient resource only", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [
                {
                    resourceType: "Patient",
                    id: "hjones",
                    meta: {
                        tag: [{
                            system: "http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag",
                            code: "medical-history"
                        }]
                    },
                    name: [{
                        family: "Jones",
                        given: [ "Henry" ]
                     }],
                    gender: "male",
                    birthDate: "1950-05-13"
                } as FHIR_Patient
            ]
        });

        const [ issues, model ] = await apiReadMedicalHistory({ sdk });

        if (shouldDump()) {
            consoleLogInspect(model);
            consoleLogInspect(issues);
        }

        expect(model).to.eql({
            modelType: "MedicalHistory/1",
            personalData: {
                firstName: "Henry",
                lastName: "Jones",
                gender: "male",
                dateOfBirth: "1950-05-13",
                height: undefined,
                weight: undefined,
                occupation: undefined,
                bloodGroup: undefined,
                bloodRhesus: undefined
            },
            inputResourceIds: [ "hjones" ],
            inputResourceIdentifiers: []
        });

        expect(hasErrors(issues)).to.be.false;
    });

    it("Tagged and untagged Patient resources", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [
                {
                    resourceType: "Patient",
                    id: "hjones-0",
                    identifier: [{
                        system: "foo",
                        value: "bar"
                    }],
                    meta: {
                        tag: [{
                            system: "http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag",
                            code: "medical-history"
                        }]
                    },
                    name: [{
                        family: "Jones",
                        given: [ "Henry" ]
                     }],
                    gender: "male",
                    birthDate: "1950-05-13"
                } as FHIR_Patient,
                {
                    resourceType: "Patient",
                    id: "hjones-1",
                    name: [{
                        family: "Jones II",
                        given: [ "Henry, II" ]
                     }],
                    gender: "male",
                    birthDate: "1950-05-14"
                } as FHIR_Patient
            ]
        });

        const [ issues, model ] = await apiReadMedicalHistory({ sdk });

        if (shouldDump()) {
            consoleLogInspect(model);
            consoleLogInspect(issues);
        }

        expect(model).to.eql({
            modelType: "MedicalHistory/1",
            personalData: {
                firstName: "Henry",
                lastName: "Jones",
                gender: "male",
                dateOfBirth: "1950-05-13",
                height: undefined,
                weight: undefined,
                occupation: undefined,
                bloodGroup: undefined,
                bloodRhesus: undefined
            },
            inputResourceIds: [ "hjones-0" ],
            inputResourceIdentifiers: [ [{
                system: "foo",
                value: "bar"
            }] ]
        });

        expect(hasErrors(issues)).to.be.false;
    });

    it("Tagged Patient resource and observation", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [
                {
                    resourceType: "Patient",
                    id: "hjones",
                    identifier: [{
                        system: "foo",
                        value: "bar"
                    }],
                    meta: {
                        tag: [{
                            system: "http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag",
                            code: "medical-history"
                        }]
                    },
                    name: [{
                        family: "Jones",
                        given: [ "Henry" ]
                     }],
                    gender: "male",
                    birthDate: "1950-05-13"
                } as FHIR_Patient,
                {
                    resourceType: "Observation",
                    id: "weight-0",
                    identifier: [{
                        system: "humpty", value: "dumpty"
                    }, {
                        system: "holy", value: "moly"
                    }],
                    status: "final",
                    subject: {},
                    code: {
                        coding: [{
                            system: "http://loinc.org",
                            code:   "29463-7"
                        }]
                    },
                    effectiveDateTime: "2020-12-12T00:00:00Z",

                    valueQuantity: {
                        value: 70,
                        unit: "kg"
                    }
                } as FHIR_Observation
            ]
        });

        const [ issues, model ] = await apiReadMedicalHistory({ sdk });

        if (shouldDump()) {
            consoleLogInspect(model);
            consoleLogInspect(issues);
        }

        expect(model).to.eql({
            modelType: "MedicalHistory/1",
            personalData: {
                firstName: "Henry",
                lastName: "Jones",
                gender: "male",
                dateOfBirth: "1950-05-13",
                height: undefined,
                weight: {
                    value: 70,
                    unit: "kg"
                },
                occupation: undefined,
                bloodGroup: undefined,
                bloodRhesus: undefined
            },
            inputResourceIds: [ "hjones", "weight-0" ],
            inputResourceIdentifiers: [ [{
                system: "foo",
                value: "bar"
            }], [{
                system: "humpty", value: "dumpty"
            }, {
                system: "holy", value: "moly"
            }] ]
        });

        expect(hasErrors(issues)).to.be.false;
    });

});
