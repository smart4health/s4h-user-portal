import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { TextResponse_A } from "../defs";

import { QUESTIONNAIRE_BACKPAIN_PREVENTION_TYPE, QUESTIONNAIRE_POST_SESSION_TYPE, QUESTIONNAIRE_POST_TRAINING_TYPE, QUESTIONNAIRE_PRE_SESSION_TYPE, QUESTIONNAIRE_PRE_TRAINING_TYPE } from "./constants";
import { QUESTIONNAIRE_POST_SESSION_SHORT_TEXT, QUESTIONNAIRE_POST_TRAINING_SHORT_TEXT, QUESTIONNAIRE_PRE_SESSION_SHORT_TEXT, QUESTIONNAIRE_PRE_TRAINING_SHORT_TEXT } from "./constants";

import { ProtoGroup, ProtoGroupItem } from "./stage-d-derive-groups/defs";


export function imputeShortTexts (protoGroup: ProtoGroup): ProtoGroup {
    if (protoGroup.sourceType !== "Course") {
        return protoGroup;
    }

    return {
        ...protoGroup,
        items: A.map(imputeItemShortText)(protoGroup.items)
    };
}

// eslint-disable-next-line complexity
const imputeItemShortText = (protoItem: ProtoGroupItem): ProtoGroupItem => {
    if (protoItem.type !== "Questionnaire") {
        return protoItem;
    }

    if (protoItem.sections.length !== 1) {
        return protoItem;
    }

    let shortText: string | undefined;
    switch (protoItem.sections[0].type) {
        case QUESTIONNAIRE_PRE_SESSION_TYPE  : shortText = QUESTIONNAIRE_PRE_SESSION_SHORT_TEXT;   break;
        case QUESTIONNAIRE_POST_SESSION_TYPE : shortText = QUESTIONNAIRE_POST_SESSION_SHORT_TEXT;  break;
        case QUESTIONNAIRE_PRE_TRAINING_TYPE : shortText = QUESTIONNAIRE_PRE_TRAINING_SHORT_TEXT;  break;
        case QUESTIONNAIRE_POST_TRAINING_TYPE: shortText = QUESTIONNAIRE_POST_TRAINING_SHORT_TEXT; break;

        case QUESTIONNAIRE_BACKPAIN_PREVENTION_TYPE: {
            const questionnaireTimingAnswer = pipe(protoItem.sections[0].responses, A.filter(r => r.linkId === "questionnaire_timing"));
            if (questionnaireTimingAnswer.length === 0) {
                shortText = "Other";
            } else {
                const responseTexts = (questionnaireTimingAnswer[0] as TextResponse_A).responseText;
                if (responseTexts.length === 0) {
                    shortText = "Other";
                } else {
                    const mappings = [ [ "before", "Pre" ], [ "after", "Post" ], [ "during", "During" ] ];
                    const responseText = responseTexts[0].toLowerCase();
                    shortText = "Other";
                    for (const m of mappings) {
                        if (responseText.indexOf(m[0]) !== -1) {
                            shortText = m[1];
                            break;
                        }
                    }
                }
            }
        }
    }

    return {
        ...protoItem,
        shortText: O.fromNullable(shortText)
    };
};
