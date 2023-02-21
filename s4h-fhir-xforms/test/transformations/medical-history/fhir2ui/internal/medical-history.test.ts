/* eslint-disable max-nested-callbacks */
import { assert, expect } from "chai";
import { consoleLogInspect, shouldDump } from "../../../../utils";

import * as E from "fp-ts/Either";

import { FHIR_Patient } from "../../../../../src/fhir-resources/individuals/patient";
import { FHIR_Observation } from "../../../../../src/fhir-resources/diagnostics/observation";
import { fhirToMedicalHistory } from "../../../../../src/transformations/medical-history/fhir2ui";
import { PersonalData_T } from "../../../../../src/transformations/medical-history/defs";


describe("PersonalData suite", () => {

    it("demo usage, error case", async () => {
        try {
            await fhirToMedicalHistory([]);
            assert.fail("should have rejected");

        } catch (issues) {
            if (shouldDump()) {
                consoleLogInspect("# of issues:", issues.length);
                consoleLogInspect(issues);
            }
        }
    });

    it("demo usage, happy case", async () => {
        const patient: FHIR_Patient = {
            resourceType: "Patient",
            meta: {
                tag: [{
                    system: "http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag",
                    code: "medical-history"
                }]
            },
            id: "pat-01",
            name: [{
               given: [ "Henry" ],
               family:  "Jones"
            }],
            gender: "male",
            birthDate: "2000-01-02"
        };

        const bodyWeight0: FHIR_Observation = {
            resourceType: "Observation",
            id: "weight-0",
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
        };

        const bodyWeight1: FHIR_Observation = {
            resourceType: "Observation",
            id: "weight-1",
            status: "final",
            subject: {},
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code:   "29463-7"
                }]
            },
            effectiveDateTime: "2019-12-12T00:00:00Z",

            valueQuantity: {
                value: 100,
                unit: "kg"
            }
        };

        const bodyHeight: FHIR_Observation = {
            resourceType: "Observation",
            id: "height-0",
            status: "final",
            subject: {},
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code:   "8302-2"
                }]
            },
            effectiveDateTime: "2020-12-12T00:00:00Z",

            valueQuantity: {
                value: 180,
                unit: "cm"
            }
        };

        const bloodGroup: FHIR_Observation = {
            resourceType: "Observation",
            id: "bloodGroup-1",
            status: "final",
            subject: {},
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code:   "883-9",
                    display: "BAR"
                }]
            },
            effectiveDateTime: "2020-12-12T00:00:00Z",
            valueCodeableConcept: {
                text: "xyz",
                coding: [{
                    system: "http://loinc.org",
                    code: "LA19710-5",
                    display: "FOO"
                }]
            }
        };

        const rhesusFactor: FHIR_Observation = {
            resourceType: "Observation",
            id: "rhesusFactor-1",
            status: "final",
            subject: {},
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code:   "10331-7"
                }]
            },
            effectiveDateTime: "2020-12-12T00:00:00Z",
            valueCodeableConcept: {
                coding: [{
                    system: "http://loinc.org",
                    code: "LA6576-8"
                }]
            }
        };

        const medicalHistory = await fhirToMedicalHistory([
            patient,
            bodyWeight0,
            bodyWeight1,
            bodyHeight,
            bloodGroup,
            rhesusFactor
        ]);

        if (E.isLeft(medicalHistory)) {
            if (shouldDump()) {
                consoleLogInspect(`There were ${medicalHistory.left.length} issue(s).`);
                consoleLogInspect(medicalHistory.left);
            }
            assert.fail("should not have rejected");
        }

        const issues       = medicalHistory.right[0];
        const personalData = PersonalData_T.encode(medicalHistory.right[1].personalData);
        if (shouldDump()) {
            consoleLogInspect(personalData);
            consoleLogInspect(`There were ${issues.length} issue(s).`);
            consoleLogInspect(issues);
        }

        expect(personalData.firstName).to.eql("Henry");
        expect(personalData.lastName).to.eql("Jones");
        expect(personalData.gender).to.eql("male");
        expect(personalData.dateOfBirth).to.eql("2000-01-02");
        expect(personalData.height).to.eql({ value: 180, unit: "cm" });
        expect(personalData.weight).to.eql({ value:  70, unit: "kg" });
        expect(personalData.bloodGroup).to.eql({ display: "A", system: "http://loinc.org", code: "LA19710-5" });
        expect(personalData.bloodRhesus).to.eql({ display: "Positive", system: "http://loinc.org", code: "LA6576-8" });
    });


    it("demo usage, happy case, patient only", async () => {
        const patient: FHIR_Patient = {
            resourceType: "Patient",
            meta: {
                tag: [{
                    system: "http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag",
                    code: "medical-history"
                }]
            },
            id: "pat-01",
            name: [{
               given: [ "Henry" ],
               family:  "Jones",
               text: "ignore me"
            }],
            gender: "male",
            birthDate: "2000-01-02"
        };

        const medicalHistory = await fhirToMedicalHistory([ patient ]);
        if (E.isLeft(medicalHistory)) {
            if (shouldDump()) {
                consoleLogInspect(`There were ${medicalHistory.left.length} issue(s).`);
                consoleLogInspect(medicalHistory.left);
            }
            assert.fail("should not have rejected");
        }

        const issues       = medicalHistory.right[0];
        const personalData = PersonalData_T.encode(medicalHistory.right[1].personalData);

        if (shouldDump()) {
            consoleLogInspect(personalData);
            consoleLogInspect(`There were ${issues.length} issue(s).`);
            consoleLogInspect(issues);
        }

        expect(personalData.firstName).to.equal("Henry");
        expect(personalData.lastName).to.equal("Jones");
        expect(personalData.gender).to.equal("male");
        expect(personalData.dateOfBirth).to.equal("2000-01-02");
        expect(personalData.height).to.be.undefined;
        expect(personalData.weight).to.be.undefined;
        expect(personalData.bloodGroup).to.be.undefined;
        expect(personalData.bloodRhesus).to.be.undefined;
    });

    it("demo usage, happy case, partial patient data", async () => {
        const patient: FHIR_Patient = {
            resourceType: "Patient",
            meta: {
                tag: [{
                    system: "http://fhir.smart4health.eu/CodeSystem/s4h-fhir-tag",
                    code: "medical-history"
                }]
            },
            id: "pat-01",
            name: [{
               given: [ "Henry" ],
               family:  "Jones"
            }],
            gender: "male",
            birthDate: "2000-01-02"
        };

        const bodyWeight0: FHIR_Observation = {
            resourceType: "Observation",
            id: "weight-0",
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
        };

        const rhesusFactor: FHIR_Observation = {
            resourceType: "Observation",
            id: "rhesusFactor-1",
            status: "final",
            subject: {},
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code:   "10331-7"
                }]
            },
            effectiveDateTime: "2020-12-12T00:00:00Z",
            valueCodeableConcept: {
                coding: [{
                    system: "http://loinc.org",
                    code: "LA6576-8"
                }]
            }
        };

        const medicalHistory = await fhirToMedicalHistory([
            patient,
            bodyWeight0,
            rhesusFactor
        ]);

        if (E.isLeft(medicalHistory)) {
            if (shouldDump()) {
                consoleLogInspect(`There were ${medicalHistory.left.length} issue(s).`);
                consoleLogInspect(medicalHistory.left);
            }
            assert.fail("should not have rejected");
        }

        const issues       = medicalHistory.right[0];
        const personalData = PersonalData_T.encode(medicalHistory.right[1].personalData);

        if (shouldDump()) {
            consoleLogInspect(personalData);
            consoleLogInspect(`There were ${issues.length} issue(s).`);
            consoleLogInspect(issues);
        }

        expect(personalData.firstName).to.equal("Henry");
        expect(personalData.lastName).to.equal("Jones");
        expect(personalData.gender).to.equal("male");
        expect(personalData.dateOfBirth).to.equal("2000-01-02");
        expect(personalData.height).to.be.undefined;
        expect(personalData.weight).to.eql({ value:  70, unit: "kg" });
        expect(personalData.bloodRhesus).to.eql({ display: "Positive", system: "http://loinc.org", code: "LA6576-8" });
        expect(personalData.bloodGroup).to.be.undefined;
    });

});
