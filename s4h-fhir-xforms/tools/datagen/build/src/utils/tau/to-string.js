"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TauTime_toString = exports.TauInstant_toString = exports.TauDate_toString = exports.TauDateTime_toString = void 0;
const common_1 = require("../common");
function Tau_YYYY_toString(dt) {
    return common_1.leftPadZero(4, dt.year);
}
function Tau_YYYYMM_toString(dt) {
    return common_1.leftPadZero(4, dt.year) + "-" + common_1.leftPadZero(2, dt.month);
}
function Tau_YYYYMMDD_toString(dt) {
    return common_1.leftPadZero(4, dt.year) + "-" + common_1.leftPadZero(2, dt.month) + "-" + common_1.leftPadZero(2, dt.day);
}
function Tau_YYYYMMDDhhmmssZ_toString(dt) {
    return common_1.leftPadZero(4, dt.year) + "-" + common_1.leftPadZero(2, dt.month) + "-" + common_1.leftPadZero(2, dt.day) + "T" +
        common_1.leftPadZero(2, dt.hours) + ":" + common_1.leftPadZero(2, dt.minutes) + ":" + common_1.leftPadZero(2, dt.seconds) + "Z";
}
function Tau_YYYYMMDDhhmmssSSSZ_toString(dt) {
    return common_1.leftPadZero(4, dt.year) + "-" + common_1.leftPadZero(2, dt.month) + "-" + common_1.leftPadZero(2, dt.day) + "T" +
        common_1.leftPadZero(2, dt.hours) + ":" + common_1.leftPadZero(2, dt.minutes) + ":" + common_1.leftPadZero(2, dt.seconds) + "." + common_1.leftPadZero(3, dt.millis) + "Z";
}
function Tau_YYYYMMDDhhmmssTZ_toString(dt) {
    return common_1.leftPadZero(4, dt.year) + "-" + common_1.leftPadZero(2, dt.month) + "-" + common_1.leftPadZero(2, dt.day) + "T" +
        common_1.leftPadZero(2, dt.hours) + ":" + common_1.leftPadZero(2, dt.minutes) + ":" + common_1.leftPadZero(2, dt.seconds) +
        (dt.tzHours < 0 ? "-" : "+") + common_1.leftPadZero(2, Math.abs(dt.tzHours)) + ":" + common_1.leftPadZero(2, dt.tzMinutes);
}
function Tau_YYYYMMDDhhmmssSSSTZ_toString(dt) {
    return common_1.leftPadZero(4, dt.year) + "-" + common_1.leftPadZero(2, dt.month) + "-" + common_1.leftPadZero(2, dt.day) + "T" +
        common_1.leftPadZero(2, dt.hours) + ":" + common_1.leftPadZero(2, dt.minutes) + ":" + common_1.leftPadZero(2, dt.seconds) + "." + common_1.leftPadZero(3, dt.millis) +
        (dt.tzHours < 0 ? "-" : "+") + common_1.leftPadZero(2, Math.abs(dt.tzHours)) + ":" + common_1.leftPadZero(2, dt.tzMinutes);
}
function Tau_hhmmss_toString(dt) {
    return common_1.leftPadZero(2, dt.hours) + ":" + common_1.leftPadZero(2, dt.minutes) + ":" + common_1.leftPadZero(2, dt.seconds);
}
function TauDateTime_toString(dt) {
    switch (dt.kind) {
        case "YYYY": return Tau_YYYY_toString(dt);
        case "YYYY-MM": return Tau_YYYYMM_toString(dt);
        case "YYYY-MM-DD": return Tau_YYYYMMDD_toString(dt);
        case "YYYY-MM-DD hh:mm:ssZ": return Tau_YYYYMMDDhhmmssZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss.SSSZ": return Tau_YYYYMMDDhhmmssSSSZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss+TZ": return Tau_YYYYMMDDhhmmssTZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss.SSS+TZ": return Tau_YYYYMMDDhhmmssSSSTZ_toString(dt);
    }
    // The above `kind` switch is exhaustive and thus we should not get here.
    // However, in case this function is ever misused, we return a string which is easy to find and debug.
    return `<unknown tau dateTime: ${dt}>`;
}
exports.TauDateTime_toString = TauDateTime_toString;
function TauDate_toString(dt) {
    switch (dt.kind) {
        case "YYYY": return Tau_YYYY_toString(dt);
        case "YYYY-MM": return Tau_YYYYMM_toString(dt);
        case "YYYY-MM-DD": return Tau_YYYYMMDD_toString(dt);
    }
    // The above `kind` switch is exhaustive and thus we should not get here.
    // However, in case this function is ever misused, we return a string which is easy to find and debug.
    return `<unknown tau date: ${dt}>`;
}
exports.TauDate_toString = TauDate_toString;
function TauInstant_toString(dt) {
    switch (dt.kind) {
        case "YYYY-MM-DD hh:mm:ssZ": return Tau_YYYYMMDDhhmmssZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss.SSSZ": return Tau_YYYYMMDDhhmmssSSSZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss+TZ": return Tau_YYYYMMDDhhmmssTZ_toString(dt);
        case "YYYY-MM-DD hh:mm:ss.SSS+TZ": return Tau_YYYYMMDDhhmmssSSSTZ_toString(dt);
    }
    // The above `kind` switch is exhaustive and thus we should not get here.
    // However, in case this function is ever misused, we return a string which is easy to find and debug.
    return `<unknown tau instant: ${dt}>`;
}
exports.TauInstant_toString = TauInstant_toString;
exports.TauTime_toString = Tau_hhmmss_toString;
