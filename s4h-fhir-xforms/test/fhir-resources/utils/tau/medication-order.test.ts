/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-nested-callbacks */
import { assert, expect } from "chai";

import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Ord as ordString } from "fp-ts/string";
import { Ord, fromCompare, reverse } from "fp-ts/Ord";

import { consoleLogInspect, shouldDump } from "../../../utils";
import { Period } from "../../../../src/fhir-resources/base/boxed";
import { parseTauDateTime } from "../../../../src/fhir-resources/utils/tau/parse";
import { Tau_valueOf_ceil, Tau_valueOf_floor, makeMedicationUsageOrd } from "../../../../src/fhir-resources/utils/tau";


type Stmt = Period & {
    id: string;
};

describe("medication usage order suite", () => {

    const secondaryOrd: Ord<Stmt> = reverse(fromCompare((a, b) => ordString.compare(a.id, b.id)));
    const primaryOrd:   Ord<Stmt> = reverse(makeMedicationUsageOrd(secondaryOrd as Ord<Period>));

    it("point events", () => {
        const stmts: Stmt[] = [
            { id: "A",  period: { min: 1, max: 1 } },
            { id: "B",  period: { min: 1, max: 1 } },
            { id: "C",  period: { min: 2, max: 2 } },
            { id: "D",  period: { min: 5, max: 5 } },
            { id: "E",  period: { min: 7, max: 7 } }
        ];


        const stmtsSorted = A.sort(primaryOrd)(stmts);
        const orderedIds = pipe(stmtsSorted, A.map(x => x.id));

        if (shouldDump()) {
            consoleLogInspect(stmtsSorted);
        }

        expect(orderedIds).to.eql([ "E", "D", "C", "A", "B" ]);
    });

    it("closed intervals", () => {
        const stmts: Stmt[] = [
            { id: "F",  period: { min: 1, max: 4 } },
            { id: "G",  period: { min: 1, max: 7 } },
            { id: "H",  period: { min: 1, max: 2 } },
            { id: "I",  period: { min: 2, max: 5 } },
            { id: "J",  period: { min: 5, max: 6 } },
            { id: "K",  period: { min: 7, max: 8 } }
        ];

        const stmtsSorted = A.sort(primaryOrd)(stmts);
        const orderedIds = pipe(stmtsSorted, A.map(x => x.id));

        if (shouldDump()) {
            consoleLogInspect(stmtsSorted);
        }

        expect(orderedIds).to.eql([  "K", "G", "J", "I", "F",  "H" ]);
    });

    it("closed intervals and point events", () => {
        const stmts: Stmt[] = [
            { id: "A",  period: { min: 1, max: 1 } },
            { id: "B",  period: { min: 1, max: 1 } },
            { id: "C",  period: { min: 2, max: 2 } },
            { id: "D",  period: { min: 5, max: 5 } },
            { id: "E",  period: { min: 7, max: 7 } },

            { id: "F",  period: { min: 1, max: 4 } },
            { id: "G",  period: { min: 1, max: 7 } },
            { id: "H",  period: { min: 1, max: 2 } },
            { id: "I",  period: { min: 2, max: 5 } },
            { id: "J",  period: { min: 5, max: 6 } },
            { id: "K",  period: { min: 7, max: 8 } }
        ];

        const stmtsSorted = A.sort(primaryOrd)(stmts);
        const orderedIds = pipe(stmtsSorted, A.map(x => x.id));

        if (shouldDump()) {
            consoleLogInspect(stmtsSorted);
        }

        expect(orderedIds).to.eql([  "K", "E", "G", "J", "D", "I", "F", "C", "H", "A", "B" ]);
    });

    it("open intervals", () => {
        const stmts: Stmt[] = [
            { id: "L",  period: { min: 2,         max: +Infinity } },
            { id: "M",  period: { min: 4.5,       max: +Infinity } },
            { id: "N",  period: { min: 8.5,       max: +Infinity } },
            { id: "O",  period: { min: -Infinity, max:  2 } },
            { id: "P",  period: { min: -Infinity, max:  4 } },
            { id: "Q",  period: { min: -Infinity, max: 10 } },
            { id: "R",  period: { min: -Infinity, max: +Infinity } }
        ];


        const stmtsSorted = A.sort(primaryOrd)(stmts);
        const orderedIds = pipe(stmtsSorted, A.map(x => x.id));

        if (shouldDump()) {
            consoleLogInspect(stmtsSorted);
        }

        expect(orderedIds).to.eql([ "N", "M", "L", "R", "Q", "P", "O" ]);
    });

    it("all mixed together", () => {
        const stmts: Stmt[] = [
            { id: "A",  period: { min: 1, max: 1 } },
            { id: "B",  period: { min: 1, max: 1 } },
            { id: "C",  period: { min: 2, max: 2 } },
            { id: "D",  period: { min: 5, max: 5 } },
            { id: "E",  period: { min: 7, max: 7 } },

            { id: "F",  period: { min: 1, max: 4 } },
            { id: "G",  period: { min: 1, max: 7 } },
            { id: "H",  period: { min: 1, max: 2 } },
            { id: "I",  period: { min: 2, max: 5 } },
            { id: "J",  period: { min: 5, max: 6 } },
            { id: "K",  period: { min: 7, max: 8 } },

            { id: "L",  period: { min: 2,         max: +Infinity } },
            { id: "M",  period: { min: 4.5,       max: +Infinity } },
            { id: "N",  period: { min: 8.5,       max: +Infinity } },
            { id: "O",  period: { min: -Infinity, max:  2 } },
            { id: "P",  period: { min: -Infinity, max:  4 } },
            { id: "Q",  period: { min: -Infinity, max: 10 } },
            { id: "R",  period: { min: -Infinity, max: +Infinity } }
        ];

        const stmtsSorted = A.sort(primaryOrd)(stmts);
        const orderedIds = pipe(stmtsSorted, A.map(x => x.id));

        if (shouldDump()) {
            consoleLogInspect(stmtsSorted);
        }

        expect(orderedIds).to.eql([ "N", "M", "L", "R", "Q", "K", "E", "G", "J", "D", "I", "F", "P", "C", "H", "O", "A", "B" ]);
    });

    describe("floor and ceil", () => {
        const cases = {
            "2000":                        { min: "2000-01-01T00:00:00.000Z", max: "2000-12-31T23:59:59.999Z" },

            "2000-02":                     { min: "2000-02-01T00:00:00.000Z", max: "2000-02-29T23:59:59.999Z" },
            "1900-02":                     { min: "1900-02-01T00:00:00.000Z", max: "1900-02-28T23:59:59.999Z" },
            "2020-02":                     { min: "2020-02-01T00:00:00.000Z", max: "2020-02-29T23:59:59.999Z" },
            "2021-02":                     { min: "2021-02-01T00:00:00.000Z", max: "2021-02-28T23:59:59.999Z" },

            "2021-04-19":                  { min: "2021-04-19T00:00:00.000Z", max: "2021-04-19T23:59:59.999Z" },
            "2021-12-31":                  { min: "2021-12-31T00:00:00.000Z", max: "2021-12-31T23:59:59.999Z" },

            "2021-02-20T12:34:56Z":        { min: "2021-02-20T12:34:56.000Z", max: "2021-02-20T12:34:56.999Z" },

            "2021-04-20T10:10:27.303Z":    { min: "2021-04-20T10:10:27.303Z", max: "2021-04-20T10:10:27.303Z" },

            "2021-02-20T12:34:56+03:00":   { min: "2021-02-20T09:34:56.000Z", max: "2021-02-20T09:34:56.999Z" },
            "2021-02-20T18:34:56-09:30":   { min: "2021-02-21T04:04:56.000Z", max: "2021-02-21T04:04:56.999Z" }
        };

        for (const s of Object.keys(cases)) {
            it(s, () => {
                const v = parseTauDateTime(s);
                if (E.isLeft(v)) {
                    assert.fail("expected right: " + v.left);
                } else {
                    expect(new Date(Tau_valueOf_floor(v.right)).toISOString()).to.eql(cases[s].min);
                    expect(new Date(Tau_valueOf_ceil( v.right)).toISOString()).to.eql(cases[s].max);
                }
            });
        }

    });

});
