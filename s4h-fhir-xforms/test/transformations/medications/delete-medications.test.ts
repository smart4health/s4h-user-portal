/* eslint-disable prefer-const */
/* eslint-disable max-nested-callbacks */
import { expect } from "chai";
import { consoleLogInspect, shouldDump } from "../../utils";

import { simpleMockedSdk } from "../../../src/utils/sdk-mocks";
import { FHIR_CodeableConcept } from "../../../src/fhir-resources/types";
import { FHIR_Medication, FHIR_MedicationStatement } from "../../../src/fhir-resources/medications/medication-statement";

import { IssueList } from "../../../src/utils/issues";
import { MedicationListResult } from "../../../src/transformations/medications/defs";
import { apiDeleteMedication, apiReadMedicationList } from "../../../src/transformations/medications/public-api";


describe("public API: medications: deletion", () => {

    function medStmtConcept (id: string, medicationCodeableConcept: FHIR_CodeableConcept): FHIR_MedicationStatement {
        return {
            resourceType: "MedicationStatement",
            id,
            status: "active",
            subject: { display: "you" },
            medicationCodeableConcept
        };
    }

    function medStmtRef (id: string, medRefValue: string): FHIR_MedicationStatement {
        return {
            resourceType: "MedicationStatement",
            id,
            status: "active",
            subject: { display: "you" },
            medicationReference: {
                identifier: {
                    system: "foobar",
                    value: medRefValue
                }
            }
        };
    }

    function med (value: string): FHIR_Medication {
        return {
            resourceType: "Medication",
            id: value,
            identifier: [{
                system: "foobar",
                value
            }],
            code: {
                coding: [{ system: "bla", code: "blub" }]
            }
        };
    }

    it("1", async () => {
        const sdk = simpleMockedSdk({
            userId: "dummy",
            resources: [
                medStmtConcept("stmt-1", { coding: [{ system: "foo1", code: "bar1" }] }),
                medStmtConcept("stmt-2", { coding: [{ system: "foo2", code: "bar2" }] })
            ]
        });

        let issues: IssueList;
        let result0: MedicationListResult;
        let result1: MedicationListResult;
        let result2: MedicationListResult;

        [ issues, result0 ] = await apiReadMedicationList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result0.model, 10);
        }

        expect(result0.model.medicationStatements).to.have.length(2);

        [ issues, result1 ] = await apiDeleteMedication({ sdk }, result0.model, "stmt-2");

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
        }

        expect(result1.model.medicationStatements).to.have.length(1);
        expect(result1.model.medicationStatements[0].medicationStatementId).to.eql("stmt-1");

        // input model untouched
        expect(result0.model.medicationStatements).to.have.length(2);

        [ issues, result2 ] = await apiReadMedicationList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result2.model, 10);
        }

        expect(result2.model.medicationStatements).to.have.length(1);
        expect(result2.model.medicationStatements[0].medicationStatementId).to.eql("stmt-1");
    });

    it("2", async () => {
        const sdk = simpleMockedSdk({
            userId: "dummy",
            resources: [
                medStmtConcept("stmt-1", { coding: [{ system: "foo1", code: "bar1" }] }),
                medStmtConcept("stmt-2", { coding: [{ system: "foo2", code: "bar2" }] }),
                medStmtRef("stmt-3", "med-3"),
                medStmtRef("stmt-4", "med-4"),
                med("med-3"),
                med("med-4")
            ]
        });

        let issues: IssueList;
        let result0: MedicationListResult;
        let result1: MedicationListResult;
        let result2: MedicationListResult;

        [ issues, result0 ] = await apiReadMedicationList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result0.model, 10);
        }

        expect(result0.model.medicationStatements).to.have.length(4);

        [ issues, result1 ] = await apiDeleteMedication({ sdk }, result0.model, "stmt-3");
        expect(issues).to.have.length(0);

        expect(result1.model.medicationStatements).to.have.length(3);
        expect(result1.model.medicationStatements[0].medicationStatementId).to.eql("stmt-1");
        expect(result1.model.medicationStatements[1].medicationStatementId).to.eql("stmt-2");
        expect(result1.model.medicationStatements[2].medicationStatementId).to.eql("stmt-4");

        // input model untouched
        expect(result0.model.medicationStatements).to.have.length(4);

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
        }

        [ issues, result2 ] = await apiReadMedicationList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result2.model, 10);
        }

        expect(result2.model.medicationStatements).to.have.length(3);
        expect(result2.model.medicationStatements[0].medicationStatementId).to.eql("stmt-1");
        expect(result2.model.medicationStatements[1].medicationStatementId).to.eql("stmt-2");
        expect(result2.model.medicationStatements[2].medicationStatementId).to.eql("stmt-4");
    });

    it("3", async () => {
        const sdk = simpleMockedSdk({
            userId: "dummy",
            resources: [
                medStmtConcept("stmt-1", { coding: [{ system: "foo1", code: "bar1" }] }),
                medStmtConcept("stmt-2", { coding: [{ system: "foo2", code: "bar2" }] }),
                medStmtRef("stmt-3", "med-X"),
                medStmtRef("stmt-4", "med-X"),
                med("med-X"),
                med("med-Y")
            ]
        });

        let issues: IssueList;
        let result0: MedicationListResult;
        let result1: MedicationListResult;
        let result2: MedicationListResult;

        [ issues, result0 ] = await apiReadMedicationList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result0.model, 10);
        }

        expect(result0.model.medicationStatements).to.have.length(4);

        [ issues, result1 ] = await apiDeleteMedication({ sdk }, result0.model, "stmt-3");
        expect(issues).to.have.length(1);
        expect(issues[0].context).to.eql({ otherMedicationStatements: [ "stmt-4" ] });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
        }

        expect(result1.model.medicationStatements).to.have.length(3);
        expect(result1.model.medicationStatements[0].medicationStatementId).to.eql("stmt-1");
        expect(result1.model.medicationStatements[1].medicationStatementId).to.eql("stmt-2");
        expect(result1.model.medicationStatements[2].medicationStatementId).to.eql("stmt-4");
        expect(result1.model.medicationStatements[2].medicationId).to.eql("med-X");

        // input model untouched
        expect(result0.model.medicationStatements).to.have.length(4);


        [ issues, result2 ] = await apiReadMedicationList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result2.model, 10);
        }

        expect(result2.model.medicationStatements).to.have.length(3);
        expect(result2.model.medicationStatements[0].medicationStatementId).to.eql("stmt-1");
        expect(result2.model.medicationStatements[1].medicationStatementId).to.eql("stmt-2");
        expect(result2.model.medicationStatements[2].medicationStatementId).to.eql("stmt-4");
        expect(result2.model.medicationStatements[2].medicationId).to.eql("med-X");
    });

    it("4", async () => {
        const sdk = simpleMockedSdk({
            userId: "dummy",
            resources: [
                medStmtConcept("stmt-1", { coding: [{ system: "foo1", code: "bar1" }] }),
                medStmtConcept("stmt-2", { coding: [{ system: "foo2", code: "bar2" }] }),
                medStmtRef("stmt-3", "med-X"),
                medStmtRef("stmt-4", "med-X"),
                med("med-X"),
                med("med-Y")
            ]
        });

        let issues: IssueList;
        let result0: MedicationListResult;
        let result1: MedicationListResult;

        [ issues, result0 ] = await apiReadMedicationList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result0.model, 10);
        }

        expect(result0.model.medicationStatements).to.have.length(4);

        [ issues, result1 ] = await apiDeleteMedication({ sdk }, result0.model, "unknown");

        expect(result1).to.be.undefined;

        // input model untouched
        expect(result0.model.medicationStatements).to.have.length(4);

        [ issues, result1 ] = await apiReadMedicationList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues, 10);
            consoleLogInspect(result1.model, 10);
        }

        expect(result1.model.medicationStatements).to.have.length(4);
        expect(result1.model.medicationStatements[0].medicationStatementId).to.eql("stmt-1");
        expect(result1.model.medicationStatements[1].medicationStatementId).to.eql("stmt-2");
        expect(result1.model.medicationStatements[2].medicationStatementId).to.eql("stmt-3");
        expect(result1.model.medicationStatements[3].medicationStatementId).to.eql("stmt-4");
    });

});
