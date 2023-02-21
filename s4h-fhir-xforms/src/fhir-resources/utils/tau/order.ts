import { Ord } from "fp-ts/Ord";
import * as O from  "fp-ts/Option";
import * as S from "fp-ts/Semigroup";

import { Period } from "../../base/boxed";

import { Fraction, TauDateTime, Tau_YYYY, Tau_YYYYMM, Tau_YYYYMMDD, Tau_YYYYMMDDhhmmssFTZ, Tau_YYYYMMDDhhmmssFZ, Tau_YYYYMMDDhhmmssTZ, Tau_YYYYMMDDhhmmssZ } from "./defs";


function fractionToMillis (fraction: Fraction): number {
    return (fraction.abs / Math.pow(10, fraction.mag - 3));
}

function Tau_YYYY_valueOf_floor (dt: Tau_YYYY): number {
    return Date.UTC(dt.year, 0, 1, 0, 0, 0, 0);
}

function Tau_YYYYMM_valueOf_floor (dt: Tau_YYYYMM): number {
    return Date.UTC(dt.year, dt.month - 1, 1, 0, 0, 0, 0);
}

function Tau_YYYYMMDD_valueOf_floor (dt: Tau_YYYYMMDD): number {
    return Date.UTC(dt.year, dt.month - 1, dt.day, 0, 0, 0, 0);
}

function Tau_YYYYMMDDhhmmssZ_valueOf_floor (dt: Tau_YYYYMMDDhhmmssZ): number {
    return Date.UTC(dt.year, dt.month - 1, dt.day, dt.hours, dt.minutes, dt.seconds, 0);
}

function Tau_YYYYMMDDhhmmssFZ_valueOf_floor (dt: Tau_YYYYMMDDhhmmssFZ): number {
    return Date.UTC(dt.year, dt.month - 1, dt.day, dt.hours, dt.minutes, dt.seconds, fractionToMillis(dt.fraction));
}

function timezoneOffsetMillis (tzHours: number, tzMinutes: number): number {
    return (tzHours * 60  +  Math.sign(tzHours) * tzMinutes) * 60 * 1000;
}

function Tau_YYYYMMDDhhmmssTZ_valueOf_floor (dt: Tau_YYYYMMDDhhmmssTZ): number {
    return Date.UTC(dt.year, dt.month - 1, dt.day, dt.hours, dt.minutes, dt.seconds, 0) - timezoneOffsetMillis(dt.tzHours, dt.tzMinutes);
}

function Tau_YYYYMMDDhhmmssFTZ_valueOf_floor (dt: Tau_YYYYMMDDhhmmssFTZ): number {
    return Date.UTC(dt.year, dt.month - 1, dt.day, dt.hours, dt.minutes, dt.seconds, fractionToMillis(dt.fraction)) - timezoneOffsetMillis(dt.tzHours, dt.tzMinutes);
}

export function Tau_valueOf_floor (dt: TauDateTime): number {
    switch (dt.kind) {
        case "YYYY":                       return Tau_YYYY_valueOf_floor(dt);
        case "YYYY-MM":                    return Tau_YYYYMM_valueOf_floor(dt);
        case "YYYY-MM-DD":                 return Tau_YYYYMMDD_valueOf_floor(dt);
        case "YYYY-MM-DD hh:mm:ssZ":       return Tau_YYYYMMDDhhmmssZ_valueOf_floor(dt);
        case "YYYY-MM-DD hh:mm:ss.FZ":     return Tau_YYYYMMDDhhmmssFZ_valueOf_floor(dt);
        case "YYYY-MM-DD hh:mm:ss+TZ":     return Tau_YYYYMMDDhhmmssTZ_valueOf_floor(dt);
        case "YYYY-MM-DD hh:mm:ss.F+TZ":   return Tau_YYYYMMDDhhmmssFTZ_valueOf_floor(dt);
    }
}

function isLeapYear (year: number): boolean {
    return (year % 400 === 0) || ( (year % 4 === 0) && (year % 100 !== 0) );
}

function Tau_YYYY_valueOf_ceil (dt: Tau_YYYY): number {
    return Date.UTC(dt.year, 11, 31, 23, 59, 59, 999);
}

function Tau_YYYYMM_valueOf_ceil (dt: Tau_YYYYMM): number {
    const DAYS_NORMAL = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    const DAYS_LEAP   = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    return Date.UTC(dt.year, dt.month - 1, isLeapYear(dt.year) ? DAYS_LEAP[dt.month - 1] : DAYS_NORMAL[dt.month - 1], 23, 59, 59, 999);
}

