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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDefaultCodeSystemsList = exports.firstUserSelectedMerger = exports.pickFirstMerger = exports.joinMerger = exports.nopMerger = exports.resolveCodeableConceptTexts = void 0;
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const E = __importStar(require("fp-ts/Either"));
const function_1 = require("fp-ts/function");
const signal_1 = require("../../../utils/signal");
const issues_1 = require("../../../utils/issues");
const canned_1 = require("../../../resolve-codings/value-sets/canned/canned");
const canned_2 = require("../../../resolve-codings/code-systems/canned/canned");
const sequence_1 = require("../../../resolve-codings/code-systems/sequence/sequence");
const value_set_sourced_1 = require("../../../resolve-codings/code-systems/value-set-sourced/value-set-sourced");
const encounter_1 = require("../../../fhir-resources/management/encounter");
const observation_1 = require("../../../fhir-resources/diagnostics/observation");
const document_reference_r4_1 = require("../../../fhir-resources/documents/document-reference-r4");
const optionalUserSelected = (c) => ({
    display: c.display,
    userSelected: O.fromNullable(c.userSelected)
});
const resolveCodeableConceptTexts = (options) => (resources) => __awaiter(void 0, void 0, void 0, function* () {
    let issues = [];
    const lock = signal_1.createSignal();
    const inputCodings = [];
    let outputCodings = [];
    const conceptPromises = [];
    function resolveConceptText(concept) {
        if (typeof concept.text === "string") {
            return Promise.resolve(O.some(concept.text));
        }
        if (!(concept.coding instanceof Array)) {
            return Promise.resolve(O.none);
        }
        if (concept.coding.length === 0) {
            return Promise.resolve(O.none);
        }
        const waiters = [];
        for (const coding of concept.coding) {
            const idx = inputCodings.push(coding) - 1;
            waiters.push(lock.signal.then(() => outputCodings[idx]));
        }
        const conceptPromise = Promise.all(waiters)
            .then(resolvedConceptCodings => {
            issues = [...issues, ...function_1.pipe(resolvedConceptCodings, A.lefts, A.flatten, A.map(issues_1.Issue_T.decode), A.rights)];
            return options.textMergeStrategy(function_1.pipe(resolvedConceptCodings, A.rights, A.map(optionalUserSelected)));
        });
        conceptPromises.push(conceptPromise);
        return conceptPromise;
    }
    A.map(resolveResourceConceptTexts(resolveConceptText))(resources);
    // call service(s)
    outputCodings = yield sequence_1.makeSequenceCodeSystems({
        codeSystems: options.codeSystems
    }).resolveCodings(inputCodings, O.fromNullable(options.language))();
    // Use display property from input codings, if available
    outputCodings = defaultInputDisplay(inputCodings)(outputCodings);
    // Carry over the userSelected flag, so it can be used by a text merge strategy, if needed
    outputCodings = function_1.pipe(outputCodings, A.mapWithIndex((i, c) => {
        if (E.isLeft(c)) {
            return c;
        }
        return Object.assign(Object.assign({}, c), { userSelected: inputCodings[i].userSelected });
    }));
    // Trigger read outs of the concepts
    lock.trigger();
    yield Promise.all(conceptPromises);
    return [issues, resources];
});
exports.resolveCodeableConceptTexts = resolveCodeableConceptTexts;
const resolveResourceConceptTexts = (resolver) => res => {
    if (document_reference_r4_1.FHIR_DocumentReference_T.is(res.boxed)) {
        document_reference_r4_1.resolveDocumentReferenceConceptTexts(resolver, res);
    }
    if (encounter_1.FHIR_Encounter_T.is(res.boxed)) {
        encounter_1.resolveEncounterConceptTexts(resolver, res);
    }
    if (observation_1.FHIR_Observation_T.is(res.boxed)) {
        observation_1.resolveObservationConceptTexts(resolver, res);
    }
};
const defaultInputDisplay = (inputCodings) => outputCodings => {
    return function_1.pipe(outputCodings, A.mapWithIndex((i, c) => {
        // If resolution successful or input codings had no display property, keep the error
        if (E.isRight(c)) {
            return c;
        }
        if (typeof inputCodings[i].display !== "string") {
            return c;
        }
        // If coding could not be resolved but the input coding had a display property, use this as default.
        return E.right({
            language: "N/A",
            version: "N/A",
            display: inputCodings[i].display
        });
    }));
};
const nopMerger = _texts => O.none;
exports.nopMerger = nopMerger;
const joinMerger = (sep) => texts => {
    if (texts.length === 0) {
        return O.none;
    }
    else {
        return O.some(function_1.pipe(texts, A.map(t => t.display)).join(sep));
    }
};
exports.joinMerger = joinMerger;
const pickFirstMerger = texts => {
    if (texts.length === 0) {
        return O.none;
    }
    else {
        return O.some(texts[0].display);
    }
};
exports.pickFirstMerger = pickFirstMerger;
const firstUserSelectedMerger = (fallback) => texts => {
    const userSelections = function_1.pipe(texts, A.filter(t => O.isSome(t.userSelected) && t.userSelected.value === true));
    if (userSelections.length === 0) {
        return fallback(texts);
    }
    else {
        return O.some(userSelections[0].display);
    }
};
exports.firstUserSelectedMerger = firstUserSelectedMerger;
function makeDefaultCodeSystemsList() {
    return __awaiter(this, void 0, void 0, function* () {
        return [
            canned_2.makeCannedCodeSystems({ canName: "default" }),
            sequence_1.makeSequenceCodeSystems({ codeSystems: [
                    value_set_sourced_1.makeValueSetSourcedCodeSystems({ valueSet: yield canned_1.makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/c80-practice-codes" }) }),
                    value_set_sourced_1.makeValueSetSourcedCodeSystems({ valueSet: yield canned_1.makeCannedValueSet({ valueSetUrl: "http://hl7.org/fhir/ValueSet/document-classcodes" }) }),
                    value_set_sourced_1.makeValueSetSourcedCodeSystems({ valueSet: yield canned_1.makeCannedValueSet({ valueSetUrl: "http://fhir.smart4health.eu/ValueSet/s4h-standard-document-types" }) }),
                    value_set_sourced_1.makeValueSetSourcedCodeSystems({ valueSet: yield canned_1.makeCannedValueSet({ valueSetUrl: "http://fhir.smart4health.eu/ValueSet/s4h-user-doc-types" }) })
                ] })
        ];
    });
}
exports.makeDefaultCodeSystemsList = makeDefaultCodeSystemsList;
