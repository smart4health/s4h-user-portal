/* eslint-disable max-len */
/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import { fhirToGroupLists } from "../../../../src/transformations/group-list/fhir2ui";
import { consoleLogInspect, shouldDump } from "../../../utils";


describe("group order suite", () => {

    it("two groups", async () => {

        const [ _issues, result ] = await fhirToGroupLists([
            docRef("id-Z", "Z",    "2021-04-22T10:00:00.000Z"),
            docRef("id-1", "One",  "2021-04-15T00:00:00.000Z"),
            docRef("id-0", "Zero", "2021-04-01T00:00:00.000Z"),
            docRef("id-2", "Two",  "2021-04-22T00:00:00.000Z"),
            docRef("id-X", "X",    "2020-04-22T00:00:00.000Z")
        ]);

        if (shouldDump()) {
            consoleLogInspect(result);
        }

        expect(result.model.groupList).to.have.length(5);

        expect(result.model.groupList[0].id).to.equal("id-X");
        expect(result.model.groupList[1].id).to.equal("id-0");
        expect(result.model.groupList[2].id).to.equal("id-1");
        expect(result.model.groupList[3].id).to.equal("id-2");
        expect(result.model.groupList[4].id).to.equal("id-Z");
    });

});

function docRef (id: string, description: string, date: string): unknown {
    return {
        "resourceType": "DocumentReference",
        id,
        "status": "current",
        description,
        "content": [
            {
                "attachment": {
                    "id": id + "/attachment",
                    "title": "Foo",
                    "contentType": "application/pdf"
                }
            }
        ],
        date,
        "type": {
            "coding": [
                {
                    "display": "Unspecified body region X-ray"
                }
            ]
        },
        "category": [
            {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "43468-8",
                        "display": "Unspecified body region X-ray"
                    }
                ]
            }
        ]
    };
}
