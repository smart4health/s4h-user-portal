/* eslint-disable max-nested-callbacks */
import * as chai from "chai";
const expect = chai.expect;
const assert = chai.assert;

import { Errors } from "io-ts";
import * as E from "fp-ts/Either";
import { PathReporter } from "io-ts/PathReporter";

import { assertEitherRight, assertEitherRightValueDeep, consoleLogInspect, shouldDump } from "../../utils";
import { FHIR_Observation_A, FHIR_Observation_T, FHIR_Observation_value_T } from "../../../src/fhir-resources/diagnostics/observation";


describe("Observation suite", () => {

    describe("decode", () => {

        it("Value decode - 1", () => {
            const value = FHIR_Observation_value_T.decode({
                valueInteger: 1234
            });

            if (shouldDump()) {
                consoleLogInspect(value, 5);
            }

            assertEitherRightValueDeep(value, { valueInteger: 1234, _valueTag: "valueInteger" });
        });

        it("Value decode - 2", () => {
            const value = FHIR_Observation_value_T.decode({
                valueBoolean: true
            });

            if (shouldDump()) {
                consoleLogInspect(value, 5);
            }

            assertEitherRightValueDeep(value, { valueBoolean: true, _valueTag: "valueBoolean" });
        });

        it("Value decode - 3", () => {
            const value = FHIR_Observation_value_T.decode({
                valueBoolean: true,
                _valueTag: "valueBoolean"
            });

            if (shouldDump()) {
                consoleLogInspect(value, 5);
            }

            assertEitherRight(value);
        });

        it("Observation decode - 1", () => {
            const value: E.Either<Errors, FHIR_Observation_A> = FHIR_Observation_T.decode({
                "resourceType": "Observation",
                "id": "s4h-height-example-observation",
                "meta": {
                    "profile": [
                        "http://hl7.org/fhir/StructureDefinition/bodyheight"
                    ]
                },
                "status": "final",
                "category": [{
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "vital-signs",
                        "display": "Vital Signs"
                    }],
                    "text": "Vital Signs"
                }],
                "code": {
                    "coding": [{
                        "system": "http://loinc.org",
                        "code": "8302-2",
                        "display": "Body height"
                    }],
                    "text": "Body height"
                },
                "subject": {
                    "reference": "Patient/example"
                },
                "effectiveDateTime": "2019-07-02",
                "performer": [{
                    "reference": "Patient/example"
                }],
                "valueQuantity": {
                    "value": 68,
                    "unit": "in",
                    "system": "http://unitsofmeasure.org",
                    "code": "[in_i]"
                }
            });

            if (shouldDump()) {
                consoleLogInspect(value, 5);
                consoleLogInspect(PathReporter.report(value));
            }

            if (E.isLeft(value)) {
                assert.fail("should be right");
            } else {

                if (value.right._effectiveTag !== "effectiveDateTime") {
                    assert.fail("should have been an effectiveDateTime");
                } else {
                    expect(value.right.effectiveDateTime).to.eql({ kind: "YYYY-MM-DD", year: 2019, month: 7, day: 2 });
                }

                if (value.right._valueTag !== "valueQuantity") {
                    assert.fail("should have been valueQuantity");
                } else {
                    expect(value.right.valueQuantity).to.eql({ value: 68, unit: "in", system: "http://unitsofmeasure.org", code: "[in_i]" });
                }
            }
        });

    });

    describe("encode", () => {

        it("Value", () => {
            const out = FHIR_Observation_value_T.encode({
                valueString: "12",
                _valueTag: "valueString"
            });

            if (shouldDump()) {
                consoleLogInspect(out, 5);
            }

            expect(out).to.eql({ valueString: "12", _valueTag: undefined });
        });

        it("Observation encode", () => {
            const out = FHIR_Observation_T.encode({
                resourceType: "Observation",
                id: "foo",
                identifier: [],
                status: "amended",
                subject: {},

                _effectiveTag: "effectiveTiming",
                effectiveTiming: {
                    repeat: {
                        count: 1,
                        _boundsTag: "boundsPeriod",
                        boundsPeriod: {
                            start: { kind: "YYYY-MM-DD hh:mm:ssZ", year: 2020, month: 12, day: 4, hours: 11, minutes: 55, seconds: 1 }
                        }
                    }
                },

                _valueTag: "valueBoolean",
                valueBoolean: true,

                component: [{
                    code: { coding: [{ system: "foo", code: "bar" }] },
                    _valueTag: "valueRatio",
                    valueRatio: {
                        denominator: {
                            value: 1234,
                            unit: "cm"
                        },
                        numerator: {
                            value: 9999,
                            unit: "km"
                        }
                    }
                }]
            });

            if (shouldDump()) {
                consoleLogInspect(out, 5);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((out as any).effectiveTiming).to.eql({ repeat: { count: 1, boundsPeriod: { start: "2020-12-04T11:55:01Z" }, _boundsTag: undefined } });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((out as any).valueBoolean).to.be.true;

            expect(out.component[0]).to.eql({
                code: { coding: [{ system: "foo", code: "bar" }] },
                _valueTag: undefined,
                valueRatio: {
                    denominator: {
                        value: 1234,
                        unit: "cm"
                    },
                    numerator: {
                        value: 9999,
                        unit: "km"
                    }
                }
            });
        });
    });



    describe("is", () => {

        it("Value is - 1", () => {
            expect(FHIR_Observation_value_T.is({
                valueBoolean: true
            })).to.be.false;
        });

        it("Value is - 2", () => {
            expect(FHIR_Observation_value_T.is({
                valueBoolean: true,
                _valueTag: "valueBoolean"
            })).to.be.true;
        });
    });

});
