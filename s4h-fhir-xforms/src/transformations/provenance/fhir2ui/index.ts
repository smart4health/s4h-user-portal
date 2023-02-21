import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Predicate } from "fp-ts/Predicate";

import { ctx, err } from "../../../utils/issues";
import { EitherIssueResult } from "../../../utils/fp-tools";
import { Tau_valueOf_floor } from "../../../fhir-resources/utils/tau";
import { BoxedProvenance, FHIR_Provenance_A, boxProvenanceResource } from "../../../fhir-resources/security/provenance";
import { Array_Array_FHIR_Identifier_T, FHIR_Identifier_A, FHIR_Reference_A, eqIdentifier } from "../../../fhir-resources/types";
import { makeDefaultCodeSystemsList, pickFirstMerger, resolveCodeableConceptTexts } from "../../../resolve-codings/concept-resolution";

import { getResources } from "../../syncer/resource-pool";

import { ProvenanceOptions, ProvenanceResult_A, Provenance_A } from "../defs";
import { makeCannedCodeSystems } from "../../../resolve-codings/code-systems/canned/canned";


export function readProvenanceResources (options: ProvenanceOptions): T.Task<EitherIssueResult<ProvenanceResult_A>> {
    return async () => {

        const provenanceResources = await getResources({ sdk: options.sdk, resourceTypes: [ "Provenance" ] })();
        if (E.isLeft(provenanceResources)) {
            return provenanceResources;
        }

        const resourceIdentifiers = Array_Array_FHIR_Identifier_T.decode(options.resourceIdentifiers);
        if (E.isLeft(resourceIdentifiers)) {
            return E.left([ err({ message: "decoding identifiers failed; see context", ...ctx({ errors: resourceIdentifiers.left }) }) ]);
        }

        const relevantProvenanceResources: FHIR_Provenance_A[] = pipe(provenanceResources.right[1], A.filter(identifierFilter(resourceIdentifiers.right)));

        const boxedProvenanceResources = pipe(relevantProvenanceResources, A.map(boxProvenanceResource));

        const resolveOptions = {
            codeSystems: [ ...await makeDefaultCodeSystemsList() ],
            textExtractionStrategy: pickFirstMerger,
            language: options.language
        };
        const resolver = resolveCodeableConceptTexts(resolveOptions);

        const [ resolutionIssues, resolvedProvenanceResources ] = await resolver(boxedProvenanceResources);

        const provenanceModel = await provenanceResourcesToUiModel(resolvedProvenanceResources as BoxedProvenance[])();
        if (E.isLeft(provenanceModel)) {
            return provenanceModel;
        }

        return E.right([ [ ...provenanceModel.right[0], ...resolutionIssues ], {
            model: {
                modelType:  "ProvenanceList/1",
                provenances: provenanceModel.right[1]
            }
        }]);
    };
}

const identifierFilter = (resourceIdentifiers: FHIR_Identifier_A[][]): Predicate<FHIR_Provenance_A> => provenance => {
    for (const target of provenance.target) {
        if (typeof target.identifier === "undefined") { continue; }

        for (const ids of resourceIdentifiers) {
            for (const id of ids) {
                if (eqIdentifier.equals(id, target.identifier)) {
                    return true;
                }
            }
        }
    }

    return false;
};

export function provenanceResourcesToUiModel (resources: BoxedProvenance[]): T.Task<EitherIssueResult<Provenance_A[]>> {
    return async () => {
        if (resources.length === 0) {
            return E.left([ err({ message: "no provenance resources specified" }) ]);
        }

        try {
            const temp: Provenance_A[] = [];
            for (const res of resources) {
                temp.push(await translateProvenanceResource(res));
            }

            return E.right([ [], temp ]);

        } catch (ex) {
            return E.left([ err({ message: "error during provenance UI model translation; see context", ...ctx({ error: ex }) }) ]);
        }
    };
}


async function translateProvenanceResource (resource: BoxedProvenance): Promise<Provenance_A> {
    return {
        id: resource.boxed.id ?? "",
        recorded: Tau_valueOf_floor(resource.boxed.recorded),
        activity: pipe(resource.activity, O.getOrElse(() => undefined)),
        agents:   await Promise.all(
            pipe(resource.agents, A.map(async agent => ({
                who:  agent.who,
                resolvedWho: await resolveWho(agent.who),
                // eslint-disable-next-line max-nested-callbacks
                type: pipe(agent.type, O.getOrElse(() => undefined))
            })))
        ),
        signature: pipe(resource.boxed.signature, O.fromNullable, O.map(s => s.length), O.getOrElse(() => 0))
    };
}

const partners = makeCannedCodeSystems({
    canName: "partners"
});

async function resolveWho (who: FHIR_Reference_A): Promise<string | undefined> {
    if (typeof who === "undefined") { return undefined; }

    if (typeof who.identifier !== "undefined") {
        if (who.identifier.system === "http://fhir.smart4health.eu/CodeSystem/s4h-source-system") {
            const res = await partners.resolveCodings([{ system: "partners", code: who.identifier.value }], O.none)();
            if (E.isLeft(res[0])) {
                return undefined;
            } else {
                return res[0].right.resolvedDisplay;
            }
        }
    }
    return undefined;
}