function Tau_YYYYMMDD_valueOf_ceil (dt: Tau_YYYYMMDD): number {
    return Date.UTC(dt.year, dt.month - 1, dt.day, 23, 59, 59, 999);
}

function Tau_YYYYMMDDhhmmssZ_valueOf_ceil (dt: Tau_YYYYMMDDhhmmssZ): number {
    return Date.UTC(dt.year, dt.month - 1, dt.day, dt.hours, dt.minutes, dt.seconds, 999);
}

function Tau_YYYYMMDDhhmmssFZ_valueOf_ceil (dt: Tau_YYYYMMDDhhmmssFZ): number {
    return Date.UTC(dt.year, dt.month - 1, dt.day, dt.hours, dt.minutes, dt.seconds, fractionToMillis(dt.fraction));
}

function Tau_YYYYMMDDhhmmssTZ_valueOf_ceil (dt: Tau_YYYYMMDDhhmmssTZ): number {
    return Date.UTC(dt.year, dt.month - 1, dt.day, dt.hours, dt.minutes, dt.seconds, 999) - timezoneOffsetMillis(dt.tzHours, dt.tzMinutes);
}

function Tau_YYYYMMDDhhmmssFTZ_valueOf_ceil (dt: Tau_YYYYMMDDhhmmssFTZ): number {
    return Date.UTC(dt.year, dt.month - 1, dt.day, dt.hours, dt.minutes, dt.seconds, fractionToMillis(dt.fraction)) - timezoneOffsetMillis(dt.tzHours, dt.tzMinutes);
}

export function Tau_valueOf_ceil (dt: TauDateTime): number {
    switch (dt.kind) {
        case "YYYY":                       return Tau_YYYY_valueOf_ceil(dt);
        case "YYYY-MM":                    return Tau_YYYYMM_valueOf_ceil(dt);
        case "YYYY-MM-DD":                 return Tau_YYYYMMDD_valueOf_ceil(dt);
        case "YYYY-MM-DD hh:mm:ssZ":       return Tau_YYYYMMDDhhmmssZ_valueOf_ceil(dt);
        case "YYYY-MM-DD hh:mm:ss.FZ":     return Tau_YYYYMMDDhhmmssFZ_valueOf_ceil(dt);
        case "YYYY-MM-DD hh:mm:ss+TZ":     return Tau_YYYYMMDDhhmmssTZ_valueOf_ceil(dt);
        case "YYYY-MM-DD hh:mm:ss.F+TZ":   return Tau_YYYYMMDDhhmmssFTZ_valueOf_ceil(dt);
    }
}


export const ordTauFloor: Ord<TauDateTime> = {
    equals (x: TauDateTime, y: TauDateTime) {
        return Tau_valueOf_floor(x) === Tau_valueOf_floor(y);
    },

    compare (x: TauDateTime, y: TauDateTime) {
        const vx = Tau_valueOf_floor(x);
        const vy = Tau_valueOf_floor(y);
        return vx < vy ? -1 : (vx > vy ? +1 : 0);
    }
};


export const minSafeTauCompare = S.fold(S.getMeetSemigroup(ordTauFloor));
export const maxSafeTauCompare = S.fold(S.getJoinSemigroup(ordTauFloor));

export function minAllOrNone (ds: TauDateTime[]): O.Option<TauDateTime> {
    if (ds.length === 0) {
        return O.none;
    } else {
        return O.some(minSafeTauCompare(ds[0], ds));
    }
}


export function maxAllOrNone (ds: TauDateTime[]): O.Option<TauDateTime> {
    if (ds.length === 0) {
        return O.none;
    } else {
        return O.some(maxSafeTauCompare(ds[0], ds));
    }
}


export const makeMedicationUsageOrd = (secondaryOrd?: Ord<Period>): Ord<Period> => ({
    equals (x, y) {
        return (x.period.min === y.period.min) && (x.period.max === y.period.max);
    },

    compare (x, y) {
        if (x.period.max > y.period.max) {
            return +1;
        }

        if (x.period.max === y.period.max) {
            if (x.period.min > y.period.min) {
                return +1;
            }
            if (x.period.min === y.period.min) {
                return secondaryOrd ? secondaryOrd.compare(x, y) : 0;
            }
            return -1;
        }

        return -1;
    }
});
