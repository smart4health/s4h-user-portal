import * as t from "io-ts";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { IssueList, IssueList_T } from "../../utils/issues";
import { Array_FHIR_Coding_T, FHIR_Coding } from "../../fhir-resources/types";

import { ResolvedCoding_T } from "./defs";
import { CannedCodeSystemsConfig, makeCannedCodeSystems } from "./canned/canned";


export type ResolvedCoding   = t.OutputOf<typeof ResolvedCoding_T>;

export interface ApiCodeSystems {
    resolveCodings (codings: FHIR_Coding[], language: string | undefined): Promise<E.Either<IssueList, ResolvedCoding>[]>;
}

export function apiMakeCannedCodeSystems (config: CannedCodeSystemsConfig): ApiCodeSystems {
    const internalCS = makeCannedCodeSystems(config);

    return {
        async resolveCodings (codings: FHIR_Coding[], language: string | undefined): Promise<E.Either<IssueList, ResolvedCoding>[]> {
            const codingsA = Array_FHIR_Coding_T.decode(codings);
            if (E.isLeft(codingsA)) {
                throw [{ severity: "error", message: "arguments parse error" }];
            }

            const res = await internalCS.resolveCodings(codingsA.right, O.fromNullable(language))();

            return pipe(res,
                A.map(E.mapLeft(IssueList_T.encode))
            );
        }
    };
}
