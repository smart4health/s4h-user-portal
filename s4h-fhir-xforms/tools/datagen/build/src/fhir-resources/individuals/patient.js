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
exports.deepPatientCopy = exports.resolvePatientConceptTexts = exports.boxPatientResource = exports.FHIR_Patient_T = exports.FHIR_Patient_gender_T = exports.FHIR_Patient_multipleBirth_T = exports.FHIR_Patient_multipleBirth_internal_T = exports.FHIR_Patient_deceased_T = exports.FHIR_Patient_deceased_internal_T = exports.FHIR_Patient_link_T = exports.FHIR_Patient_communication_T = exports.FHIR_Patient_contact_T = void 0;
const t = __importStar(require("io-ts"));
const O = __importStar(require("fp-ts/Option"));
const fp_tools_1 = require("../../utils/fp-tools");
const primitives_1 = require("../base/primitives");
const general_special_purpose_1 = require("../base/general-special-purpose");
const general_special_purpose_2 = require("../base/general-special-purpose");
exports.FHIR_Patient_contact_T = t.partial({
    relationship: t.array(general_special_purpose_2.FHIR_CodeableConcept_T),
    name: general_special_purpose_1.FHIR_HumanName_T,
    telecom: t.array(general_special_purpose_1.FHIR_ContactPoint_T),
    address: general_special_purpose_1.FHIR_Address_T,
    gender: t.keyof({
        "male": null,
        "female": null,
        "other": null,
        "unknown": null
    }),
    organization: general_special_purpose_2.FHIR_Reference_T,
    period: general_special_purpose_1.FHIR_Period_T
});
exports.FHIR_Patient_communication_T = t.intersection([
    t.type({
        language: general_special_purpose_2.FHIR_CodeableConcept_T
    }),
    t.partial({
        preferred: primitives_1.FHIR_boolean_T
    })
]);
exports.FHIR_Patient_link_T = t.type({
    other: general_special_purpose_2.FHIR_Reference_T,
    type: t.keyof({
        "replaced-by": null,
        "replaces": null,
        "refer": null,
        "seealso": null
    })
});
exports.FHIR_Patient_deceased_internal_T = t.union([
    t.type({ _deceasedTag: t.literal("none") }),
    t.type({ _deceasedTag: t.literal("deceasedBoolean"), deceasedBoolean: primitives_1.FHIR_boolean_T }, "deceasedBoolean"),
    t.type({ _deceasedTag: t.literal("deceasedDateTime"), deceasedDateTime: primitives_1.FHIR_dateTime_T }, "deceasedDateTime")
]);
exports.FHIR_Patient_deceased_T = fp_tools_1.makeTaggedUnionTypeClass(exports.FHIR_Patient_deceased_internal_T, "FHIR_Patient_deceased_internal_T", "_deceasedTag");
exports.FHIR_Patient_multipleBirth_internal_T = t.union([
    t.type({ _multipleBirthTag: t.literal("none") }),
    t.type({ _multipleBirthTag: t.literal("multipleBirthBoolean"), multipleBirthBoolean: primitives_1.FHIR_boolean_T }, "multipleBirthBoolean"),
    t.type({ _multipleBirthTag: t.literal("multipleBirthInteger"), multipleBirthInteger: primitives_1.FHIR_integer_T }, "multipleBirthInteger")
]);
exports.FHIR_Patient_multipleBirth_T = fp_tools_1.makeTaggedUnionTypeClass(exports.FHIR_Patient_multipleBirth_internal_T, "FHIR_Patient_multipleBirth_internal_T", "_multipleBirthTag");
exports.FHIR_Patient_gender_T = t.keyof({
    "male": null,
    "female": null,
    "other": null,
    "unknown": null
});
exports.FHIR_Patient_T = t.intersection([
    general_special_purpose_2.FHIR_DomainResource_T,
    t.type({
        resourceType: t.literal("Patient"),
        name: t.array(general_special_purpose_1.FHIR_HumanName_T),
        gender: exports.FHIR_Patient_gender_T,
        birthDate: primitives_1.FHIR_date_T
    }),
    exports.FHIR_Patient_deceased_T,
    exports.FHIR_Patient_multipleBirth_T,
    t.partial({
        // Resource
        meta: general_special_purpose_2.FHIR_Meta_T,
        // Patient
        identifier: t.array(general_special_purpose_1.FHIR_Identifier_T),
        active: primitives_1.FHIR_boolean_T,
        telecom: t.array(general_special_purpose_1.FHIR_ContactPoint_T),
        address: t.array(general_special_purpose_1.FHIR_Address_T),
        maritalStatus: general_special_purpose_2.FHIR_CodeableConcept_T,
        photo: t.array(general_special_purpose_2.FHIR_Attachment_T),
        contact: t.array(exports.FHIR_Patient_contact_T),
        communication: t.array(exports.FHIR_Patient_communication_T),
        generalPractitioner: t.array(general_special_purpose_2.FHIR_Reference_T),
        managingOrganization: general_special_purpose_2.FHIR_Reference_T,
        link: t.array(exports.FHIR_Patient_link_T)
    })
]);
function boxPatientResource(res) {
    return {
        boxed: res,
        maritalStatus: O.none
    };
}
exports.boxPatientResource = boxPatientResource;
function resolvePatientConceptTexts(resolver, res) {
    if (res.boxed.maritalStatus) {
        resolver(res.boxed.maritalStatus).then(os => { res.maritalStatus = os; });
    }
}
exports.resolvePatientConceptTexts = resolvePatientConceptTexts;
function deepPatientCopy(original) {
    try {
        const s = JSON.parse(JSON.stringify(exports.FHIR_Patient_T.encode(original)));
        return O.fromEither(exports.FHIR_Patient_T.decode(s));
    }
    catch (ignore) {
        return O.none;
    }
}
exports.deepPatientCopy = deepPatientCopy;
