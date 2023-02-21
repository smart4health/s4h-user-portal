/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import { refGraphToDot } from "../../src/fhir-resources/utils/graph/viz/render";
import { consoleLogInspect, shouldDot, shouldDump, writeGraph } from "../utils";
import { fhirToGroupLists } from "../../src/transformations/group-list/fhir2ui";
import { ComplexCourseGroup_A, FileGroupItem_A } from "../../src/transformations/group-list/defs";

import { RESOURCES } from "./fixtures/spike/files";


describe("spike suite", () => {

    it("regression test", async () => {
        const [ issues, result ] = await fhirToGroupLists(
            RESOURCES,
            { toDot: refGraphToDot }
        );

        if (result.dot && shouldDot()) {
            await writeGraph(result.dot, "spike.pdf");
        }

        if (shouldDump()) {
            consoleLogInspect(issues);
            consoleLogInspect(result.model.groupList);
        }

        expect(result.model.groupList).to.have.length(1);

        expect(result.model.groupList[0].groupType).to.equal("Course");
        expect(result.model.groupList[0].date).to.equal("2019-10-10T20:17:51.687Z");
        expect((result.model.groupList[0] as ComplexCourseGroup_A).courseTypes).to.eql([ "$$BACK_PAIN_TREATMENT$$" ]);

        expect( result.model.groupList[0].items).to.have.length(1);
        expect( result.model.groupList[0].items[0].type).to.equal("File");
        expect( result.model.groupList[0].items[0].id).to.equal("s4h-treatment-series-initial-force-test-docref-example");
        expect( result.model.groupList[0].items[0].date).to.equal("2019-10-10T20:17:51.687Z");
        expect((result.model.groupList[0].items[0] as FileGroupItem_A).category).to.have.length(0);
        expect((result.model.groupList[0].items[0] as FileGroupItem_A).fileId).to.be.undefined;
    });
});
