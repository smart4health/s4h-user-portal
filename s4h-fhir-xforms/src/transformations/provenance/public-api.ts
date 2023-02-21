import * as E from "fp-ts/Either";

import { IssueList, IssueList_T } from "../../utils/issues";

import { readProvenanceResources } from "./fhir2ui";
import { ProvenanceOptions, ProvenanceResult, ProvenanceResult_T } from "./defs";


export async function apiReadProvenanceData (options: ProvenanceOptions): Promise<[ IssueList, ProvenanceResult | undefined ]> {

    const model = await readProvenanceResources(options)();
    if (E.isLeft(model)) {
        return [ IssueList_T.encode(model.left), undefined ];
    }

    return [ IssueList_T.encode(model.right[0]), ProvenanceResult_T.encode(model.right[1]) ];
}
