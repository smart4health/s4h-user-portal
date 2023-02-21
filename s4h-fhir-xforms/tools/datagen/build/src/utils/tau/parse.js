"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tauNowUTC = exports.parseTauTime = exports.parseTauInstant = exports.parseTauDate = exports.parseTauDateTime = exports.parse_hhmmss = exports.parse_YYYYMMDD_etc = exports.parse_YYYYMMDD = exports.parse_YYYYMM = exports.parse_YYYY = void 0;
const E = __importStar(require("fp-ts/Either"));
const function_1 = require("fp-ts/function");
const Apply_1 = require("fp-ts/Apply");
const NonEmptyArray_1 = require("fp-ts/NonEmptyArray");
const validate_1 = require("./validate");
const validate = E.getValidation(NonEmptyArray_1.getSemigroup());
function parse_YYYY(s) {
    const pattern = /^\d\d\d\d$/;
    const matches = pattern.exec(s);
    if (matches === null) {
        return E.left(["value does not match pattern YYYY: " + s]);
    }
    const year = parseInt(s);
    return function_1.pipe(validate_1.validateYear(year), E.map(() => ({ kind: "YYYY", year })));
}
exports.parse_YYYY = parse_YYYY;
function parse_YYYYMM(s) {
    const pattern = /^(\d\d\d\d)-(\d\d)$/;
    const matches = pattern.exec(s);
    if (matches === null) {
        return E.left(["value does not match pattern YYYY-MM: " + s]);
    }
    const year = parseInt(matches[1]);
    const month = parseInt(matches[2]);
    return function_1.pipe(Apply_1.sequenceT(validate)(validate_1.validateYear(year), validate_1.validateMonth(month)), E.map(() => ({ kind: "YYYY-MM", year, month })));
}
exports.parse_YYYYMM = parse_YYYYMM;
function parse_YYYYMMDD(s) {
    const pattern = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    const matches = pattern.exec(s);
    if (matches === null) {
        return E.left(["value does not match pattern YYYY-MM-DD: " + s]);
    }
    const year = parseInt(matches[1]);
    const month = parseInt(matches[2]);
    const day = parseInt(matches[3]);
    return function_1.pipe(Apply_1.sequenceT(validate)(validate_1.validateYear(year), validate_1.validateMonth(month), validate_1.validateRange([1, 31], "day of month")(day), validate_1.validateDate(year, month, day)), E.map(() => ({ kind: "YYYY-MM-DD", year, month, day })));
}
exports.parse_YYYYMMDD = parse_YYYYMMDD;
function parse_YYYYMMDD_etc(s) {
    //                  1          2      3      4      5      6          7         8
    const pattern = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d\d\d))?(Z|(?:\+|-)\d\d:\d\d)$/;
    const matches = pattern.exec(s);
    if (matches === null) {
        return E.left(["value does not match pattern 'YYYY-MM-DDThh:mm:ss[.SSS](Z|(+|-)hh:mm)': " + s]);
    }
    const year = parseInt(matches[1]);
    const month = parseInt(matches[2]);
    const day = parseInt(matches[3]);
    const hours = parseInt(matches[4]);
    const minutes = parseInt(matches[5]);
    const seconds = parseInt(matches[6]);
    const millis = parseInt(matches[7]); // can be NaN
    const timezone = matches[8];
    return function_1.pipe(Apply_1.sequenceT(validate)(
    /* 0 */ validate_1.validateYear(year), 
    /* 1 */ validate_1.validateMonth(month), 
    /* 2 */ validate_1.validateRange([1, 31], "day of month")(day), 
    /* 3 */ validate_1.validateDate(year, month, day), 
    /* 4 */ validate_1.validateHours(hours), 
    /* 5 */ validate_1.validateMinutes(minutes), 
    /* 6 */ validate_1.validateSeconds(seconds), 
    /* 7 */ validate_1.validateLeapSecond(hours, minutes, seconds), 
    /* 8 */ validate_1.validateMillis(isNaN(millis) ? 0 : millis), 
    /* 9 */ validate_1.validateTimezone(timezone)), E.map(valis => {
        if (timezone === "Z") {
            if (isNaN(millis)) {
                return {
                    kind: "YYYY-MM-DD hh:mm:ssZ", year, month, day, hours, minutes, seconds
                };
            }
            else {
                return {
                    kind: "YYYY-MM-DD hh:mm:ss.SSSZ",
                    year, month, day, hours, minutes, seconds, millis
                };
            }
        }
        else {
            if (isNaN(millis)) {
                return {
                    kind: "YYYY-MM-DD hh:mm:ss+TZ",
                    year, month, day, hours, minutes, seconds, tzHours: valis[9][0], tzMinutes: valis[9][1]
                };
            }
            else {
                return {
                    kind: "YYYY-MM-DD hh:mm:ss.SSS+TZ",
                    year, month, day, hours, minutes, seconds, millis, tzHours: valis[9][0], tzMinutes: valis[9][1]
                };
            }
        }
    }));
}
exports.parse_YYYYMMDD_etc = parse_YYYYMMDD_etc;
function parse_hhmmss(s) {
    const pattern = /^(\d\d):(\d\d):(\d\d)$/;
    const matches = pattern.exec(s);
    if (matches === null) {
        return E.left(["value does not match pattern 'hh:mm:ss': " + s]);
    }
    const hours = parseInt(matches[1]);
    const minutes = parseInt(matches[2]);
    const seconds = parseInt(matches[3]);
    return function_1.pipe(Apply_1.sequenceT(validate)(validate_1.validateHours(hours), validate_1.validateMinutes(minutes), validate_1.validateSeconds(seconds), validate_1.validateLeapSecond(hours, minutes, seconds)), E.map(() => ({ kind: "hh:mm:ss", hours, minutes, seconds })));
}
exports.parse_hhmmss = parse_hhmmss;
function parseTauDateTime(s) {
    if (typeof s !== "string") {
        return E.left(["argument is not a string, but a " + typeof s]);
    }
    switch (s.length) {
        case 4: return parse_YYYY(s);
        case 7: return parse_YYYYMM(s);
        case 10: return parse_YYYYMMDD(s);
        default: return parse_YYYYMMDD_etc(s);
    }
}
exports.parseTauDateTime = parseTauDateTime;
function parseTauDate(s) {
    if (typeof s !== "string") {
        return E.left(["argument is not a string, but a " + typeof s]);
    }
    switch (s.length) {
        case 4: return parse_YYYY(s);
        case 7: return parse_YYYYMM(s);
        case 10: return parse_YYYYMMDD(s);
    }
    return E.left(["argument does not match Date pattern: " + s]);
}
exports.parseTauDate = parseTauDate;
function parseTauInstant(s) {
    if (typeof s !== "string") {
        return E.left(["argument is not a string, but a " + typeof s]);
    }
    return parse_YYYYMMDD_etc(s);
}
exports.parseTauInstant = parseTauInstant;
function parseTauTime(s) {
    if (typeof s !== "string") {
        return E.left(["argument is not a string, but a " + typeof s]);
    }
    return parse_hhmmss(s);
}
exports.parseTauTime = parseTauTime;
function tauNowUTC() {
    const now = new Date();
    return {
        kind: "YYYY-MM-DD hh:mm:ssZ",
        year: now.getUTCFullYear(),
        month: now.getUTCMonth(),
        day: now.getUTCDay(),
        hours: now.getUTCHours(),
        minutes: now.getUTCMinutes(),
        seconds: now.getUTCSeconds()
    };
}
exports.tauNowUTC = tauNowUTC;
