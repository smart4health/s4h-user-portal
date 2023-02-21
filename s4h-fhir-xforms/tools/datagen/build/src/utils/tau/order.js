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
exports.maxAllOrNone = exports.minAllOrNone = exports.maxSafeTauCompare = exports.minSafeTauCompare = exports.ordTau = void 0;
const O = __importStar(require("fp-ts/Option"));
const S = __importStar(require("fp-ts/Semigroup"));
function Tau_YYYY_valueOf(dt) {
    return Date.UTC(dt.year, 0, 0, 0, 0, 0, 0);
}
function Tau_YYYYMM_valueOf(dt) {
    return Date.UTC(dt.year, dt.month, 0, 0, 0, 0, 0);
}
function Tau_YYYYMMDD_valueOf(dt) {
    return Date.UTC(dt.year, dt.month, dt.day, 0, 0, 0, 0);
}
function Tau_YYYYMMDDhhmmssZ_valueOf(dt) {
    return Date.UTC(dt.year, dt.month, dt.day, dt.hours, dt.minutes, dt.seconds, 0);
}
function Tau_YYYYMMDDhhmmssSSSZ_valueOf(dt) {
    return Date.UTC(dt.year, dt.month, dt.day, dt.hours, dt.minutes, dt.seconds, dt.millis);
}
function timezoneOffsetMillis(tzHours, tzMinutes) {
    return (tzHours * 60 + Math.sign(tzHours) * tzMinutes) * 60 * 1000;
}
function Tau_YYYYMMDDhhmmssTZ_valueOf(dt) {
    return Date.UTC(dt.year, dt.month, dt.day, dt.hours, dt.minutes, dt.seconds, 0) - timezoneOffsetMillis(dt.tzHours, dt.tzMinutes);
}
function Tau_YYYYMMDDhhmmssSSSTZ_valueOf(dt) {
    return Date.UTC(dt.year, dt.month, dt.day, dt.hours, dt.minutes, dt.seconds, dt.millis) - timezoneOffsetMillis(dt.tzHours, dt.tzMinutes);
}
function Tau_valueOf(dt) {
    switch (dt.kind) {
        case "YYYY": return Tau_YYYY_valueOf(dt);
        case "YYYY-MM": return Tau_YYYYMM_valueOf(dt);
        case "YYYY-MM-DD": return Tau_YYYYMMDD_valueOf(dt);
        case "YYYY-MM-DD hh:mm:ssZ": return Tau_YYYYMMDDhhmmssZ_valueOf(dt);
        case "YYYY-MM-DD hh:mm:ss.SSSZ": return Tau_YYYYMMDDhhmmssSSSZ_valueOf(dt);
        case "YYYY-MM-DD hh:mm:ss+TZ": return Tau_YYYYMMDDhhmmssTZ_valueOf(dt);
        case "YYYY-MM-DD hh:mm:ss.SSS+TZ": return Tau_YYYYMMDDhhmmssSSSTZ_valueOf(dt);
    }
}
exports.ordTau = {
    equals(x, y) {
        return Tau_valueOf(x) === Tau_valueOf(y);
    },
    compare(x, y) {
        const vx = Tau_valueOf(x);
        const vy = Tau_valueOf(y);
        return vx < vy ? -1 : (vx > vy ? +1 : 0);
    }
};
exports.minSafeTauCompare = S.fold(S.getMeetSemigroup(exports.ordTau));
exports.maxSafeTauCompare = S.fold(S.getJoinSemigroup(exports.ordTau));
function minAllOrNone(ds) {
    if (ds.length === 0) {
        return O.none;
    }
    else {
        return O.some(exports.minSafeTauCompare(ds[0], ds));
    }
}
exports.minAllOrNone = minAllOrNone;
function maxAllOrNone(ds) {
    if (ds.length === 0) {
        return O.none;
    }
    else {
        return O.some(exports.maxSafeTauCompare(ds[0], ds));
    }
}
exports.maxAllOrNone = maxAllOrNone;
