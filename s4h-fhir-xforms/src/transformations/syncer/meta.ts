import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { reverse } from "fp-ts/Ord";
import { pipe } from "fp-ts/function";

import { FHIR_instant_A } from "../../fhir-resources/types";
import { ordTauFloor } from "../../fhir-resources/utils/tau/order";
import { SupportedResource_A } from "../../fhir-resources/base/resource";


export function getLastUpdated (resources: SupportedResource_A[], ids: string[]): O.Option<FHIR_instant_A> {
    return pipe(resources,
        A.filter(res => ids.indexOf(res.id) !== -1),
        A.map(res => O.fromNullable(res.__phdpUpdated)),
        A.compact,
        A.sort(reverse(ordTauFloor)),
        dates => O.fromNullable(dates[0]) // dates[0] may be undefined if dates is empty
    );
}

export function getLastCreated (resources: SupportedResource_A[], ids: string[]): O.Option<FHIR_instant_A> {
    return pipe(resources,
        A.filter(res => ids.indexOf(res.id) !== -1),
        A.map(res => O.fromNullable(res.__phdpCreated)),
        A.compact,
        A.sort(reverse(ordTauFloor)),
        dates => O.fromNullable(dates[0]) // dates[0] may be undefined if dates is empty
    );
}
