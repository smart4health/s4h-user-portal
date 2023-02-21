export function uuidv4 (): string {
    function randomByte () {
        if (typeof globalThis.crypto?.getRandomValues === "function") {
            return globalThis.crypto.getRandomValues(new Uint8Array(1))[0];
        } else {
            return Math.round(Math.random() * 256);
        }
    }

    const randomHexDigit = () =>  (randomByte() >> 4).toString(16);
    const randomVariant  = () => ((randomByte() >> 6) | 0x08).toString(16);

    const pat = "xxxxxxxx-xxxx-4xxx-Yxxx-xxxxxxxxxxxx";

    return pat.replace(/x/g, randomHexDigit).replace("Y", randomVariant);
}
