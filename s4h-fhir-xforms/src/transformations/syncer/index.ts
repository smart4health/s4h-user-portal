/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable complexity */
/* eslint-disable max-nested-callbacks */
import * as T from "fp-ts/Task";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

import D4LSDK from "@d4l/js-sdk";

import { uuidv4 } from "../../utils/uuid";
import { EitherIssueResult } from "../../utils/fp-tools";
import { TauInstant } from "../../fhir-resources/utils/tau";
import { IssueList_A, ctx, err, msg } from "../../utils/issues";
import { parseTauInstant } from "../../fhir-resources/utils/tau/parse";
import { SupportedResource_A, SupportedResource_T } from "../../fhir-resources/base/resource";
import { FHIR_Provenance_A, FHIR_Provenance_T } from "../../fhir-resources/security/provenance";

import { ResourceDelta } from "./defs";
import { TimedResourcePoolOptions } from "./resource-pool";


export function commitResourceDeltas (options: TimedResourcePoolOptions): (resourceDeltas: ResourceDelta[]) => T.Task<EitherIssueResult<ResourceDelta[]>> {
    return (resourceDiffs: ResourceDelta[]) => {
        return async () => {

            const userId = options.sdk.getCurrentUserId();
            if (typeof userId !== "string") {
                return E.left([ err({ ...msg("SDK error: not logged in") }) ]);
            }

            const tauNow = parseTauInstant(options.dateTime.toISOString());
            if (E.isLeft(tauNow)) {
                return E.left([ err({ ...msg("dateTime is invalid; see context"), ...ctx({ errors: tauNow.left }) }) ]);
            }

            const issues: IssueList_A = [];
            const leftover: ResourceDelta[] = [];

            for (const delta of resourceDiffs) {
                switch (delta.op) {
                    case "create":
                        try {
                            const tuple = makeProvenanceResourceTuple(delta.resource, "CREATE", tauNow.right, userId, O.fromNullable(options.clientId));

                            const _dataRecord = await options.sdk.createResource(userId, tuple.dataResource, new Date());
                            const _provRecord = await options.sdk.createResource(userId, tuple.provenanceResource, new Date());

                        } catch (error) {
                            leftover.push(delta);
                            issues.push(err({ ...msg("SDK error: could not create resource; see context"), ...ctx({ error, delta }) }));
                        }
                        break;

                    case "update":
                        try {
                            const tuple = makeProvenanceResourceTuple(delta.resource, "UPDATE", tauNow.right, userId, O.fromNullable(options.clientId));

                            const _dataRecord = await options.sdk.updateResource(userId, tuple.dataResource, new Date());
                            const _provRecord = await options.sdk.createResource(userId, tuple.provenanceResource, new Date());

                        } catch (error) {
                            leftover.push(delta);
                            issues.push(err({ ...msg("SDK error: could not update resource; see context"), ...ctx({ error, delta }) }));
                        }
                        break;

                    case "delete":
                        try {
                            await options.sdk.deleteResource(userId, delta.resourceId);

                        } catch (error) {
                            leftover.push(delta);
                            issues.push(err({ ...msg("SDK error: could not update resource; see context"), ...ctx({ error, delta }) }));
                        }
                        break;
                }
            }

            return E.right([ issues, leftover ]);
        };
    };
}

export type ModelWriterOptions = {
    dateTime: Date;
    sdk:      typeof D4LSDK;
};

export type ModelReaderOptions = {
    sdk:       typeof D4LSDK;
    language?: string;
};

export type ModelDeletionOptions = {
    sdk:      typeof D4LSDK;
};


type ProvenanceTuple = {
    dataResource: any;
    provenanceResource: any;
};

// eslint-disable-next-line max-params
function makeProvenanceResourceTuple (dataResource: SupportedResource_A, activity: string, tauNow: TauInstant, userId: string, clientId: O.Option<string>): ProvenanceTuple {
    const copy = JSON.parse(JSON.stringify(SupportedResource_T.encode(dataResource)));

    const prov: FHIR_Provenance_A = {
        resourceType: "Provenance",
        id: uuidv4(),
        meta: {
            profile: [
                "http://fhir.smart4health.eu/StructureDefinition/s4h-provenance"
            ]
        },
        target: [], // filled below
        recorded: tauNow,
        activity: {
            coding:  [{
                system: "http://terminology.hl7.org/CodeSystem/v3-DataOperation",
                code: activity
            }]
        },
        agent: [{
            type: {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        code: "author",
                        display: "Author"
                    }
                ]
            },
            who: {
                identifier: {
                    system: "http://fhir.data4life.care/CodeSystem/user-id",
                    value: userId
                }
            }
        }],
        _occurredTag: "none"
    };

    if (O.isSome(clientId)) {
        prov.agent.push({
            type: {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                        code: "composer",
                        display: "Composer"
                    }
                ]
            },
            who: {
                identifier: {
                    system: "http://fhir.smart4health.eu/CodeSystem/s4h-source-system",
                    value: clientId.value
                }
            }
        });
    }

    switch (copy.resourceType) {
        case "QuestionnaireResponse":
            if (typeof copy.identifier === "undefined") {
                copy.identifier = {
                    system: "urn:ietf:rfc:3986",
                    value:  "urn:uuid:" + uuidv4()
                };
            }

            prov.target.push({
                identifier: copy.identifier
            });
            break;


        default:
            if (typeof copy.identifier === "undefined") {
                copy.identifier = [{
                    system: "urn:ietf:rfc:3986",
                    value:  "urn:uuid:" + uuidv4()
                }];

            } else if (copy.identifier.length === 0) { // would be an invalid resource, but let's handle it
                copy.identifier.push({
                    system: "urn:ietf:rfc:3986",
                    value:  "urn:uuid:" + uuidv4()
                });
            }

            prov.target.push({
                identifier: copy.identifier[0]
            });
            break;
    }

    return {
        dataResource: copy,
        provenanceResource: FHIR_Provenance_T.encode(prov)
    };
}
