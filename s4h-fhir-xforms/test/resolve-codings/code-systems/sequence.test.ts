/* eslint-disable max-nested-callbacks */
import { expect } from "chai";
import { assertEitherLeft, assertEitherRightContains, assertEitherRightValueDeep } from "../../utils";

import * as O from "fp-ts/Option";

import { CodeSystems } from "../../../src/resolve-codings/code-systems/defs";
import { makeSequenceCodeSystems } from "../../../src/resolve-codings/code-systems/sequence/sequence";
import { makeCannedCodeSystems } from "../../../src/resolve-codings/code-systems/canned/canned";
import { installCannedCodeSystem } from "../../../src/resolve-codings/code-systems/canned/data/canned-code-systems";


describe("resolve-codings / code-systems / sequence : sequence suite", () => {

    describe("suite 1", () => {
        let codeSystems: CodeSystems;

        before(() => {
            installCannedCodeSystem("test-1", [
                { system: "sct", code: "100", language: "en", display: "one hundred" },

                { system: "sct", code: "200", language: "en", display: "two hundred" },
                { system: "sct", code: "200", language: "de", display: "zweihundert" },
                { system: "sct", code: "200", language: "fr", display: "deux cent" },

                { system: "sct", code: "300", language: "de", display: "dreihundert" },
                { system: "sct", code: "300", language: "gd", display: "tri cheud" }
            ]);

            installCannedCodeSystem("test-2", [
                { system: "sct", code: "100", language: "de", display: "einhundert" },

                { system: "sct", code: "200", language: "en", display: "TWO HUNDRED" },

                { system: "sct", code: "300", language: "en", display: "three hundred" },

                { system: "sct", code: "400", language: "gd", display: "ceithir cheud" },
                { system: "sct", code: "400", language: "de", display: "vierhundert" }
            ]);

            installCannedCodeSystem("test-3", [
                { system: "sct", code: "1000", language: "en", display: "one thousand" },
                { system: "sct", code: "1000", language: "de", display: "eintausend"   },

                { system: "sct", code: "2000", language: "en", display: "two thousand" }
            ]);

            codeSystems = makeSequenceCodeSystems({
                codeSystems: [
                    makeCannedCodeSystems({ canName: "test-1" }),
                    makeCannedCodeSystems({ canName: "test-2" }),
                    makeCannedCodeSystems({ canName: "test-3" })
                ]
            });

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

        it("100 - German language: expect the German text", async () => {
            const codings = await codeSystems.resolveCodings([{ system: "sct", code: "100" }], O.some("de"))();

            expect(codings).to.have.length(1);
            assertEitherRightValueDeep(codings[0], { language: "de", resolvedDisplay: "einhundert", version: "N/A" });
        });

        it("multiple codings, English language", async () => {
            const codings = await codeSystems.resolveCodings([
                { system: "sct", code:  "100" },
                { system: "sct", code:  "200" },
                { system: "sct", code:  "300" },
                { system: "sct", code:  "400" },
                { system: "sct", code: "1000" },
                { system: "sct", code: "2000" },
                { system: "sct", code: "3000" }
            ], O.some("en"))();

            expect(codings).to.have.length(7);
            assertEitherRightValueDeep(codings[0], { language: "en", resolvedDisplay: "one hundred", version: "N/A" });
            assertEitherRightValueDeep(codings[1], { language: "en", resolvedDisplay: "two hundred", version: "N/A" });
            assertEitherRightValueDeep(codings[2], { language: "en", resolvedDisplay: "three hundred", version: "N/A" });
            assertEitherLeft(codings[3]);
            assertEitherRightValueDeep(codings[4], { language: "en", resolvedDisplay: "one thousand", version: "N/A" });
            assertEitherRightValueDeep(codings[5], { language: "en", resolvedDisplay: "two thousand", version: "N/A" });
            assertEitherLeft(codings[6]);
        });

        it("multiple codings, German language", async () => {
            const codings = await codeSystems.resolveCodings([
                { system: "sct", code:  "100" },
                { system: "sct", code:  "200" },
                { system: "sct", code:  "300" },
                { system: "sct", code:  "400" },
                { system: "sct", code: "1000" },
                { system: "sct", code: "2000" },
                { system: "sct", code: "3000" }
            ], O.some("de"))();

            expect(codings).to.have.length(7);
            assertEitherRightValueDeep(codings[0], { language: "de", resolvedDisplay: "einhundert",  version: "N/A" });
            assertEitherRightValueDeep(codings[1], { language: "de", resolvedDisplay: "zweihundert", version: "N/A" });
            assertEitherRightValueDeep(codings[2], { language: "de", resolvedDisplay: "dreihundert", version: "N/A" });
            assertEitherRightValueDeep(codings[3], { language: "de", resolvedDisplay: "vierhundert", version: "N/A" });
            assertEitherRightValueDeep(codings[4], { language: "de", resolvedDisplay: "eintausend",  version: "N/A" });
            assertEitherLeft(codings[5]);
            assertEitherLeft(codings[6]);
        });

        it("multiple codings, Gaelic language", async () => {
            const codings = await codeSystems.resolveCodings([
                { system: "sct", code:  "100" },
                { system: "sct", code:  "200" },
                { system: "sct", code:  "300" },
                { system: "sct", code:  "400" },
                { system: "sct", code: "1000" },
                { system: "sct", code: "2000" },
                { system: "sct", code: "3000" }
            ], O.some("gd"))();

            expect(codings).to.have.length(7);
            assertEitherLeft(codings[0]);
            assertEitherLeft(codings[1]);
            assertEitherRightValueDeep(codings[2], { language: "gd", resolvedDisplay: "tri cheud",     version: "N/A" });
            assertEitherRightValueDeep(codings[3], { language: "gd", resolvedDisplay: "ceithir cheud", version: "N/A" });
            assertEitherLeft(codings[4]);
            assertEitherLeft(codings[5]);
            assertEitherLeft(codings[6]);
        });

    });

    describe("suite 2", () => {
        before(() => {
            installCannedCodeSystem("test-0", [
                { system: "A", code: "A-0", language: "en", display: "test-0:A-0" },

                { system: "B", code: "B-0", language: "en", display: "test-0:B-0" },
                { system: "B", code: "B-1", language: "en", display: "test-0:B-1" },
                { system: "B", code: "B-2", language: "en", display: "test-0:B-2" },
                { system: "B", code: "B-3", language: "en", display: "test-0:B-3" },
                { system: "B", code: "B-4", language: "en", display: "test-0:B-4" },
                { system: "B", code: "B-5", language: "en", display: "test-0:B-5" },
                { system: "B", code: "B-6", language: "en", display: "test-0:B-6" }, // B-7 missing
                { system: "B", code: "B-8", language: "en", display: "test-0:B-8" }  // B-9 missing
            ]);

            installCannedCodeSystem("test-1", [
                { system: "A", code: "A-0", language: "en", display: "test-1:A-0" },
                { system: "A", code: "A-1", language: "en", display: "test-1:A-1" },

                { system: "B", code: "B-9", language: "en", display: "test-1:B-9" }
            ]);

            installCannedCodeSystem("test-2", [
                { system: "A", code: "A-0", language: "de", display: "test-2:A-0" },
                { system: "A", code: "A-1", language: "de", display: "test-2:A-1" },
                { system: "A", code: "A-2", language: "de", display: "test-2:A-2" },

                { system: "B", code: "B-7", language: "de", display: "test-2:B-7" },
                { system: "B", code: "B-9", language: "de", display: "test-2:B-9" }
            ]);
        });

        describe("cascading tests", () => {

            it("small codings set", async () => {
                const clients = makeSequenceCodeSystems({ codeSystems: [
                    makeCannedCodeSystems({ canName: "test-0" }),
                    makeCannedCodeSystems({ canName: "test-1" }),
                    makeCannedCodeSystems({ canName: "test-2" })
                ] });

                const res =  await clients.resolveCodings([
                    { system: "A", code: "A-0" },
                    { system: "A", code: "A-1" },
                    { system: "A", code: "A-2" }
                ], O.none)();

                expect(res).to.have.length(3);

                assertEitherRightContains(res[0], { resolvedDisplay: "test-0:A-0" });
                assertEitherRightContains(res[1], { resolvedDisplay: "test-1:A-1" });
                assertEitherRightContains(res[2], { resolvedDisplay: "test-2:A-2" });
            });

            it("larger codings set", async () => {
                const clients = makeSequenceCodeSystems({ codeSystems: [
                    makeCannedCodeSystems({ canName: "test-0" }),
                    makeCannedCodeSystems({ canName: "test-1" }),
                    makeCannedCodeSystems({ canName: "test-2" })
                ] });

                const res =  await clients.resolveCodings([
                    { system: "B", code: "B-0" },
                    { system: "B", code: "B-1" },
                    { system: "B", code: "B-2" },
                    { system: "B", code: "B-3" },
                    { system: "B", code: "B-4" },
                    { system: "B", code: "B-5" },
                    { system: "B", code: "B-6" },
                    { system: "B", code: "B-7" },
                    { system: "B", code: "B-8" },
                    { system: "B", code: "B-9" },
                    { system: "B", code: "B-10" }
                ], O.none)();

                expect(res).to.have.length(11);

                assertEitherRightContains(res[0], { resolvedDisplay: "test-0:B-0" });
                assertEitherRightContains(res[1], { resolvedDisplay: "test-0:B-1" });
                assertEitherRightContains(res[2], { resolvedDisplay: "test-0:B-2" });
                assertEitherRightContains(res[3], { resolvedDisplay: "test-0:B-3" });
                assertEitherRightContains(res[4], { resolvedDisplay: "test-0:B-4" });
                assertEitherRightContains(res[5], { resolvedDisplay: "test-0:B-5" });
                assertEitherRightContains(res[6], { resolvedDisplay: "test-0:B-6" });
                assertEitherRightContains(res[7], { resolvedDisplay: "test-2:B-7" });
                assertEitherRightContains(res[8], { resolvedDisplay: "test-0:B-8" });
                assertEitherRightContains(res[9], { resolvedDisplay: "test-1:B-9" });
                assertEitherLeft(res[10]);
            });

            it("larger codings set, de", async () => {
                const clients = makeSequenceCodeSystems({ codeSystems: [
                    makeCannedCodeSystems({ canName: "test-0" }),
                    makeCannedCodeSystems({ canName: "test-1" }),
                    makeCannedCodeSystems({ canName: "test-2" })
                ] });

                const res =  await clients.resolveCodings([
                    { system: "B", code: "B-0" },
                    { system: "B", code: "B-1" },
                    { system: "B", code: "B-2" },
                    { system: "B", code: "B-3" },
                    { system: "B", code: "B-4" },
                    { system: "B", code: "B-5" },
                    { system: "B", code: "B-6" },
                    { system: "B", code: "B-7" },
                    { system: "B", code: "B-8" },
                    { system: "B", code: "B-9" },
                    { system: "B", code: "B-10" }
                ], O.some("de"))();

                expect(res).to.have.length(11);

                assertEitherLeft(res[0]);
                assertEitherLeft(res[1]);
                assertEitherLeft(res[2]);
                assertEitherLeft(res[3]);
                assertEitherLeft(res[4]);
                assertEitherLeft(res[5]);
                assertEitherLeft(res[6]);
                assertEitherRightContains(res[7], { resolvedDisplay: "test-2:B-7" });
                assertEitherLeft(res[8]);
                assertEitherRightContains(res[9], { resolvedDisplay: "test-1:B-9" });
                assertEitherLeft(res[10]);
            });
        });

    });

});
