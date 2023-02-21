import * as t from "io-ts";
import * as O from "fp-ts/Option";

import { DistributiveOmit, makeTaggedUnionTypeClass } from "../../utils/fp-tools";

import { ConceptResolver } from "../types";
import { BoxedResource, Period } from "../base/boxed";
import { FHIR_boolean_T, FHIR_dateTime_T, FHIR_date_T, FHIR_integer_T } from "../base/primitives";
import { FHIR_Attachment_T, FHIR_CodeableConcept_T, FHIR_DomainResource_T, FHIR_Reference_T } from "../base/general-special-purpose";
import { FHIR_Address_T, FHIR_ContactPoint_T, FHIR_HumanName_T, FHIR_Identifier_T, FHIR_Period_T } from "../base/general-special-purpose";


export const FHIR_Patient_contact_T = t.partial({
    relationship: t.array(FHIR_CodeableConcept_T),
    name:         FHIR_HumanName_T,
    telecom:      t.array(FHIR_ContactPoint_T),
    address:      FHIR_Address_T,
    gender: t.keyof({
        "male":    null,
        "female":  null,
        "other":   null,
        "unknown": null
    }),
    organization: FHIR_Reference_T,
    period:       FHIR_Period_T
});

export const FHIR_Patient_communication_T = t.intersection([
    t.type({
        language:  FHIR_CodeableConcept_T
    }),
    t.partial({
        preferred: FHIR_boolean_T
    })
]);

export const FHIR_Patient_link_T = t.type({
    other: FHIR_Reference_T,
    type: t.keyof({
        "replaced-by": null,
        "replaces":    null,
        "refer":       null,
        "seealso":     null
    })
});


export const FHIR_Patient_deceased_internal_T = t.union([
    t.type({ _deceasedTag: t.literal("none") }),

    t.type({ _deceasedTag: t.literal("deceasedBoolean"),    deceasedBoolean:    FHIR_boolean_T    }, "deceasedBoolean"    ),
    t.type({ _deceasedTag: t.literal("deceasedDateTime"),   deceasedDateTime:   FHIR_dateTime_T   }, "deceasedDateTime"   )
]);

export type FHIR_Patient_deceased_internal = t.TypeOf<typeof FHIR_Patient_deceased_internal_T>;

export type FHIR_Patient_deceased = DistributiveOmit<FHIR_Patient_deceased_internal, "_deceasedTag">;

export const FHIR_Patient_deceased_T = makeTaggedUnionTypeClass<
    FHIR_Patient_deceased_internal,
    FHIR_Patient_deceased,
    typeof FHIR_Patient_deceased_internal_T>(
    FHIR_Patient_deceased_internal_T,
    "FHIR_Patient_deceased_internal_T",
    "_deceasedTag"
);


export const FHIR_Patient_multipleBirth_internal_T = t.union([
    t.type({ _multipleBirthTag: t.literal("none") }),

    t.type({ _multipleBirthTag: t.literal("multipleBirthBoolean"),    multipleBirthBoolean:    FHIR_boolean_T    }, "multipleBirthBoolean"    ),
    t.type({ _multipleBirthTag: t.literal("multipleBirthInteger"),    multipleBirthInteger:    FHIR_integer_T    }, "multipleBirthInteger"    )
]);

export type FHIR_Patient_multipleBirth_internal = t.TypeOf<typeof FHIR_Patient_multipleBirth_internal_T>;

export type FHIR_Patient_multipleBirth = DistributiveOmit<FHIR_Patient_multipleBirth_internal, "_multipleBirthTag">;

export const FHIR_Patient_multipleBirth_T = makeTaggedUnionTypeClass<
    FHIR_Patient_multipleBirth_internal,
    FHIR_Patient_multipleBirth,
    typeof FHIR_Patient_multipleBirth_internal_T>(
    FHIR_Patient_multipleBirth_internal_T,
    "FHIR_Patient_multipleBirth_internal_T",
    "_multipleBirthTag"
);

export const FHIR_Patient_gender_T = t.keyof({
    "male":    null,
    "female":  null,
    "other":   null,
    "unknown": null
});

export type FHIR_Patient_gender_A = t.TypeOf<  typeof FHIR_Patient_gender_T>;
export type FHIR_Patient_gender   = t.OutputOf<typeof FHIR_Patient_gender_T>;


export const Internal_FHIR_Patient_T = t.intersection([
    FHIR_DomainResource_T,

    t.type({
        resourceType: t.literal("Patient"),
        name:         t.array(FHIR_HumanName_T),
        gender:       FHIR_Patient_gender_T,
        birthDate:    FHIR_date_T
    }),

    FHIR_Patient_deceased_T,
    FHIR_Patient_multipleBirth_T,

    t.partial({
        identifier:           t.array(FHIR_Identifier_T),
        active:               FHIR_boolean_T,
        telecom:              t.array(FHIR_ContactPoint_T),
        address:              t.array(FHIR_Address_T),
        maritalStatus:        FHIR_CodeableConcept_T,
        photo:                t.array(FHIR_Attachment_T),
        contact:              t.array(FHIR_Patient_contact_T),
        communication:        t.array(FHIR_Patient_communication_T),
        generalPractitioner:  t.array(FHIR_Reference_T),
        managingOrganization: FHIR_Reference_T,
        link:                 t.array(FHIR_Patient_link_T)
    })
]);

type Internal_FHIR_Patient_A = t.TypeOf<  typeof Internal_FHIR_Patient_T>;
type Internal_FHIR_Patient   = t.OutputOf<typeof Internal_FHIR_Patient_T>;


export const FHIR_Patient_T = new t.Type<Internal_FHIR_Patient_A, Internal_FHIR_Patient, unknown>(
    "FHIR_Patient_T",
    Internal_FHIR_Patient_T.is,
    Internal_FHIR_Patient_T.decode,

    (obj: Internal_FHIR_Patient_A) => {
        const enc = Internal_FHIR_Patient_T.encode(obj);
        delete enc.__phdpCreated;
        delete enc.__phdpUpdated;
        delete enc["_deceasedTag"];
        delete enc["_multipleBirthTag"];
        return enc;
    }
);

export type FHIR_Patient_A = t.TypeOf<  typeof FHIR_Patient_T>;
export type FHIR_Patient   = t.OutputOf<typeof FHIR_Patient_T>;


export type BoxedPatient = BoxedResource<FHIR_Patient_A> & {
    maritalStatus: O.Option<string>;
};

export function boxPatientResource (res: FHIR_Patient_A): BoxedPatient {
    return {
        boxed:         res,
        ...getPeriodFromPatient(res),

        maritalStatus: O.none
    };
}

export function resolvePatientConceptTexts (resolver: ConceptResolver, res: BoxedPatient): void {
    if (res.boxed.maritalStatus) {
        resolver(res.boxed.maritalStatus).then(os => { res.maritalStatus = os; });
    }
}

export function deepPatientCopy (original: FHIR_Patient_A): O.Option<FHIR_Patient_A> {
    try {
        const s = JSON.parse(JSON.stringify(FHIR_Patient_T.encode(original)));
        return O.fromEither(FHIR_Patient_T.decode(s));

    } catch (ignore) {
        return O.none;
    }
}

function getPeriodFromPatient (_res: FHIR_Patient_A): Period {
    // Change this when actual intervals are needed.
    return {
        period: {
            min: -Infinity,
            max: +Infinity
        }
    };
}
