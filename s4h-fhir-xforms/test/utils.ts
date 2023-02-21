import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import axios from "axios";

import * as chai from "chai";

import host from "@jsdevtools/host-environment";

import { IssueList } from "../src/utils/issues";


export function shouldDump (): boolean {
    return host.env["DUMP"] === "1";
}

export function shouldDot (): boolean {
    return typeof host.env["DOT"] !== "undefined";
}

export function consoleLogInspect (obj: unknown, depth = 5): void {
    // eslint-disable-next-line no-console
    console.dir(obj, { depth });
}


export function assertEitherRight (v: E.Either<unknown, unknown>): v is E.Right<unknown> {
    if (E.isRight(v)) {
        return true;
    } else {
        chai.assert.fail("expected Right");
    }
}

export function assertEitherLeft (v: E.Either<unknown, unknown>): v is E.Left<unknown> {
    if (E.isLeft(v)) {
        return true;
    } else {
        chai.assert.fail("expected Left");
    }
}

export function assertEitherRightValue (v: E.Either<unknown, unknown>, expected: unknown): v is E.Right<unknown> {
    if (E.isRight(v)) {
        chai.assert.equal(v.right, expected);
        return true;
    } else {
        chai.assert.fail("expected Right");
    }
}

export function assertEitherRightValueDeep (v: E.Either<unknown, unknown>, expected: unknown): v is E.Right<unknown> {
    if (E.isRight(v)) {
        chai.assert.deepEqual(v.right, expected);
        return true;
    } else {
        chai.assert.fail("expected Right");
    }
}

export function assertEitherRightContains (v: E.Either<unknown, unknown>, expected: unknown): v is E.Right<unknown> {
    if (E.isRight(v)) {
        chai.assert.containsAllKeys(v.right, expected);
        return true;
    } else {
        chai.assert.fail("expected Right");
    }
}


export function assertOptionSomeValue (v: O.Option<unknown>, expected: unknown): v is O.Some<unknown> {
    if (typeof v === "undefined") {
        chai.assert.fail("expected Some, but got undefined");
    } else {
        if (O.isSome(v)) {
            chai.assert.equal(v.value, expected);
            return true;
        } else {
            chai.assert.fail("expected Some");
        }
    }
}

export function assertOptionSomeValueDeep (v: O.Option<unknown>, expected: unknown): v is O.Some<unknown> {
    if (O.isSome(v)) {
        chai.assert.deepEqual(v.value, expected);
        return true;
    } else {
        chai.assert.fail("expected Some");
    }
}

export function assertOptionNone (v: O.Option<unknown>): v is O.None {
    if (O.isNone(v)) {
        return true;
    } else {
        chai.assert.fail("expected None, but got " + JSON.stringify(v));
    }
}

export function hasErrors (issues: IssueList): boolean {
    return pipe(issues, A.filter(i => i.severity === "error"), a => a.length > 0);
}

export class FilePolyfill implements File {
    public constructor (private content: ArrayBuffer, fileName: string, options?: FilePropertyBag) {
        this.name = fileName;
        this.lastModified = options?.lastModified;
        this.size = content.byteLength;
        this.type = options?.type;
    }

    // File
    lastModified: number;
    name: string;

    // Blob
    size: number;
    type: string;

    async arrayBuffer (): Promise<ArrayBuffer> {
        return this.content;
    }

    slice (_start?: number, _end?: number, _contentType?: string): Blob {
        throw new Error("not implemented");
    }

    stream (): ReadableStream {
        throw new Error("not implemented");
    }

    text (): Promise<string> {
        throw new Error("not implemented");
    }
}

export async function writeGraph (dot: string, file: string, format = "pdf"): Promise<void> {
    try {
        await axios.post(`${host.env["DOT"]}/graph?format=${format}&file=${file}`, dot, {
            headers: { "content-type": "text/plain" }
        });

    } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(error.message);
    }
}
