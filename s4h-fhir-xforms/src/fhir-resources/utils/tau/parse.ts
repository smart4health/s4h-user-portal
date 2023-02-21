import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { sequenceT } from "fp-ts/Apply";
import { NonEmptyArray, getSemigroup } from "fp-ts/NonEmptyArray";

import { validateDate, validateFraction, validateHours, validateLeapSecond, validateMinutes, validateMonth, validateRange, validateSeconds, validateTimezone, validateYear } from "./validate";
import { TauDate, TauDateTime, TauInstant, TauTime, Tau_YYYY, Tau_YYYYMM, Tau_YYYYMMDD, Tau_YYYYMMDDhhmmssFTZ, Tau_YYYYMMDDhhmmssFZ, Tau_YYYYMMDDhhmmssTZ, Tau_YYYYMMDDhhmmssZ, Tau_hhmmss } from "./defs";


const validate = E.getApplicativeValidation(getSemigroup<string>());

export function parse_YYYY (s: string): E.Either<NonEmptyArray<string>, Tau_YYYY> {
    const pattern = /^\d\d\d\d$/;
    const matches = pattern.exec(s);

    if (matches === null) {
        return E.left([ "value does not match pattern YYYY: " + s ]);
    }

    const year = parseInt(s);

    return pipe(
        validateYear(year),
        E.map(() => ({ kind: "YYYY", year }))
    );
}

export function parse_YYYYMM (s: string): E.Either<NonEmptyArray<string>, Tau_YYYYMM> {
    const pattern = /^(\d\d\d\d)-(\d\d)$/;
    const matches = pattern.exec(s);

    if (matches === null) {
        return E.left([ "value does not match pattern YYYY-MM: " + s ]);
    }

    const year  = parseInt(matches[1]);
    const month = parseInt(matches[2]);

    return pipe(
        sequenceT(validate)(
            validateYear(year),
            validateMonth(month)
        ),
        E.map(() => ({ kind: "YYYY-MM", year, month }))
    );
}


export function parse_YYYYMMDD (s: string): E.Either<NonEmptyArray<string>, Tau_YYYYMMDD> {
    const pattern = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    const matches = pattern.exec(s);

    if (matches === null) {
        return E.left([ "value does not match pattern YYYY-MM-DD: " + s ]);
    }

    const year  = parseInt(matches[1]);
    const month = parseInt(matches[2]);
    const day   = parseInt(matches[3]);

    return pipe(
        sequenceT(validate)(
            validateYear(year),
            validateMonth(month),
            validateRange([ 1, 31 ], "day of month")(day),
            validateDate(year, month, day)
        ),
        E.map(() => ({ kind: "YYYY-MM-DD", year, month, day }))
    );
}

export function parse_YYYYMMDD_etc (s: string):
    E.Either<NonEmptyArray<string>, Tau_YYYYMMDDhhmmssZ | Tau_YYYYMMDDhhmmssFZ | Tau_YYYYMMDDhhmmssTZ | Tau_YYYYMMDDhhmmssFTZ> {

    //                  1          2      3      4      5      6          7      8
    const pattern = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d+))?(Z|(?:\+|-)\d\d:\d\d)$/;
    const matches = pattern.exec(s);

    if (matches === null) {
        return E.left([ "value does not match pattern 'YYYY-MM-DDThh:mm:ss[.F](Z|(+|-)hh:mm)': " + s ]);
    }

    const year     = parseInt(matches[1]);
    const month    = parseInt(matches[2]);
    const day      = parseInt(matches[3]);
    const hours    = parseInt(matches[4]);
    const minutes  = parseInt(matches[5]);
    const seconds  = parseInt(matches[6]);
    const fraction = parseInt(matches[7]); // can be NaN
    const timezone = matches[8];

    return pipe(
        sequenceT(validate)(
        /* 0 */ validateYear(year),
        /* 1 */ validateMonth(month),
        /* 2 */ validateRange([ 1, 31 ], "day of month")(day),
        /* 3 */ validateDate(year, month, day),
        /* 4 */ validateHours(hours),
        /* 5 */ validateMinutes(minutes),
        /* 6 */ validateSeconds(seconds),
        /* 7 */ validateLeapSecond(hours, minutes, seconds),
        /* 8 */ validateFraction(isNaN(fraction) ? 0 : fraction),
        /* 9 */ validateTimezone(timezone)
        ),
        E.map(valis => {
            if (timezone === "Z") {
                if (isNaN(fraction)) {
                    return {
                        kind: "YYYY-MM-DD hh:mm:ssZ",
                        year, month, day, hours, minutes, seconds
                    };
                } else {
                    return {
                        kind: "YYYY-MM-DD hh:mm:ss.FZ",
                        year, month, day, hours, minutes, seconds, fraction: { abs: fraction, mag: matches[7].length }
                    };
                }
            } else {
                if (isNaN(fraction)) {
                    return {
                        kind: "YYYY-MM-DD hh:mm:ss+TZ",
                        year, month, day, hours, minutes, seconds,
                        tzHours: valis[9][0], tzMinutes: valis[9][1]
                    };
                } else {
                    return {
                        kind: "YYYY-MM-DD hh:mm:ss.F+TZ",
                        year, month, day, hours, minutes, seconds,
                        fraction: { abs: fraction, mag: matches[7].length },
                        tzHours: valis[9][0], tzMinutes: valis[9][1]
                    };
                }
            }
        })
    );
}

