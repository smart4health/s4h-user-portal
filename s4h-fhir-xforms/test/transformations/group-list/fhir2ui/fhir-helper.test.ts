/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import * as O from "fp-ts/Option";

import { FHIR_ValueSet_A } from "../../../../src/fhir-resources/types";
import { getValueSetFromQuestionnaire, isExtension } from "../../../../src/transformations/group-list/fhir2ui/stage-d-derive-groups/treatment-course/fhir-helper";


describe("fhir-helper suite", () => {

    describe("getValueSetFromQuestionnaire", () => {

        it("questionnaire w/o contained valueset", () => {
            expect(getValueSetFromQuestionnaire({
                resourceType: "Questionnaire",
                id: "123",
                title: "dummy"
            }, "#foo")).to.eql(O.none);
        });

        it("questionnaire w/ empty contained array", () => {
            expect(getValueSetFromQuestionnaire({
                resourceType: "Questionnaire",
                id: "123",
                title: "dummy",
                contained: []
            }, "#foo")).to.eql(O.none);
        });

        it("questionnaire w/ non-matching contained array", () => {
            expect(getValueSetFromQuestionnaire({
                resourceType: "Questionnaire",
                id: "123",
                title: "dummy",
                contained: [
                    {
                        resourceType: "ValueSet",
                        id: "bar",
                        status: "draft"
                    }
                ]
            }, "#foo")).to.eql(O.none);
        });

        it("questionnaire w/ matching contained array", () => {
            const vs0: FHIR_ValueSet_A = {
                resourceType: "ValueSet",
                status: "draft",
                id: "foo"
            };
            const vs1: FHIR_ValueSet_A = {
                resourceType: "ValueSet",
                status: "draft",
                id: "bar"
            };

            expect(getValueSetFromQuestionnaire({
                resourceType: "Questionnaire",
                id: "123",
                title: "dummy",
                contained: [ vs0, vs1 ]
            }, "#foo")).to.eql(O.some(vs0));
        });

        it("questionnaire w/ double matching contained array, return first match", () => {
            const vs0: FHIR_ValueSet_A = {
                resourceType: "ValueSet",
                status: "draft",
                id: "foo",
                expansion: {
                    contains: []
                }
            };
            const vs1: FHIR_ValueSet_A = {
                resourceType: "ValueSet",
                status: "draft",
                id: "foo"
            };

            expect(getValueSetFromQuestionnaire({
                resourceType: "Questionnaire",
                id: "123",
                title: "dummy",
                contained: [ vs0, vs1 ]
            }, "#foo")).to.eql(O.some(vs0));
        });

    });

    describe("isExtension", () => {

        it("empty", () => {
            expect(isExtension("ext", { code: "bar" } )({ url: "ext", valueCodeableConcept: { coding: [] } })).to.be.false;
        });

        it("match 1", () => {
            expect(isExtension("ext", { system: "foo", code: "bar" } )({ url: "ext", valueCodeableConcept: { coding: [{ system: "foo", code: "bar" }] } })).to.be.true;
        });

        it("match 2", () => {
            expect(isExtension("ext", { system: "foo", code: "bar" } )({ url: "ext", valueCodeableConcept: { coding: [
                { system: "fooxx", code: "barxx" },
                { system: "foo", code: "bar" }
            ] } })).to.be.true;
        });

        it("no match 1", () => {
            expect(isExtension("ext", { system: "foo", code: "bar" } )({ url: "ext2", valueCodeableConcept: { coding: [{ system: "foo", code: "bar" }] } })).to.be.false;
        });

        it("no match 2", () => {
            expect(isExtension("ext", { system: "foo", code: "bar" } )({ url: "ext2", valueCode: "bar" })).to.be.false;
        });

    });

});
