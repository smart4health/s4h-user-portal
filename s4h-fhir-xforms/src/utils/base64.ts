export type ArrayBufferToBase64Encoder = (array: ArrayBuffer) => string;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");

// Base64 encoding function in case we have neither `window.btoa` nor `Buffer.toString` available.
export const arrayBufferToBase64: ArrayBufferToBase64Encoder = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    const base64: string[] = [];

    for (let b = 0; b < len; b += 3) {
        // The following array access may go 1 or 2 bytes beyond the array length.
        // This will lead to undefined being returned (rather than throwing an error),
        // which we treat in function three2four accordingly.
        base64.push(three2four(bytes[b], bytes[b + 1], bytes[b + 2]));
    }

    return base64.join("");
};

/*
  +----- b0 ------+----- b1 ------+------ b2 -----+
  |               |               |               |
  |0|1|2|3|4|5|6|7|0|1|2|3|4|5|6|7|0|1|2|3|4|5|6|7|
  |           |           |           |           |
  +-----A-----+-----B-----+-----C-----+-----D-----+
*/
// eslint-disable-next-line complexity
function three2four (b0: number, b1?: number, b2?: number): string {
    if (typeof b0 !== "undefined" && typeof b1 !== "undefined" && typeof b2 !== "undefined") {
        return ALPHABET[b0 >> 2] +
               ALPHABET[((b0 & 0x03) << 4) | ((b1 & 0xf0) >> 4)] +
               ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)] +
               ALPHABET[b2 & 0x3f];
    }

    if (typeof b0 !== "undefined" && typeof b1 !== "undefined" && typeof b2 === "undefined") {
        return ALPHABET[b0 >> 2] +
               ALPHABET[((b0 & 0x03) << 4) | ((b1 & 0xf0) >> 4)] +
               ALPHABET[((b1 & 0x0f) << 2)]  + "=";
    }

    if (typeof b0 !== "undefined" && typeof b1 === "undefined" && typeof b2 === "undefined") {
        return ALPHABET[b0 >> 2] +
               ALPHABET[((b0 & 0x03) << 4)] + "==";
    }

    throw new Error(`invalid arguments: ${b0}, ${b1}, ${b2}`);
}
