/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import { refGraphToDot } from "../../src/fhir-resources/utils/graph/viz/render";
import { consoleLogInspect, shouldDot, shouldDump, writeGraph } from "../utils";
import { fhirToGroupLists } from "../../src/transformations/group-list/fhir2ui";
import { QuestionnaireGroupItem_A, ScaleResponse, TextResponse } from "../../src/transformations/group-list/defs";

import { RESOURCES_ALL, RESOURCES_DE, RESOURCES_EN } from "./fixtures/questionnaire-extensions/files";


describe("Questionnaire[Response] suite", () => {

    it("English", async () => {
        const [ issues, result ] = await fhirToGroupLists(
            RESOURCES_EN,
            { toDot: refGraphToDot }
        );

        if (result.dot && shouldDot()) {
            await writeGraph(result.dot, "questionnaire-extensions.en.pdf");
        }

        expect(result.model.groupList).to.have.length(1);

        if (shouldDump()) {
            consoleLogInspect(issues, 5);
            consoleLogInspect(result.model.groupList[0]);
        }

        expect(result.model.groupList[0].groupType).to.equal("Course");
        expect(result.model.groupList[0].items     ).to.have.length(2);
        // expect(model.model.groupList[0].title     ).to.equal("$$PAIN_QUESTIONNAIRE_TITLE$$");
        expect(result.model.groupList[0].date      ).to.equal("2020-02-04T14:15:00-05:00");

        expect( result.model.groupList[0].items[0].type).to.equal("Questionnaire");
        expect( result.model.groupList[0].items[0].id  ).to.equal("F9259254-FF98-423F-B986-A46C2F27869E");
        expect( result.model.groupList[0].items[0].date).to.equal("2020-02-03T14:15:00-05:00");
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections).to.have.length(1);

        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].title    ).to.equal("Smart4Health pre-session pain questionnaire");
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].type     ).to.equal("http://fhir.smart4health.eu/Questionnaire/pre-session-questionnaire");
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses).to.have.length(6);

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).questionTitle     ).to.equal("Please indicate your current pain level in the lower back.");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleValue        ).to.equal(3);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMinValueLabel).to.equal("no pain");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMaxValueLabel).to.equal("worst pain");

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).questionTitle     ).to.equal("Please indicate your average pain level in the lower back over the last 4 weeks.");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleValue        ).to.equal(5);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMinValueLabel).to.equal("no pain");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMaxValueLabel).to.equal("worst pain");

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).questionTitle     ).to.equal("Please indicate your maximum pain level in the lower back over the last 4 weeks.");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleValue        ).to.equal(8);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMinValueLabel).to.equal("no pain");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMaxValueLabel).to.equal("worst pain");

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).questionTitle      ).to.equal("Are you currently taking painkillers for the lower back?");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).responseText       ).to.eql([ "Yes" ]);

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).questionTitle      ).to.equal("How did the dose of your painkillers change since your last training?");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).responseText       ).to.eql([ "Steady" ]);

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).questionTitle      ).to.equal("Which painkiller are you currently taking?");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).responseText       ).to.eql([ "Substance 2" ]);


        expect( result.model.groupList[0].items[1].type).to.equal("Questionnaire");
        expect( result.model.groupList[0].items[1].id  ).to.equal("1C5DAB96-19A0-4591-A37F-645FCBD9058E");
        expect( result.model.groupList[0].items[1].date).to.equal("2020-02-04T14:15:00-05:00");
        expect((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections).to.have.length(1);

        expect((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].title    ).to.equal("Smart4Health pre-session pain questionnaire");
        expect((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].type     ).to.equal("http://fhir.smart4health.eu/Questionnaire/pre-session-questionnaire");
        expect((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses).to.have.length(6);

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).questionTitle     ).to.equal("Please indicate your current pain level in the lower back.");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleValue        ).to.equal(3);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMinValueLabel).to.equal("no pain");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMaxValueLabel).to.equal("worst pain");

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).questionTitle     ).to.equal("Please indicate your average pain level in the lower back over the last 4 weeks.");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleValue        ).to.equal(5);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMinValueLabel).to.equal("no pain");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMaxValueLabel).to.equal("worst pain");

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).questionTitle     ).to.equal("Please indicate your maximum pain level in the lower back over the last 4 weeks.");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleValue        ).to.equal(8);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMinValueLabel).to.equal("no pain");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMaxValueLabel).to.equal("worst pain");

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).questionTitle      ).to.equal("Are you currently taking painkillers for the lower back?");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).responseText       ).to.eql([ "Yes" ]);

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).questionTitle      ).to.equal("How did the dose of your painkillers change since your last training?");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).responseText       ).to.eql([ "Steady" ]);

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).questionTitle      ).to.equal("Which painkiller are you currently taking?");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).responseText       ).to.eql([ "Substance 2" ]);
    });

    it("Deutsch", async () => {
        const [ issues, result ] = await fhirToGroupLists(
            RESOURCES_DE,
            { toDot: refGraphToDot }
        );

        // if (model.dot && shouldDot()) {
        //     fs.writeFileSync("./temp/questionnaire-extensions.de.pdf", await renderDigraph("pdf", model.dot));
        // }

        expect(result.model.groupList).to.have.length(1);

        if (shouldDump()) {
            consoleLogInspect(issues, 3);
            consoleLogInspect(result.model.groupList[0]);
        }

        expect(result.model.groupList[0].groupType).to.equal("Course");
        expect(result.model.groupList[0].items     ).to.have.length(2);
        // expect(model.model.groupList[0].title     ).to.equal("$$PAIN_QUESTIONNAIRE_TITLE$$");
        expect(result.model.groupList[0].date      ).to.equal("2020-02-04T14:15:00-05:00");

        expect( result.model.groupList[0].items[0].type).to.equal("Questionnaire");
        expect( result.model.groupList[0].items[0].id  ).to.equal("F9259254-FF98-423F-B986-A46C2F27869E");
        expect( result.model.groupList[0].items[0].date).to.equal("2020-02-03T14:15:00-05:00");
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections).to.have.length(1);

        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].title    ).to.equal("Smart4Health Pre-Session-Schmerz-Fragebogen");
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].type     ).to.equal("http://fhir.smart4health.eu/Questionnaire/pre-session-questionnaire");
        expect((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses).to.have.length(6);

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).questionTitle     ).to.equal("Schmerzen aktuell");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleValue        ).to.equal(3);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMinValueLabel).to.equal("schmerzfrei");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMaxValueLabel).to.equal("starke Schmerzen");

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).questionTitle     ).to.equal("Durchschnittliche Schmerzen in den letzten 4 Wochen");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleValue        ).to.equal(5);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMinValueLabel).to.equal("schmerzfrei");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMaxValueLabel).to.equal("starke Schmerzen");

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).questionTitle     ).to.equal("Maximale Schmerzen in den letzten 4 Wochen");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleValue        ).to.equal(8);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMinValueLabel).to.equal("schmerzfrei");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMaxValueLabel).to.equal("starke Schmerzen");

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).questionTitle      ).to.equal("Schmerzmedikation?");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).responseText       ).to.eql([ "Ja" ]);

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).questionTitle      ).to.equal("Dosierungsänderung?");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).responseText       ).to.eql([ "unverändert" ]);

        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).questionTitle      ).to.equal("Aktuelles Schmerzmedikament");
        expect(((result.model.groupList[0].items[0] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).responseText       ).to.eql([ "Substanz 2" ]);



        expect( result.model.groupList[0].items[1].type).to.equal("Questionnaire");
        expect( result.model.groupList[0].items[1].id  ).to.equal("1C5DAB96-19A0-4591-A37F-645FCBD9058E");
        expect( result.model.groupList[0].items[1].date).to.equal("2020-02-04T14:15:00-05:00");
        expect((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections).to.have.length(1);

        expect((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].title    ).to.equal("Smart4Health Pre-Session-Schmerz-Fragebogen");
        expect((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].type     ).to.equal("http://fhir.smart4health.eu/Questionnaire/pre-session-questionnaire");
        expect((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses).to.have.length(6);

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).questionTitle     ).to.equal("Schmerzen aktuell");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleValue        ).to.equal(3);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMinValueLabel).to.equal("schmerzfrei");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[0] as ScaleResponse).scaleMaxValueLabel).to.equal("starke Schmerzen");

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).questionTitle     ).to.equal("Durchschnittliche Schmerzen in den letzten 4 Wochen");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleValue        ).to.equal(5);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMinValueLabel).to.equal("schmerzfrei");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[1] as ScaleResponse).scaleMaxValueLabel).to.equal("starke Schmerzen");

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).type              ).to.equal("Scale");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).questionTitle     ).to.equal("Maximale Schmerzen in den letzten 4 Wochen");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleValue        ).to.equal(8);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMinValue     ).to.equal(0);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMaxValue     ).to.equal(10);
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMinValueLabel).to.equal("schmerzfrei");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[2] as ScaleResponse).scaleMaxValueLabel).to.equal("starke Schmerzen");

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).questionTitle      ).to.equal("Schmerzmedikation?");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[3] as TextResponse).responseText       ).to.eql([ "Ja" ]);

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).questionTitle      ).to.equal("Dosierungsänderung?");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[4] as TextResponse).responseText       ).to.eql([ "unverändert" ]);

        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).type               ).to.equal("Text");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).questionTitle      ).to.equal("Aktuelles Schmerzmedikament");
        expect(((result.model.groupList[0].items[1] as QuestionnaireGroupItem_A).sections[0].responses[5] as TextResponse).responseText       ).to.eql([ "Substanz 2" ]);
    });


    it("language clash", async () => {
        const [ issues, _ignore ] = await fhirToGroupLists(
            RESOURCES_ALL, { }
        );

        if (shouldDump()) {
            consoleLogInspect(issues);
        }

        let found = false;
        for (const issue of issues) {
            if (issue.message.match(/could not add Questionnaire to graph/)) {
                found = true;
            }
        }
        expect(found).to.be.true;
    });

});
