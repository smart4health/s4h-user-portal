import { IssueList, issueErrorExternal } from "../../utils/issues";

import { ModelReaderOptions } from "../syncer";


export type UpdateTagsOptions = ModelReaderOptions & {
    dateTime:    Date;
    resourceIds: string[];
    tags:        string[]
};

export type UpdateTagsReport = {
    status: Record<string, string>;
};

/**
 * This function updates the tags to `tags` of all resources given by `resourceIds`.
 * The tags are overwritten! No merging takes place!
 *
 * @param options Must contain the resource IDs, the tags and the new updated timestamp.
 * @returns A report of which updates worked and which ones might have failed.
 */
// eslint-disable-next-line complexity
export async function apiUpdateTags (options: UpdateTagsOptions): Promise<[ IssueList, UpdateTagsReport | undefined ]> {
    const D4LSDK = options.sdk;
    const report: UpdateTagsReport = {
        status: {}
    };

    const userId = D4LSDK.getCurrentUserId();
    if (typeof userId !== "string") {
        return [ [ issueErrorExternal("SDK error: not logged in") ], undefined ];
    }

    for (const resourceId of options.resourceIds) {
        try {
            const record = await D4LSDK.fetchResource(userId, resourceId);
            await D4LSDK.updateResource(userId, record.fhirResource, options.dateTime, options.tags);

            report.status[resourceId] = "OK";

        } catch (error) {
            report.status[resourceId] = JSON.stringify(error);
        }
    }

    return [ [], report ];
}
