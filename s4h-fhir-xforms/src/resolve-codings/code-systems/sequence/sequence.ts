import * as T from "fp-ts/Task";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

import { FHIR_Coding_A } from "../../../fhir-resources/types";
import { IssueList_A, msg, warn } from "../../../utils/issues";

import { CodeSystems, ResolvedCoding_A } from "../defs";


export type SequenceCodeSystemsConfig = {
    codeSystems: CodeSystems[];
};

export function makeSequenceCodeSystems (config: SequenceCodeSystemsConfig): CodeSystems {
    if (config.codeSystems.length === 0) {
        return {
            resolveCodings (codings: FHIR_Coding_A[], _language: O.Option<string>): T.Task<E.Either<IssueList_A, ResolvedCoding_A>[]> {
                return T.of(fillArray(E.left([ warn({ ...msg("empty clients list") }) ]))(codings.length));
            }
        };

    } else {

        return {
            resolveCodings (codings: FHIR_Coding_A[], language: O.Option<string>): T.Task<E.Either<IssueList_A, ResolvedCoding_A>[]> {
                return async () => {
                    const results: E.Either<IssueList_A, ResolvedCoding_A>[] = new Array(codings.length);

                    const idxmap: number[] = [];
                    for (let i = 0; i < codings.length; i++) {
                        idxmap[i] = i;
                    }

                    let stageCodings = codings;
                    let nextStageCodings: FHIR_Coding_A[] = [];
                    for (const codeSystems of config.codeSystems) {

                        const stageResult = await codeSystems.resolveCodings(stageCodings, language)();
                        nextStageCodings = [];

                        for (let i = 0; i < stageResult.length; i++) {
                            const r = stageResult[i];
                            if (E.isRight(r)) {
                                results[idxmap[i]] = r;
                            } else {
                                const curr = results[idxmap[i]];
                                if (!curr) {
                                    results[idxmap[i]] = r;
                                } else if (E.isLeft(curr)) {
                                    results[idxmap[i]] = E.left([ ...curr.left,  ...r.left ]);
                                }
                                // The case curr being right "should not happen":
                                // We had a resolved coding, but asked the next service again (which returned an error for this coding).
                                // In such a case we just keep the existing resolved coding.

                                // Rewire the index for the next stage
                                idxmap[nextStageCodings.push(stageCodings[i]) - 1] = idxmap[i];
                            }
                        }

                        stageCodings = nextStageCodings;
                    }

                    return results;
                };
            }
        };
    }
}

const fillArray = <T>(content: T): (size: number) => T[] => size => {
    const a = new Array(size);
    for (let i = 0; i < size; i++) {
        a[i] = content;
    }
    return a;
};
