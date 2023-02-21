import * as t from "io-ts";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { TauDate, TauDateTime, TauDateTime_toString, TauDate_toString, TauInstant, TauInstant_toString, TauTime, TauTime_toString, parseTauDate, parseTauDateTime, parseTauInstant, parseTauTime, validateTauDate, validateTauDateTime, validateTauInstant, validateTauTime } from "../utils/tau";


// https://www.hl7.org/fhir/datatypes.html#boolean
export const FHIR_boolean_T = t.boolean;
export type  FHIR_boolean_A = t.TypeOf<  typeof FHIR_boolean_T>;
export type  FHIR_boolean   = t.OutputOf<typeof FHIR_boolean_T>;


// https://www.hl7.org/fhir/datatypes.html#integer
export class FHIR_integer_TC extends t.Type<number> {
    private static pattern = /^([0]|[-+]?[1-9][0-9]*)$/;
    private static MIN_VALUE = -2_147_483_648;
    private static MAX_VALUE = +2_147_483_647;

    constructor () {
        super(
            "FHIR_integer_T",

            (x): x is number => E.isRight(this.decode(x)),

            (x, c) => {
                if (typeof x !== "number") {
                    return t.failure(x, c, "value is not a number, but a " + typeof x);
                }

                if (FHIR_integer_TC.pattern.test(x.toString())) {
                    if ((FHIR_integer_TC.MIN_VALUE <= x) && (x <= FHIR_integer_TC.MAX_VALUE)) {
                        return t.success(x);
                    } else {
                        return t.failure(x, c, "integer out of range: " + x);
                    }
                } else {
                    return t.failure(x, c, "not an integer: " + x);
                }
            },

            t.identity
        );
    }
}

export const FHIR_integer_T = new FHIR_integer_TC();
export type  FHIR_integer_A = t.TypeOf<  typeof FHIR_integer_T>;
export type  FHIR_integer   = t.OutputOf<typeof FHIR_integer_T>;


// https://www.hl7.org/fhir/datatypes.html#positiveInt
export class FHIR_positiveInt_TC extends t.Type<number> {
    private static pattern = /^\+?[1-9][0-9]*$/;
    private static MAX_VALUE = +2_147_483_647;

    constructor () {
        super(
            "FHIR_positiveInt_T",

            (x): x is number => E.isRight(this.decode(x)),

            (x, c) => {
                if (typeof x !== "number") {
                    return t.failure(x, c, "value is not a number, but a " + typeof x);
                }

                if (FHIR_positiveInt_TC.pattern.test(x.toString())) {
                    if ((x >= 1) && (x <= FHIR_positiveInt_TC.MAX_VALUE)) {
                        return t.success(x);
                    } else {
                        return t.failure(x, c, "positive integer out of range: " + x);
                    }
                } else {
                    return t.failure(x, c, "not a positive integer: " + x);
                }
            },

            t.identity
        );
    }
}

export const FHIR_positiveInt_T = new FHIR_positiveInt_TC();
export type  FHIR_positiveInt_A = t.TypeOf<  typeof FHIR_positiveInt_T>;
export type  FHIR_positiveInt   = t.OutputOf<typeof FHIR_positiveInt_T>;



// https://www.hl7.org/fhir/datatypes.html#unsignedInt
export class FHIR_unsignedInt_TC extends t.Type<number> {
    private static pattern = /^([0]|([1-9][0-9]*))$/;
    private static MAX_VALUE = +2_147_483_647;

    constructor () {
        super(
            "FHIR_unsignedInt_T",

            (x): x is number => E.isRight(this.decode(x)),

            (x, c) => {
                if (typeof x !== "number") {
                    return t.failure(x, c, "value is not a number, but a " + typeof x);
                }

                if (FHIR_unsignedInt_TC.pattern.test(x.toString())) {
                    if ((x >= 0) && (x <= FHIR_unsignedInt_TC.MAX_VALUE)) {
                        return t.success(x);
                    } else {
                        return t.failure(x, c, "unsigned integer out of range: " + x);
                    }
                } else {
                    return t.failure(x, c, "not an unsigned integer: " + x);
                }
            },

            t.identity
        );
    }
}

