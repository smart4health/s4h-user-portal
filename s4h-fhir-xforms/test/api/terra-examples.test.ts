/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import { refGraphToDot } from "../../src/fhir-resources/utils/graph/viz/render";
import { consoleLogInspect, shouldDot, shouldDump, writeGraph } from "../utils";
import { fhirToGroupLists } from "../../src/transformations/group-list/fhir2ui";

import { RESOURCES } from "./fixtures/terra-examples/files";
import { ComplexCourseGroup_A } from "../../src/transformations/group-list/defs";


describe("terra examples", () => {

    it("check the terra example", async () => {

        const [ issues, result ] = await fhirToGroupLists(
            RESOURCES,
            { toDot: refGraphToDot, removeAnswers: [ "training_no" ] }
        );

        if (result.dot && shouldDot()) {
            await writeGraph(result.dot, "terra-example.pdf");
        }

        if (shouldDump()) {
            consoleLogInspect(issues, 3);
            consoleLogInspect(result.model.groupList);
        }

        expect(result.model.groupList).to.have.length(2);

        expect((result.model.groupList[0] as ComplexCourseGroup_A).inputResourceIds).to.have.length(3);
        expect((result.model.groupList[0] as ComplexCourseGroup_A).inputResourceIdentifiers).to.have.length(3);
    });

});
