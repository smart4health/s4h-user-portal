import * as E from "fp-ts/Either";

import { ModelReaderOptions, ModelWriterOptions } from "../syncer";
import { IssueList, IssueList_T, issueErrorExternal } from "../../utils/issues";

import { readMedicalHistory } from "./fhir2ui";
import { writeMedicalHistory } from "./ui2fhir";
import { MedicalHistory, MedicalHistory_T } from "./defs";

/**
 * This function attempts to derive a patient's medical history UI model from FHIR resources in PHDP.
 *
 * The PHDP access is carried out via the `sdk` object supplied in `options`.
 *
 * @param options Must contain a valid initialized SDK object
 * @returns A `MedicalHistory` object or undefined if there were hard errors.
 */
export async function apiReadMedicalHistory (options: ModelReaderOptions): Promise<[ IssueList, MedicalHistory | undefined ]> {
    const model = await readMedicalHistory(options)();
    if (E.isLeft(model)) {
        return [ IssueList_T.encode(model.left), undefined ];
    }

    return [ IssueList_T.encode(model.right[0]), MedicalHistory_T.encode(model.right[1]) ];
}

/**
 * This function attempts to write or update FHIR resources in PHDP to reflect the data in the supplied UI model.
 *
 * The PHDP access is carried out via the `sdk` object supplied in `options`.
 * If resources need to be created, the options value `dateTime` is used for the `effective` property.
 *
 * @param newModel The model that shall be written to PHDP
 * @param options  Must contain a valid initialized SDK object and the `dateTime` to be used as "now".
 * @returns A `MedicalHistory` object reflecting the new state of PHDP or undefined if there were hard errors.
 */
 export async function apiWriteMedicalHistory (newModel: MedicalHistory, options: ModelWriterOptions): Promise<[ IssueList, MedicalHistory | undefined ]> {

    const newModelA = MedicalHistory_T.decode(newModel);
    if (E.isLeft(newModelA)) {
        return [ [ issueErrorExternal("could not decode new model", { errors: newModelA.left }) ], undefined ];
    }

    const afterModel = await writeMedicalHistory(newModelA.right, options)();
    if (E.isLeft(afterModel)) {
        return [ IssueList_T.encode(afterModel.left), undefined ];
    }

    return [ IssueList_T.encode(afterModel.right[0]), MedicalHistory_T.encode(afterModel.right[1]) ];
}
