import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { Issue_A } from "../../utils/issues";

import { FHIR_Identifier_A, eqIdentifier } from "../types";


export type IIdBag = {
    intersectsWithIdBag (other: IIdBag): boolean;
    intersectsWithIdentifiers (others: FHIR_Identifier_A[]): boolean;
    createMerged (other: IIdBag): E.Either<Issue_A, IIdBag>;
    getIdentifiers(): FHIR_Identifier_A[];
    clone(): IIdBag;
};

/**
 * This class represents items that can be referenced by one or more IDs (IIdentifier).
 * It implements the following equality semantics:
 * - For two IdBags to be equal, all IDs must be equal.
 * - IDs of a bag have no order, that is, the equality of the IDs is independent of any order of the
 *   implementing container (here: array).
 */
export abstract class IdBag implements IIdBag {
    protected _ids: FHIR_Identifier_A[] = [];

    constructor (ids: FHIR_Identifier_A[]) {
        this._ids = A.uniq(eqIdentifier)(ids);
    }

    /**
     * Checks whether the bag of IDs contain some elements of the argument.
     *
     * @param others  Returns true iff the bag of IDs contains at least one element of `others`.
     */
    intersectsWithIdBag (other: IIdBag): boolean {
        return A.intersection(eqIdentifier)(this._ids, other.getIdentifiers()).length > 0;
    }


    intersectsWithIdentifiers (others: FHIR_Identifier_A[]): boolean {
        return A.intersection(eqIdentifier)(this._ids, others).length > 0;
    }

    getIdentifiers (): FHIR_Identifier_A[] {
        return this._ids;
    }

    abstract clone (): IIdBag;

    abstract createMerged (other: IIdBag): E.Either<Issue_A, IIdBag>;
}


export class Set<Elem extends IIdBag> {
    private elements: Elem[] = [];

    constructor (xs: Elem[]) {
        for (const x of xs) {
            this.add(x);
        }
    }

    add (x: Elem): E.Either<Issue_A, void> {
        let y: IIdBag = x;
        const newElements: Elem[] = [];

        for (const elem of this.elements) {
            if (elem.intersectsWithIdBag(y)) {
                const z = y.createMerged(elem);
                if (E.isRight(z)) {
                    y = z.right;
                } else {
                    return z;
                }
            } else {
                newElements.push(elem);
            }
        }
        newElements.push(x);

        this.elements = newElements;
        return E.right(void 0);
    }

    contains (x: FHIR_Identifier_A): boolean {
        for (const e of this.elements) {
            if (e.intersectsWithIdentifiers([ x ])) {
                return true;
            }
        }
        return false;
    }

    get (id: FHIR_Identifier_A): E.Either<Issue_A, O.Option<Elem>> {
        const res: Elem[] = [];
        for (const e of this.elements) {
            if (e.intersectsWithIdentifiers([ id ])) {
                res.push(e);
            }
        }
        if (res.length === 0) {
            return E.right(O.none);
        } else if (res.length === 1) {
            return E.right(O.some(res[0]));
        } else {
            return E.left({ severity: "error", message: "inconsistent set contents, expected at most 1 element but got " + res.length });
        }
    }

    getElements (): Elem[] {
        return this.elements;
    }

    filter (f: (e: Elem) => boolean): Elem[] {
        return this.elements.filter(f);
    }

    remove (id: FHIR_Identifier_A): boolean {
        const oldCount = this.elements.length;
        this.elements = pipe(this.elements, A.filter(e => !e.intersectsWithIdentifiers([ id ])));
        return this.elements.length < oldCount;
    }

    clone (): Set<Elem> {
        return new Set<Elem>(pipe(this.elements, A.map(e => e.clone() as Elem)));
    }

}
