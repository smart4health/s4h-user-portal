/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import { refGraphToDot } from "../../src/fhir-resources/utils/graph/viz/render";
import { consoleLogInspect, shouldDot, shouldDump, writeGraph } from "../utils";
import { fhirToGroupLists } from "../../src/transformations/group-list/fhir2ui";

import { RESOURCES } from "./fixtures/debug-example/files";


/*
 * Debugging recipe
 *
 * 1. Create a new subfolder parallel to ./fixtures/debug-example
 * 2. Put all FHIR resource files of your example in there
 * 3. Duplicate this test file (or just duplicate the test case)
 * 4. Amend the PDF graph file name
 * 5. Run the test
 * 6. Check the graph PDF and console output
 * 7. If bug in code: fix bug :)
 * 8. Amend test case with expect checks to turn this case into a regression test
 */

describe("debugging test skeleton", () => {

    it("investigating bug", async () => {
        const [ issues, result ] = await fhirToGroupLists(
            RESOURCES,
            { toDot: refGraphToDot }
        );

        if (result.dot && shouldDot()) {
            await writeGraph(result.dot, "debug-example.pdf");
        }

        if (shouldDump()) {
            consoleLogInspect(issues);
            consoleLogInspect(result.model);
        }

        expect(result.model.groupList.length).to.be.at.least(0);
    });
});
