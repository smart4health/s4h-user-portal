import * as T from "fp-ts/Task";

import { EitherIssueResult } from "../../utils/fp-tools";
import { SupportedResource_A } from "../../fhir-resources/base/resource";


export type ResourceDelta = {
    op: "create";
    resource: SupportedResource_A
} | {
    op: "delete";
    resourceId: string;
} | {
    op: "update";
    resource: SupportedResource_A
};


export type ModelWriterTask = T.Task<EitherIssueResult<ResourceDelta[]>>;
export type ModelWriterTaskMaker = (resources: SupportedResource_A[]) => ModelWriterTask;
