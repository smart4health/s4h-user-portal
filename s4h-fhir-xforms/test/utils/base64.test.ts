/* eslint-disable max-nested-callbacks */
import { expect } from "chai";

import { arrayBufferToBase64 } from "../../src/utils/base64";

describe("base64 suite", () => {
    const cover = makeCoverMap();

    const TEST_DATA = [
        {
            title: "",
            byteArray: stringToArrayBuffer(""),
            base64: ""
        },
        {
            title: " ",
            byteArray: stringToArrayBuffer(" "),
            base64: "IA=="
        },
        {
            title: "12",
            byteArray: stringToArrayBuffer("12"),
            base64: "MTI="
        },
        {
            title: "D4L",
            byteArray: stringToArrayBuffer("D4L"),
            base64: "RDRM"
        },
        {
            title: "1234",
            byteArray: stringToArrayBuffer("1234"),
            base64: "MTIzNA=="
        },
        {
            title: "12345",
            byteArray: stringToArrayBuffer("12345"),
            base64: "MTIzNDU="
        },
        {
            title: "Hello",
            byteArray: stringToArrayBuffer("Hello"),
            base64: "SGVsbG8="
        },
        {
            title: "xx}aaj",
            byteArray: stringToArrayBuffer("xx}aaj"),
            base64: "eHh9YWFq"
        },
        {
            title: "Poem",
            byteArray: stringToArrayBuffer("Zur Arbeit ist kein Bub geschaffen / Das Lernen findet er nicht schön; / Er möchte träumen, möchte gaffen / Und Vogelnester suchen gehn. / Er liebt es, lang im Bett zu liegen. / Und wie es halt im Leben geht: / Grad zu den frühen Morgenzügen / Kommt man am leichtesten zu spät."),
            base64: "WnVyIEFyYmVpdCBpc3Qga2VpbiBCdWIgZ2VzY2hhZmZlbiAvIERhcyBMZXJuZW4gZmluZGV0IGVyIG5pY2h0IHNjaMO2bjsgLyBFciBtw7ZjaHRlIHRyw6R1bWVuLCBtw7ZjaHRlIGdhZmZlbiAvIFVuZCBWb2dlbG5lc3RlciBzdWNoZW4gZ2Vobi4gLyBFciBsaWVidCBlcywgbGFuZyBpbSBCZXR0IHp1IGxpZWdlbi4gLyBVbmQgd2llIGVzIGhhbHQgaW0gTGViZW4gZ2VodDogLyBHcmFkIHp1IGRlbiBmcsO8aGVuIE1vcmdlbnrDvGdlbiAvIEtvbW10IG1hbiBhbSBsZWljaHRlc3RlbiB6dSBzcMOkdC4="
        },
        {
            title: "😱🔥🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿!",
            byteArray: stringToArrayBuffer("😱🔥🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿!"),
            base64: "8J+YsfCflKXwn4+086CBp/OggaLzoIGz86CBo/OggbTzoIG/8J+PtPOggafzoIGi86CBs/OggaPzoIG086CBvyE="
        },
        {
            title: "Large buffer",
            byteArray: stringToArrayBuffer(Array(1000000).join("1234567")),
            base64: Array(333334).join("MTIzNDU2NzEyMzQ1NjcxMjM0NTY3")
        }

    ];

    for (const testCase of TEST_DATA) {
        it(`base64 encode: ${testCase.title}`, () => {
            const base64 = arrayBufferToBase64(new Uint8Array(testCase.byteArray));
            expect(base64).to.equal(testCase.base64);

            for (let i = 0; i < base64.length; i++) {
                delete cover[base64[i]];
            }
        });
    }

    it("check alphabet cover", () => {
        expect(Object.keys(cover)).to.have.length(0);
    });

});

function stringToArrayBuffer (text: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(text);
}

function makeCoverMap (): Record<string, number> {
    const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    const map: Record<string, number> = {};
    for (let i = 0; i < ALPHABET.length; i++) {
        map[ALPHABET[i]] = 1;
    }
    return map;
}
