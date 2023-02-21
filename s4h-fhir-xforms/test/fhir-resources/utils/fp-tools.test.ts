/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import { FHIR_Patient_A, FHIR_Patient_T } from "../../../src/fhir-resources/individuals/patient";
import { FHIR_Condition_A, FHIR_Condition_T } from "../../../src/fhir-resources/summary/condition";
import { FHIR_Encounter_A, FHIR_Encounter_T } from "../../../src/fhir-resources/management/encounter";
import { FHIR_Provenance_A, FHIR_Provenance_T } from "../../../src/fhir-resources/security/provenance";
import { FHIR_Observation_A, FHIR_Observation_T } from "../../../src/fhir-resources/diagnostics/observation";
import { FHIR_Practitioner_A, FHIR_Practitioner_T } from "../../../src/fhir-resources/individuals/practitioner";
import { FHIR_PractitionerRole_A, FHIR_PractitionerRole_T } from "../../../src/fhir-resources/individuals/practitioner-role";
import { FHIR_DocumentReference_A, FHIR_DocumentReference_T } from "../../../src/fhir-resources/documents/document-reference-r4";
import { FHIR_QuestionnaireResponse_A, FHIR_QuestionnaireResponse_T } from "../../../src/fhir-resources/diagnostics/questionnaire-response";
import { FHIR_AllergyIntolerance_A, FHIR_AllergyIntolerance_T } from "../../../src/fhir-resources/summary/allergy-intolerance";
import { FHIR_MedicationStatement_A, FHIR_MedicationStatement_T, FHIR_Medication_A, FHIR_Medication_T } from "../../../src/fhir-resources/medications/medication-statement";

import { consoleLogInspect, shouldDump } from "../../utils";


describe("codec union helper and encoder suite", () => {

    it("Observation", () => {
        const res: FHIR_Observation_A = {
            resourceType: "Observation",
            subject: { display: "me" },
            status: "final",

            _effectiveTag: "none",
            _valueTag: "none",

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_Observation_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "Observation",
            subject: { display: "me" },
            status: "final"
        });
    });

    it("DocumentReference", () => {
        const res: FHIR_DocumentReference_A = {
            resourceType: "DocumentReference",
            id: "foo",
            status: "current",
            content: [],

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_DocumentReference_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "DocumentReference",
            id: "foo",
            status: "current",
            content: []
        });
    });

    it("QuestionnaireResponse", () => {
        const res: FHIR_QuestionnaireResponse_A = {
            resourceType: "QuestionnaireResponse",
            id: "foo",
            status: "completed",

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_QuestionnaireResponse_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "QuestionnaireResponse",
            id: "foo",
            status: "completed"
        });
    });

    it("Patient", () => {
        const res: FHIR_Patient_A = {
            resourceType: "Patient",
            name: [],
            gender: "male",
            birthDate: { kind: "YYYY-MM-DD", year: 1980, month: 10, day: 1 },

            _deceasedTag: "deceasedBoolean",
            deceasedBoolean: false,

            _multipleBirthTag: "none",

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_Patient_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "Patient",
            name: [],
            gender: "male",
            birthDate: "1980-10-01",
            deceasedBoolean: false
        });
    });

    it("PractitionerRole", () => {
        const res: FHIR_PractitionerRole_A = {
            resourceType: "PractitionerRole",
            active: false,

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_PractitionerRole_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "PractitionerRole",
            active: false
        });
    });

    it("Practitioner", () => {
        const res: FHIR_Practitioner_A = {
            resourceType: "Practitioner",
            active: false,

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_Practitioner_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "Practitioner",
            active: false
        });
    });

    it("Encounter", () => {
        const res: FHIR_Encounter_A = {
            resourceType: "Encounter",
            identifier: [{ system: "foo", value: "bar" }],
            status: "arrived",
            class: { code: "important" },

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_Encounter_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "Encounter",
            identifier: [{ system: "foo", value: "bar" }],
            status: "arrived",
            class: { code: "important" }
        });
    });

    it("MedicationStatement", () => {
        const res: FHIR_MedicationStatement_A = {
            resourceType: "MedicationStatement",
            identifier: [{ system: "foo", value: "bar" }],
            status: "active",
            subject: { display: "me" },

            _effectiveTag: "effectiveDateTime",
            effectiveDateTime: { kind: "YYYY", year: 2021 },

            _medicationTag: "none",

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_MedicationStatement_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "MedicationStatement",
            identifier: [{ system: "foo", value: "bar" }],
            status: "active",
            subject: { display: "me" },
            effectiveDateTime: "2021"
        });
    });

    it("Medication", () => {
        const res: FHIR_Medication_A = {
            resourceType: "Medication",
            code: { coding: [] },

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_Medication_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "Medication",
            code: { coding: [] }
        });
    });

    it("Provenance", () => {
        const res: FHIR_Provenance_A = {
            resourceType: "Provenance",
            target: [],
            recorded: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            agent: [],

            _occurredTag: "none",

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_Provenance_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "Provenance",
            target: [],
            recorded: "2021-08-26T12:34:56Z",
            agent: []
        });
    });

    it("AllergyIntolerance", () => {
        const res: FHIR_AllergyIntolerance_A = {
            resourceType: "AllergyIntolerance",
            patient: { reference: "me" },

            _onsetTag: "none",

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_AllergyIntolerance_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "AllergyIntolerance",
            patient: { reference: "me" }
        });
    });

    it("Condition", () => {
        const res: FHIR_Condition_A = {
            resourceType: "Condition",
            subject: { reference: "me" },
            clinicalStatus: { coding: [] },

            _onsetTag: "none",
            _abatementTag: "none",

            __phdpCreated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 },
            __phdpUpdated: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2021, month: 8, day: 26, hours: 12, minutes: 34, seconds: 56 }
        };

        const out = FHIR_Condition_T.encode(res);

        if (shouldDump()) {
            consoleLogInspect(out);
        }

        expect(out).to.eql({
            resourceType: "Condition",
            subject: { reference: "me" },
            clinicalStatus: { coding: [] }
        });
    });

});
