import * as R from "fp-ts/Record";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";

export const PARTNER_CODES = pipe(
  [
    {
      system: "partners",
      language: "en",
      codes: {
        // removed
      }
    },
    {
      system: "partners",
      language: "pt",
      codes: {
        // removed
      }
    },
    {
      system: "partners",
      language: "de",
      codes: {
        // removed
      }
    }
    // eslint-disable-next-line max-nested-callbacks
  ], A.map((vs) => R.collect((k, v) => ({ system: vs.system, language: vs.language, code: k, display: "" + v }))(vs.codes)), A.flatten
);
