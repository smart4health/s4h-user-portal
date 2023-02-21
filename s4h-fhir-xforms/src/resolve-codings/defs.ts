import { CodeSystems } from "./code-systems/defs";

export interface TextMergerStrategy {
    (texts: string[]): string;
}

export type ConceptResolutionOptions = {
    codeSystems:            CodeSystems[];
    textExtractionStrategy: TextMergerStrategy;
    language?:              string;
};
