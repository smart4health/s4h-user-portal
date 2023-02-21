import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Eq, struct } from "fp-ts/Eq";
import { Eq as eqString } from "fp-ts/string";

import { firstElement } from "../../../../../utils/fp-tools";
import { IssueList_A, msg, warn } from "../../../../../utils/issues";

import { FHIR_Questionnaire_A, FHIR_Questionnaire_Item } from "../../../../../fhir-resources/definitional-artifacts/questionnaire";
import { FHIR_CodeableConcept_A, FHIR_Coding_A, FHIR_Extension_A, FHIR_Meta_A, FHIR_ValueSet_A, FHIR_ValueSet_T } from "../../../../../fhir-resources/types";


export const getValueSetFromQuestionnaire = (q: FHIR_Questionnaire_A, ref: string): O.Option<FHIR_ValueSet_A> => {
    if (!ref.startsWith("#")) {
        return O.none; // only support internal references
    }

    if (!q.contained) {
        return O.none;
    }

    return pipe(q.contained,
        A.filter(FHIR_ValueSet_T.is),
        A.filter(x => "#" + x.id === ref),
        firstElement
    );
};

export const getDisplayFromValueSet = (valueSet: FHIR_ValueSet_A, coding: FHIR_Coding_A): E.Either<IssueList_A, string> => {
    if (!valueSet.expansion) {
        return E.left([ warn({ ...msg("expansion missing for " + valueSet.id) }) ]);
    }

    if (!valueSet.expansion.contains) {
        return E.left([ warn({ ...msg("expansion.contains missing") }) ]);
    }

    for (const v of valueSet.expansion.contains) {
        if (eqCoding.equals(v, coding)) {
            if (typeof v.display === "string") {
                return E.right(v.display);
            } else {
                return E.left([ warn({ ...msg(`coding found in expansion, but it has no display value (${coding.system} / ${coding.code})`) }) ]);
            }
        }
    }

    return E.left([ warn({ ...msg(`coding not found (${coding.system} / ${coding.code}) in value set ${valueSet.id}`) }) ]);
};

export const getQuestionnaireItemForLinkId = (q: FHIR_Questionnaire_A, linkId: string): O.Option<FHIR_Questionnaire_Item> => {
    if (!q.item) {
        return O.none;
    }

    return pipe(q.item,
        A.filter(x => x.linkId === linkId),
        (items) => items.length === 0 ? O.none : O.fromNullable(items[0])
    );
};

export const codingInCodeableConcept = (coding: FHIR_Coding_A): (concept: FHIR_CodeableConcept_A) => boolean => concept => {
    for (const c of concept.coding) {
        if (eqCoding.equals(c, coding)) {
            return true;
        }
    }
    return false;
};

export const URL_ITEM_CONTROL_EXTENSION = "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl";

export const isExtension = (url: string, coding: FHIR_Coding_A): (ext: FHIR_Extension_A) => boolean => ext => {
    return ext.url === url && codingInCodeableConcept(coding)(ext.valueCodeableConcept);
};

export const eqCoding: Eq<FHIR_Coding_A> = struct({
    system: eqString,
    code:   eqString
});

export const hasMetaTag = (system: string, code: string): (meta?: FHIR_Meta_A) => boolean => meta => {
    if (typeof meta === "undefined") {
        return false;
    }

    const match = pipe(meta.tag ?? [], A.filter(tag => tag.system === system && tag.code === code));
    return match.length > 0;
};
