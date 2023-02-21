/* eslint-disable max-nested-callbacks */
import { expect } from "chai";
import { consoleLogInspect, hasErrors, shouldDump } from "../../utils";

import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";

import { readOnlyMockedSdk } from "../../../src/utils/sdk-mocks";

import { apiReadProvenanceData } from "../../../src/transformations/provenance/public-api";
import { installCannedCodeSystem } from "../../../src/resolve-codings/code-systems/canned/data/canned-code-systems";


describe("public API: provenance data", () => {

    const partial = {
        resourceType: "Provenance",
        recorded: "2021-08-16T12:00:00.000Z",
        agent: [{
            who: { reference: "somebody" }
        }]
    };

    it("single resource", async () => {
        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [
                {
                    ...partial,
                    id: "id-prov-a",
                    target: [{
                        identifier: {
                            system: "enc",
                            value: "enc-1"
                        }
                    }]
                },
                {
                    ...partial,
                    id: "id-prov-b",
                    target: [{
                        identifier: {
                            system: "enc",
                            value: "enc-1"
                        }
                    }, {
                        identifier: {
                            system: "enc",
                            value: "enc-2"
                        }
                    }]
                },
                {
                    ...partial,
                    id: "id-prov-c",
                    target: [{
                        identifier: {
                            system: "enc",
                            value: "enc-2"
                        }
                    }]
                },
                {
                    ...partial,
                    id: "id-prov-d",
                    target: [{
                        identifier: {
                            system: "enc",
                            value: "enc-4"
                        }
                    }, {
                        identifier: {
                            value: "123456"
                        }
                    }]
                },
                {
                    ...partial,
                    id: "id-prov-e",
                    target: [{
                        identifier: {
                            value: "foobar"
                        }
                    }]
                }
            ]
        });

        const [ issues, result ] = await apiReadProvenanceData({ sdk, resourceIdentifiers: [
            [
                { system: "enc", value: "enc-1" },
                { system: "enc", value: "enc-2" },
                { system: "enc", value: "enc-3" },
                { system: "obs", value: "obs-1" },
                { system: "obs", value: "obs-2" },
                { system: "doc", value: "doc-1" },
                {                value: "foobar" }
            ]
        ] });

        if (shouldDump()) {
            consoleLogInspect(issues);
            consoleLogInspect(result, 10);
        }

        expect(hasErrors(issues)).to.be.false;

        expect(pipe(result.model.provenances, A.map(p => p.id))).to.eql([
            "id-prov-a",
            "id-prov-b",
            "id-prov-c",
            "id-prov-e"
        ]);

    });

    it("provenance resolution", async () => {
        installCannedCodeSystem("partners", [
            { system: "partners", language: "en", code: "1234", display: "ACME, Inc."     },
            { system: "partners", language: "en", code:  "666", display: "Luci Fer Corp." }
        ]);

        const sdk = readOnlyMockedSdk({
            userId: "dummy",
            resources: [
                {
                    resourceType: "Provenance",
                    recorded: "2021-08-16T12:00:00.000Z",
                    activity: {
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/v3-DataOperation",
                            code: "CREATE"
                        }]
                    },
                    agent: [{
                        who: { reference: "somebody" },
                        type: {
                            coding: [{
                                system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                                code: "author"
                            }]
                        }
                    }, {
                        who: {
                            identifier: {
                                system: "http://fhir.smart4health.eu/CodeSystem/s4h-source-system",
                                value: "666"
                            }
                        },
                        type: {
                            coding: [{
                                system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                                code: "performer"
                            }]
                        }
                    },  {
                        who: {
                            identifier: {
                                system: "foo",
                                code: "bar"
                            }
                        },
                        type: {
                            coding: [{
                                system: "foo",
                                code: "bar",
                                display: "Doctor"
                            }]
                        }
                    }, {
                        who: {
                            identifier: {
                                system: "http://fhir.smart4health.eu/CodeSystem/s4h-source-system",
                                value: "1234"
                            }
                        }
                    }],
                    id: "id-prov-a",
                    target: [{
                        identifier: {
                            system: "enc",
                            value: "enc-1"
                        }
                    }],
                    signature: [{
                        type: [{
                            system: "urn:iso-astm:E1762-95:2013",
                            code: "1.2.840.10065.1.12.1.1",
                            display: "Author's Signature"
                        }],
                        when: "2021-08-15T14:36:21.147+00:00",
                        who: {
                            display: "Dr. Doe"
                        },
                        sigFormat: "application/jose",
                        data: "RFIuIERPRQ=="
                    }]
                }
            ]
        });

        const [ issues, result ] = await apiReadProvenanceData({ sdk, resourceIdentifiers: [
            [
                { system: "enc", value: "enc-1" }
            ]
        ] });

        if (shouldDump()) {
            consoleLogInspect(issues);
            consoleLogInspect(result, 10);
        }

        expect(hasErrors(issues)).to.be.false;

        expect(result.model.provenances[0].activity.resolvedText).to.eql("Create");

        expect(result.model.provenances[0].agents).to.have.length(4);
        expect(result.model.provenances[0].agents[0].type.resolvedText).to.eql("Author");
        expect(result.model.provenances[0].agents[0].resolvedWho).to.be.undefined;

        expect(result.model.provenances[0].agents[1].type.resolvedText).to.eql("Performer");
        expect(result.model.provenances[0].agents[1].resolvedWho).to.eql("Luci Fer Corp.");

        expect(result.model.provenances[0].agents[2].type.resolvedText).to.eql("Doctor");
        expect(result.model.provenances[0].agents[2].resolvedWho).to.be.undefined;

        expect(result.model.provenances[0].agents[3].type).to.be.undefined;
        expect(result.model.provenances[0].agents[3].resolvedWho).to.eql("ACME, Inc.");

        expect(result.model.provenances[0].signature).to.eql(1);
    });

});
