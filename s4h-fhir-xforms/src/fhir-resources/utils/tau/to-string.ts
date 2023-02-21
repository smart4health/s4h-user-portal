import { leftPadZero } from "../../../utils/common";

import { TauDate, TauDateTime, TauInstant, Tau_YYYY, Tau_YYYYMM, Tau_YYYYMMDD, Tau_YYYYMMDDhhmmssFTZ, Tau_YYYYMMDDhhmmssFZ, Tau_YYYYMMDDhhmmssTZ, Tau_YYYYMMDDhhmmssZ, Tau_hhmmss } from "./defs";


function Tau_YYYY_toString (dt: Tau_YYYY): string {
    return leftPadZero(4, dt.year);
}

function Tau_YYYYMM_toString (dt: Tau_YYYYMM): string {
    return leftPadZero(4, dt.year) + "-" + leftPadZero(2, dt.month);
}

function Tau_YYYYMMDD_toString (dt: Tau_YYYYMMDD): string {
    return leftPadZero(4, dt.year) + "-" + leftPadZero(2, dt.month) + "-" + leftPadZero(2, dt.day);
}

function Tau_YYYYMMDDhhmmssZ_toString (dt: Tau_YYYYMMDDhhmmssZ): string {
    return leftPadZero(4, dt.year)  + "-" + leftPadZero(2, dt.month)   + "-" + leftPadZero(2, dt.day)     + "T" +
           leftPadZero(2, dt.hours) + ":" + leftPadZero(2, dt.minutes) + ":" + leftPadZero(2, dt.seconds) + "Z";
}

function Tau_YYYYMMDDhhmmssFZ_toString (dt: Tau_YYYYMMDDhhmmssFZ): string {
    return leftPadZero(4, dt.year)  + "-" + leftPadZero(2, dt.month)   + "-" + leftPadZero(2, dt.day)     + "T" +
           leftPadZero(2, dt.hours) + ":" + leftPadZero(2, dt.minutes) + ":" + leftPadZero(2, dt.seconds) + "." + leftPadZero(dt.fraction.mag, dt.fraction.abs) + "Z";
}

function Tau_YYYYMMDDhhmmssTZ_toString (dt: Tau_YYYYMMDDhhmmssTZ): string {
    return leftPadZero(4, dt.year)  + "-" + leftPadZero(2, dt.month)   + "-" + leftPadZero(2, dt.day)     + "T" +
           leftPadZero(2, dt.hours) + ":" + leftPadZero(2, dt.minutes) + ":" + leftPadZero(2, dt.seconds) +
           (dt.tzHours < 0 ? "-" : "+") + leftPadZero(2, Math.abs(dt.tzHours)) + ":" + leftPadZero(2, dt.tzMinutes);
}

function Tau_YYYYMMDDhhmmssFTZ_toString (dt: Tau_YYYYMMDDhhmmssFTZ): string {
    return leftPadZero(4, dt.year)  + "-" + leftPadZero(2, dt.month)   + "-" + leftPadZero(2, dt.day)     + "T" +
           leftPadZero(2, dt.hours) + ":" + leftPadZero(2, dt.minutes) + ":" + leftPadZero(2, dt.seconds) + "." + leftPadZero(dt.fraction.mag, dt.fraction.abs) +
           (dt.tzHours < 0 ? "-" : "+") + leftPadZero(2, Math.abs(dt.tzHours)) + ":" + leftPadZero(2, dt.tzMinutes);
}

function Tau_hhmmss_toString (dt: Tau_hhmmss): string {
    return leftPadZero(2, dt.hours) + ":" + leftPadZero(2, dt.minutes) + ":" + leftPadZero(2, dt.seconds);
}

export function TauDateTime_toString (dt: TauDateTime): string {
    switch (dt.kind) {
        case "YYYY":                       return Tau_YYYY_toString(dt);
        case "YYYY-MM":                    return Tau_YYYYMM_toString(dt);
        case "YYYY-MM-DD":                 return Tau_YYYYMMDD_toString(dt);
        case "YYYY-MM-DD hh:mm:ssZ":       return Tau_YYYYMMDDhhmmssZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss.FZ":     return Tau_YYYYMMDDhhmmssFZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss+TZ":     return Tau_YYYYMMDDhhmmssTZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss.F+TZ":   return Tau_YYYYMMDDhhmmssFTZ_toString(dt);
    }

    // The above `kind` switch is exhaustive and thus we should not get here.
    // However, in case this function is ever misused, we return a string which is easy to find and debug.
    return `<unknown tau dateTime: ${dt}>`;
}

export function TauDate_toString (dt: TauDate): string {
    switch (dt.kind) {
        case "YYYY":                       return Tau_YYYY_toString(dt);
        case "YYYY-MM":                    return Tau_YYYYMM_toString(dt);
        case "YYYY-MM-DD":                 return Tau_YYYYMMDD_toString(dt);
    }

    // The above `kind` switch is exhaustive and thus we should not get here.
    // However, in case this function is ever misused, we return a string which is easy to find and debug.
    return `<unknown tau date: ${dt}>`;
}

export function TauInstant_toString (dt: TauInstant): string {
    switch (dt.kind) {
        case "YYYY-MM-DD hh:mm:ssZ":       return Tau_YYYYMMDDhhmmssZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss.FZ":     return Tau_YYYYMMDDhhmmssFZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss+TZ":     return Tau_YYYYMMDDhhmmssTZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss.F+TZ":   return Tau_YYYYMMDDhhmmssFTZ_toString(dt);
    }

    // The above `kind` switch is exhaustive and thus we should not get here.
    // However, in case this function is ever misused, we return a string which is easy to find and debug.
    return `<unknown tau instant: ${dt}>`;
}

export const TauTime_toString = Tau_hhmmss_toString;
