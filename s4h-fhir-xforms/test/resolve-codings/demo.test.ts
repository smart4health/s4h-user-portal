/* eslint-disable max-nested-callbacks */
import { assert, expect } from "chai";

import axios from "axios";
import { ValueSet } from "../../src/resolve-codings/value-sets/defs";
import { makeReadymadeValueSet } from "../../src/resolve-codings/value-sets/sequence/sequence";


describe("value set use case demo", () => {
    describe("known value set", () => {
        let valueSet: ValueSet;

        before(async () => {
            valueSet = await makeReadymadeValueSet({
                valueSetUrl: "http://fhir.smart4health.eu/ValueSet/s4h-standard-document-types",
                version: "0.1.0",
                language: "en",
                axios
            });
        });

        it("lookup a value set, w/o limit, w/o offset", async () => {
            try {
                const codings = await valueSet.lookup({});
                expect(codings).to.have.length(8);
            } catch (issues) {
                assert.fail("value set lookup failed: " + issues[0].message);
            }
        });

        it("lookup a value set, w/  limit, w/o offset", async () => {
            try {
                const codings = await valueSet.lookup({ limit: 5 });
                expect(codings).to.have.length(5);
            } catch (issues) {
                assert.fail("value set lookup failed: " + issues[0].message);
            }
        });

        it("lookup a value set, w/o limit, w/  offset", async () => {
            try {
                const codings = await valueSet.lookup({ offset: 6 });

                expect(codings).to.have.length(2);

                expect(codings[0]).to.eql({
                    system:  "http://loinc.org",
                    code:    "43468-8",
                    display: "Unspecified body region X-ray"
                });
                expect(codings[1]).to.eql({
                    system:  "http://loinc.org",
                    code:    "68629-5",
                    display: "Allergy and immunology Note"
                });

            } catch (issues) {
                assert.fail("value set lookup failed: " + issues[0].message);
            }
        });

        it("lookup a value set, w/  limit, w/  offset", async () => {
            try {
                const codings = await valueSet.lookup({ limit: 3, offset: 2 });

                expect(codings).to.have.length(3);

                expect(codings[0]).to.eql({
                    system:  "http://loinc.org",
                    code:    "25045-6",
                    display: "Unspecified body region CT"
                });
                expect(codings[1]).to.eql({
                    system:  "http://loinc.org",
                    code:    "25056-3",
                    display: "Unspecified body region MRI"
                });
                expect(codings[2]).to.eql({
                    system:  "http://loinc.org",
                    code:    "25071-2",
                    display: "Unspecified body region X-ray tomograph"
                });
            } catch (issues) {
                assert.fail("value set lookup failed: " + issues[0].message);
            }
        });
    });

    it("lookup unknown value set", async () => {
        // this will not fail
        const unknownValueSet = await makeReadymadeValueSet({
            valueSetUrl: "http://this/does/not/look/right",
            axios
        });

        try {
            // this will not fail either, but return []
            const codings = await unknownValueSet.lookup({});
            expect(codings).to.have.length(0);
        } catch (issues) {
            assert.fail("value set lookup failed: " + issues[0].message);
        }
    });

    describe("medical history value set retrieval", () => {

        it("blood groups", async () => {
            const valueSet = await makeReadymadeValueSet({
                valueSetUrl: "http://loinc.org/vs/LL2419-1",
                // omitting version and language is fine, selection strategy see:
                // src/resolve-codings/value-sets/logic.ts
                axios
            });

            const codings = await valueSet.lookup({ });

            expect(codings).to.have.length(4);

            expect(codings[0]).to.eql({ system:  "http://loinc.org", code: "LA19708-9", display: "Group O" });
            expect(codings[1]).to.eql({ system:  "http://loinc.org", code: "LA19709-7", display: "Group B" });
            expect(codings[2]).to.eql({ system:  "http://loinc.org", code: "LA19710-5", display: "Group A" });
            expect(codings[3]).to.eql({ system:  "http://loinc.org", code: "LA28449-9", display: "Group AB" });
        });

        it("rhesus factor", async () => {
            const valueSet = await makeReadymadeValueSet({
                valueSetUrl: "http://loinc.org/vs/LL360-9",
                axios
            });

            const codings = await valueSet.lookup({ });

            expect(codings).to.have.length(2);

            expect(codings[0]).to.eql({ system:  "http://loinc.org", code: "LA6576-8", display: "Positive" });
            expect(codings[1]).to.eql({ system:  "http://loinc.org", code: "LA6577-6", display: "Negative" });
        });

        it("administrative gender", async () => {
            const valueSet = await makeReadymadeValueSet({
                valueSetUrl: "http://hl7.org/fhir/ValueSet/administrative-gender",
                axios
            });

            const codings = await valueSet.lookup({ });

            expect(codings).to.have.length(4);

            expect(codings[0]).to.eql({ system: "http://hl7.org/fhir/administrative-gender", code: "female",  display: "Female" });
            expect(codings[1]).to.eql({ system: "http://hl7.org/fhir/administrative-gender", code: "male",    display: "Male" });
            expect(codings[2]).to.eql({ system: "http://hl7.org/fhir/administrative-gender", code: "other",   display: "Other" });
            expect(codings[3]).to.eql({ system: "http://hl7.org/fhir/administrative-gender", code: "unknown", display: "Unknown" });
        });
    });

});
