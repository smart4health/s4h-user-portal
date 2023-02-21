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
exports.Recipe_T = exports.ClampedGaussian_T = exports.GaussianParams_T = exports.Coding_T = void 0;
const t = __importStar(require("io-ts"));
exports.Coding_T = t.intersection([
    t.type({
        system: t.string,
        code: t.string
    }),
    t.partial({
        display: t.string
    })
]);
exports.GaussianParams_T = t.type({
    mean: t.number,
    sd: t.number
});
exports.ClampedGaussian_T = t.intersection([
    exports.GaussianParams_T,
    t.type({
        min: t.number,
        max: t.number
    })
]);
exports.Recipe_T = t.type({
    gender_m: t.number,
    birth_year: exports.ClampedGaussian_T,
    weight: exports.ClampedGaussian_T,
    height: exports.ClampedGaussian_T,
    countries: t.array(t.string),
    value_sets: t.type({
        pain_scale: t.array(exports.Coding_T),
        painkillers: t.array(exports.Coding_T)
    }),
    sessions: t.type({
        none: t.number,
        pre_only: t.number,
        both: t.number
    }),
    pre_session: t.type({
        pain_level: exports.ClampedGaussian_T,
        painkillers: t.number
    }),
    post_session: t.type({
        prob_a: t.number,
        group_a: t.type({
            pain_level: exports.ClampedGaussian_T,
            painkillers: t.number
        }),
        group_b: t.type({
            pain_level: exports.ClampedGaussian_T,
            painkillers: t.number
        })
    })
});
