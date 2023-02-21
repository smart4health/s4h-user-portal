/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import { consoleLogInspect, shouldDot, shouldDump, writeGraph } from "../utils";
import { refGraphToDot } from "../../src/fhir-resources/utils/graph/viz/render";
import { fhirToGroupLists } from "../../src/transformations/group-list/fhir2ui";
import { QuestionnaireGroupItem_A } from "../../src/transformations/group-list/defs";

import { RESOURCES } from "./fixtures/merge-sections/files";

describe("section merging suite", () => {

    it("merge single encounter QRs", async () => {
        const [ issues, result ] = await fhirToGroupLists(
            RESOURCES,
            { toDot: refGraphToDot }
        );

        if (result.dot && shouldDot()) {
            await writeGraph(result.dot, "section-merging.pdf");
        }

        if (shouldDump()) {
            consoleLogInspect(issues, 5);
            consoleLogInspect(result.model.groupList[0], 8);
        }

        expect(result.model.groupList).to.have.length(1);

        expect(result.model.groupList[0].items).to.have.length(2);

        expect( result.model.groupList[0].items[0].type).to.equal("Questionnaire");
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).thumbnailText).to.equal("#1");

        expect( result.model.groupList[0].items[1].type).to.equal("Questionnaire");
        expect((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).thumbnailText).to.equal("Pre");
    });

});
