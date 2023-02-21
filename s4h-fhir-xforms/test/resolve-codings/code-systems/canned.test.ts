/* eslint-disable max-nested-callbacks */
import { assert, expect } from "chai";
import { assertEitherLeft, assertEitherRightValueDeep, assertOptionNone, assertOptionSomeValue } from "../../utils";

import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { CodeSystems } from "../../../src/resolve-codings/code-systems/defs";
import { makeCannedCodeSystems } from "../../../src/resolve-codings/code-systems/canned/canned";
import { installCannedCodeSystem } from "../../../src/resolve-codings/code-systems/canned/data/canned-code-systems";
import { joinMerger, makeDefaultCodeSystemsList, resolveCodeableConceptTexts } from "../../../src/resolve-codings/concept-resolution";

import { FHIR_SimpleQuantity_A } from "../../../src/fhir-resources/types";
import { BoxedConceptCollector, boxConceptCollector } from "../../../src/fhir-resources/base/concept-collector";


describe("resolve-codings / code-systems / canned : canned suite", () => {
    let codeSystems: CodeSystems;

    before(() => {
        installCannedCodeSystem("internal-test", [
            { system: "sct", code: "100", language: "en", display: "one hundred" },

            { system: "sct", code: "200", language: "en", display: "two hundred" },
            { system: "sct", code: "200", language: "de", display: "zweihundert" },
            { system: "sct", code: "200", language: "fr", display: "deux cent" },

            { system: "sct", code: "300", language: "de", display: "dreihundert" },
            { system: "sct", code: "300", language: "gd", display: "tri cheud" }
        ]);
        codeSystems = makeCannedCodeSystems({ canName: "internal-test" });
    });

    it("empty codings lookup returns empty array", async () => {
        const codings = await codeSystems.resolveCodings([], O.none)();
        expect(codings).to.have.length(0);
    });

    it("100 - no language: expect the English text", async () => {
        const codings = await codeSystems.resolveCodings([{ system: "sct", code: "100" }], O.none)();

        expect(codings).to.have.length(1);
        assertEitherRightValueDeep(codings[0], { language: "en", resolvedDisplay: "one hundred", version: "N/A" });
    });

    it("200 - no language: expect the English text", async () => {
        const codings = await codeSystems.resolveCodings([{ system: "sct", code: "200" }], O.none)();

        expect(codings).to.have.length(1);
        assertEitherRightValueDeep(codings[0], { language: "en", resolvedDisplay: "two hundred", version: "N/A" });
    });

    it("200 - de: expect the German text", async () => {
        const codings = await codeSystems.resolveCodings([{ system: "sct", code: "200" }], O.some("de"))();

        expect(codings).to.have.length(1);
        assertEitherRightValueDeep(codings[0], { language: "de", resolvedDisplay: "zweihundert", version: "N/A" });
    });

    it("200 - es: expect error", async () => {
        const codings = await codeSystems.resolveCodings([{ system: "sct", code: "200" }], O.some("es"))();

        expect(codings).to.have.length(1);
        assertEitherLeft(codings[0]);
    });

    it("300 - no language: expect the German or Gaelic text", async () => {
        const codings = await codeSystems.resolveCodings([{ system: "sct", code: "300"  }], O.none)();

        expect(codings).to.have.length(1);

        if (E.isRight(codings[0])) {
            assert.includeDeepMembers([
                { version: "N/A", language: "de", resolvedDisplay: "dreihundert" },
                { version: "N/A", language: "gd", resolvedDisplay: "tri cheud" }
            ], [ codings[0].right ]);
        } else {
            assert.fail("expected right");
        }
    });

    it("resolve multiple codings with language de", async () => {
        const codings = await codeSystems.resolveCodings([
            { system: "sct", code: "100" },
            { system: "sct", code: "200" },
            { system: "sct", code: "300" }
        ], O.some("de"))();

        expect(codings).to.have.length(3);

        assertEitherLeft(codings[0]);
        assertEitherRightValueDeep(codings[1], { language: "de", resolvedDisplay: "zweihundert", version: "N/A" });
        assertEitherRightValueDeep(codings[2], { language: "de", resolvedDisplay: "dreihundert", version: "N/A" });
    });

    it("resolve multiple codings without requested language", async () => {
        const codings = await codeSystems.resolveCodings([
            { system: "sct", code: "100" },
            { system: "sct", code: "200" },
            { system: "sct", code: "300" }
        ], O.none)();

        expect(codings).to.have.length(3);

        assertEitherRightValueDeep(codings[0], { language: "en", resolvedDisplay: "one hundred", version: "N/A" });
        assertEitherRightValueDeep(codings[1], { language: "en", resolvedDisplay: "two hundred", version: "N/A" });
        if (E.isRight(codings[2])) {
            assert.includeDeepMembers([
                { version: "N/A", language: "de", resolvedDisplay: "dreihundert" },
                { version: "N/A", language: "gd", resolvedDisplay: "tri cheud" }
            ], [ codings[2].right ]);
        } else {
            assert.fail("expected right");
        }
    });


    describe("quantity unit resolution", () => {

        const quantities: FHIR_SimpleQuantity_A[] = [{
            value:   40,
            unit:   "mg",
            system: "http://unitsofmeasure.org",
            code:   "mg"
        }, {
            value:   1,
            system: "http://fhir.de/CodeSystem/kbv/s-bmp-dosiereinheit",
            code:   "1"
        }, {
            value:   1,
            unit:   "Stuk",
            system: "urn:oid:2.16.840.1.113883.2.4.4.1.900.2",
            code:   "245"
        }, {
            value: 1,
            system: "http://unitsofmeasure.org",
            code: "{Pill}"
        }];

        it("no language requested", async () => {
            const cc = quantitiesToBoxedConceptCollector(quantities);

            await resolveCodeableConceptTexts({
                codeSystems: await makeDefaultCodeSystemsList(),
                textExtractionStrategy: joinMerger(", ")
            })([ cc ]);

            assertOptionSomeValue(cc.concepts[0], "milligram");
            assertOptionNone(cc.concepts[1]);
            assertOptionSomeValue(cc.concepts[2], "Stuk");
            assertOptionSomeValue(cc.concepts[3], "Pill");
        });

        it("'en' language requested", async () => {
            const cc = quantitiesToBoxedConceptCollector(quantities);

            await resolveCodeableConceptTexts({
                codeSystems: await makeDefaultCodeSystemsList(),
                textExtractionStrategy: joinMerger(", "),
                language: "en"
            })([ cc ]);

            assertOptionSomeValue(cc.concepts[0], "milligram");
            assertOptionNone(cc.concepts[1]);
            assertOptionSomeValue(cc.concepts[2], "Stuk");
            assertOptionSomeValue(cc.concepts[3], "Pill");
        });

        it("'de' language requested", async () => {
            const cc = quantitiesToBoxedConceptCollector(quantities);

            await resolveCodeableConceptTexts({
                codeSystems: await makeDefaultCodeSystemsList(),
                textExtractionStrategy: joinMerger(", "),
                language: "de"
            })([ cc ]);

            assertOptionSomeValue(cc.concepts[0], "mg");
            assertOptionNone(cc.concepts[1]);
            assertOptionSomeValue(cc.concepts[2], "Stuk");
            assertOptionNone(cc.concepts[3]);
        });
    });

});

function quantitiesToBoxedConceptCollector (quantities: FHIR_SimpleQuantity_A[]): BoxedConceptCollector {
    return boxConceptCollector({
        resourceType: "ConceptCollector",
        identifier: [],
        concepts: pipe(quantities, A.map(q => ({
            coding: [{
                system:  q.system,
                code:    q.code,
                display: q.unit
            }]
        })))
    });
}
