import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { contramap } from "fp-ts/Ord";
import { flow, pipe } from "fp-ts/function";

import { first, second } from "../../../utils/common";
import { ordTau } from "../../../fhir-resources/utils/tau";
import { ConceptResolutionOptions } from "../../../resolve-codings/defs";
import { RefGraph, RefNodeList } from "../../../fhir-resources/utils/graph";
import { IssueList_A, addTags, msg, tags, warn } from "../../../utils/issues";
import { makeDefaultCodeSystemsList, pickFirstMerger, resolveCodeableConceptTexts } from "../../../resolve-codings/concept-resolution";

import { TransformationResult_A } from "../defs";

import { buildGraph } from "./stage-b-build-graph";
import { removeAnswers } from "./stage-g-remove-answers";
import { imputeShortTexts } from "./stage-f-impute-texts";
import { decodeResources } from "./stage-a-filter-resources";
import { mergeGroupItemSections } from "./stage-e-merge-sections";
import { deriveGroup } from "./stage-d-derive-groups/derive-groups";
import { ProtoGroup, protoGroupToUiGroup } from "./stage-d-derive-groups/defs";


export type TransformationOptions = {
    toDot?: (g: RefGraph, components: RefNodeList[]) => string;

    removeAnswers?: string[];
    codeableConceptsResolution?: ConceptResolutionOptions;
};


export async function fhirToGroupLists (candidateResources: unknown[], options: TransformationOptions = {}):
    Promise<[ IssueList_A, TransformationResult_A ]> {

    const TAGS = tags("fhirToGroupLists");

    // Stage A
    const validatedResources = decodeResources(candidateResources);
    const issuesStageA = addTags(A.lefts(validatedResources), TAGS, tags("stage-A") );

    if (candidateResources.length === 0) {
        issuesStageA.push(warn({ ...msg("no resource candidates supplied"), ...tags("stage-A") }));
    }

    // Stage A.2
    const resolveOptions = options.codeableConceptsResolution ?? {
        codeSystems: await makeDefaultCodeSystemsList(),
        textExtractionStrategy: pickFirstMerger
    };
    const [ issuesStageA2, resolvedResources ] = await resolveCodeableConceptTexts(resolveOptions)(A.rights(validatedResources));

    // Stage B
    const [ issuesStageB, g ] = buildGraph(resolvedResources);

    // Stage C
    const disconnectedComponents = g.getDisconnectedComponents([ "partOf", "context" ]);

    const dot = options.toDot ? options.toDot(g, disconnectedComponents) : undefined;

    // Stage D
    const groupList = A.map(deriveGroup(g))(disconnectedComponents);
    const issuesStageD1 = A.flatten(A.lefts(groupList));

    const byDate = contramap( (x: [ IssueList_A, ProtoGroup ]) => x[1].date)(O.getOrd(ordTau));

    const goodGroups = pipe(groupList, A.rights, A.sort(byDate));
    const issuesStageD2 = pipe(groupList,
        A.rights,
        A.map(first),
        A.flatten
    );

    // Stage E
    const groupsWithMergedSections = pipe(goodGroups,
        A.map(flow(second, mergeGroupItemSections))
    );
    const issuesStageE = pipe(groupsWithMergedSections, A.map(first), A.flatten);

    // Stage F
    const textImputedGroups = pipe(groupsWithMergedSections,
        A.map(flow(second, imputeShortTexts))
    );

    // Stage G
    const cleansedAnswerGroups = A.map(removeAnswers(options.removeAnswers ?? []))(textImputedGroups);

    return [
        // collect all issues from underway (stage C does not emit issues)
        [ ...issuesStageA, ...issuesStageA2, ...issuesStageB, ...issuesStageD1, ...issuesStageD2, ...issuesStageE ],

        // build UI model
        {
            model: { modelType: "GroupList/1", groupList: A.map(protoGroupToUiGroup)(cleansedAnswerGroups) },
            dot
        }
    ];
}
