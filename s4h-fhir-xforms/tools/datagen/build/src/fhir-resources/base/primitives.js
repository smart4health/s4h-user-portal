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
exports.FHIR_xhtml_T = exports.FHIR_url_T = exports.FHIR_base64Binary_T = exports.FHIR_canonical_T = exports.FHIR_markdown_T = exports.FHIR_instant_T = exports.FHIR_id_T = exports.FHIR_id_TC = exports.FHIR_time_T = exports.FHIR_date_T = exports.FHIR_dateTime_T = exports.FHIR_uri_T = exports.FHIR_uri_TC = exports.FHIR_code_T = exports.FHIR_code_TC = exports.FHIR_decimal_T = exports.FHIR_decimal_TC = exports.FHIR_string_T = exports.FHIR_unsignedInt_T = exports.FHIR_unsignedInt_TC = exports.FHIR_positiveInt_T = exports.FHIR_positiveInt_TC = exports.FHIR_integer_T = exports.FHIR_integer_TC = exports.FHIR_boolean_T = void 0;
const t = __importStar(require("io-ts"));
const A = __importStar(require("fp-ts/Array"));
const E = __importStar(require("fp-ts/Either"));
const function_1 = require("fp-ts/function");
const tau_1 = require("../../utils/tau/tau");
// https://www.hl7.org/fhir/datatypes.html#boolean
exports.FHIR_boolean_T = t.boolean;
// https://www.hl7.org/fhir/datatypes.html#integer
class FHIR_integer_TC extends t.Type {
    constructor() {
        super("FHIR_integer_T", (x) => E.isRight(this.decode(x)), (x, c) => {
            if (typeof x !== "number") {
                return t.failure(x, c, "value is not a number, but a " + typeof x);
            }
            if (FHIR_integer_TC.pattern.test(x.toString())) {
                if ((FHIR_integer_TC.MIN_VALUE <= x) && (x <= FHIR_integer_TC.MAX_VALUE)) {
                    return t.success(x);
                }
                else {
                    return t.failure(x, c, "integer out of range: " + x);
                }
            }
            else {
                return t.failure(x, c, "not an integer: " + x);
            }
        }, t.identity);
    }
}
exports.FHIR_integer_TC = FHIR_integer_TC;
FHIR_integer_TC.pattern = /^([0]|[-+]?[1-9][0-9]*)$/;
FHIR_integer_TC.MIN_VALUE = -2147483648;
FHIR_integer_TC.MAX_VALUE = +2147483647;
exports.FHIR_integer_T = new FHIR_integer_TC();
// https://www.hl7.org/fhir/datatypes.html#positiveInt
class FHIR_positiveInt_TC extends t.Type {
    constructor() {
        super("FHIR_positiveInt_T", (x) => E.isRight(this.decode(x)), (x, c) => {
            if (typeof x !== "number") {
                return t.failure(x, c, "value is not a number, but a " + typeof x);
            }
            if (FHIR_positiveInt_TC.pattern.test(x.toString())) {
                if ((x >= 1) && (x <= FHIR_positiveInt_TC.MAX_VALUE)) {
                    return t.success(x);
                }
                else {
                    return t.failure(x, c, "positive integer out of range: " + x);
                }
            }
            else {
                return t.failure(x, c, "not a positive integer: " + x);
            }
        }, t.identity);
    }
}
exports.FHIR_positiveInt_TC = FHIR_positiveInt_TC;
FHIR_positiveInt_TC.pattern = /^\+?[1-9][0-9]*$/;
FHIR_positiveInt_TC.MAX_VALUE = +2147483647;
exports.FHIR_positiveInt_T = new FHIR_positiveInt_TC();
// https://www.hl7.org/fhir/datatypes.html#unsignedInt
class FHIR_unsignedInt_TC extends t.Type {
    constructor() {
        super("FHIR_unsignedInt_T", (x) => E.isRight(this.decode(x)), (x, c) => {
            if (typeof x !== "number") {
                return t.failure(x, c, "value is not a number, but a " + typeof x);
            }
            if (FHIR_unsignedInt_TC.pattern.test(x.toString())) {
                if ((x >= 0) && (x <= FHIR_unsignedInt_TC.MAX_VALUE)) {
                    return t.success(x);
                }
                else {
                    return t.failure(x, c, "unsigned integer out of range: " + x);
                }
            }
            else {
                return t.failure(x, c, "not an unsigned integer: " + x);
            }
        }, t.identity);
    }
}
exports.FHIR_unsignedInt_TC = FHIR_unsignedInt_TC;
FHIR_unsignedInt_TC.pattern = /^([0]|([1-9][0-9]*))$/;
FHIR_unsignedInt_TC.MAX_VALUE = +2147483647;
exports.FHIR_unsignedInt_T = new FHIR_unsignedInt_TC();
// https://www.hl7.org/fhir/datatypes.html#string
exports.FHIR_string_T = t.string;
// https://www.hl7.org/fhir/datatypes.html#decimal
class FHIR_decimal_TC extends t.Type {
    constructor() {
        super("FHIR_decimal_T", (x) => E.isRight(this.decode(x)), (x, c) => {
            if (typeof x !== "number") {
                return t.failure(x, c, "value is not a number, but a " + typeof x);
            }
            if (FHIR_decimal_TC.pattern.test(x.toString())) {
                return t.success(x);
            }
            return t.failure(x, c, "not a decimal: " + x);
        }, t.identity);
    }
}
exports.FHIR_decimal_TC = FHIR_decimal_TC;
FHIR_decimal_TC.pattern = /^(-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?)$/;
exports.FHIR_decimal_T = new FHIR_decimal_TC();
// https://www.hl7.org/fhir/datatypes.html#code
class FHIR_code_TC extends t.Type {
    constructor() {
        super("FHIR_code_T", (x) => E.isRight(this.decode(x)), (x, c) => {
            if (typeof x !== "string") {
                return t.failure(x, c, "value is not a string, but a " + typeof x);
            }
            if (FHIR_code_TC.pattern.test(x)) {
                return t.success(x);
            }
            return t.failure(x, c, "not a code: " + x);
        }, t.identity);
    }
}
exports.FHIR_code_TC = FHIR_code_TC;
FHIR_code_TC.pattern = /^([^\s]+([ ][^\s]+)*)$/;
exports.FHIR_code_T = new FHIR_code_TC();
// https://www.hl7.org/fhir/datatypes.html#uri
class FHIR_uri_TC extends t.Type {
    constructor() {
        super("FHIR_uri_T", (x) => E.isRight(this.decode(x)), (x, c) => {
            if (typeof x !== "string") {
                return t.failure(x, c, "value is not a string, but a " + typeof x);
            }
            if (FHIR_uri_TC.pattern.test(x)) {
                return t.success(x);
            }
            return t.failure(x, c, "not a code: " + x);
        }, t.identity);
    }
}
exports.FHIR_uri_TC = FHIR_uri_TC;
FHIR_uri_TC.pattern = /^\S*$/;
exports.FHIR_uri_T = new FHIR_uri_TC();
// https://www.hl7.org/fhir/datatypes.html#dateTime
exports.FHIR_dateTime_T = new t.Type("FHIR_dateTime_T", (value) => E.isRight(tau_1.validateTauDateTime(value)), (value, context) => {
    return function_1.pipe(value, tau_1.parseTauDateTime, E.mapLeft(A.map(message => ({ value, context, message }))));
}, tau_1.TauDateTime_toString);
// https://www.hl7.org/fhir/datatypes.html#date
exports.FHIR_date_T = new t.Type("FHIR_date_T", (value) => E.isRight(tau_1.validateTauDate(value)), (value, context) => {
    return function_1.pipe(value, tau_1.parseTauDate, E.mapLeft(A.map(message => ({ value, context, message }))));
}, tau_1.TauDate_toString);
// https://www.hl7.org/fhir/datatypes.html#time
exports.FHIR_time_T = new t.Type("FHIR_time_T", (value) => E.isRight(tau_1.validateTauTime(value)), (value, context) => {
    return function_1.pipe(value, tau_1.parseTauTime, E.mapLeft(A.map(message => ({ value, context, message }))));
}, tau_1.TauTime_toString);
// https://www.hl7.org/fhir/datatypes.html#id
class FHIR_id_TC extends t.Type {
    constructor() {
        super("FHIR_id_T", (x) => E.isRight(this.decode(x)), (x, c) => {
            if (typeof x !== "string") {
                return t.failure(x, c, "value is not a string, but a " + typeof x);
            }
            if (FHIR_id_TC.pattern.test(x)) {
                return t.success(x);
            }
            return t.failure(x, c, "not an id: " + x);
        }, t.identity);
    }
}
exports.FHIR_id_TC = FHIR_id_TC;
FHIR_id_TC.pattern = /^([A-Za-z0-9\-.]{1,64})$/;
exports.FHIR_id_T = new FHIR_id_TC();
// https://www.hl7.org/fhir/datatypes.html#instant
exports.FHIR_instant_T = new t.Type("FHIR_instant_T", (value) => E.isRight(tau_1.validateTauInstant(value)), (value, context) => {
    return function_1.pipe(value, tau_1.parseTauInstant, E.mapLeft(A.map(message => ({ value, context, message }))));
}, tau_1.TauInstant_toString);
exports.FHIR_markdown_T = exports.FHIR_string_T; // FIXME
exports.FHIR_canonical_T = exports.FHIR_uri_T; // FIXME
exports.FHIR_base64Binary_T = exports.FHIR_string_T; // FIXME
exports.FHIR_url_T = exports.FHIR_uri_T; // FIXME
exports.FHIR_xhtml_T = exports.FHIR_string_T; // FIXME
