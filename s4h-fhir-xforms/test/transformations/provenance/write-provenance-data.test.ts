/* eslint-disable max-nested-callbacks */
import { expect } from "chai";
import { consoleLogInspect, hasErrors, shouldDump } from "../../utils";

import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";

import { simpleMockedSdk } from "../../../src/utils/sdk-mocks";

import { apiReadProvenanceData } from "../../../src/transformations/provenance/public-api";
import { apiWriteMedicalHistory } from "../../../src/transformations/medical-history/public-api";


describe("public API: provenance data (writing)", () => {

    it("medical history", async () => {
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
        }, { sdk, dateTime: new Date("2021-08-20T12:00:00.000Z") });

        if (shouldDump()) {
            consoleLogInspect(result, 10);
        }

        const [ issues, prov ] = await apiReadProvenanceData({ sdk, resourceIdentifiers: result[1].inputResourceIdentifiers });

        if (shouldDump()) {
            consoleLogInspect(issues);
            consoleLogInspect(prov, 10);
        }

        expect(prov.model.provenances).to.have.length(6);

        expect(prov.model.provenances[0].recorded).to.eql(1629460800000);
        expect(prov.model.provenances[1].recorded).to.eql(1629460800000);
        expect(prov.model.provenances[2].recorded).to.eql(1629460800000);
        expect(prov.model.provenances[3].recorded).to.eql(1629460800000);
        expect(prov.model.provenances[4].recorded).to.eql(1629460800000);
        expect(prov.model.provenances[5].recorded).to.eql(1629460800000);
    });

});
