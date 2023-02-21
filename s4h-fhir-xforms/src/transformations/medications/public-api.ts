import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { Tau_valueOf_floor } from "../../fhir-resources/utils/tau";
import { IssueList, IssueList_T, ctx, err, info, msg, warn } from "../../utils/issues";

import { getResources } from "../syncer/resource-pool";
import { getLastCreated, getLastUpdated } from "../syncer/meta";
import { ModelDeletionOptions, ModelReaderOptions } from "../syncer";

import { readMedicationList } from "./fhir2ui";
import { MedicationList, MedicationListResult, MedicationListResult_T } from "./defs";


/**
 * This function attempts to derive a patient's medication list UI model from FHIR resources in PHDP.
 *
 * The PHDP access is carried out via the `sdk` object supplied in `options`.
 *
 * @param options Must contain a valid initialized SDK object, may contain a desired language
 * @returns A `MedicationListResult` object or undefined if there were hard errors.
 */
export async function apiReadMedicationList (options: ModelReaderOptions): Promise<[ IssueList, MedicationListResult | undefined ]> {

    const resources = await getResources({ sdk: options.sdk, resourceTypes: [ "Medication", "MedicationStatement" ] })();
    if (E.isLeft(resources)) {
        return [ IssueList_T.encode(resources.left), undefined ];
    }

    const model = await readMedicationList(resources.right[1], options.language)();
    if (E.isLeft(model)) {
        return [ IssueList_T.encode(model.left), undefined ];
    }

    const lastUpdated = getLastUpdated(resources.right[1], pipe(model.right[1].model.medicationStatements,
        A.map(stmt => [ stmt.medicationId, stmt.medicationStatementId ]),
        A.flatten
    ));

    if (O.isSome(lastUpdated)) {
        model.right[1].lastUpdated = Tau_valueOf_floor(lastUpdated.value);
    }

    const lastCreated = getLastCreated(resources.right[1], pipe(model.right[1].model.medicationStatements,
        A.map(stmt => [ stmt.medicationId, stmt.medicationStatementId ]),
        A.flatten
    ));

    if (O.isSome(lastCreated)) {
        model.right[1].lastCreated = Tau_valueOf_floor(lastCreated.value);
    }

    return [ IssueList_T.encode(model.right[0]), MedicationListResult_T.encode(model.right[1]) ];
}


/**
 * This function attempts to delete the MedicationStatement resource specified by `deletionId`.
 *
 * The PHDP access is carried out via the `sdk` object supplied in `options`.
 * If there is a Medication resource referenced by the to-be-deleted MedicationStatement, it is also deleted if it is not
 * referenced by any other MedicationStatement.
 *
 * @param options        Must contain a valid initialized SDK object
 * @param medicationList Current medication list model (needed to decide whethere there are shared Medication resources)
 * @param deletionId    `MedicationStatement.id` of the statement to delete
 * @returns              An updated `MedicationListResult` object or undefined if there were hard errors.
 */
 // eslint-disable-next-line max-len
 export async function apiDeleteMedication (options: ModelDeletionOptions, medicationList: MedicationList, deletionId: string ): Promise<[ IssueList, MedicationListResult | undefined ]> {
    const medicationListCopy: MedicationListResult = {
        model: JSON.parse(JSON.stringify(medicationList))
    };

    const userId = options.sdk.getCurrentUserId();
    if (typeof userId !== "string") {
        return [ IssueList_T.encode([ err({ ...msg("SDK error: not logged in") }) ]), undefined ];
    }

    const medication = pipe(medicationList.medicationStatements, A.filter(m => m.medicationStatementId === deletionId));
    if (medication.length !== 1) {
        return [ IssueList_T.encode([ err({ ...msg("expected to find deletion ID once in list, but found " + medication.length) }) ]), undefined ];
    }

    try {
        await options.sdk.deleteResource(userId, deletionId);
    } catch (error) {
        return [ IssueList_T.encode([ err({ ...msg("could not delete MedicationStatement resource; see context"), ...ctx(error) }) ]), undefined ];
    }

    // Update the model to be returned
    medicationListCopy.model.medicationStatements = pipe(medicationListCopy.model.medicationStatements, A.filter(m => m.medicationStatementId !== deletionId));

    if (typeof medication[0].medicationId === "string") {
        // Check that there is no other MedicationStatement referencing this Medication
        const others = pipe(medicationList.medicationStatements,
            A.filter(m => m.medicationStatementId !== deletionId),
            A.filter(m => m.medicationId === medication[0].medicationId)
        );

        if (others.length === 0) {
            try {
                await options.sdk.deleteResource(userId, medication[0].medicationId);
            } catch (error) {
                return [ IssueList_T.encode([ warn({ ...msg("MedicationStatement successfully deleted; but could not delete referenced Medication resource; see context"), ...ctx(error) }) ]), medicationListCopy ];
            }

        } else {
            return [
                IssueList_T.encode([
                    info({
                        ...msg(`MedicationStatement successfully deleted; but did not delete referenced Medication because it is referenced by ${others.length} other MedicationStatement(s); see context for IDs`),
                        ...ctx({ otherMedicationStatements: pipe(others, A.map(m => m.medicationStatementId)) })
                    })
                ]),
                medicationListCopy
            ];
        }
    }

    return [ [], medicationListCopy ];
}
