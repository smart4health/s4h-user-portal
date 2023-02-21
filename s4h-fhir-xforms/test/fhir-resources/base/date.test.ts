/* eslint-disable max-nested-callbacks */
import { FHIR_date_T } from "../../../src/fhir-resources/base/primitives";
import { assertEitherLeft, assertEitherRight, consoleLogInspect, shouldDump } from "../../utils";


describe("FHIR date suite", () => {

    describe("decode", () => {

        const BAD = [
            false,
            1.2,
            1234,
            null,
            undefined,
            {},
            [],
            new Date(),
            "",
            "2020-1-01",
            "999",
            "1980-15",
            "1980-00",
            "1980/05",
            "2019-02-29",
            "2020-02-30",
            "2020-02-00",
            " 2020-06-15",
            "2020/06/05"
        ];

        const GOOD = [
            "2020-01-01",
            "1900-12-31",
            "2020-01",
            "2020",
            "1499",
            "0499",
            "2020-02-29"
        ];

        describe("negative tests", () => {
            for (const input of BAD) {
                it("" + input, () => {
                    assertEitherLeft(FHIR_date_T.decode(input));
                });
            }
        });

        describe("positive tests", () => {
            for (const input of GOOD) {
                it("" + input, () => {
                    const result = FHIR_date_T.decode(input);
                    if (shouldDump()) {
                        consoleLogInspect(result);
                    }
                    assertEitherRight(result);
                });
            }
        });

    });

});
