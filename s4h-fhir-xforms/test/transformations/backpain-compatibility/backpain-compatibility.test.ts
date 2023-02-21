/* eslint-disable max-nested-callbacks */
import { assert, expect } from "chai";

import { readOnlyMockedSdk } from "../../../src/utils/sdk-mocks";
import { apiReadGroupList } from "../../../src/transformations/group-list/public-api";
import { fhirToGroupLists } from "../../../src/transformations/group-list/fhir2ui";
import { refGraphToDot } from "../../../src/fhir-resources/utils/graph/viz/render";

import { consoleLogInspect, shouldDot, shouldDump, writeGraph } from "../../utils";

import { RESOURCES, RESOURCES_SUBSET } from "./fixtures/files";
import { QuestionnaireGroupItem_A } from "../../../src/transformations/group-list/defs";

describe("backpain compatibility investigation", () => {

    it("demo sources", async () => {

        const [ _, result1 ] = await fhirToGroupLists(RESOURCES_SUBSET, {
            toDot: refGraphToDot,
            removeAnswers: [ "training_no" ]
        });

        if (result1.dot && shouldDot()) {
            await writeGraph(result1.dot, "backpain.pdf");
        }

        expect((result1.model.groupList[0].items[0] as QuestionnaireGroupItem_A).thumbnailText).to.equal("During");

    });

});
