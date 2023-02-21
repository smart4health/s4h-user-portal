import * as A from "fp-ts/Array";

import { ProtoGroup, ProtoGroupItem, ProtoQuestionnaireResponse, ProtoQuestionnaireSection } from "./stage-d-derive-groups/defs";


export const removeAnswers = (linkIdsToRemove: string[]): (protoGroup: ProtoGroup) => ProtoGroup => protoGroup => {
    if (protoGroup.sourceType === "Document") { return protoGroup; }

    const removeItemAnswers = (protoItem: ProtoGroupItem): ProtoGroupItem => {
        if (protoItem.type !== "Questionnaire") {
            return protoItem;
        }

        return {
            ...protoItem,
            sections: A.map(removeSectionAnswers)(protoItem.sections)
        };
    };

    const removeSectionAnswers = (protoSection: ProtoQuestionnaireSection): ProtoQuestionnaireSection => {
        return {
            ...protoSection,
            responses: A.filter( (resp: ProtoQuestionnaireResponse) => linkIdsToRemove.indexOf(resp.linkId) === -1)(protoSection.responses)
        };
    };

    if (linkIdsToRemove.length === 0) {
        return protoGroup;
    }

    return {
        ...protoGroup,
        items: A.map(removeItemAnswers)(protoGroup.items)
    };
};
