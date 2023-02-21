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
exports.numericYearToYearMonthDay = exports.DOY_LEAP = exports.DOY_NORMAL = exports.clamp = exports.sampleGaussian = void 0;
const A = __importStar(require("fp-ts/Array"));
const function_1 = require("fp-ts/function");
const distris = __importStar(require("distributions"));
function sampleGaussian(params) {
    const g = distris.Normal(params.mean, params.sd);
    let x;
    do {
        x = g.inv(Math.random());
    } while ((x < params.min) || (x > params.max));
    return x;
}
exports.sampleGaussian = sampleGaussian;
const clamp = (min, max) => x => Math.min(Math.max(min, x), max);
exports.clamp = clamp;
const DAYS_NORMAL = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
exports.DOY_NORMAL = A.zip(function_1.pipe(DAYS_NORMAL, A.map(d => A.range(1, d)), A.flatten), function_1.pipe(DAYS_NORMAL, A.mapWithIndex((i, d) => A.replicate(d, i + 1)), A.flatten));
const DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
exports.DOY_LEAP = A.zip(function_1.pipe(DAYS_LEAP, A.map(d => A.range(1, d)), A.flatten), function_1.pipe(DAYS_LEAP, A.mapWithIndex((i, d) => A.replicate(d, i + 1)), A.flatten));
function isLeapYear(year) {
    return (year % 4 === 0) && (year % 100 !== 0) && (year % 400 === 0);
}
function numericYearToYearMonthDay(nyear) {
    const year = Math.floor(nyear);
    if (isLeapYear(year)) {
        const monthDay = exports.DOY_LEAP[Math.floor(exports.DOY_LEAP.length * (nyear - Math.floor(nyear)))];
        return {
            year,
            month: monthDay[1],
            day: monthDay[0]
        };
    }
    else {
        const monthDay = exports.DOY_NORMAL[Math.floor(exports.DOY_NORMAL.length * (nyear - Math.floor(nyear)))];
        return {
            year,
            month: monthDay[1],
            day: monthDay[0]
        };
    }
}
exports.numericYearToYearMonthDay = numericYearToYearMonthDay;
