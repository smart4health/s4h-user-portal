/* eslint-disable max-nested-callbacks */
import * as chai from "chai";
const expect = chai.expect;
const assert = chai.assert;


import { makeCannedValueSet } from "../../../src/resolve-codings/value-sets/canned/canned";


describe("value set: canned suite", () => {

    describe("lookup", () => {

        it("unknown value set", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "unknown" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(0);

            } catch (issues) {
                assert.fail("codings should be right, not: " + JSON.stringify(issues));
            }
        });

        it("lookup, no limit, no offset", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/document-classcodes" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(45);

            } catch (issues) {
                assert.fail("codings should be right, not: " + JSON.stringify(issues));
            }
        });

        it("lookup, negative limit, no offset", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/document-classcodes" });
            try {
                const codings = await vs.lookup({ limit: -1 });
                expect(codings).to.have.length(45);

            } catch (issues) {
                assert.fail("codings should be right, not: " + JSON.stringify(issues));
            }
        });

        it("lookup, with limit, no offset", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/document-classcodes" });
            try {
                const codings = await vs.lookup({ limit: 10 });
                expect(codings).to.have.length(10);

            } catch (issues) {
                assert.fail("codings should be right, not: " + JSON.stringify(issues));
            }
        });

        it("lookup, no limit, negative offset", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/document-classcodes" });
            try {
                await vs.lookup({ offset: -10 });
                assert.fail("should have failed");

            // eslint-disable-next-line no-empty
            } catch (issue) { }
        });

    });

    describe("check presence of canned value sets", () => {

        it("value set 'http://hl7.org/fhir/ValueSet/c80-practice-codes' is available (no language given)", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/c80-practice-codes" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(115);
                expect(codings[10].display).to.equal("Obstetrics and gynecology");

            } catch (issues) {
                assert.fail("value set not found");
            }
        });

        it("value set 'http://hl7.org/fhir/ValueSet/c80-practice-codes' is available in DE", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/c80-practice-codes", language: "de" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(115);
                expect(codings[10].display).to.equal("Gynäkologie und Geburtshilfe");

            } catch (issues) {
                assert.fail("value set not found");
            }
        });

        it("value set 'http://hl7.org/fhir/ValueSet/c80-practice-codes' is available in PT", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/c80-practice-codes", language: "pt" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(115);
                expect(codings[10].display).to.equal("Obstetrícia e ginecologia");

            } catch (issues) {
                assert.fail("value set not found");
            }
        });

        it("value set 'http://hl7.org/fhir/ValueSet/c80-practice-codes' is available in FR", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/c80-practice-codes", language: "fr" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(115);
                expect(codings[10].display).to.equal("Gynécologie-obstétrique");

            } catch (issues) {
                assert.fail("value set not found");
            }
        });

        it("value set 'http://hl7.org/fhir/ValueSet/c80-practice-codes' is available in IT", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/c80-practice-codes", language: "it" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(115);
                expect(codings[10].display).to.equal("Ostetricia e Ginecologia");

            } catch (issues) {
                assert.fail("value set not found");
            }
        });

        it("value set 'http://hl7.org/fhir/ValueSet/c80-practice-codes' is available in NL", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/c80-practice-codes", language: "nl" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(115);
                expect(codings[10].display).to.equal("Verloskunde en gynaecologie");

            } catch (issues) {
                assert.fail("value set not found");
            }
        });

        it("value set 'http://fhir.smart4health.eu/ValueSet/s4h-standard-document-types' is available", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://fhir.smart4health.eu/ValueSet/s4h-standard-document-types" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(8);

            } catch (issues) {
                assert.fail("value set not found");
            }
        });

        it("value set 'http://hl7.org/fhir/ValueSet/document-classcodes' is available", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/document-classcodes" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(45);

            } catch (issues) {
                assert.fail("value set not found");
            }
        });

        it("value set 'http://fhir.smart4health.eu/ValueSet/s4h-user-doc-types' / EN is available", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://fhir.smart4health.eu/ValueSet/s4h-user-doc-types" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(15);
                expect(codings[14].display).to.equal("X-ray image");

            } catch (issues) {
                assert.fail("value set not found");
            }
        });

        it("value set 'http://fhir.smart4health.eu/ValueSet/s4h-user-doc-types' / DE is available", async () => {
            const vs = await makeCannedValueSet({ valueSetUrl: "http://fhir.smart4health.eu/ValueSet/s4h-user-doc-types", language: "de" });
            try {
                const codings = await vs.lookup({});
                expect(codings).to.have.length(15);
                expect(codings[14].display).to.equal("Röntgenbild");

            } catch (issues) {
                assert.fail("value set not found");
            }
        });

    });

});
