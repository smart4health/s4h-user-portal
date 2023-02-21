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
exports.installCannedCodeSystem = exports.getCannedCodeSystem = void 0;
const O = __importStar(require("fp-ts/Option"));
const CANNED_CODE_SYSTEMS = {
    "default": [
        // Document Class Value Set (used for DocumentReference.category)
        { system: "http://loinc.org", code: "11369-6", language: "en", display: "History of Immunization" },
        { system: "http://loinc.org", code: "11485-0", language: "en", display: "Anesthesia records" },
        { system: "http://loinc.org", code: "11486-8", language: "en", display: "Chemotherapy records" },
        { system: "http://loinc.org", code: "11488-4", language: "en", display: "Consult Note" },
        { system: "http://loinc.org", code: "11506-3", language: "en", display: "Provider-unspecified progress note" },
        { system: "http://loinc.org", code: "11543-6", language: "en", display: "Nursery records" },
        { system: "http://loinc.org", code: "15508-5", language: "en", display: "Labor and delivery records" },
        { system: "http://loinc.org", code: "18726-0", language: "en", display: "Radiology studies (set)" },
        { system: "http://loinc.org", code: "18761-7", language: "en", display: "Provider-unspecified transfer summary" },
        { system: "http://loinc.org", code: "18842-5", language: "en", display: "Discharge summary" },
        { system: "http://loinc.org", code: "26436-6", language: "en", display: "Laboratory Studies (set)" },
        { system: "http://loinc.org", code: "26441-6", language: "en", display: "Cardiology studies (set)" },
        { system: "http://loinc.org", code: "26442-4", language: "en", display: "Obstetrical studies (set)" },
        { system: "http://loinc.org", code: "27895-2", language: "en", display: "Gastroenterology endoscopy studies (set)" },
        { system: "http://loinc.org", code: "27896-0", language: "en", display: "Pulmonary studies (set)" },
        { system: "http://loinc.org", code: "27897-8", language: "en", display: "Neuromuscular electrophysiology studies (set)" },
        { system: "http://loinc.org", code: "27898-6", language: "en", display: "Pathology studies (set)" },
        { system: "http://loinc.org", code: "28570-0", language: "en", display: "Provider-unspecified procedure note" },
        { system: "http://loinc.org", code: "28619-5", language: "en", display: "Ophthalmology/optometry studies (set)" },
        { system: "http://loinc.org", code: "28634-4", language: "en", display: "Miscellaneous studies (set)" },
        { system: "http://loinc.org", code: "29749-9", language: "en", display: "Dialysis records" },
        { system: "http://loinc.org", code: "29750-7", language: "en", display: "Neonatal intensive care records" },
        { system: "http://loinc.org", code: "29751-5", language: "en", display: "Critical care records" },
        { system: "http://loinc.org", code: "29752-3", language: "en", display: "Perioperative records" },
        { system: "http://loinc.org", code: "34109-9", language: "en", display: "Evaluation and management note" },
        { system: "http://loinc.org", code: "34117-2", language: "en", display: "Provider-unspecified, History and physical note" },
        { system: "http://loinc.org", code: "34121-4", language: "en", display: "Interventional procedure note" },
        { system: "http://loinc.org", code: "34122-2", language: "en", display: "Pathology procedure note" },
        { system: "http://loinc.org", code: "34133-9", language: "en", display: "Summarization of episode note" },
        { system: "http://loinc.org", code: "34140-4", language: "en", display: "Transfer of care referral note" },
        { system: "http://loinc.org", code: "34748-4", language: "en", display: "Telephone encounter note" },
        { system: "http://loinc.org", code: "34775-7", language: "en", display: "General surgery Pre-operative evaluation and management note" },
        { system: "http://loinc.org", code: "47039-3", language: "en", display: "Inpatient Admission history and physical note" },
        { system: "http://loinc.org", code: "47042-7", language: "en", display: "Counseling note" },
        { system: "http://loinc.org", code: "47045-0", language: "en", display: "Study report Document" },
        { system: "http://loinc.org", code: "47046-8", language: "en", display: "Summary of death" },
        { system: "http://loinc.org", code: "47049-2", language: "en", display: "Non-patient Communication" },
        { system: "http://loinc.org", code: "57017-6", language: "en", display: "Privacy Policy Organization Document" },
        { system: "http://loinc.org", code: "57016-8", language: "en", display: "Privacy Policy Acknowledgment Document" },
        { system: "http://loinc.org", code: "56445-0", language: "en", display: "Medication Summary Document" },
        { system: "http://loinc.org", code: "53576-5", language: "en", display: "Personal health monitoring report Document" },
        { system: "http://loinc.org", code: "56447-6", language: "en", display: "Plan of care note" },
        { system: "http://loinc.org", code: "18748-4", language: "en", display: "Diagnostic imaging study" },
        { system: "http://loinc.org", code: "11504-8", language: "en", display: "Surgical operation note" },
        { system: "http://loinc.org", code: "57133-1", language: "en", display: "Referral note" },
        // Doc type
        { system: "http://loinc.org", code: "19002-5", language: "en", display: "Physical therapy service attachment" },
        // Rhesus factor
        { system: "http://loinc.org", code: "10331-7", language: "en", display: "Rhesus factor" },
        { system: "http://loinc.org", code: "LA6576-8", language: "en", display: "Positive" },
        { system: "http://loinc.org", code: "LA6577-6", language: "en", display: "Negative" },
        // Blood groups
        { system: "http://loinc.org", code: "883-9", language: "en", display: "Blood group" },
        { system: "http://loinc.org", code: "LA19710-5", language: "en", display: "Group A" },
        { system: "http://loinc.org", code: "LA19709-7", language: "en", display: "Group B" },
        { system: "http://loinc.org", code: "LA19708-9", language: "en", display: "Group O" },
        { system: "http://loinc.org", code: "LA28449-9", language: "en", display: "Group AB" },
        // Body weight
        { system: "http://loinc.org", code: "29463-7", language: "en", display: "Body weight" },
        // Body Height
        { system: "http://loinc.org", code: "8302-2", language: "en", display: "Body height" },
        // Occupation concept
        { system: "http://loinc.org", code: "85658-3", language: "en", display: "Occupation" }
    ]
};
function getCannedCodeSystem(canName) {
    return O.fromNullable(CANNED_CODE_SYSTEMS[canName]);
}
exports.getCannedCodeSystem = getCannedCodeSystem;
function installCannedCodeSystem(canName, codings) {
    CANNED_CODE_SYSTEMS[canName] = codings;
}
exports.installCannedCodeSystem = installCannedCodeSystem;
