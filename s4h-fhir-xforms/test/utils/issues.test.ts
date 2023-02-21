/* eslint-disable max-nested-callbacks */
import * as chai from "chai";
const expect = chai.expect;
const assert = chai.assert;

import * as E from "fp-ts/Either";

import { Issue, IssueList_A, IssueList_T, Issue_T, addTags, err, msg, tags } from "../../src/utils/issues";
import { consoleLogInspect, shouldDump } from "../utils";


describe("issues suite", () => {

    it("Issue -> Issue_A", () => {
        const issue: Issue = {
            message: "Something happened",
            severity: "warning",
            tags: [ "foo", "bar" ]
        };

        const issueA = Issue_T.decode(issue);

        if (shouldDump()) {
            consoleLogInspect(issueA);
        }

        if (E.isLeft(issueA)) {
            assert.fail("expected to be right");
        } else {
            expect(issueA.right.tags).to.eql({ foo: null, bar: null });
        }
    });

    it("IssueList_A -> IssueList (1)", () => {
        const issuesA: IssueList_A = [{
            message: "Something happened",
            severity: "warning",
            tags: { "foo": null, "bar": null }
        }, {
            message: "Something else happened",
            severity: "error",
            tags: { "foo": null, "baz": null }
        }];

        const issues = IssueList_T.encode(issuesA);

        if (shouldDump()) {
            consoleLogInspect(issues);
        }

        expect(issues[0].message).to.equal("Something happened");
        expect(issues[0].severity).to.equal("warning");
        expect(issues[0].tags).to.include.all.members([ "bar", "foo" ]);

        expect(issues[1].message).to.equal("Something else happened");
        expect(issues[1].severity).to.equal("error");
        expect(issues[1].tags).to.include.all.members([ "baz", "foo" ]);
    });

    it("IssueList_A -> IssueList (2)", () => {
        const issuesA: IssueList_A = [{
            message: "Something happened",
            severity: "warning",
            context: { foo: "bar" },
            tags: { "resolve": null }
        }];

        const issues = IssueList_T.encode(issuesA);

        if (shouldDump()) {
            consoleLogInspect(issues);
        }

        expect(issues[0].message).to.equal("Something happened");
        expect(issues[0].severity).to.equal("warning");
        expect(issues[0].context).to.eql({ foo: "bar" });
        expect(issues[0].tags).to.eql([ "resolve" ]);
    });

    describe("tags merging", () => {

        it("single issue, single tag", () => {
            const issue = err({ ...msg("Booom") });

            const added = addTags([ issue ], tags("foo"));

            expect(added).to.have.length(1);

            expect(added[0]).to.eql({ severity: "error", message: "Booom", tags: { foo: null } });
            expect(issue).to.eql({ severity: "error", message: "Booom" }); // unchanged
        });

        it("single issue, multiple tags", () => {
            const issue = err({ ...msg("Booom"), ...tags("bar", "wom") });

            const added = addTags([ issue ], tags("foo", "bar"));

            expect(added).to.have.length(1);

            expect(added[0]).to.eql({ severity: "error", message: "Booom", tags: { foo: null, bar: null, wom: null } });
            expect(issue).to.eql({ severity: "error", message: "Booom", tags: { bar: null, wom: null } }); // unchanged
        });

        it("single issue, no tags 1", () => {
            const issue = err({ ...msg("Booom") });

            const added = addTags([ issue ]);

            expect(added).to.have.length(1);

            expect(added[0]).to.eql({ severity: "error", message: "Booom" });
            expect(issue).to.eql({ severity: "error", message: "Booom" }); // unchanged
        });

        it("single issue, no tags 2", () => {
            const issue = err({ ...msg("Booom"), ...tags("bar", "wom") });

            const added = addTags([ issue ], tags());

            expect(added).to.have.length(1);

            expect(added[0]).to.eql({ severity: "error", message: "Booom", tags: { bar: null, wom: null } });
            expect(issue).to.eql({ severity: "error", message: "Booom", tags: { bar: null, wom: null } }); // unchanged
        });
    });

});
