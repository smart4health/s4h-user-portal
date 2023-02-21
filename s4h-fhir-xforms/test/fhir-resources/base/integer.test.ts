/* eslint-disable max-nested-callbacks */

import { FHIR_integer_T } from "../../../src/fhir-resources/base/primitives";
import { assertEitherLeft, assertEitherRightValue } from "../../utils";


describe("FHIR integer suite", () => {

    describe("decode", () => {

        describe("negative tests", () => {

            it("+Infinity", () => {
                assertEitherLeft(FHIR_integer_T.decode(+Infinity));
            });

            it("-Infinity", () => {
                assertEitherLeft(FHIR_integer_T.decode(-Infinity));
            });

            it("NaN", () => {
                assertEitherLeft(FHIR_integer_T.decode(NaN));
            });

            it("false", () => {
                assertEitherLeft(FHIR_integer_T.decode(false));
            });

            it("123.4", () => {
                assertEitherLeft(FHIR_integer_T.decode(123.4));
            });

            it("'string'", () => {
                assertEitherLeft(FHIR_integer_T.decode("string"));
            });

            it("'666'", () => {
                assertEitherLeft(FHIR_integer_T.decode("666"));
            });

            it("+2_147_483_648", () => {
                assertEitherLeft(FHIR_integer_T.decode(+2_147_483_648));
            });

        });

        describe("positive tests", () => {

            it("1234", () => {
                assertEitherRightValue(FHIR_integer_T.decode(1234), 1234);
            });

            it("+2_147_483_647", () => {
                assertEitherRightValue(FHIR_integer_T.decode(+2_147_483_647), +2_147_483_647);
            });

            it("1234.0", () => {
                assertEitherRightValue(FHIR_integer_T.decode(1234.0), 1234);
            });

            it("0", () => {
                assertEitherRightValue(FHIR_integer_T.decode(0), 0);
            });

            it("0.0", () => {
                assertEitherRightValue(FHIR_integer_T.decode(0.0), 0);
            });

            it("+0", () => {
                assertEitherRightValue(FHIR_integer_T.decode(+0), 0);
            });

            it("-0", () => {
                // toEqual distinguishes +0 and -0, so we have to be explicit here
                assertEitherRightValue(FHIR_integer_T.decode(-0), -0);
            });

        });

    });

});
