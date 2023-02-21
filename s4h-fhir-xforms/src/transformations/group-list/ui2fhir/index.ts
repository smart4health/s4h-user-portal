import * as T from "fp-ts/Task";
import * as E from "fp-ts/Either";

import { ERRORS as ERR } from "../../../utils/errors";
import { IssueList_A, err, msg, name, tags } from "../../../utils/issues";

import { GroupListModel_A } from "../defs";


export function deleteGroup (_oldModel: GroupListModel_A, _index: number): T.Task<E.Either<IssueList_A, GroupListModel_A>> {
    return async () => {
        return E.left([ err({ ...msg("group deletion not implemented yet"), ...tags("deleteGroup"), ...name(ERR.NOT_IMPL) }) ]);
    };
}
