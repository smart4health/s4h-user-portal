import * as t from "io-ts";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";


export function tags (...t: unknown[]): { tags: TagSet_A } {
    const obj: TagSet_A = {};
    for (const tag of t) {
        obj["" + tag] = null;
    }
    return { tags: obj };
}

export class TagSet_TC extends t.Type<Record<string, null>, string[], unknown> {
    constructor () {
        super(
            "TagSet_T",

            (x): x is Record<string, null> => { return typeof x === "object"; },

            (x, c) => {
                if (!(x instanceof Array)) {
                    return t.failure(x, c, "value is not an array");
                }

                return t.success(tags(...x).tags);
            },

            (obj: Record<string, null>) => {
                return Object.keys(obj);
            }
        );
    }
}

export const TagSet_T = new TagSet_TC();
export type  TagSet_A = t.TypeOf<  typeof TagSet_T>;
export type  TagSet   = t.OutputOf<typeof TagSet_T>;


export const Severity_T = t.keyof({
    "info":    null,
    "warning": null,
    "error":   null
});

export type Severity_A = t.TypeOf<  typeof Severity_T>;
export type Severity   = t.OutputOf<typeof Severity_T>;


export const Context_T = t.record(t.string, t.unknown);
export type Context_A  = t.TypeOf<  typeof Context_T>;
export type Context    = t.OutputOf<typeof Context_T>;


export const Issue_T = t.intersection([
    t.type({
        severity: Severity_T,
        message:  t.string
    }),
    t.partial({
        context: Context_T,
        name:    t.number,
        tags:    TagSet_T
    })
]);

export type Issue_A = t.TypeOf<  typeof Issue_T>;
export type Issue   = t.OutputOf<typeof Issue_T>;


export const IssueList_T = t.array(Issue_T);
export type  IssueList_A = t.TypeOf<  typeof IssueList_T>;
export type  IssueList   = t.OutputOf<typeof IssueList_T>;


export function hasErrors (issues: IssueList_A): boolean {
    return pipe(issues, A.filter(i => i.severity === "error"), a => a.length > 0);
}


export function issueErrorExternal (reason: unknown, context?: Context): Issue {
    return Issue_T.encode(err({ ...msg(reason), ...ctx(context) }));
}

export const msg = (reason: unknown): { message: string } => {
    if (reason instanceof Error) {
        return { message: reason.message };
    }

    if (typeof reason === "string") {
        return { message: reason };
    }
    return { message: "unknown error; see context" };
};

export const info = (issue: Omit<Issue_A, "severity">): Issue_A => ({ severity: "info",    ...issue });
export const warn = (issue: Omit<Issue_A, "severity">): Issue_A => ({ severity: "warning", ...issue });
export const err  = (issue: Omit<Issue_A, "severity">): Issue_A => ({ severity: "error",   ...issue });

export const ctx = (context: Context): { context: Context } => ({ context });
export const name = (name: number): { name: number } => ({ name });

function mergeTags (first: { tags?: TagSet_A }, second: { tags?: TagSet_A }): { tags?: TagSet_A } | undefined {
    if (typeof first.tags === "undefined") { return second; }
    if (typeof second.tags === "undefined") { return first; }

    const newSet: TagSet_A = {};
    for (const t of Object.keys(first.tags)) {
        newSet["" + t] = null;
    }
    for (const t of Object.keys(second.tags)) {
        newSet["" + t] = null;
    }

    return { tags: newSet };
}

export function addTags (issues: IssueList_A, ...t: { tags: TagSet_A }[]): IssueList_A {
    return pipe(issues, A.map(issue => ({ ...issue, ...A.reduce(issue, mergeTags)(t) })));
}
