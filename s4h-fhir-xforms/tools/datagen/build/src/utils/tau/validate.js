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
exports.validateTauTime = exports.validateTauInstant = exports.validateTauDate = exports.validateTauDateTime = exports.validateMillis = exports.validateSeconds = exports.validateMinutes = exports.validateHours = exports.validateMonth = exports.validateYear = exports.validateTimezone = exports.validateLeapSecond = exports.validateDate = exports.validateRange = void 0;
const A = __importStar(require("fp-ts/Array"));
const E = __importStar(require("fp-ts/Either"));
const Eq_1 = require("fp-ts/Eq");
const function_1 = require("fp-ts/function");
const Apply_1 = require("fp-ts/Apply");
const common_1 = require("../common");
const NonEmptyArray_1 = require("fp-ts/NonEmptyArray");
const validate = E.getValidation(NonEmptyArray_1.getSemigroup());
const onlyProps = (props) => obj => {
    const X = A.uniq(Eq_1.eqString)(props);
    const Y = A.uniq(Eq_1.eqString)(Object.getOwnPropertyNames(obj)); // uniq technically not needed here
    if (X.length !== Y.length) {
        return E.left([`number of properties is not equal: ${X.length} vs ${Y.length}`]);
    }
    const diff = A.difference(Eq_1.eqString)(X)(Y); // Y \ X
    if (diff.length !== 0) {
        return E.left([`too many properties: ${diff.join(", ")}`]);
    }
    return E.right(obj);
};
const validateRange = (range, item) => n => {
    if (n >= range[0] && n <= range[1]) {
        return E.right(n);
    }
    else {
        return E.left([`${item} must be in range [${range[0]}; ${range[1]}], but got ${n}`]);
    }
};
exports.validateRange = validateRange;
function validateDate(year, month, day) {
    const date = common_1.leftPadZero(4, year) + "-" + common_1.leftPadZero(2, month) + "-" + common_1.leftPadZero(2, day);
    const d = new Date(date);
    if (isNaN(d.valueOf())) {
        return E.left(["parsing error for date: " + date]);
    }
    if (d.toISOString().substr(0, 10) !== date) {
        return E.left(["invalid date (check leap year): " + date]);
    }
    return E.right([year, month, day]);
}
exports.validateDate = validateDate;
// TODO: Implement full leap second logic (including date)
function validateLeapSecond(hours, minutes, seconds) {
    if (seconds === 60) {
        if ((hours !== 23) || (minutes !== 59)) {
            return E.left(["leap second only allowed as 23:59:60"]);
        }
    }
    return E.right([hours, minutes, seconds]);
}
exports.validateLeapSecond = validateLeapSecond;
function validateTimezone(timezone) {
    const validate = E.getValidation(NonEmptyArray_1.getSemigroup());
    if (timezone === "Z") {
        return E.right([0, 0]);
    }
    const tz = /^(\+|-)(\d\d):(\d\d)$/;
    const matches = tz.exec(timezone);
    if (matches === null) {
        return E.left(["not a timezone: " + timezone]);
    }
    const sign = parseInt(matches[1] + "1"); // -1 or +1
    const hours = parseInt(matches[2]);
    const minutes = parseInt(matches[3]);
    return function_1.pipe(Apply_1.sequenceT(validate)(exports.validateRange([-12, +14], "time zone hour offset")(hours), exports.validateMinutes(minutes)), E.map(() => [sign * hours, minutes]));
}
exports.validateTimezone = validateTimezone;
exports.validateYear = exports.validateRange([1, 9999], "year");
exports.validateMonth = exports.validateRange([1, 12], "month");
exports.validateHours = exports.validateRange([0, 23], "hours");
exports.validateMinutes = exports.validateRange([0, 59], "minutes");
exports.validateSeconds = exports.validateRange([0, 60], "seconds"); // leap second
exports.validateMillis = exports.validateRange([0, 999], "millis");
function validateTauDateTime(tau) {
    if (typeof tau !== "object") {
        return E.left(["value is not an object"]);
    }
    // TODO: impl me
    return E.right(tau);
}
exports.validateTauDateTime = validateTauDateTime;
function validateTauDate(tau) {
    // eslint-disable-next-line eqeqeq
    if (tau == null) {
        return E.left(["value is null or undefined"]);
    }
    if (typeof tau !== "object") {
        return E.left(["value is not an object"]);
    }
    switch (tau["kind"]) {
        case "YYYY":
            return function_1.pipe(Apply_1.sequenceT(validate)(exports.validateYear(tau["year"]), onlyProps(["kind", "year"])(tau)), E.map(() => tau));
        case "YYYY-MM":
            return function_1.pipe(Apply_1.sequenceT(validate)(exports.validateYear(tau["year"]), exports.validateMonth(tau["month"]), onlyProps(["kind", "year", "month"])(tau)), E.map(() => tau));
        case "YYYY-MM-DD":
            return function_1.pipe(Apply_1.sequenceT(validate)(exports.validateYear(tau["year"]), exports.validateMonth(tau["month"]), validateDate(tau["year"], tau["month"], tau["day"]), onlyProps(["kind", "year", "month", "day"])(tau)), E.map(() => tau));
    }
    return E.left(["unknown date kind: " + tau["kind"]]);
}
exports.validateTauDate = validateTauDate;
function validateTauInstant(tau) {
    if (typeof tau !== "object") {
        return E.left(["value is not an object"]);
    }
    // TODO: impl me
    return E.right(tau);
}
exports.validateTauInstant = validateTauInstant;
function validateTauTime(tau) {
    if (typeof tau !== "object") {
        return E.left(["value is not an object"]);
    }
    // TODO: impl me
    return E.right(tau);
}
exports.validateTauTime = validateTauTime;
