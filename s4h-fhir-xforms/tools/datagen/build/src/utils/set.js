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
exports.Set = exports.IdBag = void 0;
const A = __importStar(require("fp-ts/Array"));
const O = __importStar(require("fp-ts/Option"));
const E = __importStar(require("fp-ts/Either"));
const types_1 = require("../fhir-resources/types");
/**
 * This class represents items that can be referenced by one or more IDs (IIdentifier).
 * It implements the following equality semantics:
 * - For two IdBags to be equal, all IDs must be equal.
 * - IDs of a bag have no order, that is, the equality of the IDs is independent of any order of the
 *   implementing container (here: array).
 */
class IdBag {
    constructor(ids) {
        this._ids = [];
        this._ids = A.uniq(types_1.eqIdentifier)(ids);
    }
    /**
     * Checks whether the bag of IDs contain some elements of the argument.
     *
     * @param others  Returns true iff the bag of IDs contains at least one element of `others`.
     */
    intersectsWithIdBag(other) {
        return A.intersection(types_1.eqIdentifier)(this._ids, other.getIdentifiers()).length > 0;
    }
    intersectsWithIdentifiers(others) {
        return A.intersection(types_1.eqIdentifier)(this._ids, others).length > 0;
    }
    getIdentifiers() {
        return this._ids;
    }
}
exports.IdBag = IdBag;
class Set {
    constructor(xs) {
        this.elements = [];
        for (const x of xs) {
            this.add(x);
        }
    }
    add(x) {
        let y = x;
        const newElements = [];
        for (const elem of this.elements) {
            if (elem.intersectsWithIdBag(y)) {
                y = y.createMerged(elem);
            }
            else {
                newElements.push(elem);
            }
        }
        newElements.push(x);
        this.elements = newElements;
    }
    contains(x) {
        for (const e of this.elements) {
            if (e.intersectsWithIdentifiers([x])) {
                return true;
            }
        }
        return false;
    }
    get(id) {
        const res = [];
        for (const e of this.elements) {
            if (e.intersectsWithIdentifiers([id])) {
                res.push(e);
            }
        }
        if (res.length === 0) {
            return E.right(O.none);
        }
        else if (res.length === 1) {
            return E.right(O.some(res[0]));
        }
        else {
            return E.left({ stage: "NA", severity: "error", message: "inconsistent set contents, expected at most 1 element but got " + res.length });
        }
    }
    getElements() {
        return this.elements;
    }
    filter(f) {
        return this.elements.filter(f);
    }
}
exports.Set = Set;
