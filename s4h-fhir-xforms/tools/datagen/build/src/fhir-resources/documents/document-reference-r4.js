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
exports.deepCopy = exports.resolveDocumentReferenceConceptTexts = exports.boxDocumentReferenceResource = exports.insertDocumentReferenceResource = exports.FHIR_DocumentReference_T = exports.FHIR_DocumentReference_Context_T = exports.FHIR_DocumentReference_Content_T = void 0;
const t = __importStar(require("io-ts"));
const A = __importStar(require("fp-ts/Array"));
const E = __importStar(require("fp-ts/Either"));
const O = __importStar(require("fp-ts/Option"));
const utils_1 = require("../utils");
const graph_1 = require("../../graph/graph");
const issues_1 = require("../../utils/issues");
const primitives_1 = require("../base/primitives");
const general_special_purpose_1 = require("../base/general-special-purpose");
exports.FHIR_DocumentReference_Content_T = t.intersection([
    t.type({
        attachment: general_special_purpose_1.FHIR_Attachment_T
    }),
    t.partial({
        format: general_special_purpose_1.FHIR_Coding_T
    })
]);
exports.FHIR_DocumentReference_Context_T = t.partial({
    encounter: t.array(general_special_purpose_1.FHIR_Reference_T),
    event: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
    period: general_special_purpose_1.FHIR_Period_T,
    facilityType: general_special_purpose_1.FHIR_CodeableConcept_T,
    practiceSetting: general_special_purpose_1.FHIR_CodeableConcept_T,
    sourcePatientInfo: general_special_purpose_1.FHIR_Reference_T,
    related: t.array(general_special_purpose_1.FHIR_Reference_T)
});
exports.FHIR_DocumentReference_T = t.intersection([
    t.type({
        resourceType: t.literal("DocumentReference"),
        id: primitives_1.FHIR_id_T,
        status: t.keyof({
            "current": null,
            "superseded": null,
            "entered-in-error": null
        }),
        content: t.array(exports.FHIR_DocumentReference_Content_T)
    }),
    t.partial({
        // Resource
        language: primitives_1.FHIR_code_T,
        // DomainResource
        contained: t.array(general_special_purpose_1.FHIR_Resource_T),
        // DocumentReference
        masterIdentifier: general_special_purpose_1.FHIR_Identifier_T,
        identifier: t.array(general_special_purpose_1.FHIR_Identifier_T),
        docStatus: t.keyof({
            "preliminary": null,
            "final": null,
            "amended": null,
            "entered-in-error": null
        }),
        type: general_special_purpose_1.FHIR_CodeableConcept_T,
        category: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
        subject: general_special_purpose_1.FHIR_Reference_T,
        date: primitives_1.FHIR_instant_T,
        author: t.array(general_special_purpose_1.FHIR_Reference_T),
        authenticator: general_special_purpose_1.FHIR_Reference_T,
        custodian: general_special_purpose_1.FHIR_Reference_T,
        relatesTo: t.array(t.type({
            code: primitives_1.FHIR_code_T,
            target: general_special_purpose_1.FHIR_Reference_T
        })),
        description: primitives_1.FHIR_string_T,
        securityLabel: t.array(general_special_purpose_1.FHIR_CodeableConcept_T),
        context: exports.FHIR_DocumentReference_Context_T
    })
]);
function insertDocumentReferenceResource(g, boxdocRef) {
    var _a;
    const issues = [];
    const docRef = boxdocRef.boxed;
    try {
        if (((_a = docRef.identifier) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            g.addNode(new graph_1.RefNode(docRef.identifier, boxdocRef));
            const ret = insertEncounterEdges(docRef, g, docRef.identifier[0]);
            if (E.isLeft(ret)) {
                issues.push(ret.left);
            }
        }
        else {
            const id = utils_1.randomId();
            issues.push(issues_1.issueWarningStageB("DocumentReference without identifier; creating random one: " + JSON.stringify(id), { resource: docRef }));
            const n = new graph_1.RefNode([id], boxdocRef);
            g.addNode(n);
            const ret = insertEncounterEdges(docRef, g, id);
            if (E.isLeft(ret)) {
                issues.push(ret.left);
            }
        }
    }
    catch (error) {
        issues.push(issues_1.issueErrorStageB(error.message, { resource: docRef }));
    }
    return issues;
}
exports.insertDocumentReferenceResource = insertDocumentReferenceResource;
function insertEncounterEdges(docRef, g, id) {
    var _a;
    if ((_a = docRef.context) === null || _a === void 0 ? void 0 : _a.encounter) {
        for (const ref of docRef.context.encounter) {
            if (ref.reference) {
                return E.left(issues_1.issueErrorStageB("context.encounter property with reference not supported yet"));
            }
            else if (ref.identifier) {
                g.addEdge(id, ref.identifier, "context");
            }
        }
    }
    return E.right(undefined);
}
function boxDocumentReferenceResource(res) {
    return {
        boxed: res,
        type: O.none,
        category: []
    };
}
exports.boxDocumentReferenceResource = boxDocumentReferenceResource;
function resolveDocumentReferenceConceptTexts(resolver, res) {
    if (res.boxed.type) {
        resolver(res.boxed.type).then(os => { res.type = os; });
    }
    if (res.boxed.category) {
        Promise.all(A.map(resolver)(res.boxed.category))
            .then(texts => { res.category = texts; });
    }
}
exports.resolveDocumentReferenceConceptTexts = resolveDocumentReferenceConceptTexts;
function deepCopy(original) {
    try {
        const s = JSON.parse(JSON.stringify(exports.FHIR_DocumentReference_T.encode(original)));
        return O.fromEither(exports.FHIR_DocumentReference_T.decode(s));
    }
    catch (ignore) {
        return O.none;
    }
}
exports.deepCopy = deepCopy;
