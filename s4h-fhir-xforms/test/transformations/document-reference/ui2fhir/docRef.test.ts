/* eslint-disable max-nested-callbacks */
import { assert, expect } from "chai";

import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";

import { FilePolyfill, consoleLogInspect, shouldDump } from "../../../utils";

import { fhirToGroupLists } from "../../../../src/transformations/group-list/fhir2ui";
import { SimpleDocumentGroup_A } from "../../../../src/transformations/group-list/defs";
import { FHIR_Practitioner_A } from "../../../../src/fhir-resources/individuals/practitioner";
import { FHIR_PractitionerRole_A } from "../../../../src/fhir-resources/individuals/practitioner-role";
import { FHIR_DocumentReference, FHIR_DocumentReference_A } from "../../../../src/fhir-resources/documents/document-reference-r4";
import { DocumentReferenceProvenanceTuple, amendDocumentReference, makeDocumentReference } from "../../../../src/transformations/document-reference/ui2fhir/docRef";


describe("FHIR2UI - DocumentReference", () => {

    describe("makeDocumentReference suite", () => {

        it("make DocumentReference with Practitioner", async () => {
            let tuple: DocumentReferenceProvenanceTuple;

            try {
                tuple = await makeDocumentReference({
                    id: "foobar",
                    docDateTime: new Date("2020-11-17T12:34:56.666Z"),
                    file: new FilePolyfill(new Uint8Array([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]), "foo.pdf", { type: "text/plain" }),
                    title: "Doctor letter",
                    category: [{
                        coding: [{ system: "http://loinc.org", code: "12345-6" }]
                    }, {
                        coding: [{ system: "http://loinc.org", code: "99999-9" }]
                    }],
                    practitioner: {
                        firstName: "Henry",
                        lastName:  "Jones",
                        specialty: {
                            coding: [
                                { system: "http://our.system.org", code: "abcde" }
                            ]
                        }
                    }
                }, { userId: "hjones", clientId: "citizen-app", recorded: new Date("2021-08-12T12:34:56.666Z") });

            } catch (issues) {
                if (shouldDump()) {
                    consoleLogInspect(issues);
                }
                assert.fail("could not make DocumentReference");
            }

            if (shouldDump()) {
                consoleLogInspect(tuple);
            }

            expect(tuple.documentReference.resourceType).to.eql("DocumentReference");
            expect(tuple.documentReference.id).to.eql("foobar");
            expect(tuple.documentReference.status).to.eql("current");
            expect(tuple.documentReference.date).to.eql("2020-11-17T12:34:56.666Z");

            expect(tuple.documentReference.category).to.eql([
                { coding: [{ system: "http://loinc.org", code: "12345-6" }] },
                { coding: [{ system: "http://loinc.org", code: "99999-9" }] }
            ]);

            expect(tuple.documentReference.content).to.eql([{
                attachment: {
                    id: "foo.pdf",
                    title: "Doctor letter",
                    contentType: "text/plain",
                    size: 10,
                    file: new FilePolyfill(new Uint8Array([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]), "foo.pdf", { type: "text/plain" })
                }
            }]);

            expect(tuple.documentReference.contained).to.have.length(2);

            const practitioner = pipe(tuple.documentReference.contained,
                A.filter(x => x.resourceType === "Practitioner")
            );
            expect(practitioner).to.have.length(1);
            expect((practitioner[0] as unknown as FHIR_Practitioner_A).name).to.eql([{ family: "Jones", given: [ "Henry" ] }]);

            const role = pipe(tuple.documentReference.contained,
                A.filter(x => x.resourceType === "PractitionerRole")
            );
            expect(role).to.have.length(1);
            expect((role[0] as unknown as FHIR_PractitionerRole_A).specialty).to.eql([{
                coding: [{ system: "http://our.system.org", code: "abcde" }]
            }]);

            expect((role[0] as unknown as FHIR_PractitionerRole_A).practitioner).to.eql({
                reference: "#" + (practitioner[0] as unknown as FHIR_Practitioner_A).id
            });

            expect(tuple.documentReference.author).to.eql([{
                reference: "#" + (practitioner[0] as unknown as FHIR_Practitioner_A).id
            }]);

            // Provenance checks
            expect(tuple.provenance.recorded).to.eql("2021-08-12T12:34:56.666Z");
            expect(tuple.provenance.target).to.eql([{
                identifier: tuple.documentReference.identifier[0]
            }]);

            expect(Object.keys(tuple.provenance)).not.to.contain("__phdpCreated");
            expect(Object.keys(tuple.provenance)).not.to.contain("__phdpUpdated");
            expect(Object.keys(tuple.provenance)).not.to.contain("_occurredTag");
        });

        it("make new DocumentResource and turn it into SimpleDocumentGroup", async () => {
            let tuple: DocumentReferenceProvenanceTuple;
            try {
                tuple = await makeDocumentReference({
                    id: "foobar",
                    docDateTime: new Date("2021-01-20T12:34:56.666Z"),
                    file: new FilePolyfill(new Uint8Array([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]), "foo.pdf", { type: "text/plain" }),
                    title: "Doctor letter",
                    category: [{
                        coding: [{ system: "http://loinc.org", code: "25045-6" }]
                    }, {
                        coding: [{ system: "http://loinc.org", code: "99999-9", display: "Dummy category" }]
                    }],
                    practitioner: {
                        firstName: "Henry",
                        lastName:  "Jones",
                        specialty: {
                            coding: [
                                { system: "http://our.system.org", code: "abcde" }
                            ]
                        }
                    }
                }, { userId: "hjones", clientId: "citizen-app", recorded: new Date("2021-07-20T12:34:56.666Z") });

            } catch (issues) {
                if (shouldDump()) {
                    consoleLogInspect(issues);
                }
                assert.fail("could not make DocumentReference");
            }

            if (shouldDump()) {
                consoleLogInspect(tuple);
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [ _issues, result ] = await fhirToGroupLists([ tuple.documentReference ]);

            if (shouldDump()) {
                consoleLogInspect(result);
            }

            expect(result.model.groupList).to.have.length(1);

            expect(result.model.groupList[0].groupType).to.eql("Document");
            expect(result.model.groupList[0].id).to.eql("foobar");
            expect(result.model.groupList[0].date).to.eql("2021-01-20T12:34:56.666Z");

            expect((result.model.groupList[0] as SimpleDocumentGroup_A).title).to.eql("Doctor letter");
            expect((result.model.groupList[0] as SimpleDocumentGroup_A).items).to.have.length(1);
            expect((result.model.groupList[0] as SimpleDocumentGroup_A).items[0].type).to.eql("File");
            expect((result.model.groupList[0] as SimpleDocumentGroup_A).items[0].id).to.eql("foobar");
            expect((result.model.groupList[0] as SimpleDocumentGroup_A).items[0].date).to.eql("2021-01-20T12:34:56.666Z");
            expect((result.model.groupList[0] as SimpleDocumentGroup_A).items[0].fileId).to.eql("foo.pdf");
            expect((result.model.groupList[0] as SimpleDocumentGroup_A).items[0].title).to.eql("Doctor letter");

            let found = false;
            for (const cat of (result.model.groupList[0] as SimpleDocumentGroup_A).items[0].category) {
                if (cat.resolvedText === "Unspecified body region CT") {
                    found = true;
                    break;
                }
            }

            if (!found) {
                assert.fail("did not find category value");
            }

            // Provenance checks
            expect(tuple.provenance.recorded).to.eql("2021-07-20T12:34:56.666Z");
            expect(tuple.provenance.target).to.eql([{
                identifier: tuple.documentReference.identifier[0]
            }]);

        });

        it("make document w/o category", async () => {
            let tuple: DocumentReferenceProvenanceTuple;

            try {
                tuple = await makeDocumentReference({
                    id: "foobar",
                    docDateTime: new Date("2020-11-17T12:34:56.666Z"),
                    file: new FilePolyfill(new Uint8Array([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]), "foo.pdf", { type: "text/plain" }),
                    title: "Doctor letter",
                    practitioner: {
                        firstName: "Henry",
                        lastName:  "Jones",
                        specialty: {
                            coding: [
                                { system: "http://our.system.org", code: "abcde" }
                            ]
                        }
                    }
                }, { userId: "hjones", clientId: "citizen-app", recorded: new Date("2020-11-17T12:34:56.666Z") });

            } catch (issues) {
                if (shouldDump()) {
                    consoleLogInspect(issues);
                }
                assert.fail("could not make DocumentReference");
            }

            if (shouldDump()) {
                consoleLogInspect(tuple.documentReference);
            }

            expect(tuple.documentReference.resourceType).to.eql("DocumentReference");
            expect(tuple.documentReference.id).to.eql("foobar");
            expect(tuple.documentReference.status).to.eql("current");
            expect(tuple.documentReference.date).to.eql("2020-11-17T12:34:56.666Z");

            expect(tuple.documentReference.category).to.be.undefined;

            expect(tuple.documentReference.content).to.eql([{
                attachment: {
                    id: "foo.pdf",
                    title: "Doctor letter",
                    contentType: "text/plain",
                    size: 10,
                    file: new FilePolyfill(new Uint8Array([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]), "foo.pdf", { type: "text/plain" })
                }
            }]);

            expect(tuple.documentReference.contained).to.have.length(2);

            const practitioner = pipe(tuple.documentReference.contained,
                A.filter(x => x.resourceType === "Practitioner")
            );
            expect(practitioner).to.have.length(1);
            expect((practitioner[0] as unknown as FHIR_Practitioner_A).name).to.eql([{ family: "Jones", given: [ "Henry" ] }]);

            const role = pipe(tuple.documentReference.contained,
                A.filter(x => x.resourceType === "PractitionerRole")
            );
            expect(role).to.have.length(1);
            expect((role[0] as unknown as FHIR_PractitionerRole_A).specialty).to.eql([{
                coding: [{ system: "http://our.system.org", code: "abcde" }]
            }]);

            expect((role[0] as unknown as FHIR_PractitionerRole_A).practitioner).to.eql({
                reference: "#" + (practitioner[0] as unknown as FHIR_Practitioner_A).id
            });

            expect(tuple.documentReference.author).to.eql([{
                reference: "#" + (practitioner[0] as unknown as FHIR_Practitioner_A).id
            }]);

            // Provenance checks
            expect(tuple.provenance.recorded).to.eql("2020-11-17T12:34:56.666Z");
            expect(tuple.provenance.target).to.eql([{
                identifier: tuple.documentReference.identifier[0]
            }]);

        });

    });

    describe("amendDocumentReference suite", () => {

        it("amend DocumentReference.date", async () => {
            const docRef: FHIR_DocumentReference = {
                resourceType: "DocumentReference",
                id: "foo",
                date: "2000-01-01T00:00:00.000Z",
                status: "current",
                content: [{
                    attachment: {
                        id: "file-1",
                        data: "Q29udGVudCBvZiBGaWxlIE9uZQ=="
                    }
                }, {
                    attachment: {
                        id: "file-2",
                        data: "Q29udGVudCBvZiBGaWxlIFR3bw=="
                    }
                }]
            };

            let tuple: DocumentReferenceProvenanceTuple;
            try {
                tuple = await amendDocumentReference(docRef, {
                    docDateTime: new Date("2020-11-11T12:00:00.000Z")
                }, { userId: "hjones", clientId: "citizen-app", recorded: new Date("2020-11-22T12:00:00.000Z") });

            } catch (issues) {
                consoleLogInspect(issues);
                assert.fail("could not amend DocumentReference");
            }

            if (shouldDump()) {
                consoleLogInspect(tuple, 10);
            }

            expect(tuple.documentReference).to.eql({
                resourceType: "DocumentReference",
                id: "foo",
                date: "2020-11-11T12:00:00.000Z",
                status: "current",
                identifier: tuple.documentReference.identifier, // this is dynamic and we do not know it beforehand
                content: [{
                    attachment: {
                        id: "file-1",
                        data: "Q29udGVudCBvZiBGaWxlIE9uZQ=="
                    }
                }, {
                    attachment: {
                        id: "file-2",
                        data: "Q29udGVudCBvZiBGaWxlIFR3bw=="
                    }
                }]
            });

            // Provenance checks
            expect(tuple.provenance.recorded).to.eql("2020-11-22T12:00:00.000Z");
            expect(tuple.provenance.target).to.eql([{
                identifier: tuple.documentReference.identifier[0]
            }]);
        });

        it("amend DocumentReference.category", async () => {
            const docRef: FHIR_DocumentReference_A = {
                resourceType: "DocumentReference",
                id: "foo",
                status: "current",
                content: [], // technically not allowed, but we tolerate it
                identifier: [{
                    system: "foo",
                    value: "bar"
                }],
                category: [
                    { coding: [{ system: "foo", code: "bar" }] },
                    { coding: [{ system: "wom", code: "bat" }] }
                ]
            };

            let tuple: DocumentReferenceProvenanceTuple;
            try {
                tuple = await amendDocumentReference(docRef, {
                    category: [{ coding: [{ system: "baz", code: "quz" }] }]
                }, { userId: "hjones", clientId: "citizen-app", recorded: new Date("2020-11-22T12:00:00.000Z") });

            } catch (issues) {
                assert.fail("could not amend DocumentReference");
            }

            if (shouldDump()) {
                consoleLogInspect(tuple);
            }

            expect(tuple.documentReference).to.eql({
                resourceType: "DocumentReference",
                id: "foo",
                status: "current",
                content: [],
                identifier: [{
                    system: "foo",
                    value: "bar"
                }],
                category: [{ coding: [{ system: "baz", code: "quz" }] }]
            });

            // Provenance checks
            expect(tuple.provenance.target).to.eql([{
                identifier: {
                    system: "foo",
                    value: "bar"
                }
            }]);
            expect(tuple.provenance.recorded).to.eql("2020-11-22T12:00:00.000Z");
        });

        it("amend DocumentReference.category (remove it)", async () => {
            const docRef: FHIR_DocumentReference_A = {
                resourceType: "DocumentReference",
                id: "foo",
                status: "current",
                content: [], // technically not allowed, but we tolerate it
                category: [
                    { coding: [{ system: "foo", code: "bar" }] },
                    { coding: [{ system: "wom", code: "bat" }] }
                ]
            };

            let tuple: DocumentReferenceProvenanceTuple;
            try {
                tuple = await amendDocumentReference(docRef, {
                    category: []
                }, { userId: "hjones", clientId: "citizen-app", recorded: new Date("2020-11-22T12:00:00.000Z") });

            } catch (issues) {
                assert.fail("could not amend DocumentReference");
            }

            if (shouldDump()) {
                consoleLogInspect(tuple);
            }

            expect(tuple.documentReference).to.eql({
                resourceType: "DocumentReference",
                id: "foo",
                identifier: tuple.documentReference.identifier, // this is dynamic and we do not know it beforehand
                status: "current",
                content: [],
                category: undefined
            });

            // Provenance checks
            expect(tuple.provenance.target).to.eql([{
                identifier: tuple.documentReference.identifier[0]
            }]);
            expect(tuple.provenance.recorded).to.eql("2020-11-22T12:00:00.000Z");
        });

        it("cannot amend DocumentReference.content - 1", async () => {
            const docRef: FHIR_DocumentReference_A = {
                resourceType: "DocumentReference",
                id: "foo",
                status: "current",
                content: [{
                    attachment: {
                        id: "file-1",
                        data: "Q29udGVudCBvZiBGaWxlIE9uZQ=="
                    }
                }]
            };

            try {
                await amendDocumentReference(docRef, {
                    file: new FilePolyfill(new ArrayBuffer(0), "foo.pdf", { type: "text/plain" })
                }, { userId: "hjones", clientId: "citizen-app", recorded: new Date("2020-11-22T12:00:00.000Z") });
                assert.fail("should have failed");

            } catch (issues) {
                // ignore
            }
        });

        it("cannot amend DocumentReference.content - 2", async () => {
            const docRef: FHIR_DocumentReference_A = {
                resourceType: "DocumentReference",
                id: "foo",
                status: "current",
                content: [{
                    attachment: {
                        id: "file-1",
                        data: "Q29udGVudCBvZiBGaWxlIE9uZQ=="
                    }
                }]
            };

            try {
                await amendDocumentReference(docRef, {
                    title: "New title"
                }, { userId: "hjones", clientId: "citizen-app", recorded: new Date("2020-11-22T12:00:00.000Z") });
                assert.fail("should have failed");

            } catch (issues) {
                // ignore
            }
        });

        it("amend function is pure", async () => {
            // Idea: Construct a DocumentResource, amend it and check that the initial resource is unmodified

            const tuple = await makeDocumentReference({
                id: "foobar",
                docDateTime: new Date("2020-11-17T12:34:56.666Z"),
                file: new FilePolyfill(new Uint8Array([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]), "foo.pdf", { type: "text/plain" }),
                title: "Doctor letter",
                category: [{
                    coding: [{ system: "http://loinc.org", code: "12345-6" }]
                }, {
                    coding: [{ system: "http://loinc.org", code: "99999-9" }]
                }],
                practitioner: {
                    firstName: "Henry",
                    lastName:  "Jones",
                    specialty: {
                        coding: [
                            { system: "lucas-arts", code: "digging" }
                        ]
                    }
                }
            }, { userId: "hjones", clientId: "citizen-app", recorded: new Date("2020-11-22T12:00:00.000Z") });

            tuple.documentReference.contained.push({
                resourceType: "Foo",
                id: "bar"
            });

            // docRef is now in its final shape. We amend it and check that docRef remains untouched.

            let amendedTuple: DocumentReferenceProvenanceTuple;
            try {
                amendedTuple = await amendDocumentReference(tuple.documentReference, {
                    practitioner: {
                        firstName: "Guybrush", lastName: "Threepwood", specialty: {
                            coding: [{ system: "lucas-arts", code: "root-beer" }]
                        }
                    }
                }, { userId: "hjones", clientId: "citizen-app", recorded: new Date("2020-11-22T12:00:00.000Z") });

            } catch (issues) {
                if (shouldDump()) {
                    consoleLogInspect(issues);
                }
                assert.fail("should not have failed");
            }

            // docRef checks
            expect(tuple.documentReference.contained).to.have.length(3);

            let practitioner = pipe(tuple.documentReference.contained,
                A.filter(x => x.resourceType === "Practitioner")
            );
            expect(practitioner).to.have.length(1);
            expect((practitioner[0] as unknown as FHIR_Practitioner_A).name).to.eql([{ family: "Jones", given: [ "Henry" ] }]);

            let role = pipe(tuple.documentReference.contained,
                A.filter(x => x.resourceType === "PractitionerRole")
            );
            expect(role).to.have.length(1);
            expect((role[0] as unknown as FHIR_PractitionerRole_A).specialty).to.eql([{
                coding: [{ system: "lucas-arts", code: "digging" }]
            }]);


            // amendedDocRef checks
            practitioner = pipe(amendedTuple.documentReference.contained,
                A.filter(x => x.resourceType === "Practitioner")
            );
            expect(practitioner).to.have.length(1);
            expect((practitioner[0] as unknown as FHIR_Practitioner_A).name).to.eql([{ family: "Threepwood", given: [ "Guybrush" ] }]);

            role = pipe(amendedTuple.documentReference.contained,
                A.filter(x => x.resourceType === "PractitionerRole")
            );
            expect(role).to.have.length(1);
            expect((role[0] as unknown as FHIR_PractitionerRole_A).specialty).to.eql([{
                coding: [{ system: "lucas-arts", code: "root-beer" }]
            }]);

            expect(amendedTuple.documentReference.contained).to.have.length(3);
        });
    });

});
