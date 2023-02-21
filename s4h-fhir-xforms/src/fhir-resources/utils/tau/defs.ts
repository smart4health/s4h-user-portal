export type Fraction = {
    abs: number;
    mag: number;
};

export type Tau_YYYY = {
    kind: "YYYY",
    year:    number;
};

export type Tau_YYYYMM = {
    kind: "YYYY-MM",
    year:    number;
    month:   number;
};

export type Tau_YYYYMMDD = {
    kind: "YYYY-MM-DD",
    year:    number;
    month:   number;
    day:     number;
};

export type Tau_YYYYMMDDhhmmss = {
    year:    number;
    month:   number;
    day:     number;
    hours:   number;
    minutes: number;
    seconds: number;
};

export type Tau_YYYYMMDDhhmmssFZ = Tau_YYYYMMDDhhmmss & {
    kind: "YYYY-MM-DD hh:mm:ss.FZ",
    fraction: Fraction;
};

export type Tau_YYYYMMDDhhmmssZ = Tau_YYYYMMDDhhmmss & {
    kind: "YYYY-MM-DD hh:mm:ssZ"
};

export type Tau_YYYYMMDDhhmmssFTZ = Tau_YYYYMMDDhhmmss & {
    kind: "YYYY-MM-DD hh:mm:ss.F+TZ",
    fraction:  Fraction;
    tzHours:   number;
    tzMinutes: number;
};

export type Tau_YYYYMMDDhhmmssTZ = Tau_YYYYMMDDhhmmss & {
    kind: "YYYY-MM-DD hh:mm:ss+TZ",
    tzHours:   number;
    tzMinutes: number;
};

export type Tau_hhmmss = {
    kind:    "hh:mm:ss";
    hours:   number;
    minutes: number;
    seconds: number;
};

export type TauDateTime
    = Tau_YYYY
    | Tau_YYYYMM
    | Tau_YYYYMMDD
    | Tau_YYYYMMDDhhmmssFZ
    | Tau_YYYYMMDDhhmmssZ
    | Tau_YYYYMMDDhhmmssFTZ
    | Tau_YYYYMMDDhhmmssTZ
    ;

export type TauDate
    = Tau_YYYY
    | Tau_YYYYMM
    | Tau_YYYYMMDD
    ;

export type TauInstant
    = Tau_YYYYMMDDhhmmssFZ
    | Tau_YYYYMMDDhhmmssZ
    | Tau_YYYYMMDDhhmmssFTZ
    | Tau_YYYYMMDDhhmmssTZ
    ;

export type TauTime = Tau_hhmmss;
