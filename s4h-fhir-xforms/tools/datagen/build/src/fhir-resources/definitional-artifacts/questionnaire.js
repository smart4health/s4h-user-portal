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
exports.boxQuestionnaireResource = exports.insertQuestionnaireResource = exports.FHIR_Questionnaire_T = exports.FHIR_Questionnaire_Item_T = void 0;
const t = __importStar(require("io-ts"));
const graph_1 = require("../../graph/graph");
const value_set_1 = require("../terminology/value-set");
const issues_1 = require("../../utils/issues");
const primitives_1 = require("../base/primitives");
const general_special_purpose_1 = require("../base/general-special-purpose");
exports.FHIR_Questionnaire_Item_T = t.intersection([
    t.type({
        linkId: primitives_1.FHIR_string_T,
        type: t.keyof({
            "group": null,
            "display": null,
            "boolean": null,
            "decimal": null,
            "integer": null,
            "date": null,
            "dateTime": null,
            "time": null,
            "string": null,
            "text": null,
            "choice": null,
            "open-choice": null,
            "attachment": null,
            "reference": null,
            "quantity": null
        })
    }),
    t.partial({
        definition: primitives_1.FHIR_uri_T,
        code: t.array(general_special_purpose_1.FHIR_Coding_T),
        prefix: primitives_1.FHIR_string_T,
        text: primitives_1.FHIR_string_T,
        // enabledWhen
        enableBehavior: t.keyof({
            "all": null,
            "any": null
        }),
        required: primitives_1.FHIR_boolean_T,
        repeats: primitives_1.FHIR_boolean_T,
        readOnly: primitives_1.FHIR_boolean_T,
        maxLength: primitives_1.FHIR_integer_T,
        answerValueSet: primitives_1.FHIR_canonical_T,
        // answerOption[x]
        // initial
        // item
        extension: t.array(general_special_purpose_1.FHIR_Extension_T)
    })
]);
exports.FHIR_Questionnaire_T = t.intersection([
    general_special_purpose_1.FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("Questionnaire"),
        title: primitives_1.FHIR_string_T
    }),
    t.partial({
        url: primitives_1.FHIR_uri_T,
        identifier: t.array(general_special_purpose_1.FHIR_Identifier_T),
        item: t.array(exports.FHIR_Questionnaire_Item_T),
        contained: t.array(value_set_1.FHIR_ValueSet_T)
    })
]);
function insertQuestionnaireResource(g, boxres) {
    var _a;
    const issues = [];
    const res = boxres.boxed;
    try {
        const idUrl = { system: "__internal__", value: res.url };
        issues.push(issues_1.issueInfoStageB("adding internal identifier to resource " + res.url, { additionalIdentifier: idUrl }));
        const ids = [idUrl, ...((_a = res.identifier) !== null && _a !== void 0 ? _a : [])];
        g.addNode(new graph_1.RefNode(ids, boxres));
    }
    catch (error) {
        issues.push(issues_1.issueErrorStageB(error.message, { resource: res }));
    }
    return issues;
}
exports.insertQuestionnaireResource = insertQuestionnaireResource;
function boxQuestionnaireResource(res) {
    return { boxed: res };
}
exports.boxQuestionnaireResource = boxQuestionnaireResource;
