import * as E from "fp-ts/Either";

import { IssueList, IssueList_T } from "../../utils/issues";

import { ModelReaderOptions } from "../syncer";

import { readAllergyIntoleranceList, readProblemList } from "./fhir2ui";
import { AllergyIntoleranceListResult, AllergyIntoleranceListResult_T, ProblemListResult, ProblemListResult_T } from "./defs";

/**
 * This function attempts to derive a patient's problem list UI model from FHIR resources in PHDP.
 * The problem list items are sorted in ascending order by the underlying condition's `recordedDate`.
 * Problem with no `recordDate` precede the others.
 *
 * The PHDP access is carried out via the `sdk` object supplied in `options`.
 *
 * @param options Must contain a valid initialized SDK object, may contain a desired language
 * @returns A `ProblemListResult` object or undefined if there were hard errors.
 */
export async function apiReadProblemList (options: ModelReaderOptions): Promise<[ IssueList, ProblemListResult | undefined ]> {

    const model = await readProblemList(options)();
    if (E.isLeft(model)) {
        return [ IssueList_T.encode(model.left), undefined ];
    }

    return [ IssueList_T.encode(model.right[0]), ProblemListResult_T.encode(model.right[1]) ];
}


/**
 * This function attempts to derive a patient's allergy/intolerance list UI model from FHIR resources in PHDP.
 * The allergy/intolerance list items are sorted in ascending order by the `recordedDate`.
 * Items with no `recordDate` precede the others.
 *
 * The PHDP access is carried out via the `sdk` object supplied in `options`.
 *
 * @param options Must contain a valid initialized SDK object, may contain a desired language
 * @returns A `AllergyIntoleranceListResult` object or undefined if there were hard errors.
 */
 export async function apiReadAllergyIntoleranceList (options: ModelReaderOptions): Promise<[ IssueList, AllergyIntoleranceListResult | undefined ]> {

    const model = await readAllergyIntoleranceList(options)();
    if (E.isLeft(model)) {
        return [ IssueList_T.encode(model.left), undefined ];
    }

    return [ IssueList_T.encode(model.right[0]), AllergyIntoleranceListResult_T.encode(model.right[1]) ];
}