export const FHIR_unsignedInt_T = new FHIR_unsignedInt_TC();
export type  FHIR_unsignedInt_A = t.TypeOf<  typeof FHIR_unsignedInt_T>;
export type  FHIR_unsignedInt   = t.OutputOf<typeof FHIR_unsignedInt_T>;



// https://www.hl7.org/fhir/datatypes.html#string
export const FHIR_string_T  = t.string;
export type  FHIR_string_A = t.TypeOf<  typeof FHIR_string_T>;
export type  FHIR_string   = t.OutputOf<typeof FHIR_string_T>;


// https://www.hl7.org/fhir/datatypes.html#decimal
export class FHIR_decimal_TC extends t.Type<number> {
    private static pattern = /^(-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?)$/;

    constructor () {
        super(
            "FHIR_decimal_T",

            (x): x is number => E.isRight(this.decode(x)),

            (x, c) => {
                if (typeof x !== "number") {
                    return t.failure(x, c, "value is not a number, but a " + typeof x);
                }

                if (FHIR_decimal_TC.pattern.test(x.toString())) {
                    return t.success(x);
                }

                return t.failure(x, c, "not a decimal: " + x);
            },

            t.identity
        );
    }
}

export const FHIR_decimal_T = new FHIR_decimal_TC();
export type  FHIR_decimal_A = t.TypeOf<  typeof FHIR_decimal_T>;
export type  FHIR_decimal   = t.OutputOf<typeof FHIR_decimal_T>;


// https://www.hl7.org/fhir/datatypes.html#code
export class FHIR_code_TC extends t.Type<string> {
    private static pattern = /^([^\s]+([ ][^\s]+)*)$/;

    constructor () {
        super(
            "FHIR_code_T",

            (x): x is string => E.isRight(this.decode(x)),

            (x, c) => {
                if (typeof x !== "string") {
                    return t.failure(x, c, "value is not a string, but a " + typeof x);
                }

                if (FHIR_code_TC.pattern.test(x)) {
                    return t.success(x);
                }

                return t.failure(x, c, "not a code: " + x);
            },

            t.identity
        );
    }
}

export const FHIR_code_T = new FHIR_code_TC();
export type  FHIR_code_A = t.TypeOf<  typeof FHIR_code_T>;
export type  FHIR_code   = t.OutputOf<typeof FHIR_code_T>;


// https://www.hl7.org/fhir/datatypes.html#uri
export class FHIR_uri_TC extends t.Type<string> {
    private static pattern = /^\S*$/;

    constructor () {
        super(
            "FHIR_uri_T",

            (x): x is string => E.isRight(this.decode(x)),

            (x, c) => {
                if (typeof x !== "string") {
                    return t.failure(x, c, "value is not a string, but a " + typeof x);
                }

                if (FHIR_uri_TC.pattern.test(x)) {
                    return t.success(x);
                }

                return t.failure(x, c, "not a code: " + x);
            },

            t.identity
        );
    }
}

export const FHIR_uri_T = new FHIR_uri_TC();
export type  FHIR_uri_A = t.TypeOf<  typeof FHIR_uri_T>;
export type  FHIR_uri   = t.OutputOf<typeof FHIR_uri_T>;




// https://www.hl7.org/fhir/datatypes.html#dateTime
export const FHIR_dateTime_T = new t.Type<TauDateTime, string, unknown>(
    "FHIR_dateTime_T",

    (value: unknown): value is TauDateTime => E.isRight(validateTauDateTime(value)),

    (value, context) => {
        return pipe(value,
            parseTauDateTime,
            E.mapLeft(A.map(message => ({ value, context, message }) ))
        );
    },

    TauDateTime_toString
);

export type FHIR_dateTime_A = t.TypeOf<  typeof FHIR_dateTime_T>;
export type FHIR_dateTime   = t.OutputOf<typeof FHIR_dateTime_T>;


// https://www.hl7.org/fhir/datatypes.html#date
export const FHIR_date_T = new t.Type<TauDate, string, unknown>(
    "FHIR_date_T",

    (value): value is TauDate => E.isRight(validateTauDate(value)),

    (value, context) => {
        return pipe(value,
            parseTauDate,
            E.mapLeft(A.map(message => ({ value, context, message }) ))
        );
    },

    TauDate_toString
);

