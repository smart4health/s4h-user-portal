import { uuidv4 } from "../../utils/uuid";

import { FHIR_Identifier_A } from "../base/general-special-purpose";


export function randomId (): FHIR_Identifier_A {
    return {
        system: "random-id",
        value:   uuidv4()
    };
}

export function referenceToIdentifier (ref: string): FHIR_Identifier_A {
    const pipeIdx = ref.indexOf("|");
    if (pipeIdx !== -1) {
        return { system: "__internal__", value: ref.substring(0, pipeIdx) };
    } else {
        return { system: "__internal__", value: ref };
    }

}
