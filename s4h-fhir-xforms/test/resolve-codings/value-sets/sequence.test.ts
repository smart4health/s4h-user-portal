/* eslint-disable max-nested-callbacks */
import { assert, expect, use } from "chai";

import * as spies from "chai-spies";
use(spies);

import { makeSequenceValueSet } from "../../../src/resolve-codings/value-sets/sequence/sequence";
import { makeCannedValueSet } from "../../../src/resolve-codings/value-sets/canned/canned";
import { ValueSetLookupCoding_A, ValueSetSearchCoding, ValueSetSourceLookupParameters, ValueSetSourceSearchParameters } from "../../../src/resolve-codings/value-sets/defs";


describe("value sets: sequence suite", () => {

    it("empty sequence", async () => {
        const valueSet = await makeSequenceValueSet({ valueSets: [] });

        try {
            const codings = await valueSet.lookup({});
            expect(codings).to.have.length(0);
        } catch (issues) {
            assert.fail("codings should not be left");
        }
    });

    it("single source", async () => {
        const dummyValueSet1 = {
            async lookup (_params: ValueSetSourceLookupParameters): Promise<ValueSetLookupCoding_A[]> {
                return [];
            },
            async search (_params: ValueSetSourceSearchParameters): Promise<ValueSetSearchCoding[]> {
                return [];
            },
            language: () => undefined
        };
        const valueSetSpy1 = chai.spy.on(dummyValueSet1, "lookup");

        const dummyValueSet2 = {
            async lookup (_params: ValueSetSourceLookupParameters): Promise<ValueSetLookupCoding_A[]> {
                return [{ system: "A", code: "a", display: "A: a" }];
            },
            async search (_params: ValueSetSourceSearchParameters): Promise<ValueSetSearchCoding[]> {
                return [];
            },
            language: () => undefined
        };
        const valueSetSpy2 = chai.spy.on(dummyValueSet2, "lookup");


        const valueSet = await makeSequenceValueSet({ valueSets: [
            await makeCannedValueSet({ valueSetUrl: "http://hard/to/find" }),
            dummyValueSet1,
            dummyValueSet2
        ] });

        try {
            const codings = await valueSet.lookup({});

            expect(valueSetSpy1).to.be.called();
            expect(valueSetSpy2).to.be.called();

            expect(codings).to.have.length(1);
            expect(codings[0]).to.eql({ system: "A", code: "a", display: "A: a" });

        } catch (issues) {
            assert.fail("codings should not be left");
        }
    });

});
