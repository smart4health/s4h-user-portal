/* eslint-disable max-nested-callbacks */
import { expect } from "chai";
import { consoleLogInspect, shouldDump } from "../../../../utils";

import { fhirToGroupLists } from "../../../../../src/transformations/group-list/fhir2ui";
import { QuestionnaireGroupItem_A, TextResponse } from "../../../../../src/transformations/group-list/defs";

import { RESOURCES_NOT_OK, RESOURCES_OK } from "./fixtures/files";


describe("multiple coding answers", () => {

    it("good example", async () => {
        const [ issues, result ] = await fhirToGroupLists(RESOURCES_OK);

        if (shouldDump()) {
            consoleLogInspect(issues);
            consoleLogInspect(result);
        }

        expect(result.model.groupList).to.have.length(1);
        expect(result.model.groupList[0].items).to.have.length(1);
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections).to.have.length(1);

        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].title).to.equal("Smart4Health pre-training questionnaire");
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].questionnaireResponseId).to.equal("s4h-pre-training-response-example");

        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses).to.have.length(5);

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).responseText).to.eql([ "Aching muscles", "Gardening", "Busy day" ]);
    });

    it("good example", async () => {
        const [ issues, result ] = await fhirToGroupLists(RESOURCES_NOT_OK);

        if (shouldDump()) {
            consoleLogInspect(issues);
            consoleLogInspect(result);
        }

        expect(result.model.groupList).to.have.length(1);
        expect(result.model.groupList[0].items).to.have.length(1);
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections).to.have.length(1);

        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].title).to.equal("Smart4Health pre-training questionnaire");
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].questionnaireResponseId).to.equal("s4h-pre-training-response-example");

        // The fifth answer has multiple answers and starts with a non-Coding answer, which is not supported yet.
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses).to.have.length(4);
    });

});
