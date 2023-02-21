import * as O from "fp-ts/Option";


export type CodeSystemIdent = {
    codeSystemName:    string;
    codeSystemEdition: string;
    codeSystemVersion: string;
    prefixLengthBits:  number;
    hashFunction:      string;
};

const CODE_SYSTEM_MAPPINGS: Record<string, CodeSystemIdent> = {
    // removed
};

export function getCodeSystemIdent (s: string): O.Option<CodeSystemIdent> {
    return O.fromNullable(CODE_SYSTEM_MAPPINGS[s]);
}
