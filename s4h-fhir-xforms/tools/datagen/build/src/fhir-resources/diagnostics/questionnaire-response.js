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
exports.boxQuestionnaireResponseResource = exports.insertQuestionnaireResponseResource = exports.FHIR_QuestionnaireResponse_T = exports.FHIR_QuestionnaireResponse_item_T = exports.FHIR_QuestionnaireResponse_Item_Value_T = exports.FHIR_QuestionnaireResponse_Item_Value_internal_T = exports.TValueCoding = exports.TValueDecimal = exports.TValueInteger = void 0;
const t = __importStar(require("io-ts"));
const utils_1 = require("../utils");
const graph_1 = require("../../graph/graph");
const common_1 = require("../../utils/common");
const issues_1 = require("../../utils/issues");
const fp_tools_1 = require("../../utils/fp-tools");
const general_special_purpose_1 = require("../base/general-special-purpose");
const primitives_1 = require("../base/primitives");
exports.TValueInteger = t.type({ _valueTag: t.literal("valueInteger"), valueInteger: primitives_1.FHIR_integer_T }, "valueInteger");
exports.TValueDecimal = t.type({ _valueTag: t.literal("valueDecimal"), valueDecimal: primitives_1.FHIR_decimal_T }, "valueDecimal");
exports.TValueCoding = t.type({ _valueTag: t.literal("valueCoding"), valueCoding: general_special_purpose_1.FHIR_Coding_T }, "valueCoding");
exports.FHIR_QuestionnaireResponse_Item_Value_internal_T = t.union([
    t.type({ _valueTag: t.literal("none") }),
    exports.TValueDecimal,
    exports.TValueInteger,
    exports.TValueCoding,
    t.type({ _valueTag: t.literal("valueBoolean"), valueBoolean: primitives_1.FHIR_boolean_T }, "valueBoolean"),
    t.type({ _valueTag: t.literal("valueDate"), valueDate: primitives_1.FHIR_date_T }, "valueDate"),
    t.type({ _valueTag: t.literal("valueDateTime"), valueDateTime: primitives_1.FHIR_dateTime_T }, "valueDateTime"),
    t.type({ _valueTag: t.literal("valueTime"), valueTime: primitives_1.FHIR_time_T }, "valueTime"),
    t.type({ _valueTag: t.literal("valueString"), valueString: primitives_1.FHIR_string_T }, "valueString"),
    t.type({ _valueTag: t.literal("valueUri"), valueUri: primitives_1.FHIR_uri_T }, "valueUri"),
    t.type({ _valueTag: t.literal("valueAttachment"), valueAttachment: general_special_purpose_1.FHIR_Attachment_T }, "valueAttachment"),
    t.type({ _valueTag: t.literal("valueQuantity"), valueQuantity: general_special_purpose_1.FHIR_Quantity_T }, "valueQuantity"),
    t.type({ _valueTag: t.literal("valueReference"), valueReference: general_special_purpose_1.FHIR_Reference_T }, "valueReference")
]);
exports.FHIR_QuestionnaireResponse_Item_Value_T = fp_tools_1.makeTaggedUnionTypeClass(exports.FHIR_QuestionnaireResponse_Item_Value_internal_T, "FHIR_QuestionnaireResponse_Item_Value_T", "_valueTag");
exports.FHIR_QuestionnaireResponse_item_T = t.intersection([
    t.type({
        linkId: primitives_1.FHIR_string_T
    }),
    t.partial({
        text: primitives_1.FHIR_string_T,
        answer: t.array(exports.FHIR_QuestionnaireResponse_Item_Value_T)
    })
]);
exports.FHIR_QuestionnaireResponse_T = t.intersection([
    general_special_purpose_1.FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("QuestionnaireResponse"),
        status: t.keyof({
            "in-progress": null,
            "completed": null,
            "amended": null,
            "entered-in-error": null,
            "stopped": null
        })
    }),
    t.partial({
        identifier: general_special_purpose_1.FHIR_Identifier_T,
        questionnaire: primitives_1.FHIR_canonical_T,
        encounter: general_special_purpose_1.FHIR_Reference_T,
        authored: primitives_1.FHIR_dateTime_T,
        item: t.array(exports.FHIR_QuestionnaireResponse_item_T)
    })
]);
function insertQuestionnaireResponseResource(g, boxres) {
    var _a, _b;
    const issues = [];
    const res = boxres.boxed;
    try {
        const nodeId = (_a = res.identifier) !== null && _a !== void 0 ? _a : utils_1.randomId();
        g.addNode(new graph_1.RefNode([nodeId], boxres));
        if ((_b = res.encounter) === null || _b === void 0 ? void 0 : _b.identifier) {
            g.addEdge(nodeId, res.encounter.identifier, "context");
        }
        if (res.questionnaire) {
            g.addEdge(nodeId, common_1.referenceToIdentifier(res.questionnaire), "questionnaire");
        }
    }
    catch (error) {
        issues.push(issues_1.issueErrorStageB(error.message, { resource: res }));
    }
    return issues;
}
exports.insertQuestionnaireResponseResource = insertQuestionnaireResponseResource;
function boxQuestionnaireResponseResource(res) {
    return { boxed: res };
}
exports.boxQuestionnaireResponseResource = boxQuestionnaireResponseResource;
