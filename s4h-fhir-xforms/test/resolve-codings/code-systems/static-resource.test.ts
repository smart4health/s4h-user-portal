/* eslint-disable max-nested-callbacks */
import chai from "chai";
import { expect } from "chai";
import spies from "chai-spies";


import { assertEitherLeft, assertEitherRightValueDeep, consoleLogInspect, shouldDump } from "../../utils";

import * as O from "fp-ts/Option";

import { makeStaticResourceCodeSystems, purgeCache } from "../../../src/resolve-codings/code-systems/static-resource/static-resource";
import { AxiosRequestConfig, AxiosStatic } from "axios";


chai.use(spies);

describe("resolve-codings / code-systems / static resource", () => {

    const mockAxios = (): AxiosStatic => ({
        async get (url: string, _config?: AxiosRequestConfig) {
            if (url.endsWith("atc/std/2020/00/2f.json")) {
                return {
                    data: {
                        "C05BA05": {
                            "de": "Mucopolysaccharidschwefelsäureester"
                        },
                        "A07DA02": {
                            "de": "Opium",
                            "en": "opium"
                        },
                        "R01BA": {
                            "en": "Sympathomimetics"
                        }
                    }
                };
            }

            if (url.endsWith("sct/int/20200309/01/ec.json")) {
                return {
                    data: {
                        "249189006": {
                            "en": "Wharton's jelly excessive (disorder)"
                        },
                        "439557007": {
                            "en": "Sphingomonas phyllosphaerae (organism)"
                        },
                        "10927201000119107": {
                            "en": "Closed fracture of neck of first metacarpal bone of right hand (disorder)"
                        }
                    }
                };
            }

            if (url.endsWith("sct/int/20200309/05/09.json")) {
                return {
                    data: {
                        "9101001": {
                            "en": "Reactor-converter operator (chemical processes, except Petroleum) (occupation)"
                        },
                        "42337005": {
                            "en": "Acute suppurative otitis media (disorder)"
                        },
                        "208437002": {
                            "en": "Closed fracture thumb proximal phalanx, neck (disorder)"
                        }
                    }
                };
            }

            throw new Error("not found: " + url);
        }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any as AxiosStatic;


    it("unknown static resource", async () => {
        const codeSystems = makeStaticResourceCodeSystems({
            axios: mockAxios()
        });

        const codings = await codeSystems.resolveCodings([{
            system: "foo",
            code:   "bar"
        }], O.none)();

        expect(codings).to.have.length(1);
        assertEitherLeft(codings[0]);
    });

    it("resolved static resource, default language", async () => {
        const codeSystems = makeStaticResourceCodeSystems({
            axios: mockAxios()
        });

        const codings = await codeSystems.resolveCodings([
            {
                system: "http://fhir.de/CodeSystem/dimdi/atc",
                code:   "C05BA05"
            },
            {
                system: "http://www.whocc.no/atc",
                code:   "A07DA02"
            },
            {
                system: "http://www.whocc.no/atc",
                code:   "R01BA"
            },
            {
                system: "http://fhir.de/CodeSystem/dimdi/atc",
                code:   "C05BP01"
            }
        ], O.none)();

        if (shouldDump()) {
            consoleLogInspect(codings);
        }

        expect(codings).to.have.length(4);

        assertEitherRightValueDeep(codings[0], { resolvedDisplay: "Mucopolysaccharidschwefelsäureester", language: "de", version: "2020" });
        assertEitherRightValueDeep(codings[1], { resolvedDisplay: "opium",                               language: "en", version: "2020" });
        assertEitherRightValueDeep(codings[2], { resolvedDisplay: "Sympathomimetics",                    language: "en", version: "2020" });
        assertEitherLeft(codings[3]);
    });

    it("resolved static resource, German language", async () => {
        purgeCache();

        const mockedAxios = mockAxios();
        const axiosGetSpy = chai.spy.on(mockedAxios, "get");

        const codeSystems = makeStaticResourceCodeSystems({
            axios: mockedAxios
        });

        const codings0 = await codeSystems.resolveCodings([
            {
                system: "http://fhir.de/CodeSystem/dimdi/atc",
                code: "C05BA05"
            },
            {
                system: "http://fhir.de/CodeSystem/dimdi/atc",
                code: "A07DA02"
            },
            {
                system: "http://fhir.de/CodeSystem/dimdi/atc",
                code: "R01BA"
            }
        ], O.some("de"))();

        expect(codings0).to.have.length(3);
        assertEitherRightValueDeep(codings0[0], { resolvedDisplay: "Mucopolysaccharidschwefelsäureester", language: "de", version: "2020" });
        assertEitherRightValueDeep(codings0[1], { resolvedDisplay: "Opium", language: "de", version: "2020" });
        assertEitherLeft(codings0[2]);

        const codings1 = await codeSystems.resolveCodings([
            {
                system: "http://fhir.de/CodeSystem/dimdi/atc",
                code: "C05BA05"
            },
            {
                system: "http://fhir.de/CodeSystem/dimdi/atc",
                code: "M02AA04"
            }
        ], O.some("de"))();

        expect(codings1).to.have.length(2);
        assertEitherRightValueDeep(codings1[0], { resolvedDisplay: "Mucopolysaccharidschwefelsäureester", language: "de", version: "2020" });
        assertEitherLeft(codings1[1]);

        // Only 1 call, because it should be cached
        expect(axiosGetSpy).to.have.been.called.exactly(1);
    });

    it("resolved static resource, default language, multiple buckets", async () => {
        const codeSystems = makeStaticResourceCodeSystems({
            axios: mockAxios()
        });

        const codings = await codeSystems.resolveCodings([
            {
                system: "http://snomed.info/sct/900000000000207008/version/20200309",
                code:   "249189006"
            },
            {
                system: "http://snomed.info/sct",
                code:   "42337005"
            },
            {
                system: "http://www.whocc.no/atc",
                code:   "R01BA"
            },
            {
                system: "http://fhir.de/CodeSystem/dimdi/atc",
                code:   "A07DA02"
            }
        ], O.none)();

        if (shouldDump()) {
            consoleLogInspect(codings);
        }

        expect(codings).to.have.length(4);

        assertEitherRightValueDeep(codings[0], { resolvedDisplay: "Wharton's jelly excessive (disorder)",      language: "en", version: "20200309" });
        assertEitherRightValueDeep(codings[1], { resolvedDisplay: "Acute suppurative otitis media (disorder)", language: "en", version: "20200309" });
        assertEitherRightValueDeep(codings[2], { resolvedDisplay: "Sympathomimetics",                          language: "en", version: "2020" });
        assertEitherRightValueDeep(codings[3], { resolvedDisplay: "opium",                                     language: "en", version: "2020" });
    });

});
