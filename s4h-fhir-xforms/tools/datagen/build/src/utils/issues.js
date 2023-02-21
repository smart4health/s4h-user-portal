"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueErrorStageD = exports.issueWarningStageD = exports.issueInfoStageD = exports.issueInfoStageB = exports.issueErrorStageB = exports.issueWarningStageB = exports.issueErrorStageA = exports.issueWarningStageA = exports.issueErrorFn = exports.issueWarning = exports.issueInfo = exports.issueErrorExt = exports.issueError = exports.hasErrors = exports.IssueList_T = exports.Issue_T = exports.TagSet_T = exports.TagSet_TC = void 0;
const t = __importStar(require("io-ts"));
const A = __importStar(require("fp-ts/Array"));
const E = __importStar(require("fp-ts/Either"));
const function_1 = require("fp-ts/function");
class TagSet_TC extends t.Type {
    constructor() {
        super("TagSet_T", (x) => E.isRight(this.decode(x)), (x, c) => {
            if (!(x instanceof Array)) {
                return t.failure(x, c, "value is not an array");
            }
            const obj = {};
            for (const tag of x) {
                obj[tag] = null;
            }
            return t.success(obj);
        }, (obj) => {
            return Object.keys(obj);
        });
    }
}
exports.TagSet_TC = TagSet_TC;
exports.TagSet_T = new TagSet_TC();
exports.Issue_T = t.intersection([
    t.type({
        // stage: t.keyof({
        //     "A":  null,
        //     "B":  null,
        //     "C":  null,
        //     "D":  null,
        //     "NA": null
        // }),
        severity: t.keyof({
            "info": null,
            "warning": null,
            "error": null
        }),
        message: t.string
    }),
    t.partial({
        context: t.record(t.string, t.unknown),
        name: t.string,
        tags: exports.TagSet_T
    })
]);
exports.IssueList_T = t.array(exports.Issue_T);
function hasErrors(issues) {
    return function_1.pipe(issues, A.filter(i => i.severity === "error"), a => a.length > 0);
}
exports.hasErrors = hasErrors;
function issueError(reason, context) {
    if (reason instanceof Error) {
        return {
            severity: "error",
            message: reason.message,
            context
        };
    }
    if (typeof reason === "string") {
        return {
            severity: "error",
            message: reason,
            context
        };
    }
    return {
        severity: "error",
        message: "unknown error; see context",
        context: Object.assign(Object.assign({}, context), { reason })
    };
}
exports.issueError = issueError;
function issueErrorExt(reason, context) {
    return exports.Issue_T.encode(issueError(reason, context));
}
exports.issueErrorExt = issueErrorExt;
function issueInfo(message, context) {
    return {
        severity: "info",
        message,
        context
    };
}
exports.issueInfo = issueInfo;
function issueWarning(message, context) {
    return {
        severity: "warning",
        message,
        context
    };
}
exports.issueWarning = issueWarning;
const issueErrorFn = (reason, context) => () => [issueError(reason, context)];
exports.issueErrorFn = issueErrorFn;
function issueWarningStageA(message, context) {
    return {
        tags: { "stage-A": null },
        severity: "warning",
        message,
        context
    };
}
exports.issueWarningStageA = issueWarningStageA;
function issueErrorStageA(message, context) {
    return {
        tags: { "stage-A": null },
        severity: "error",
        message,
        context
    };
}
exports.issueErrorStageA = issueErrorStageA;
function issueWarningStageB(message, context) {
    return {
        tags: { "stage-B": null },
        severity: "warning",
        message,
        context
    };
}
exports.issueWarningStageB = issueWarningStageB;
function issueErrorStageB(message, context) {
    return {
        tags: { "stage-B": null },
        severity: "error",
        message,
        context
    };
}
exports.issueErrorStageB = issueErrorStageB;
function issueInfoStageB(message, context) {
    return {
        tags: { "stage-B": null },
        severity: "info",
        message,
        context
    };
}
exports.issueInfoStageB = issueInfoStageB;
function issueInfoStageD(message, context) {
    return {
        tags: { "stage-D": null },
        severity: "info",
        message,
        context
    };
}
exports.issueInfoStageD = issueInfoStageD;
function issueWarningStageD(message, context) {
    return {
        tags: { "stage-D": null },
        severity: "warning",
        message,
        context
    };
}
exports.issueWarningStageD = issueWarningStageD;
function issueErrorStageD(message, context) {
    return {
        tags: { "stage-D": null },
        severity: "error",
        message,
        context
    };
}
exports.issueErrorStageD = issueErrorStageD;
