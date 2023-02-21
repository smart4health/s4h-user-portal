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
exports.makeTaggedUnionTypeClass = exports.pickSingleOrUndefined = exports.curriedFlip = exports.noneIfEmpty = exports.eitherArrayOrIssue = exports.join = exports.pair = exports.fallback = exports.firstElement = exports.arrayContains = exports.someDate = exports.optionDateToStringOrUndefined = void 0;
const t = __importStar(require("io-ts"));
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const E = __importStar(require("fp-ts/Either"));
const Eq_1 = require("fp-ts/Eq");
const function_1 = require("fp-ts/function");
const issues_1 = require("./issues");
function optionDateToStringOrUndefined(date) {
    if (O.isSome(date)) {
        return date.value.toISOString();
    }
    else {
        return undefined;
    }
}
exports.optionDateToStringOrUndefined = optionDateToStringOrUndefined;
const someDate = (s) => O.some(new Date(s));
exports.someDate = someDate;
const arrayContains = (pred) => arr => O.isSome(A.findFirst(pred)(arr));
exports.arrayContains = arrayContains;
const firstElement = (arr) => {
    return arr.length === 0 ? O.none : O.some(arr[0]);
};
exports.firstElement = firstElement;
const fallback = (v) => O.getOrElse(() => v);
exports.fallback = fallback;
const pair = (s) => x => [s, x];
exports.pair = pair;
const join = (sep) => xs => xs.join(sep);
exports.join = join;
const eitherArrayOrIssue = (obj) => obj instanceof Array ? E.right(obj) : E.left(issues_1.issueError("response is not an array"));
exports.eitherArrayOrIssue = eitherArrayOrIssue;
const noneIfEmpty = x => x.length === 0 ? O.none : O.some(x);
exports.noneIfEmpty = noneIfEmpty;
const curriedFlip = (f) => (a) => (b) => f(b)(a);
exports.curriedFlip = curriedFlip;
const pickSingleOrUndefined = (arr) => arr.length === 1 ? arr[0] : undefined;
exports.pickSingleOrUndefined = pickSingleOrUndefined;
/**
 * Maker function for codec that provides a tagged union needed for FHIR properties like `value[x]`.
 *
 * Some FHIR resources have properties that can assume different data types. See, for example,
 * [Patient](https://www.hl7.org/fhir/patient.html) with `deceased[x]` and `multipleBirth[x]`, or
 * [Observation](https://www.hl7.org/fhir/observation.html) with `effective[x]` and `value[x]`.
 *
 * To model those properties appropriately, we need to define a tagged union (because only one value
 * at most can be present), but need to make sure we do not expose the tag property, because this
 * might break downstream consumers.
 *
 * This function takes a union codec and provides `encode` and `validate` functions that properly handle
 * the union's tag property.
 *
 * Use this function as shown in e.g. `FHIR_Observation_T` for the `effective[x]` property.
 *
 * @param codec           Codec of the tagged union
 * @param typeClassName   Name for the new codec
 * @param tagProp         Name of the tag property (for addition or removal)
 *
 * @returns               Codec for the tagged union `codec` with the above behavior added
 */
function makeTaggedUnionTypeClass(codec, typeClassName, tagProp) {
    return new t.Type(typeClassName, 
    // Is
    (x) => codec.is(x), 
    // Validate I -> Either<Errors, A>
    (x, c) => {
        if (typeof x !== "object") {
            return t.failure(x, c, "expect object, but got " + typeof x);
        }
        const unionOptions = function_1.pipe(codec.types, A.map(typeInfo => typeInfo.name));
        const objProps = Object.keys(x);
        const unionProp = A.intersection(Eq_1.eqString)(unionOptions)(objProps);
        if (unionProp.length === 0) {
            return t.success({ [tagProp]: "none" });
        }
        if (unionProp.length > 1) {
            return t.failure(x, c, `expect exactly one property, but got ${unionProp.length} (${unionProp.join()})`);
        }
        const prop = unionProp[0];
        for (const typeInfo of codec.types) {
            if (typeInfo.name === prop) {
                return function_1.pipe(x[prop], typeInfo.props[prop].decode, E.map(z => ({
                    [tagProp]: prop,
                    [prop]: z
                })));
            }
        }
        return t.failure(x, c, "unknown prop: " + prop);
    }, 
    // Encode A -> O
    (x) => (Object.assign(Object.assign({}, codec.encode(x)), { [tagProp]: undefined })));
}
exports.makeTaggedUnionTypeClass = makeTaggedUnionTypeClass;
