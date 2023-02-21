/* eslint-disable max-nested-callbacks */
import * as chai from "chai";
const expect = chai.expect;

import { assertEitherLeft, assertEitherRightValueDeep } from "../../utils";
import { FHIR_CodeableConcept_T, eqIdentifier } from "../../../src/fhir-resources/base/general-special-purpose";
import { FHIR_base64Binary_T, FHIR_id_T } from "../../../src/fhir-resources/base/primitives";


describe("general-purpose suite", () => {

    describe("False comparisons", () => {
        it("1", () => {
            // In FHIR context, a value-less identifier is not meaningful, but in the sense of an
            // abstract datatype we need to handle the case.
            expect(eqIdentifier.equals({ system: "foo" }, { system: "bar" })).to.be.false;
        });

        it("2", () => {
            expect(eqIdentifier.equals({ value: "foo" }, { value: "bar" })).to.be.false;
        });

        it("3", () => {
            expect(eqIdentifier.equals({ value: "foo" }, { system: "bar" })).to.be.false;
        });

        it("4", () => {
            expect(eqIdentifier.equals({ }, { system: "bar" })).to.be.false;
        });

        it("5", () => {
            expect(eqIdentifier.equals({ }, { value: "bar" })).to.be.false;
        });

        it("6", () => {
            expect(eqIdentifier.equals({ value: "foo" }, { })).to.be.false;
        });

        it("7", () => {
            expect(eqIdentifier.equals({ system: "foo" }, { })).to.be.false;
        });

        it("8", () => {
            expect(eqIdentifier.equals({ system: null }, { })).to.be.false;
        });

        it("9", () => {
            expect(eqIdentifier.equals({ value: null }, { })).to.be.false;
        });

        it("10", () => {
            expect(eqIdentifier.equals({ system: "foo", value: "bar" }, { system: "foo", value: "xxx" })).to.be.false;
        });

        it("11", () => {
            expect(eqIdentifier.equals({ system: "foo", value: "bar" }, { system: "foo" })).to.be.false;
        });

        it("12", () => {
            expect(eqIdentifier.equals({ system: null, value: "bar" }, { value: "bar" })).to.be.false;
        });
    });

    describe("True comparisons", () => {
        it("1", () => {
            expect(eqIdentifier.equals({}, {})).to.be.true;
        });

        it("2", () => {
            expect(eqIdentifier.equals({ system: "foo" }, { system: "foo" })).to.be.true;
        });

        it("3", () => {
            expect(eqIdentifier.equals({ value: "foo" }, { value: "foo" })).to.be.true;
        });

        it("4", () => {
            expect(eqIdentifier.equals({ value: null }, { value: null })).to.be.true;
        });

        it("5", () => {
            expect(eqIdentifier.equals({ system: "foo", value: "bar" }, { system: "foo", value: "bar" })).to.be.true;
        });
    });

    describe("CodeableConcept", () => {
        it("bad cases", () => {
            assertEitherLeft(FHIR_CodeableConcept_T.decode({ }));
            assertEitherLeft(FHIR_CodeableConcept_T.decode({ foo: "bar" }));
            assertEitherLeft(FHIR_CodeableConcept_T.decode({ coding: undefined }));
            assertEitherLeft(FHIR_CodeableConcept_T.decode({ coding: null }));
            assertEitherLeft(FHIR_CodeableConcept_T.decode({ coding: {} }));
            assertEitherLeft(FHIR_CodeableConcept_T.decode({ coding: [{ system: 1234 }] }));
            assertEitherLeft(FHIR_CodeableConcept_T.decode({ text: undefined }));
            assertEitherLeft(FHIR_CodeableConcept_T.decode({ text: null }));
            assertEitherLeft(FHIR_CodeableConcept_T.decode({ text: {} }));
            assertEitherLeft(FHIR_CodeableConcept_T.decode({ text: [] }));
            assertEitherLeft(FHIR_CodeableConcept_T.decode({ text: 1234 }));
        });

        it("good cases", () => {
            assertEitherRightValueDeep(FHIR_CodeableConcept_T.decode({ text: "Hello" }), { text: "Hello" });
            assertEitherRightValueDeep(FHIR_CodeableConcept_T.decode({ text: "Hello", bla: "blubb" }), { text: "Hello" });
            assertEitherRightValueDeep(FHIR_CodeableConcept_T.decode({ coding: [{ system: "foo", code: "bar" }] }), { coding: [{ system: "foo", code: "bar" }] });
            assertEitherRightValueDeep(FHIR_CodeableConcept_T.decode({ text: "Hello", coding: [{ system: "foo", code: "bar" }] }), { text: "Hello", coding: [{ system: "foo", code: "bar" }] });
        });
    });

    describe("FHIR_id_T", () => {
        const BAD = [
            "",
            "%$$#@",
            "foo bar",
            "toooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo long",
            "http://fhir.org/123456"
        ];

        const GOOD = [
            "1234",
            "Foo-Bar",
            "X",
            "juuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuust-the-right-length"
        ];

        for (const bad of BAD) {
            it("bad ID: " + bad, () => {
                expect(FHIR_id_T.is(bad)).to.be.false;
            });
        }

        for (const good of GOOD) {
            it("good ID: " + good, () => {
                expect(FHIR_id_T.is(good)).to.be.true;
            });
        }
    });

    describe("FHIR_base64Binary_T", () => {
        const BAD = [
            "Foo===",
            "QQ QQ",
            "ABC$"
        ];
        const GOOD = [
            "",
            "MTIzNA==",
            "QQ=="
        ];

        for (const bad of BAD) {
            it("bad Base64: " + bad, () => {
                expect(FHIR_base64Binary_T.is(bad)).to.be.false;
            });
        }

        for (const good of GOOD) {
            it("good Base64: " + good, () => {
                expect(FHIR_base64Binary_T.is(good)).to.be.true;
            });
        }
    });

});
