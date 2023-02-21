/* eslint-disable max-nested-callbacks */
import { assertOptionNone, assertOptionSomeValue } from "../utils";

import { IssueList_A } from "../../src/utils/issues";
import { CodeSystems } from "../../src/resolve-codings/code-systems/defs";
import { BSupportedResource } from "../../src/fhir-resources/base/resource";
import { makeCannedCodeSystems } from "../../src/resolve-codings/code-systems/canned/canned";
import { joinMerger, resolveCodeableConceptTexts } from "../../src/resolve-codings/concept-resolution";
import { installCannedCodeSystem } from "../../src/resolve-codings/code-systems/canned/data/canned-code-systems";
import { BoxedEncounter, FHIR_Encounter_A, boxEncounterResource } from "../../src/fhir-resources/management/encounter";
import { BoxedObservation, FHIR_Observation_A, boxObservationResource } from "../../src/fhir-resources/diagnostics/observation";


describe("concept-resolution suite", () => {

    describe("resolution combinations", () => {

        let [ _issues, resources ]: [ IssueList_A, BSupportedResource[] ] = [ [], [] ];
        let codeSystemsEn:   CodeSystems;
        let codeSystemsDeFr: CodeSystems;
        let codeSystemsGd:   CodeSystems;
        let codeSystemsMisc: CodeSystems;

        let encounter_A: FHIR_Encounter_A;

        before(() => {
            installCannedCodeSystem("numbers-en", [
                { system: "1", code: "1", language: "en", display: "one"    },
                { system: "2", code: "2", language: "en", display: "two"    },
                { system: "3", code: "3", language: "en", display: "three"  },
                { system: "4", code: "4", language: "en", display: "four"   }
            ]);

            installCannedCodeSystem("numbers-de-fr", [
                { system: "1", code: "1", language: "de", display: "eins"   },
                { system: "2", code: "2", language: "de", display: "zwei"   },
                { system: "3", code: "3", language: "de", display: "drei"   },
                { system: "4", code: "4", language: "de", display: "vier"   },

                { system: "1", code: "1", language: "fr", display: "un"     },
                { system: "2", code: "2", language: "fr", display: "deux"   },
                { system: "3", code: "3", language: "fr", display: "trois"  },
                { system: "4", code: "4", language: "fr", display: "quatre" }
            ]);

            installCannedCodeSystem("numbers-gd", [
                { system: "1", code: "1", language: "gd", display: "aon"     },
                { system: "2", code: "2", language: "gd", display: "dhà"     },
                { system: "3", code: "3", language: "gd", display: "trì"     },
                { system: "4", code: "4", language: "gd", display: "ceithir" }
            ]);

            installCannedCodeSystem("numbers-misc", [
                { system: "5", code: "5", language: "de", display: "fünf"    },
                { system: "6", code: "6", language: "de", display: "sechs"   },

                { system: "6", code: "6", language: "en", display: "six"     },
                { system: "7", code: "7", language: "en", display: "seven"   },

                { system: "5", code: "5", language: "fr", display: "quinze"  },

                { system: "1", code: "1", language: "de", display: "OVERRIDE-eins" },
                { system: "1", code: "1", language: "fr", display: "OVERRIDE-un"   },
                { system: "1", code: "1", language: "en", display: "OVERRIDE-one"  }
            ]);

            codeSystemsEn   = makeCannedCodeSystems({ canName: "numbers-en" });
            codeSystemsDeFr = makeCannedCodeSystems({ canName: "numbers-de-fr" });
            codeSystemsGd   = makeCannedCodeSystems({ canName: "numbers-gd" });
            codeSystemsMisc = makeCannedCodeSystems({ canName: "numbers-misc" });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ENCOUNTER_PROPS: any = {
                resourceType: "Encounter",
                identifier: [],
                status: "unknown",
                class: { system: "this/is/unused", code: "in this test" }
            };

            encounter_A = {
                ...ENCOUNTER_PROPS,

                type: [
                    { // 0
                        coding: [
                            { system: "1", code: "1" },
                            { system: "2", code: "2" },
                            { system: "5", code: "5" }
                        ]
                    },
                    { // 1
                        coding: [
                            { system: "7", code: "7" }
                        ]
                    },
                    { // 2
                        text: "SIEBEN",
                        coding: [
                            { system: "7", code: "7" }
                        ]
                    },
                    { // 3
                        text: "EGAL",
                        coding: [
                            { system: "1", code: "1", display: "EINS" },
                            { system: "8", code: "8", display: "ACHT" }
                        ]
                    },
                    { // 4
                        coding: []
                    },
                    { // 5
                        text: "XYZ"
                    },
                    { // 6
                        coding: [],
                        text: "EGAL"
                    },
                    { // 7
                        coding: [
                            { system: "7", code: "7", display: "SIEBEN" }
                        ]
                    },
                    { // 8
                        coding: [
                            { display: "ACHT" }
                        ]
                    }
                ]
            };
        });

        describe("resolution combinations, language 'en'", () => {

            before(async () => {
                [ _issues, resources ] = await resolveCodeableConceptTexts({
                    codeSystems: [ codeSystemsEn, codeSystemsDeFr, codeSystemsGd, codeSystemsMisc ],
                    textExtractionStrategy: joinMerger(" / "),
                    language: "en"
                })([ boxEncounterResource(encounter_A) ]);
            });

            it("first two codings resolved, third one ignored", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[0], "one / two");
            });

            it("straightforward resolution", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[1], "seven");
            });

            it("straightforward resolution, text property ignored", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[2], "seven");
            });

            it("single coding could be resolved, so use its display text", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[3], "one");
            });

            it("invalid concept", () => {
                assertOptionNone(     (resources[0] as BoxedEncounter).type[4]);
            });

            it("well, just use the text", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[5], "XYZ");
            });

            it("invalid concept, early exit, text ignored", () => {
                assertOptionNone(     (resources[0] as BoxedEncounter).type[6]);
            });

            it("normal resolution", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[7], "seven");
            });

            it("return the display text", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[8], "ACHT");
            });

        });

        describe("resolution combinations, language 'de'", () => {

            before(async () => {
                [ _issues, resources ] = await resolveCodeableConceptTexts({
                    codeSystems: [ codeSystemsEn, codeSystemsDeFr, codeSystemsGd, codeSystemsMisc ],
                    textExtractionStrategy: joinMerger(" / "),
                    language: "de"
                })([ boxEncounterResource(encounter_A) ]);
            });

            it("all codings resolved", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[0], "eins / zwei / fünf");
            });

            it("not found for German", () => {
                assertOptionNone(     (resources[0] as BoxedEncounter).type[1]);
            });

            it("not resolveable for German, but text property specified", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[2], "SIEBEN");
            });

            it("all codings resolved", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[3], "eins");
            });

            it("invalid concept", () => {
                assertOptionNone(     (resources[0] as BoxedEncounter).type[4]);
            });

            it("well, just use the text", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[5], "XYZ");
            });

            it("invalid concept, early exit, text ignored", () => {
                assertOptionNone(     (resources[0] as BoxedEncounter).type[6]);
            });

            it("not resolveable for German, but display property specified", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[7], "SIEBEN");
            });

            it("return the display text", () => {
                assertOptionSomeValue((resources[0] as BoxedEncounter).type[8], "ACHT");
            });
        });

    });

    it("fallback to text property", async () => {
        const bloodGroup_A: FHIR_Observation_A = {
            resourceType: "Observation",
            id: "bloodGroup-1",
            status: "final",
            subject: {},
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code:   "883-9",
                    display: "BAR"
                }]
            },
            _effectiveTag: "none",

            _valueTag: "valueCodeableConcept",
            valueCodeableConcept: {
                text: "xyz",
                coding: [{
                    system: "http://loinc.org",
                    code: "LA19710-5xx",
                    display: "FOO"
                }]
            }
        };

        installCannedCodeSystem("internal-test", [
            { system: "http://loinc.org", code: "883-9",     language: "en", display: "Blood group" }, // concept code
            { system: "http://loinc.org", code: "LA19710-5", language: "en", display: "A"  },
            { system: "http://loinc.org", code: "LA19709-7", language: "en", display: "B"  },
            { system: "http://loinc.org", code: "LA19708-9", language: "en", display: "O"  },
            { system: "http://loinc.org", code: "LA28449-9", language: "en", display: "AB" }

        ]);
        const codeSystems = makeCannedCodeSystems({ canName: "internal-test" });

        const [ _issues, resources ] = await resolveCodeableConceptTexts({
            codeSystems: [ codeSystems ],
            textExtractionStrategy: joinMerger(", "),
            language: "en"
        })([ boxObservationResource(bloodGroup_A) ]);

        assertOptionSomeValue((resources[0] as BoxedObservation).code, "Blood group");
        assertOptionSomeValue((resources[0] as BoxedObservation).valueCodeableConcept, "xyz");
    });

});
