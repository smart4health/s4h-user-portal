/* eslint-disable max-nested-callbacks */
import { assert, expect } from "chai";

import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

import { parseTauDateTime } from "../../../../src/fhir-resources/utils/tau";
import { RefGraph, RefNode } from "../../../../src/fhir-resources/utils/graph";
import { assertEitherLeft, consoleLogInspect, shouldDump } from "../../../utils";
import { FileGroupItem_A, SimpleDocumentGroup_T } from "../../../../src/transformations/group-list/defs";
import { protoGroupToUiGroup } from "../../../../src/transformations/group-list/fhir2ui/stage-d-derive-groups/defs";
import { deriveTreatmentCourseGroup } from "../../../../src/transformations/group-list/fhir2ui/stage-d-derive-groups/treatment-course/derive-treatment-course-group";


describe("derive treatment course groups suite", () => {

    it("treatment course group - 1", () => {
        const g = new RefGraph();
        const result = deriveTreatmentCourseGroup(g, g.getNodes());

        assertEitherLeft(result);
    });


    it("treatment course group - 2", () => {
        const g = new RefGraph();

        g.addEdge({ system: "foo", value: "enc:day:1" }, { system: "foo", value: "enc:course" }, "foobar");
        g.addEdge({ system: "foo", value: "enc:day:2" }, { system: "foo", value: "enc:course" }, "foobar");

        const result = deriveTreatmentCourseGroup(g, g.getNodes());

        assertEitherLeft(result);
    });


    it("treatment course group - 3", () => {
        const g = new RefGraph();

        g.addEdge({ system: "foo", value: "enc:day:1" }, { system: "foo", value: "enc:course" }, "partOf");
        g.addEdge({ system: "foo", value: "enc:day:2" }, { system: "foo", value: "enc:course" }, "partOf");

        const result = deriveTreatmentCourseGroup(g, g.getNodes());

        if (E.isLeft(result)) { assert.fail("group must not be left"); }

        const group = protoGroupToUiGroup(result.right[1]);
        expect(group.date).to.be.undefined;
        expect(group.items).to.be.empty;
        expect(result.right[1].id).to.be.string;
    });


    it("treatment course group - 4", () => {
        const g = new RefGraph();

        g.addNode(new RefNode([{ system: "foo", value: "doc:1:1" }], {
            boxed: {
                resourceType: "DocumentReference",
                id: "AAA",
                identifier: [{
                    system: "S4H",
                    value: "AAA"
                }],
                status: "current",
                type: { coding: [{ system: "foo", code: "bar" }] },
                date: E.getOrElse(() => undefined)(parseTauDateTime("2020-01-01T00:00:00.000Z")),
                subject: {
                    reference: "Subject-AAA"
                },
                content: [
                    {
                        attachment: {
                            id: "11111"
                        }
                    }, {
                        attachment: {
                            id: "22222"
                        }
                    }
                ]
            },
            period: {
                min: -Infinity,
                max: +Infinity
            },
            type: O.none,
            category: [],
            specialty: O.none
        }));

        g.addNode(new RefNode([{ system: "foo", value: "doc:1:2" }], {
            boxed: {
                resourceType: "DocumentReference",
                id: "BBB",
                status: "current",
                type: { coding: [{ system: "foo", code: "bar" }] },
                date: E.getOrElse(() => undefined)(parseTauDateTime("2020-06-01T00:00:00.000Z")),
                subject: {
                    identifier: {
                        system: "KIS", value: "PAT-BBB"
                    }
                },
                content: [
                    {
                        attachment: {
                            id: "33333"
                        }
                    }
                ]
            },
            period: {
                min: -Infinity,
                max: +Infinity
            },
            type: O.none,
            category: [],
            specialty: O.none
        }));

        g.addEdge({ system: "foo", value: "enc:day:1" }, { system: "foo", value: "enc:course" }, "partOf");
        g.addEdge({ system: "foo", value: "doc:1:1"   }, { system: "foo", value: "enc:day:1"  }, "context");
        g.addEdge({ system: "foo", value: "doc:1:2"   }, { system: "foo", value: "enc:day:1"  }, "context");

        g.addEdge({ system: "foo", value: "enc:day:2" }, { system: "foo", value: "enc:course" }, "partOf");
        g.addEdge({ system: "foo", value: "doc:2:1"   }, { system: "foo", value: "enc:day:2"  }, "context");
        g.addEdge({ system: "foo", value: "doc:2:2"   }, { system: "foo", value: "enc:day:2"  }, "context");
        g.addEdge({ system: "foo", value: "doc:2:3"   }, { system: "foo", value: "enc:day:2"  }, "context");

        g.addNode(new RefNode([{ system: "foo", value: "doc:2:3" }], {
            boxed: {
                resourceType: "DocumentReference",
                id: "CCC",
                status: "current",
                type: { coding: [{ system: "foo", code: "bar" }] },
                date: E.getOrElse(() => undefined)(parseTauDateTime("2019-06-01T00:00:00.000Z")),
                content: [
                    {
                        attachment: {
                            id: "44444"
                        }
                    }
                ],
                contained: [ {
                    resourceType: "PractitionerRole",
                    id: "xyz",
                    practitioner: { reference: "#foo" },
                    specialty: [{
                        coding: [{ system: "abc", code: "def", display: "Show me in UI" }]
                    }]
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any ]
            },
            period: {
                min: -Infinity,
                max: +Infinity
            },
            type: O.none,
            category: [],
            specialty: O.some({
                codeableConcept: { system: "abc", code: "def", display: "Show me in UI" },
                resolvedText: "Show me in UI"
            })
        }));

        const result = deriveTreatmentCourseGroup(g, g.getNodes());
        if (E.isLeft(result)) { assert.fail("group must not be left"); }

        if (shouldDump()) {
            consoleLogInspect(result.right);
        }

        const group = protoGroupToUiGroup(result.right[1]);

        expect(group.groupType).to.eql("Course");
        expect(group.id).to.be.string;
        expect(group.date).to.eql("2020-06-01T00:00:00.000Z");
        expect(group.items).to.have.length(4);

        expect( group.items[0].type).to.eql("File");
        expect( group.items[0].id).to.eql("CCC");
        expect( group.items[0].date).to.eql("2019-06-01T00:00:00.000Z");
        expect((group.items[0] as FileGroupItem_A).fileId).to.eql("44444");
        expect((group.items[0] as FileGroupItem_A).specialty).to.eql({
            codeableConcept: { system: "abc", code: "def", display: "Show me in UI" },
            resolvedText: "Show me in UI"
        });

        expect( group.items[1].type).to.eql("File");
        expect( group.items[1].id).to.eql("AAA");
        expect( group.items[1].date).to.eql("2020-01-01T00:00:00.000Z");
        expect((group.items[1] as FileGroupItem_A).fileId).to.eql("11111");

        expect( group.items[2].type).to.eql("File");
        expect( group.items[2].id).to.eql("AAA");
        expect( group.items[2].date).to.eql("2020-01-01T00:00:00.000Z");
        expect((group.items[2] as FileGroupItem_A).fileId).to.eql("22222");

        expect( group.items[3].type).to.eql("File");
        expect( group.items[3].id).to.eql("BBB");
        expect( group.items[3].date).to.eql("2020-06-01T00:00:00.000Z");
        expect((group.items[3] as FileGroupItem_A).fileId).to.eql("33333");
    });

    it("SimpleDocumentGroup decode regression test", () => {
        const docA = {
            "groupType": "Document",
            "id": "92ea9f52-134d-42ce-830d-b89c9716dcff",
            "date": "2021-03-11T11:00:00.000Z",
            "items": [
                {
                    "type": "File",
                    "id": "92ea9f52-134d-42ce-830d-b89c9716dcff",
                    "identifier": [{ "system": "foo", "value": "bar" }],
                    "date": "2021-03-11T11:00:00.000Z",
                    "fileId": "583c6dd6-477d-4cf1-9948-28257e3985df",
                    "title": "xxx",
                    "category": [{
                        "codeableConcept": {
                            "coding": [{ "system": "http://loinc.org", "code": "11524-6", "display": "EKG study" }]
                        },
                        "resolvedText": "EKG study"
                    }],
                    "docRefType": {
                        "codeableConcept": { "coding": [{ "display": "EKG study" }] },
                        "resolvedText": "EKG study"
                    }
                }
            ],
            "title": "xxx"
        };

        const r = SimpleDocumentGroup_T.decode(docA);

        consoleLogInspect(r, 10);
        expect(r._tag).to.eql("Right");
    });

});
