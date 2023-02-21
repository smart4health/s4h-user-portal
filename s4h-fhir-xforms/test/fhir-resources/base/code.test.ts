/* eslint-disable max-nested-callbacks */
import { assertEitherLeft, assertEitherRightValue } from "../../utils";

import { FHIR_code_T } from "../../../src/fhir-resources/base/primitives";


describe("FHIR code suite", () => {

    describe("decode", () => {

        describe("negative tests", () => {

            it("undefined", () => {
                assertEitherLeft(FHIR_code_T.decode(undefined));
            });

            it("null", () => {
                assertEitherLeft(FHIR_code_T.decode(null));
            });

            it("{}", () => {
                assertEitherLeft(FHIR_code_T.decode({}));
            });

            it("false", () => {
                assertEitherLeft(FHIR_code_T.decode(false));
            });

            it("-Infinity", () => {
                assertEitherLeft(FHIR_code_T.decode(-Infinity));
            });

            it("NaN", () => {
                assertEitherLeft(FHIR_code_T.decode(NaN));
            });

            it("123.4", () => {
                assertEitherLeft(FHIR_code_T.decode(123.4));
            });

            it("0", () => {
                assertEitherLeft(FHIR_code_T.decode(0));
            });

            it("''", () => {
                assertEitherLeft(FHIR_code_T.decode(""));
            });

            it("' foo'", () => {
                assertEitherLeft(FHIR_code_T.decode(" foo"));
            });

            it("'bar'", () => {
                assertEitherLeft(FHIR_code_T.decode("bar "));
            });

            it("'foo  bar'", () => {
                assertEitherLeft(FHIR_code_T.decode("foo  bar"));
            });

            it("'this\\nis\\nnot\\na\\ncode'", () => {
                assertEitherLeft(FHIR_code_T.decode("this\nis\nnot\na\ncode"));
            });

        });

        describe("positive tests", () => {

            it("'foobar'", () => {
                assertEitherRightValue(FHIR_code_T.decode("foobar"), "foobar");
            });

            it("'foo bar'", () => {
                assertEitherRightValue(FHIR_code_T.decode("foo bar"), "foo bar");
            });

            it("'1234'", () => {
                assertEitherRightValue(FHIR_code_T.decode("1234"), "1234");
            });

            it("'foo--bar 123'", () => {
                assertEitherRightValue(FHIR_code_T.decode("foo--bar 123"), "foo--bar 123");
            });

            it("'this is an okay code'", () => {
                assertEitherRightValue(FHIR_code_T.decode("this is an okay code"), "this is an okay code");
            });

        });

    });

});
