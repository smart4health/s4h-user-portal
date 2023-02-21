import * as E from "fp-ts/Either";

import { Issue_A, ctx, err, msg } from "../../utils/issues";

import { FHIR_DocumentReference_A, FHIR_DocumentReference_T } from "./document-reference-r4";
import { FHIR_STU3_DocumentReference_T, convertDocumentReferenceSTU3toR4 } from "./document-reference-stu3";


export function decodeDocumentReference (res: unknown): E.Either<Issue_A, FHIR_DocumentReference_A> {

    // Detect STU3 vs R4
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (res as any).indexed !== "undefined") {
        // Treat as STU3
        const stu3 = FHIR_STU3_DocumentReference_T.decode(res);
        if (E.isLeft(stu3)) {
            return E.left(err({ ...msg("resource seems to be STU3, but decoding error; see context for details"), ...ctx({ errors: stu3.left }) }));
        }

        return E.map(convertDocumentReferenceSTU3toR4)(stu3);
    }

    const r4 = FHIR_DocumentReference_T.decode(res);
    if (E.isLeft(r4)) {
        return E.left(err({ ...msg("resource is not STU3, but decoding as R4 failed; see context for details"), ...ctx({ errors: r4.left }) }));
    }

    return r4;
}
