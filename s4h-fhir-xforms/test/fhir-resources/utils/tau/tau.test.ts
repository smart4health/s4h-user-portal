/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-nested-callbacks */
import { assert, expect } from "chai";

import * as E from "fp-ts/Either";

import { parseTauInstant } from "../../../../src/fhir-resources/utils/tau/parse";
import { validateTauDateTime, validateTauInstant } from "../../../../src/fhir-resources/utils/tau/validate";
import { TauDateTime_toString, TauInstant_toString } from "../../../../src/fhir-resources/utils/tau/to-string";
import { TauDate_toString, TauTime_toString, ordTau, parseTauDate, parseTauDateTime, parseTauTime, validateTauDate, validateTauTime } from "../../../../src/fhir-resources/utils/tau";


function txt (x: unknown): string {
    if (x === undefined) {
        return "undefined";
    }

    try {
        return JSON.stringify(x);
    } catch (error) {
        return "(could not serialize) " + x;
    }
}

describe("tau suite", () => {

    describe("date", () => {

        const goodCases = {
            "2020":       { kind: "YYYY",       year: 2020 },
            "0001":       { kind: "YYYY",       year:    1 },
            "1980":       { kind: "YYYY",       year: 1980 },
            "9999":       { kind: "YYYY",       year: 9999 },
            "2020-01":    { kind: "YYYY-MM",    year: 2020, month:  1 },
            "0001-12":    { kind: "YYYY-MM",    year:    1, month: 12 },
            "1980-10":    { kind: "YYYY-MM",    year: 1980, month: 10 },
            "2020-01-01": { kind: "YYYY-MM-DD", year: 2020, month:  1, day:  1 },
            "2020-02-28": { kind: "YYYY-MM-DD", year: 2020, month:  2, day: 28 },
            "2020-02-29": { kind: "YYYY-MM-DD", year: 2020, month:  2, day: 29 }
        };

        describe("parsing", () => {

            describe("positive tests", () => {
                for (const s of Object.keys(goodCases)) {
                    it("parse: " + s, () => {
                        expect((parseTauDate(s) as any).right).to.eql(goodCases[s]);
                    });
                }
            });

            describe("negative tests", () => {
                const badCases = [
                    undefined, null, {}, () => false, "", "    ", "\t1234",
                    "0000", "10000", "-999", "0",
                    "2020-13",
                    "2020-02-30",
                    "2019-02-29", // no leap year
                    "2020-10-00",
                    "2020-10-99",
                    "1980/10/01"
                ];
                for (const input of badCases) {
                    it("" + input, () => {
                        expect(parseTauDate(input)._tag).to.eql("Left");
                    });
                }
            });

        });

        describe("toString", () => {
            for (const s of Object.keys(goodCases)) {
                it("toString: " + s, () => {
                    expect(TauDate_toString(goodCases[s])).to.equal(s);
                });
            }
        });

        describe("validation", () => {

            describe("positive tests", () => {
                for (const s of Object.keys(goodCases)) {
                    it("validate: " + s, () => {
                        const x = validateTauDate(goodCases[s]);
                        expect(x._tag).to.equal("Right");
                        expect((x as any).right).to.eql(goodCases[s]);
                    });
                }
            });

            describe("negative tests", () => {
                const badCases = [
                    undefined, null, {}, () => false, "",
                    { kind: "foo" },
                    { kind: "YYYY" },
                    { kind: "YYYY", year: 10000 },
                    { kind: "YYYY-MM", year: 1000 },
                    { kind: "YYYY-MM", year: 1000, month: 13 },
                    { kind: "YYYY-MM", year: 1000, month: 12, day: 1 },
                    { kind: "YYYY-MM-DD", year: 2020, month:  2, day: 30 },
                    { kind: "YYYY-MM-DD", year: 2019, month:  2, day: 29 }

                ];
                for (const input of badCases) {
                    it("validate: " + txt(input), () => {
                        expect(validateTauDate(input)._tag).to.equal("Left");
                    });
                }
            });

        });

    }); // end: date

    describe("time", () => {

        const goodCases = {
            "00:00:00":   { kind: "hh:mm:ss",   hours:  0, minutes:  0, seconds:  0 },
            "12:34:56":   { kind: "hh:mm:ss",   hours: 12, minutes: 34, seconds: 56 },
            "23:59:59":   { kind: "hh:mm:ss",   hours: 23, minutes: 59, seconds: 59 },
            "23:59:60":   { kind: "hh:mm:ss",   hours: 23, minutes: 59, seconds: 60 }
        };

        describe("parsing", () => {

            describe("positive tests", () => {
                for (const s of Object.keys(goodCases)) {
                    it("parse: " + s, () => {
                        expect((parseTauTime(s) as any).right).to.eql(goodCases[s]);
                    });
                }
            });

            describe("negative tests", () => {
                const badCases = [
                    undefined, null, {}, () => false, "", "    ", "\t1234",
                    "00:00", "0",
                    "12h44",
                    "24:00",
                    "11:77:00",
                    "12:13:99",
                    "22:59:60", // only 23:59:60 is valid
                    "23:58:60"  // only 23:59:60 is valid
                ];

                for (const input of badCases) {
                    it("" + input, () => {
                        expect(parseTauTime(input)._tag).to.equal("Left");
                    });
                }
            });

        });

        describe("toString", () => {
            for (const s of Object.keys(goodCases)) {
                it("toString: " + s, () => {
                    expect(TauTime_toString(goodCases[s])).to.equal(s);
                });
            }
        });

        describe("validation", () => {
            for (const s of Object.keys(goodCases)) {
                it("validate: " + s, () => {
                    expect((validateTauTime(goodCases[s]) as any).right).to.eql(goodCases[s]);
                });
            }
        });

    }); // end: time


    describe("dateTime", () => {

        const goodCases = {
            "2020":                          { kind: "YYYY",                     year: 2020                                                                                                                          },
            "0001":                          { kind: "YYYY",                     year:    1                                                                                                                          },
            "1980":                          { kind: "YYYY",                     year: 1980                                                                                                                          },
            "9999":                          { kind: "YYYY",                     year: 9999                                                                                                                          },
            "2020-01":                       { kind: "YYYY-MM",                  year: 2020, month:  1                                                                                                               },
            "0001-12":                       { kind: "YYYY-MM",                  year:    1, month: 12                                                                                                               },
            "1980-10":                       { kind: "YYYY-MM",                  year: 1980, month: 10                                                                                                               },
            "2020-01-01":                    { kind: "YYYY-MM-DD",               year: 2020, month:  1, day:  1                                                                                                      },
            "2020-02-28":                    { kind: "YYYY-MM-DD",               year: 2020, month:  2, day: 28                                                                                                      },
            "2020-02-29":                    { kind: "YYYY-MM-DD",               year: 2020, month:  2, day: 29                                                                                                      },
            "2020-01-02T00:00:00Z":          { kind: "YYYY-MM-DD hh:mm:ssZ",     year: 2020, month:  1, day:  2, hours:  0, minutes:  0, seconds:  0                                                                 },
            "2020-02-29T00:00:00+00:00":     { kind: "YYYY-MM-DD hh:mm:ss+TZ",   year: 2020, month:  2, day: 29, hours:  0, minutes:  0, seconds:  0,                                    tzHours:   0, tzMinutes:  0 },
            "2020-10-11T12:34:56+01:02":     { kind: "YYYY-MM-DD hh:mm:ss+TZ",   year: 2020, month: 10, day: 11, hours: 12, minutes: 34, seconds: 56,                                    tzHours:   1, tzMinutes:  2 },
            "2020-10-11T12:34:56-01:02":     { kind: "YYYY-MM-DD hh:mm:ss+TZ",   year: 2020, month: 10, day: 11, hours: 12, minutes: 34, seconds: 56,                                    tzHours:  -1, tzMinutes:  2 },
            "2020-01-02T00:00:00.123Z":      { kind: "YYYY-MM-DD hh:mm:ss.FZ",   year: 2020, month:  1, day:  2, hours:  0, minutes:  0, seconds:  0, fraction: { abs: 123,    mag: 3 }                              },
            "2021-04-20T10:10:27.303678Z":   { kind: "YYYY-MM-DD hh:mm:ss.FZ",   year: 2021, month:  4, day: 20, hours: 10, minutes: 10, seconds: 27, fraction: { abs: 303678, mag: 6 }                              },
            "0001-01-02T23:59:13.5-01:02":   { kind: "YYYY-MM-DD hh:mm:ss.F+TZ", year:    1, month:  1, day:  2, hours: 23, minutes: 59, seconds: 13, fraction: { abs: 5,      mag: 1 }, tzHours:  -1, tzMinutes:  2 },
            "1000-01-02T23:59:60.666+10:30": { kind: "YYYY-MM-DD hh:mm:ss.F+TZ", year: 1000, month:  1, day:  2, hours: 23, minutes: 59, seconds: 60, fraction: { abs: 666,    mag: 3 }, tzHours:  10, tzMinutes: 30 },
            "1000-01-02T23:59:60.00+10:30":  { kind: "YYYY-MM-DD hh:mm:ss.F+TZ", year: 1000, month:  1, day:  2, hours: 23, minutes: 59, seconds: 60, fraction: { abs: 0,      mag: 2 }, tzHours:  10, tzMinutes: 30 }
        };

        describe("parsing", () => {

            describe("positive tests", () => {
                for (const s of Object.keys(goodCases)) {
                    it("parse: " + s, () => {
                        const v = parseTauDateTime(s);
                        if (E.isLeft(v)) {
                            assert.fail("expected right: " + v.left);
                        } else {
                            expect(v.right).to.eql(goodCases[s]);
                        }
                    });
                }
            });

            describe("negative tests", () => {
                const badCases = [
                    undefined, null, {}, () => false, "", "    ", "\t1234",
                    "00:00", "0",
                    "2020-",
                    "2020-13",
                    "2020-02-30",
                    "2019-02-29", // no leap year
                    "2020-10-00",
                    "2020-10-99",
                    "1980/10/01",
                    "2020-01-10T12:00Z",
                    "2020-02-30T12:00:00Z",
                    "2019-02-29T12:00:00Z",
                    "2019-02-29T12:00:00AB",
                    "2000-01-01T22:59:60Z",  // only 23:59:60 is valid
                    "2000-01-01T23:58:60Z",  // only 23:59:60 is valid
                    "2020-10-11T12:34:56/01:02",
                    "2020-10-11T12:34:56+18:00",
                    "2020-10-11T12:34:56-15:00",
                    "2020-10-11T12:34:56+00:60",
                    "2020-10-11T12:34:56+00:99",
                    "2020-10-11T12:34:56.-99Z"
                ];

                for (const input of badCases) {
                    it("" + input, () => {
                        expect(parseTauDateTime(input)._tag).to.equal("Left");
                    });
                }
            });

        });

        describe("toString", () => {
            for (const s of Object.keys(goodCases)) {
                it("toString: " + s, () => {
                    expect(TauDateTime_toString(goodCases[s])).to.equal(s);
                });
            }
        });

        describe("validation", () => {
            for (const s of Object.keys(goodCases)) {
                it("validate: " + s, () => {
                    expect((validateTauDateTime(goodCases[s]) as any).right).to.eql(goodCases[s]);
                });
            }
        });

    }); // end: dateTime

    describe("instant", () => {

        const goodCases = {
            "2020-01-02T00:00:00Z":             { kind: "YYYY-MM-DD hh:mm:ssZ",     year: 2020, month:  1, day:  2, hours:  0, minutes:  0, seconds:  0                                                                 },
            "2020-02-29T00:00:00+00:00":        { kind: "YYYY-MM-DD hh:mm:ss+TZ",   year: 2020, month:  2, day: 29, hours:  0, minutes:  0, seconds:  0,                                    tzHours:   0, tzMinutes:  0 },
            "2020-10-11T12:34:56+01:02":        { kind: "YYYY-MM-DD hh:mm:ss+TZ",   year: 2020, month: 10, day: 11, hours: 12, minutes: 34, seconds: 56,                                    tzHours:   1, tzMinutes:  2 },
            "2020-10-11T12:34:56-01:02":        { kind: "YYYY-MM-DD hh:mm:ss+TZ",   year: 2020, month: 10, day: 11, hours: 12, minutes: 34, seconds: 56,                                    tzHours:  -1, tzMinutes:  2 },
            "2020-01-02T00:00:00.123Z":         { kind: "YYYY-MM-DD hh:mm:ss.FZ",   year: 2020, month:  1, day:  2, hours:  0, minutes:  0, seconds:  0, fraction: { abs: 123,    mag: 3 }                              },
            "0001-01-02T23:59:13.5-01:02":      { kind: "YYYY-MM-DD hh:mm:ss.F+TZ", year:    1, month:  1, day:  2, hours: 23, minutes: 59, seconds: 13, fraction: { abs: 5,      mag: 1 }, tzHours:  -1, tzMinutes:  2 },
            "1000-01-02T23:59:60.666666+10:30": { kind: "YYYY-MM-DD hh:mm:ss.F+TZ", year: 1000, month:  1, day:  2, hours: 23, minutes: 59, seconds: 60, fraction: { abs: 666666, mag: 6 }, tzHours:  10, tzMinutes: 30 }
        };

        describe("parsing", () => {

            describe("positive tests", () => {
                for (const s of Object.keys(goodCases)) {
                    it("parse: " + s, () => {
                        const v = parseTauInstant(s);
                        if (E.isLeft(v)) {
                            assert.fail("expected right: " + v.left);
                        } else {
                            expect(v.right).to.eql(goodCases[s]);
                        }
                    });
                }
            });

            describe("negative tests", () => {
                const badCases = [
                    undefined, null, {}, () => false, "", "    ", "\t1234",
                    "00:00", "0",
                    "2020-",
                    "2020-13",
                    "2020-02-30",
                    "2019-02-29", // no leap year
                    "2020-10-00",
                    "2020-10-99",
                    "1980/10/01",
                    "2020",
                    "0001",
                    "1980",
                    "9999",
                    "2020-01",
                    "0001-12",
                    "1980-10",
                    "2020-01-01",
                    "2020-02-28",
                    "2020-02-29",
                    "2020-01-10T12:00Z",
                    "2020-02-30T12:00:00Z",
                    "2019-02-29T12:00:00Z",
                    "2019-02-29T12:00:00AB",
                    "2000-01-01T22:59:60Z",  // only 23:59:60 is valid
                    "2000-01-01T23:58:60Z",  // only 23:59:60 is valid
                    "2020-10-11T12:34:56/01:02",
                    "2020-10-11T12:34:56+18:00",
                    "2020-10-11T12:34:56-15:00",
                    "2020-10-11T12:34:56+00:60",
                    "2020-10-11T12:34:56+00:99",
                    "2020-10-11T12:34:56.-99Z"
                ];

                for (const input of badCases) {
                    it("" + input, () => {
                        expect(parseTauInstant(input)._tag).to.equal("Left");
                    });
                }
            });

        });

        describe("toString", () => {
            for (const s of Object.keys(goodCases)) {
                it("toString: " + s, () => {
                    expect(TauInstant_toString(goodCases[s])).to.equal(s);
                });
            }
        });

        describe("validation", () => {
            for (const s of Object.keys(goodCases)) {
                it("validate: " + s, () => {
                    expect((validateTauInstant(goodCases[s]) as any).right).to.eql(goodCases[s]);
                });
            }
        });

    }); // end: instant

    describe("ordTau", () => {

        describe("floor", () => {
            it("", () => {
                expect(ordTau.compare({
                    kind: "YYYY", year: 2020
                }, {
                    kind: "YYYY", year: 2020
                })).to.equal(0);
            });

            it("", () => {
                expect(ordTau.compare({
                    kind: "YYYY-MM-DD", year: 2020, month: 6, day: 10
                }, {
                    kind: "YYYY-MM-DD hh:mm:ssZ", year: 2020, month: 6, day: 10, hours: 0, minutes: 0, seconds: 0
                })).to.equal(0);
            });

            it("", () => {
                expect(ordTau.compare({
                    kind: "YYYY", year: 2019
                }, {
                    kind: "YYYY", year: 2020
                })).to.equal(-1);
            });

            it("", () => {
                expect(ordTau.compare({
                    kind: "YYYY-MM-DD", year: 2019, month: 10, day: 1
                }, {
                    kind: "YYYY-MM-DD", year: 2019, month: 10, day: 10
                })).to.equal(-1);
            });

        });

    });

});
