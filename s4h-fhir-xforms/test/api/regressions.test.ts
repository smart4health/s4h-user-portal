/* eslint-disable max-nested-callbacks */
import { assert, expect } from "chai";

import { consoleLogInspect, shouldDump } from "../utils";
import { fhirToGroupLists } from "../../src/transformations/group-list/fhir2ui";


describe("regression test suite", () => {
    it("regression test for DocumentReference", async () => {
        const docRef = {
            resourceType: "DocumentReference",
            status: "current",
            type: { coding: [{ display: "Befund" }] },
            author: [{ reference: "#contained-author-id" }],
            description: "Befund",
            subject: { reference: "Befund" },
            contained: [],
            date: "2020-08-08T10:29:34.834Z",
            content: [
              {
                attachment: {
                  contentType: "image/png",
                  creation: "2020-08-08T10:29:34.834Z",
                  title: "Bildschirmfoto 2020-07-29 um 12.40.11.png",
                  hash: "sdiTQFvrecWAUiDPJwA2VLE10PE=",
                  size: 7148,
                  id: "02e491d8-3f26-4340-9ecc-1ec44c993779"
                }
              }
            ],
            identifier: [
              {
                value:
                  "d4l_f_p_t#02e491d8-3f26-4340-9ecc-1ec44c993779#02e491d8-3f26-4340-9ecc-1ec44c993779#02e491d8-3f26-4340-9ecc-1ec44c993779"
              }
            ],
            id: "920a1004-78a8-41ca-933f-d9474e18886f"
        };

        const [ _issues, result ] = await fhirToGroupLists([ docRef ]);
        expect(result.model.groupList).to.have.length(1);
    });

    it("multiple DocumentReferences with multiple matching identifiers", async () => {
        const docRef = {
            resourceType: "DocumentReference",
            status: "current",
            type: { coding: [{ display: "Befund" }] },
            author: [{ reference: "#contained-author-id" }],
            description: "Befund",
            subject: { reference: "Befund" },
            contained: [],
            date: "2020-08-08T10:29:34.834Z",
            content: [
              {
                attachment: {
                  contentType: "image/png",
                  creation: "2020-08-08T10:29:34.834Z",
                  title: "Bildschirmfoto 2020-07-29 um 12.40.11.png",
                  hash: "sdiTQFvrecWAUiDPJwA2VLE10PE=",
                  size: 7148,
                  id: "02e491d8-3f26-4340-9ecc-1ec44c993779"
                }
              },
              {
                attachment: {
                  contentType: "image/png",
                  creation: "2020-08-08T10:29:34.834Z",
                  title: "Bildschirmfoto 2020-07-29 um 12.40.11.png",
                  hash: "sdiTQFvrecWAUiDPJwA2VLE10PE=",
                  size: 7148,
                  id: "810c252a-d48c-4a8e-8861-0872e6c6edfd"
                }
              }
            ],
            identifier: [
              {
                value:
                  "d4l_f_p_t#02e491d8-3f26-4340-9ecc-1ec44c993779#02e491d8-3f26-4340-9ecc-1ec44c993779#02e491d8-3f26-4340-9ecc-1ec44c993779"
              },
              {
                value:
                  "d4l_f_p_t#810c252a-d48c-4a8e-8861-0872e6c6edfd#d0f205d5-abf5-4842-bcae-72e3c49dbc9f#47857397-1409-4508-8f0b-ffe869ca0b5e"
              }
            ],
            id: "920a1004-78a8-41ca-933f-d9474e18886f"
        };

        const [ _issues, result ] = await fhirToGroupLists([ docRef, docRef ]);
        expect(result.model.groupList).to.have.length(1);
    });

    it("undefined date DocRef bug", async () => {
        const docRef = {
            resourceType: "DocumentReference",
            status: "current",
            type: {
              coding: [
                {
                  display: "EigenFoto"
                }
              ]
            },
            author: [
              {
                reference: "#contained-author-id"
              }
            ],
            description: "Legacy™️ Document with each 1 Unsupported/Supported Image",
            subject: {
              reference: "Legacy™️ Document with each 1 Unsupported/Supported Image"
            },
            contained: [],
            indexed: "2020-09-10T17:05:35.521Z",
            content: [
              {
                attachment: {
                  contentType: "image/jpeg",
                  creation: "2020-09-10T17:05:35.521Z",
                  title: "iu.jpeg",
                  hash: "vlBRWJsGP3R4DWwGMEZJMtQRG7s=",
                  size: 56003,
                  id: "5ad44f7c-ef4d-4535-88d0-e0ad30326b80"
                }
              }
            ],
            identifier: [
              {
                value:
                  "d4l_f_p_t#9eae21eb-6860-4e16-8317-3c46c1e5b284#9eae21eb-6860-4e16-8317-3c46c1e5b284#9eae21eb-6860-4e16-8317-3c46c1e5b284"
              },
              {
                value:
                  "d4l_f_p_t#5ad44f7c-ef4d-4535-88d0-e0ad30326b80#5ad44f7c-ef4d-4535-88d0-e0ad30326b80#fb03c5c2-15a4-4a2e-8629-9afce703f5cb"
              }
            ],
            id: "3a0a79c5-21be-429c-90a0-ba8d7333290f"
        };

        try {
            const [ _issues, result ] = await fhirToGroupLists([ docRef ]);
            expect(result.model.groupList).to.have.length(1);
        } catch (error) {
            assert.fail(error);
        }
    });

    it("additional properties in DocumentReference.context", async () => {
        const docRef = {
            resourceType: "DocumentReference",
            status: "current",
            type: {
              coding: [
                {
                  display: "CTDiagnostik"
                }
              ]
            },
            author: [
              {
                reference: "#contained-author-id"
              }
            ],
            description: "Medical document",
            subject: {
              reference: "Medical document"
            },
            contained: [
              {
                resourceType: "Practitioner",
                id: "contained-author-id",
                identifier: [],
                name: [
                  {
                    family: "Eeralil",
                    given: [ "Doctor" ],
                    prefix: [],
                    suffix: []
                  }
                ],
                address: [
                  {
                    city: "",
                    postalCode: "",
                    line: []
                  }
                ],
                telecom: []
              }
            ],
            indexed: "2020-10-27T10:12:25.845Z",
            content: [
              {
                attachment: {
                  contentType: "image/png",
                  creation: "2020-10-27T10:12:25.845Z",
                  title: "Screenshot from 2020-10-21 11-37-06.png",
                  hash: "d1zTSUZa9pbwvN5Qkx7prUmjEYE=",
                  size: 44385,
                  id: "a734b23e-7629-4ec9-a22b-fd11da6c0f20"
                }
              }
            ],
            context: {
              practiceSetting: {
                coding: [
                  {
                    code: "394577000"
                  }
                ]
              }
            },
            identifier: [
              {
                value:
                  "d4l_f_p_t#a734b23e-7629-4ec9-a22b-fd11da6c0f20#a734b23e-7629-4ec9-a22b-fd11da6c0f20#fb3c3f0d-2415-4bcb-a5aa-99e47696fa28"
              }
            ],
            id: "aea35e6c-dcc4-4c7e-89cb-dcd4cbee33f4"
        };

        try {
            const [ _issues, result ] = await fhirToGroupLists([ docRef ]);
            expect(result.model.groupList).to.have.length(1);
        } catch (error) {
            assert.fail(error);
        }
    });

    it("", async () => {
        const docRef = {
            "resourceType": "DocumentReference",
            "status": "current",
            "type": {
              "coding": [
                {
                  "display": "Blutbild"
                }
              ]
            },
            "author": [
              {
                "reference": "#contained-author-id"
              }
            ],
            "description": "Immer noch Fehler?",
            "subject": {
              "reference": "Immer noch Fehler?"
            },
            "contained": [
              {
                "resourceType": "Practitioner",
                "id": "contained-author-id",
                "identifier": [],
                "name": [
                  {
                    "given": [],
                    "prefix": [],
                    "suffix": []
                  }
                ],
                "address": [
                  {
                    "line": []
                  }
                ],
                "telecom": []
              }
            ],
            "content": [
              {
                "attachment": {
                  "contentType": "image/jpeg",
                  "creation": "2020-11-02T11:00:00.000Z",
                  "title": "iu.jpeg",
                  "hash": "znbLAnyg/+pgo/SUyY8Aqk5RVQQ=",
                  "size": 17754,
                  "id": "7497ac01-8833-40dd-8cc1-c9eff57e4c12"
                }
              }
            ],
            "context": {
              "practiceSetting": {
                "coding": [
                  {
                    "code": "Anesthetics"
                  }
                ]
              }
            },
            "date": "2020-11-02T11:00:00.000Z",
            "identifier": [
              {
                "value": "d4l_f_p_t#7497ac01-8833-40dd-8cc1-c9eff57e4c12#7497ac01-8833-40dd-8cc1-c9eff57e4c12#2b8beed4-7be5-48f8-ab4d-94ae8ca1f4eb"
              }
            ],
            "id": "489ed3fe-8b2b-4cb5-a94c-f7cbc0d8296d"
        };

        try {
            const [ issues, result ] = await fhirToGroupLists([ docRef ]);
            if (shouldDump()) {
              consoleLogInspect(issues);
            }
            expect(result.model.groupList).to.have.length(1);
        } catch (error) {
            assert.fail(error);
        }
    });
});