export type FHIR_date_A = t.TypeOf<  typeof FHIR_date_T>;
export type FHIR_date   = t.OutputOf<typeof FHIR_date_T>;


// https://www.hl7.org/fhir/datatypes.html#time
export const FHIR_time_T = new t.Type<TauTime, string, unknown>(
    "FHIR_time_T",

    (value): value is TauTime => E.isRight(validateTauTime(value)),

    (value, context) => {
        return pipe(value,
            parseTauTime,
            E.mapLeft(A.map(message => ({ value, context, message }) ))
        );
    },

    TauTime_toString
);

export type FHIR_time_A = t.TypeOf<  typeof FHIR_time_T>;
export type FHIR_time   = t.OutputOf<typeof FHIR_time_T>;


// https://www.hl7.org/fhir/datatypes.html#id
export class FHIR_id_TC extends t.Type<string> {
    private static pattern = /^([A-Za-z0-9\-.]{1,64})$/;

    constructor () {
        super(
            "FHIR_id_T",

            (x): x is string => E.isRight(this.decode(x)),

            (x, c) => {
                if (typeof x !== "string") {
                    return t.failure(x, c, "value is not a string, but a " + typeof x);
                }

                if (FHIR_id_TC.pattern.test(x)) {
                    return t.success(x);
                }

                return t.failure(x, c, "not an id: " + x);
            },

            t.identity
        );
    }
}

export const FHIR_id_T = new FHIR_id_TC();
export type  FHIR_id_A = t.TypeOf<  typeof FHIR_id_T>;
export type  FHIR_id   = t.OutputOf<typeof FHIR_id_T>;


// https://www.hl7.org/fhir/datatypes.html#instant
export const FHIR_instant_T = new t.Type<TauInstant, string, unknown>(
    "FHIR_instant_T",

    (value: unknown): value is TauInstant => E.isRight(validateTauInstant(value)),

    (value, context) => {
        return pipe(value,
            parseTauInstant,
            E.mapLeft(A.map(message => ({ value, context, message }) ))
        );
    },

    TauInstant_toString
);

export type FHIR_instant_A = t.TypeOf<  typeof FHIR_instant_T>;
export type FHIR_instant   = t.OutputOf<typeof FHIR_instant_T>;


export const FHIR_markdown_T = FHIR_string_T;
export type  FHIR_markdown_A = t.TypeOf<  typeof FHIR_markdown_T>;
export type  FHIR_markdown   = t.OutputOf<typeof FHIR_markdown_T>;


export const FHIR_canonical_T = FHIR_uri_T;
export type  FHIR_canonical_A = t.TypeOf<  typeof FHIR_canonical_T>;
export type  FHIR_canonical   = t.OutputOf<typeof FHIR_canonical_T>;



// https://www.hl7.org/fhir/datatypes.html#base64Binary
export class FHIR_base64Binary_TC extends t.Type<string> {
    private static pattern = /^[A-Za-z0-9+/]*(={0,2})$/;

    constructor () {
        super(
            "FHIR_base64Binary_T",

            (x): x is string => E.isRight(this.decode(x)),

            (x, c) => {
                if (typeof x !== "string") {
                    return t.failure(x, c, "value is not a string, but a " + typeof x);
                }

                if (FHIR_base64Binary_TC.pattern.test(x)) {
                    return t.success(x);
                }

                return t.failure(x, c, "not Base64: " + x);
            },

            t.identity
        );
    }
}

export const FHIR_base64Binary_T = new FHIR_base64Binary_TC();
export type  FHIR_base64Binary_A = t.TypeOf<  typeof FHIR_base64Binary_T>;
export type  FHIR_base64Binary   = t.OutputOf<typeof FHIR_base64Binary_T>;


export const FHIR_url_T = FHIR_uri_T;
export type  FHIR_url_A = t.TypeOf<  typeof FHIR_url_T>;
export type  FHIR_url   = t.OutputOf<typeof FHIR_url_T>;

export const FHIR_xhtml_T = FHIR_string_T;
export type  FHIR_xhtml_A = t.TypeOf<  typeof FHIR_xhtml_T>;
export type  FHIR_xhtml   = t.OutputOf<typeof FHIR_xhtml_T>;
