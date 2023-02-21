import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { sequenceT } from "fp-ts/Apply";
import { Eq as eqString } from "fp-ts/string";
import { NonEmptyArray, getSemigroup } from "fp-ts/NonEmptyArray";

import { leftPadZero } from "../../../utils/common";

import { TauDate, TauDateTime, TauInstant, TauTime } from "./defs";


const validate = E.getApplicativeValidation(getSemigroup<string>());

const onlyProps = (props: string[]): (obj: unknown) => E.Either<NonEmptyArray<string>, unknown> => obj => {
    const X = A.uniq(eqString)(props);
    const Y = A.uniq(eqString)(Object.getOwnPropertyNames(obj)); // uniq technically not needed here

    if (X.length !== Y.length) {
        return E.left([ `number of properties is not equal: ${X.length} vs ${Y.length}` ]);
    }

    const diff = A.difference(eqString)(X)(Y); // Y \ X
    if (diff.length !== 0) {
        return E.left([ `too many properties: ${diff.join(", ")}` ] );
    }
    return E.right(obj);
};

export const validateRange = (range: [number, number], item: string): (n: number) => E.Either<NonEmptyArray<string>, number> => n => {
    if (n >= range[0] && n <= range[1]) {
        return E.right(n);
    } else {
        return E.left([ `${item} must be in range [${range[0]}; ${range[1]}], but got ${n}` ]);
    }
};

export function validateDate (year: number, month: number, day: number): E.Either<NonEmptyArray<string>, [number, number, number]> {
    const date = leftPadZero(4, year) + "-" + leftPadZero(2, month) + "-" + leftPadZero(2, day);
    const d = new Date(date);
    if (isNaN(d.valueOf())) {
        return E.left([ "parsing error for date: " + date ]);
    }
    if (d.toISOString().substr(0, 10) !== date) {
        return E.left([ "invalid date (check leap year): " + date ]);
    }
    return E.right([ year, month, day ]);
}

// TODO: Implement full leap second logic (including date)
export function validateLeapSecond (hours: number, minutes: number, seconds: number): E.Either<NonEmptyArray<string>, [number, number, number]> {
    if (seconds === 60) {
        if ((hours !== 23) || (minutes !== 59)) {
            return E.left([ "leap second only allowed as 23:59:60" ]);
        }
    }
    return E.right([ hours, minutes, seconds ]);
}

export function validateTimezone (timezone: string): E.Either<NonEmptyArray<string>, [number, number] > {
    const validate = E.getApplicativeValidation(getSemigroup<string>());

    if (timezone === "Z") {
        return E.right([ 0, 0 ]);
    }

    const tz = /^(\+|-)(\d\d):(\d\d)$/;
    const matches = tz.exec(timezone);

    if (matches === null) {
        return E.left([ "not a timezone: " + timezone ]);
    }

    const sign    = parseInt(matches[1] + "1");  // -1 or +1
    const hours   = parseInt(matches[2]);
    const minutes = parseInt(matches[3]);

    return pipe(
        sequenceT(validate)(
            validateRange([ -12, +14 ], "time zone hour offset")(hours),
            validateMinutes(minutes)
        ),
        E.map(() => [ sign * hours, minutes ])
    );
}



export const validateYear     = validateRange([ 1,  9999 ], "year");
export const validateMonth    = validateRange([ 1,    12 ], "month");
export const validateHours    = validateRange([ 0,    23 ], "hours");
export const validateMinutes  = validateRange([ 0,    59 ], "minutes");
export const validateSeconds  = validateRange([ 0,    60 ], "seconds"); // leap second
export const validateFraction = validateRange([ 0, +Infinity ], "fraction");

export function validateTauDateTime (tau: unknown): E.Either<NonEmptyArray<string>, TauDateTime> {
    if (typeof tau !== "object") {
        return E.left([ "value is not an object" ]);
    }

    return E.right(tau as TauDateTime);
}

export function validateTauDate (tau: unknown): E.Either<NonEmptyArray<string>, TauDate> {
    // eslint-disable-next-line eqeqeq
    if (tau == null) {
        return E.left([ "value is null or undefined" ]);
    }
    if (typeof tau !== "object") {
        return E.left([ "value is not an object" ]);
    }

    switch (tau["kind"]) {
        case "YYYY":
            return pipe(
                sequenceT(validate)(
                    validateYear(tau["year"]),
                    onlyProps([ "kind", "year" ])(tau)
                ),
                E.map(() => tau as TauDate)
            );

        case "YYYY-MM":
            return pipe(
                sequenceT(validate)(
                    validateYear(tau["year"]),
                    validateMonth(tau["month"]),
                    onlyProps([ "kind", "year", "month" ])(tau)
                ),
                E.map(() => tau as TauDate)
            );

        case "YYYY-MM-DD":
            return pipe(
                sequenceT(validate)(
                    validateYear(tau["year"]),
                    validateMonth(tau["month"]),
                    validateDate(tau["year"], tau["month"], tau["day"]),
                    onlyProps([ "kind", "year", "month", "day" ])(tau)
                ),
                E.map(() => tau as TauDate)
            );
    }

    return E.left([ "unknown date kind: " + tau["kind"] ]);
}

export function validateTauInstant (tau: unknown): E.Either<NonEmptyArray<string>, TauInstant> {
    if (typeof tau !== "object") {
        return E.left([ "value is not an object" ]);
    }

    return E.right(tau as TauInstant);
}

export function validateTauTime (tau: unknown): E.Either<NonEmptyArray<string>, TauTime> {
    if (typeof tau !== "object") {
        return E.left([ "value is not an object" ]);
    }

    return E.right(tau as TauTime);
}
