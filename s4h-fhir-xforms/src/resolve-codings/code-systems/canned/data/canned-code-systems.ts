import * as O from "fp-ts/Option";

import { MINI_CODES } from "./mini-value-sets";
import { PARTNER_CODES } from "./partners";
import { UCUM_SUBSET_EN } from "./ucum.en";


export type LanguageCoding = {
    system:   string;
    code:     string;
    language: string;
    display:  string;
};

const CANNED_CODE_SYSTEMS: Record<string, LanguageCoding[]> = {
    "default": [
        // removed
    ],

    "timing": [
        // removed
    ],

    "ucum": UCUM_SUBSET_EN,

    "mini": MINI_CODES,

    "partners": PARTNER_CODES
};

export function getCannedCodeSystem (canName: string): O.Option<LanguageCoding[]> {
    return O.fromNullable(CANNED_CODE_SYSTEMS[canName]);
}

export function installCannedCodeSystem (canName: string, codings: LanguageCoding[]): void {
    CANNED_CODE_SYSTEMS[canName] = codings;
}
