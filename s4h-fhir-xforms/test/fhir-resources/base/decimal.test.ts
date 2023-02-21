/* eslint-disable max-nested-callbacks */
import { FHIR_decimal_T } from "../../../src/fhir-resources/base/primitives";
import { assertEitherLeft, assertEitherRightValue } from "../../utils";


describe("FHIR decimal suite", () => {

    describe("decode", () => {

        describe("negative tests", () => {

            it("false", () => {
                assertEitherLeft(FHIR_decimal_T.decode(false));
            });

            it("'string'", () => {
                assertEitherLeft(FHIR_decimal_T.decode("string"));
            });

            it("'666.6'", () => {
                assertEitherLeft(FHIR_decimal_T.decode("666.6"));
            });

            it("+Infinity", () => {
                assertEitherLeft(FHIR_decimal_T.decode(+Infinity));
            });

            it("-Infinity", () => {
                assertEitherLeft(FHIR_decimal_T.decode(-Infinity));
            });

            it("NaN", () => {
                assertEitherLeft(FHIR_decimal_T.decode(NaN));
            });

        });

        describe("positive tests", () => {

            it("123.4", () => {
                assertEitherRightValue(FHIR_decimal_T.decode(123.4), 123.4);
            });

            it("1234", () => {
                assertEitherRightValue(FHIR_decimal_T.decode(1234), 1234);
            });

            it("1234.0", () => {
                assertEitherRightValue(FHIR_decimal_T.decode(1234.0), 1234);
            });

            it("PI", () => {
                assertEitherRightValue(FHIR_decimal_T.decode(Math.PI), Math.PI);
            });

            it("0", () => {
                assertEitherRightValue(FHIR_decimal_T.decode(0), 0);
            });

            it("0.0", () => {
                assertEitherRightValue(FHIR_decimal_T.decode(0.0), 0);
            });

            it("+0", () => {
                assertEitherRightValue(FHIR_decimal_T.decode(+0), 0);
            });

            it("-0", () => {
                // toEqual distinguishes +0 and -0, so we have to be explicit here
                assertEitherRightValue(FHIR_decimal_T.decode(-0), -0);
            });

            it("100000000000000000000000", () => {
                assertEitherRightValue(FHIR_decimal_T.decode(100000000000000000000000), 100000000000000000000000);
            });

            it("-42.1234e-10", () => {
                assertEitherRightValue(FHIR_decimal_T.decode(-42.1234e-10), -42.1234e-10);
            });

        });

    });

});
