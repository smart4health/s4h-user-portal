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
exports.samplePatient = void 0;
const faker = __importStar(require("faker"));
const utils_1 = require("../utils");
function samplePatient(recipe) {
    const genderMale = Math.random() < recipe.gender_m;
    const patient = {
        id: faker.random.uuid(),
        lastName: faker.name.lastName(genderMale ? 0 : 1),
        firstName: faker.name.firstName(genderMale ? 0 : 1),
        country: faker.random.arrayElement(recipe.countries),
        gender: genderMale ? "male" : "female",
        birthDay: utils_1.sampleGaussian(recipe.birth_year),
        weight: utils_1.sampleGaussian(recipe.weight),
        height: utils_1.sampleGaussian(recipe.height)
    };
    const sum = recipe.sessions.none + recipe.sessions.pre_only + recipe.sessions.both;
    const t = Math.random();
    if (t < recipe.sessions.none / sum) {
        return patient;
    }
    if (t < (recipe.sessions.none + recipe.sessions.pre_only) / sum) {
        // pre only
        patient.preSession = {
            painLevel: Math.round(utils_1.sampleGaussian(recipe.pre_session.pain_level)),
            painKillers: Math.random() < 0.8
        };
    }
    else {
        // both
        if (Math.random() < recipe.post_session.prob_a) {
            // Group A
            patient.preSession = {
                painLevel: Math.round(utils_1.sampleGaussian(recipe.pre_session.pain_level)),
                painKillers: Math.random() < recipe.pre_session.painkillers
            };
            patient.postSession = {
                painLevel: Math.round(utils_1.sampleGaussian(recipe.post_session.group_a.pain_level)),
                painKillers: Math.random() < recipe.post_session.group_a.painkillers
            };
        }
        else {
            // Group B
            patient.preSession = {
                painLevel: Math.round(utils_1.sampleGaussian(recipe.pre_session.pain_level)),
                painKillers: Math.random() < recipe.pre_session.painkillers
            };
            patient.postSession = {
                painLevel: Math.round(utils_1.sampleGaussian(recipe.post_session.group_b.pain_level)),
                painKillers: Math.random() < recipe.post_session.group_b.painkillers
            };
        }
    }
    return patient;
}
exports.samplePatient = samplePatient;