export function parse_hhmmss (s: string): E.Either<NonEmptyArray<string>, Tau_hhmmss> {
    const pattern = /^(\d\d):(\d\d):(\d\d)$/;
    const matches = pattern.exec(s);

    if (matches === null) {
        return E.left([ "value does not match pattern 'hh:mm:ss': " + s ]);
    }

    const hours    = parseInt(matches[1]);
    const minutes  = parseInt(matches[2]);
    const seconds  = parseInt(matches[3]);

    return pipe(
        sequenceT(validate)(
            validateHours(hours),
            validateMinutes(minutes),
            validateSeconds(seconds),
            validateLeapSecond(hours, minutes, seconds)
        ),
        E.map(() => ({ kind: "hh:mm:ss", hours, minutes, seconds }))
    );
}

export function parseTauDateTime (s: unknown): E.Either<NonEmptyArray<string>, TauDateTime> {
    if (typeof s !== "string") {
        return E.left([ "argument is not a string, but a " + typeof s ]);
    }

    switch (s.length) {
        case  4: return parse_YYYY(s);
        case  7: return parse_YYYYMM(s);
        case 10: return parse_YYYYMMDD(s);
        default: return parse_YYYYMMDD_etc(s);
    }
}

export function parseTauDate (s: unknown): E.Either<NonEmptyArray<string>, TauDate> {
    if (typeof s !== "string") {
        return E.left([ "argument is not a string, but a " + typeof s ]);
    }

    switch (s.length) {
        case  4: return parse_YYYY(s);
        case  7: return parse_YYYYMM(s);
        case 10: return parse_YYYYMMDD(s);
    }

    return E.left([ "argument does not match Date pattern: " + s ]);
}

export function parseTauInstant (s: unknown): E.Either<NonEmptyArray<string>, TauInstant> {
    if (typeof s !== "string") {
        return E.left([ "argument is not a string, but a " + typeof s ]);
    }

    return parse_YYYYMMDD_etc(s);
}

export function parseTauTime (s: unknown): E.Either<NonEmptyArray<string>, TauTime> {
    if (typeof s !== "string") {
        return E.left([ "argument is not a string, but a " + typeof s ]);
    }

    return parse_hhmmss(s);
}

export function tauNowUTC (): TauDateTime {
    const now = new Date();
    return {
        kind:   "YYYY-MM-DD hh:mm:ssZ",
        year:    now.getUTCFullYear(),
        month:   now.getUTCMonth() + 1, // UTC month is 0..11
        day:     now.getUTCDay(),
        hours:   now.getUTCHours(),
        minutes: now.getUTCMinutes(),
        seconds: now.getUTCSeconds()
    };
}

export function tauInstantNowUTC (): TauInstant {
    const now = new Date();
    return {
        kind:   "YYYY-MM-DD hh:mm:ssZ",
        year:    now.getUTCFullYear(),
        month:   now.getUTCMonth() + 1, // UTC month is 0..11
        day:     now.getUTCDay(),
        hours:   now.getUTCHours(),
        minutes: now.getUTCMinutes(),
        seconds: now.getUTCSeconds()
    };
}
