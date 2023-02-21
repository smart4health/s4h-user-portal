/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import { readOnlyMockedSdk } from "../../src/utils/sdk-mocks";
import { refGraphToDot } from "../../src/fhir-resources/utils/graph/viz/render";
import { fhirToGroupLists } from "../../src/transformations/group-list/fhir2ui";
import { apiReadGroupList } from "../../src/transformations/group-list/public-api";
import { ComplexCourseGroup_A, FileGroupItem_A, SimpleDocumentGroup } from "../../src/transformations/group-list/defs";

import { consoleLogInspect, shouldDot, shouldDump, writeGraph } from "../utils";

import { RESOURCES } from "./fixtures/stu3-docref/files";


describe("STU3 examples", () => {

    it("real-world example", async () => {

        const [ _issues, result ] = await fhirToGroupLists(RESOURCES, {
            toDot: refGraphToDot,
            removeAnswers: [ "training_no" ]
        });

        if (result.dot && shouldDot()) {
            await writeGraph(result.dot, "stu3-docref.pdf");
        }

        if (shouldDump()) {
            consoleLogInspect(result.model.groupList);
        }

        expect(  result.model.groupList).to.have.length(2);

        expect(  result.model.groupList[0].groupType).to.equal("Course");
        expect(  result.model.groupList[0].date).to.equal("2020-02-10T16:47:55+01:00");
        expect( (result.model.groupList[0] as ComplexCourseGroup_A).courseTypes).to.eql([ "$$BACK_PAIN_TREATMENT$$" ]);
        expect( (result.model.groupList[0] as ComplexCourseGroup_A).inputResourceIds).to.eql([ "7c2d4577-9a9c-4e83-8c68-ad0518756ce3", "day0" ]);

        expect( (result.model.groupList[0] as ComplexCourseGroup_A).inputResourceIdentifiers).to.eql([
            [{
                "assigner": {
                    "reference": "89dbc876-ac7c-43b7-8741-25b14065fb91"
                },
                "value": "d4l_f_p_t#649defe0-0cbd-4d3b-92b1-4a6fee0e30d8#712fb97c-a219-48ae-a7a8-85b8c937c8cd#44a4317c-6809-40cc-a66b-de58acfe2f44"
            }],
            [{
                "system": "http://fhir.smart4health.eu/CodeSystem/ittm-visit-id",
                "value": "test-final"
            }]
        ]);

        expect( (result.model.groupList[0] as ComplexCourseGroup_A).items).to.have.length(1);
        expect( (result.model.groupList[0] as ComplexCourseGroup_A).items[0].type).to.equal("File");
        expect( (result.model.groupList[0] as ComplexCourseGroup_A).items[0].date).to.equal("2020-02-10T16:47:55+01:00");
        expect(((result.model.groupList[0] as ComplexCourseGroup_A).items[0] as FileGroupItem_A).category).to.eql([]);
        expect(((result.model.groupList[0] as ComplexCourseGroup_A).items[0] as FileGroupItem_A).id).to.equal("7c2d4577-9a9c-4e83-8c68-ad0518756ce3");
        expect(((result.model.groupList[0] as ComplexCourseGroup_A).items[0] as FileGroupItem_A).fileId).to.equal("649defe0-0cbd-4d3b-92b1-4a6fee0e30d8");
        expect(((result.model.groupList[0] as ComplexCourseGroup_A).items[0] as FileGroupItem_A).title).to.equal("ttt +1");
        expect(((result.model.groupList[0] as ComplexCourseGroup_A).items[0] as FileGroupItem_A).docRefType).to.be.undefined;
    });

    it("STU3 and R4 mixed input", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: RESOURCES
        });

        const [ issues, result ] = await apiReadGroupList({ sdk });

        if (shouldDump()) {
            consoleLogInspect(issues);
            consoleLogInspect(result);
        }

        expect(result.model.groupList).to.have.length(2);

        expect(result.model.groupList[0].groupType).to.eql("Course");
        expect(result.model.groupList[0].date).to.equal("2020-02-10T16:47:55+01:00");

        expect(result.model.groupList[1].groupType).to.eql("Document");
        expect((result.model.groupList[1] as SimpleDocumentGroup).identifier).to.eql([{
            value: "d4l_f_p_t#f99bed95-4a1e-417a-823f-820b45accf2b#f99bed95-4a1e-417a-823f-820b45accf2b#f99bed95-4a1e-417a-823f-820b45accf2b"
        }]);

        expect(result.model.groupList[1].date).to.equal("2021-06-03T10:00:00.000Z");
    });

});
