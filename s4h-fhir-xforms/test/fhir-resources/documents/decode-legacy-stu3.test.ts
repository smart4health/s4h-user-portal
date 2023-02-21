/* eslint-disable max-nested-callbacks */
import { assert, expect } from "chai";

import * as E from "fp-ts/Either";
import { consoleLogInspect, shouldDump } from "../../utils";

import { decodeDocumentReference } from "../../../src/fhir-resources/documents/document-reference";
import { FHIR_DocumentReference_T } from "../../../src/fhir-resources/documents/document-reference-r4";


describe("parse legacy STU3 resources", () => {
    it("incorrect type, class missing", () => {
        const brokenStu3DocRef = {
            "author": [
              {
                "reference": "#d3675d5c-b904-4f18-bb8c-1eded90cab68"
              }
            ],
            "contained": [
              {
                "id": "d3675d5c-b904-4f18-bb8c-1eded90cab68",
                "resourceType": "Organization"
              }
            ],
            "content": [
              {
                "attachment": {
                  "contentType": "image/jpg",
                  "creation": "2020-02-10T16:47:55+01:00",
                  "hash": "ZSaeVjTOyexH+gyiV1vVV/yRJ6E=",
                  "id": "649defe0-0cbd-4d3b-92b1-4a6fee0e30d8",
                  "size": 2051275,
                  "title": "File_10-02-2020-11-16-30-633.jpg"
                }
              }
            ],
            "context": {},
            "created": "2020-02-10T10:16:40.781+01:00",
            "description": "ttt +1",
            "id": "7c2d4577-9a9c-4e83-8c68-ad0518756ce3",
            "identifier": [
              {
                "assigner": {
                  "reference": "89dbc876-ac7c-43b7-8741-25b14065fb91"
                },
                "value": "d4l_f_p_t#649defe0-0cbd-4d3b-92b1-4a6fee0e30d8#712fb97c-a219-48ae-a7a8-85b8c937c8cd#44a4317c-6809-40cc-a66b-de58acfe2f44"
              }
            ],
            "indexed": "2020-02-10T16:47:55+01:00",
            "status": "current",
            "type": {},
            "resourceType": "DocumentReference"
        };

        const r4DocRefA = decodeDocumentReference(brokenStu3DocRef);

        if (E.isLeft(r4DocRefA)) {
            assert.fail("should not have been left");
        }

        const r4DocRef = FHIR_DocumentReference_T.encode(r4DocRefA.right);

        expect(r4DocRef.type).to.be.undefined;

        expect(r4DocRef).to.eql({
            "author": [
              {
                "reference": "#d3675d5c-b904-4f18-bb8c-1eded90cab68"
              }
            ],
            "contained": [
              {
                "id": "d3675d5c-b904-4f18-bb8c-1eded90cab68",
                "resourceType": "Organization"
              }
            ],
            "content": [
              {
                "attachment": {
                  "contentType": "image/jpg",
                  "creation": "2020-02-10T16:47:55+01:00",
                  "hash": "ZSaeVjTOyexH+gyiV1vVV/yRJ6E=",
                  "id": "649defe0-0cbd-4d3b-92b1-4a6fee0e30d8",
                  "size": 2051275,
                  "title": "File_10-02-2020-11-16-30-633.jpg"
                }
              }
            ],
            "context": {},
            "description": "ttt +1",
            "id": "7c2d4577-9a9c-4e83-8c68-ad0518756ce3",
            "identifier": [
              {
                "assigner": {
                  "reference": "89dbc876-ac7c-43b7-8741-25b14065fb91"
                },
                "value": "d4l_f_p_t#649defe0-0cbd-4d3b-92b1-4a6fee0e30d8#712fb97c-a219-48ae-a7a8-85b8c937c8cd#44a4317c-6809-40cc-a66b-de58acfe2f44"
              }
            ],
            "date": "2020-02-10T16:47:55+01:00",
            "status": "current",
            "resourceType": "DocumentReference"
        });

    });

    it("correct type, class present", () => {
        const brokenStu3DocRef = {
            "author": [
              {
                "reference": "#d3675d5c-b904-4f18-bb8c-1eded90cab68"
              }
            ],
            "contained": [
              {
                "id": "d3675d5c-b904-4f18-bb8c-1eded90cab68",
                "resourceType": "Organization"
              }
            ],
            "content": [
              {
                "attachment": {
                  "contentType": "image/jpg",
                  "creation": "2020-02-10T16:47:55+01:00",
                  "hash": "ZSaeVjTOyexH+gyiV1vVV/yRJ6E=",
                  "id": "649defe0-0cbd-4d3b-92b1-4a6fee0e30d8",
                  "size": 2051275,
                  "title": "File_10-02-2020-11-16-30-633.jpg"
                }
              }
            ],
            "context": {},
            "created": "2020-02-10T10:16:40.781+01:00",
            "description": "ttt +1",
            "id": "7c2d4577-9a9c-4e83-8c68-ad0518756ce3",
            "identifier": [
              {
                "assigner": {
                  "reference": "89dbc876-ac7c-43b7-8741-25b14065fb91"
                },
                "value": "d4l_f_p_t#649defe0-0cbd-4d3b-92b1-4a6fee0e30d8#712fb97c-a219-48ae-a7a8-85b8c937c8cd#44a4317c-6809-40cc-a66b-de58acfe2f44"
              }
            ],
            "indexed": "2020-02-10T16:47:55+01:00",
            "status": "current",
            "type": {
                "text": "Bar"
            },
            "class": {
                "coding": [{
                    "system": "foo",
                    "code": "bar"
                }],
                "text": "Foo"
            },
            "resourceType": "DocumentReference"
        };

        const r4DocRefA = decodeDocumentReference(brokenStu3DocRef);
        if (shouldDump()) {
            consoleLogInspect(r4DocRefA);
        }

        if (E.isLeft(r4DocRefA)) {
            consoleLogInspect(r4DocRefA.left);
            assert.fail("should not have been left");
        }

        const r4DocRef = FHIR_DocumentReference_T.encode(r4DocRefA.right);

        expect(r4DocRef).to.eql({
            "author": [
              {
                "reference": "#d3675d5c-b904-4f18-bb8c-1eded90cab68"
              }
            ],
            "contained": [
              {
                "id": "d3675d5c-b904-4f18-bb8c-1eded90cab68",
                "resourceType": "Organization"
              }
            ],
            "content": [
              {
                "attachment": {
                  "contentType": "image/jpg",
                  "creation": "2020-02-10T16:47:55+01:00",
                  "hash": "ZSaeVjTOyexH+gyiV1vVV/yRJ6E=",
                  "id": "649defe0-0cbd-4d3b-92b1-4a6fee0e30d8",
                  "size": 2051275,
                  "title": "File_10-02-2020-11-16-30-633.jpg"
                }
              }
            ],
            "context": {},
            "description": "ttt +1",
            "id": "7c2d4577-9a9c-4e83-8c68-ad0518756ce3",
            "identifier": [
              {
                "assigner": {
                  "reference": "89dbc876-ac7c-43b7-8741-25b14065fb91"
                },
                "value": "d4l_f_p_t#649defe0-0cbd-4d3b-92b1-4a6fee0e30d8#712fb97c-a219-48ae-a7a8-85b8c937c8cd#44a4317c-6809-40cc-a66b-de58acfe2f44"
              }
            ],
            "date": "2020-02-10T16:47:55+01:00",
            "status": "current",
            "resourceType": "DocumentReference",
            "category": [
                {
                    "text": "Foo",
                    "coding": [{
                        "system": "foo",
                        "code": "bar"
                    }]
                }
            ],
            "type": {
                "text": "Bar"
            }
        });

    });



    it("real-world example", () => {
        const docRef = {
          "author": [
            {
              "reference": "#d3675d5c-b904-4f18-bb8c-1eded90cab68"
            }
          ],
          "contained": [
            {
              "id": "d3675d5c-b904-4f18-bb8c-1eded90cab68",
              "resourceType": "Organization"
            }
          ],
          "content": [
            {
              "attachment": {
                "contentType": "image/jpg",
                "creation": "2020-02-10T16:47:55+01:00",
                "hash": "ZSaeVjTOyexH+gyiV1vVV/yRJ6E=",
                "id": "649defe0-0cbd-4d3b-92b1-4a6fee0e30d8",
                "size": 2051275,
                "title": "File_10-02-2020-11-16-30-633.jpg"
              }
            }
          ],
          "context": {
            "encounter": [
              {
                "identifier": {
                  "system": "http://fhir.smart4health.eu/CodeSystem/ittm-location-id",
                  "value": "clinic-zs-ug-1"
                }
              }
            ]
          },
          "created": "2020-02-10T10:16:40.781+01:00",
          "description": "ttt +1",
          "id": "7c2d4577-9a9c-4e83-8c68-ad0518756ce3",
          "identifier": [
            {
              "assigner": {
                "reference": "89dbc876-ac7c-43b7-8741-25b14065fb91"
              },
              "value": "d4l_f_p_t#649defe0-0cbd-4d3b-92b1-4a6fee0e30d8#712fb97c-a219-48ae-a7a8-85b8c937c8cd#44a4317c-6809-40cc-a66b-de58acfe2f44"
            }
          ],
          "indexed": "2020-02-10T16:47:55+01:00",
          "status": "current",
          "type": {},
          "resourceType": "DocumentReference"
        };


        const r4DocRefA = decodeDocumentReference(docRef);

        if (E.isLeft(r4DocRefA)) {
            if (shouldDump()) {
            consoleLogInspect(r4DocRefA.left);
            }
            assert.fail("should not have been left");
        }

        const r4DocRef = FHIR_DocumentReference_T.encode(r4DocRefA.right);

        expect(r4DocRef).to.eql({
          "author": [
            {
              "reference": "#d3675d5c-b904-4f18-bb8c-1eded90cab68"
            }
          ],
          "contained": [
            {
              "id": "d3675d5c-b904-4f18-bb8c-1eded90cab68",
              "resourceType": "Organization"
            }
          ],
          "content": [
            {
              "attachment": {
                "contentType": "image/jpg",
                "creation": "2020-02-10T16:47:55+01:00",
                "hash": "ZSaeVjTOyexH+gyiV1vVV/yRJ6E=",
                "id": "649defe0-0cbd-4d3b-92b1-4a6fee0e30d8",
                "size": 2051275,
                "title": "File_10-02-2020-11-16-30-633.jpg"
              }
            }
          ],
          "context": {
            "encounter": [
              {
                "identifier": {
                  "system": "http://fhir.smart4health.eu/CodeSystem/ittm-location-id",
                  "value": "clinic-zs-ug-1"
                }
              }
            ]
          },
          "description": "ttt +1",
          "id": "7c2d4577-9a9c-4e83-8c68-ad0518756ce3",
          "identifier": [
            {
              "assigner": {
                "reference": "89dbc876-ac7c-43b7-8741-25b14065fb91"
              },
              "value": "d4l_f_p_t#649defe0-0cbd-4d3b-92b1-4a6fee0e30d8#712fb97c-a219-48ae-a7a8-85b8c937c8cd#44a4317c-6809-40cc-a66b-de58acfe2f44"
            }
          ],
          "date": "2020-02-10T16:47:55+01:00",
          "status": "current",
          "resourceType": "DocumentReference"
        });

    });
});
