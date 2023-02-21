/* eslint-disable max-nested-callbacks */
import { expect } from "chai";
import { assertEitherLeft, assertEitherRightValueDeep } from "../../utils";

import * as O from "fp-ts/Option";

import { makeSequenceCodeSystems } from "../../../src/resolve-codings/code-systems/sequence/sequence";
import { makeValueSetSourcedCodeSystems } from "../../../src/resolve-codings/code-systems/value-set-sourced/value-set-sourced";
import { makeCannedValueSet } from "../../../src/resolve-codings/value-sets/canned/canned";


describe("resolve-codings / code-systems / value-set-sourced", () => {

    it("single value set lookup", async () => {
        const valueSet = await makeCannedValueSet({
            valueSetUrl: "http://hl7.org/fhir/ValueSet/document-classcodes"
        });

        const codeSystems = makeValueSetSourcedCodeSystems({ valueSet: valueSet });

        const codings = await codeSystems.resolveCodings([
            { system: "http://loinc.org", code: "11369-6" },
            { system: "http://loinc.org", code: "11485-0" }
        ], O.none)();

        expect(codings).to.have.length(2);

        assertEitherRightValueDeep(codings[0], { system: "http://loinc.org", code: "11369-6", version: "N/A", language: "en", resolvedDisplay: "History of Immunization" });
        assertEitherRightValueDeep(codings[1], { system: "http://loinc.org", code: "11485-0", version: "N/A", language: "en", resolvedDisplay: "Anesthesia records" });
    });

    it("multiple value set lookup", async () => {
        const valueSet1 = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/document-classcodes", language: "foo" });
        const valueSet2 = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/document-classcodes" });
        const valueSet3 = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/c80-practice-codes", language: "en" });

        const codeSystems = makeSequenceCodeSystems({
            codeSystems: [
                makeValueSetSourcedCodeSystems({ valueSet: valueSet1 }),
                makeValueSetSourcedCodeSystems({ valueSet: valueSet2 }),
                makeValueSetSourcedCodeSystems({ valueSet: valueSet3 })
            ]
        });

        const codings = await codeSystems.resolveCodings([
            { system: "http://loinc.org", code: "11369-6" },
            { system: "http://loinc.org", code: "11485-0" },
            { system: "http://snomed.info/sct", code: "394589003" },
            { system: "unknown", code: "123456" }
        ], O.none)();

        expect(codings).to.have.length(4);

        assertEitherRightValueDeep(codings[0], { system: "http://loinc.org",       code: "11369-6",   version: "N/A", language: "en", resolvedDisplay: "History of Immunization" });
        assertEitherRightValueDeep(codings[1], { system: "http://loinc.org",       code: "11485-0",   version: "N/A", language: "en", resolvedDisplay: "Anesthesia records" });
        assertEitherRightValueDeep(codings[2], { system: "http://snomed.info/sct", code: "394589003", version: "N/A", language: "en", resolvedDisplay: "Nephrology" });
        assertEitherLeft(codings[3]);
    });

});
