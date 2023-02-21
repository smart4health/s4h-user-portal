import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import { contramap } from "fp-ts/Ord";
import { flow, pipe } from "fp-ts/function";
import { NonEmptyArray, groupBy } from "fp-ts/NonEmptyArray";


import { uuidv4 } from "../../../utils/uuid";
import { IssueList_A } from "../../../utils/issues";
import { noneIfEmpty } from "../../../utils/fp-tools";
import { minAllOrNone, ordTau } from "../../../fhir-resources/utils/tau";

import { MERGEABLE_TYPES, NA } from "./constants";
import { ProtoFileGroupItem, ProtoGroup, ProtoGroupItem, ProtoQuestionnaireGroupItem, ProtoQuestionnaireSection, trainingNumberFromGroupItem } from "./stage-d-derive-groups/defs";


/**
 * This function creates a new ProtoGroup with possibly items merged.
 *
 * Items will be merged if the following criteria hold:
 * - Items were derived from QuestionnaireResponse resources which referenced the same encounter.
 * - Items were derived from QuestionnaireResponse resources which had the same value for the answer with `linkId` `training_no`.
 *
 * @param protoGroup
 */
export function mergeGroupItemSections (protoGroup: ProtoGroup): [ IssueList_A, ProtoGroup ] {
    // Helper functions
    const byDate             = contramap( (g: ProtoGroupItem) => g.date)(O.getOrd(ordTau));
    const encounterId       = (item: ProtoGroupItem) => O.getOrElse(() => NA)(item.encounter);
    const getValue          = (k: string, v: ProtoGroupItem[]) => v;
    const collectValues     = flow(R.collect(getValue), A.flatten);
    const trainingNumberOrNA = flow(trainingNumberFromGroupItem, x => O.isNone(x) ? NA : x.value.toString());
    const groupByTrainingNo = (encId: string, items: NonEmptyArray<ProtoQuestionnaireGroupItem>) => pipe(items, groupBy(trainingNumberOrNA));
    const isProtoQuestionnaireGroupItem = (item: ProtoGroupItem): item is ProtoQuestionnaireGroupItem => item.type === "Questionnaire";
    const isProtoFileGroupItem = (item: ProtoGroupItem): item is ProtoFileGroupItem => item.type === "File";

    if (protoGroup.sourceType !== "Course") {
        return [ [], protoGroup ];
    }

    // keep FileGroupItems
    const fileGroupItems = A.filter(isProtoFileGroupItem)(protoGroup.items);

    const questionnaireGroupItems = A.filter(isProtoQuestionnaireGroupItem)(protoGroup.items);
    const mergedItems = pipe(questionnaireGroupItems,
        groupBy(encounterId),                   // Record<string, ProtoGroupItem[]>
        R.mapWithIndex(groupByTrainingNo),      // Record<string, Record<string, ProtoGroupItem[]>>

        R.mapWithIndex((encId, v) => pipe(v, R.mapWithIndex(mergeSections(encId)), collectValues)),
        collectValues
    );

    const newGroup = {
        ...protoGroup,
        items: A.sort(byDate)([ ...fileGroupItems, ...mergedItems ])
    };

    return [ [], newGroup ];
}

const mergeSections = (encounterId: string):
    (trainingNo: string, items: NonEmptyArray<ProtoQuestionnaireGroupItem>) => ProtoQuestionnaireGroupItem[] => (trainingNo, items) => {

    const byDate = contramap( (sec: ProtoQuestionnaireSection) => sec.date)(O.getOrd(ordTau));


    if (encounterId === NA) {
        // items coming from encounter w/o ID are not merged, because we cannot assert them coming from the same encounter
        return items;
    }

    if (trainingNo === NA) {
        // items coming from answers w/o a training number are untouched
        return items;
    }

    if (items.length <= 1) {
        return items;
    }

    function toBeMerged (item: ProtoQuestionnaireGroupItem) {
        if ((item.sections.length === 1) && (MERGEABLE_TYPES.indexOf(item.sections[0].type) !== -1)) {
            return "merge";
        } else {
            return "no-merge";
        }
    }

    const mergePartition = groupBy(toBeMerged)(items);

    const unmergeableItems = mergePartition["no-merge"] ?? [];
    const   mergeableItems = mergePartition[   "merge"];

    let newItem: ProtoQuestionnaireGroupItem | undefined;
    if (mergeableItems instanceof Array) {
        newItem = {
            type:          "Questionnaire",
            id:             uuidv4(),
            identifier:     pipe(mergeableItems, A.map(item => item.identifier), A.flatten),
            date:           pipe(mergeableItems, A.map(item => item.date), A.compact, minAllOrNone),
            encounter:      O.some(encounterId),
            encounterType:  pipe(mergeableItems,
                                A.map(item => item.encounterType), // Option<ICodeableConcept[]>
                                A.map(O.getOrElse(() => [])),      // unpack into array
                                A.flatten,
                                noneIfEmpty
            ),
            trainingNumber: O.some(parseInt(trainingNo)),
            shortText:      O.some("#" + trainingNo),
            sections:       pipe(mergeableItems,
                                A.map(item => item.sections),
                                A.flatten,
                                A.sort(byDate)
            )
        };
    }

    return [
        // Keep the items which must not be merged as individuals (if any)
        ...unmergeableItems,

        // Add one new item for the ones to be merged into sections (if any)
        ...(newItem ? [ newItem ] : [])
    ];
};
