import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { IssueList, IssueList_T } from "../../utils/issues";
import { SupportedResource_T } from "../../fhir-resources/base/resource";
import { refGraphToDot } from "../../fhir-resources/utils/graph/viz/render";

import { ModelReaderOptions } from "../syncer";
import { getResources } from "../syncer/resource-pool";

import { fhirToGroupLists } from "./fhir2ui";
import { TransformationResult, TransformationResult_T } from "./defs";


export type GroupListModelReaderOptions = ModelReaderOptions & {
    additionalResources?: unknown[];
    removeAnswers?: string[];
    dot?: boolean;
};

/**
 * This function attempts to derive a patient's group list UI model from FHIR resources in PHDP.
 *
 * The PHDP access is carried out via the `sdk` object supplied in `options`.
 * You can supply additional resources in the `additionalResources` array. This comes in handy for e.g.
 * `Questionnaire` resources which are required for correct group list derivation but are not contained in PHDP.
 * Note: Do not add resources that also exist in PHDP; this may lead to incorrect model derivation.
 *
 * If you want to render the internal dependency graph for debugging (see [here](../../../docs/testing.md)), set the `dot`
 * value to true.
 *
 * @param options Must contain a valid initialized SDK object (and the above-mentioned optional values)
 * @returns A `GroupList` model object wrapped in a `TransformationResult`
 */
export async function apiReadGroupList (options: GroupListModelReaderOptions): Promise<[ IssueList, TransformationResult | undefined ]> {

    const resources = await getResources({
        sdk: options.sdk,
        resourceTypes: [ "Questionnaire", "QuestionnaireResponse", "Encounter", "DocumentReference" ]
    })();
    if (E.isLeft(resources)) {
        return [ IssueList_T.encode(resources.left), undefined ];
    }

    const [ issues, result ] = await fhirToGroupLists(
        [ ...pipe(resources.right[1], A.map(SupportedResource_T.encode)), ...(options.additionalResources ?? []) ],
        {
            toDot: options.dot === true ? refGraphToDot : undefined,
            removeAnswers: options.removeAnswers
        }
    );

    return [ IssueList_T.encode(issues), TransformationResult_T.encode(result) ];
}
