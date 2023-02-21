/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";


import { TauInstant, parseTauInstant } from "../../../src/fhir-resources/utils/tau";
import { FHIR_Observation_A } from "../../../src/fhir-resources/diagnostics/observation";
import { getLastCreated, getLastUpdated } from "../../../src/transformations/syncer/meta";


describe("get last created and updated", () => {

    describe("last updated", () => {

        const partial = {
            resourceType: "Observation",
            status: "final",
            subject: { display: "John Doe" }
        };

        it("all empty", async () => {
            const date = getLastUpdated([], []);
            expect(O.isNone(date)).to.be.true;
        });

        it("one match", async () => {
            const date = getLastUpdated([ {
                ...partial,
                id: "foo",
                __phdpUpdated: tau("2021-08-25T12:34:56Z")
            } as FHIR_Observation_A ], [ "foo", "bar" ]);

            expect(date).to.eql(O.some(tau("2021-08-25T12:34:56Z")));
        });

        it("multiple resources", async () => {
            const date = getLastUpdated([ {
                ...partial,
                id: "blup",
                __phdpUpdated: undefined
            } as FHIR_Observation_A, {
                ...partial,
                id: "bla",
                __phdpUpdated: tau("2022-08-25T06:12:11Z")
            } as FHIR_Observation_A, {
                ...partial,
                id: "foo",
                __phdpUpdated: tau("2021-08-25T12:34:56Z")
            } as FHIR_Observation_A, {
                ...partial,
                id: "bar",
                __phdpUpdated: tau("2020-08-25T00:11:22Z")
            } as FHIR_Observation_A,  {
                ...partial,
                id: "qux",
                __phdpUpdated: tau("2025-08-25T00:11:22Z")
            } as FHIR_Observation_A ], [ "foo", "bar", "wom", undefined, "bla" ]);

            expect(date).to.eql(O.some(tau("2022-08-25T06:12:11Z")));
        });

    });

    describe("last created", () => {

        const partial = {
            resourceType: "Observation",
            status: "final",
            subject: { display: "John Doe" }
        };

        it("all empty", async () => {
            const date = getLastCreated([], []);
            expect(O.isNone(date)).to.be.true;
        });

        it("one match", async () => {
            const date = getLastCreated([ {
                ...partial,
                id: "foo",
                __phdpCreated: tau("2021-08-25T12:34:56Z")
            } as FHIR_Observation_A ], [ "foo", "bar" ]);

            expect(date).to.eql(O.some(tau("2021-08-25T12:34:56Z")));
        });

        it("multiple resources", async () => {
            const date = getLastCreated([ {
                ...partial,
                id: "blup",
                __phdpCreated: undefined
            } as FHIR_Observation_A, {
                ...partial,
                id: "bla",
                __phdpCreated: tau("2022-08-25T06:12:11Z")
            } as FHIR_Observation_A, {
                ...partial,
                id: "foo",
                __phdpCreated: tau("2021-08-25T12:34:56Z")
            } as FHIR_Observation_A, {
                ...partial,
                id: "bar",
                __phdpCreated: tau("2020-08-25T00:11:22Z")
            } as FHIR_Observation_A,  {
                ...partial,
                id: "qux",
                __phdpCreated: tau("2025-08-25T00:11:22Z")
            } as FHIR_Observation_A ], [ "foo", "bar", "wom", "bla" ]);

            expect(date).to.eql(O.some(tau("2022-08-25T06:12:11Z")));
        });

    });

});

function tau (ts: string): TauInstant {
    return pipe(ts,
        parseTauInstant,
        E.getOrElse(_ => undefined)
    );
}
