import * as R from "fp-ts/Record";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";


export const MINI_CODES = pipe([
    {
        system: "http://terminology.hl7.org/CodeSystem/medication-statement-category",
        language: "en",
        codes: {
            "inpatient":        "Inpatient",
            "outpatient":       "Outpatient",
            "community":        "Community",
            "patientspecified": "Patient Specified"
        }
    },
    {
        system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
        language: "en",
        codes: {
            "active":     "Active",
            "recurrence": "Recurrence",
            "relapse":    "Relapse",
            "inactive":   "Inactive",
            "remission":  "Remission",
            "resolved":   "Resolved"
        }
    },
    {
        system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
        language: "en",
        codes: {
            "unconfirmed":      "Unconfirmed",
            "provisional":      "Provisional",
            "differential":     "Differential",
            "confirmed":        "Confirmed",
            "refuted":          "Refuted",
            "entered-in-error": "Entered in Error"
        }
    },
    {
        system: "http://hl7.org/fhir/allergy-intolerance-criticality",
        language: "en",
        codes: {
            "low":              "Low",
            "high":             "High",
            "unable-to-assess": "Unable to Assess Risk"
        }
    },
    {
        system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
        language: "en",
        codes: {
            "active":   "Active",
            "inactive": "Inactive",
            "resolved": "Resolved"
        }
    },
    {
        system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
        language: "en",
        codes: {
            "unconfirmed":      "Unconfirmed",
            "presumed":         "Presumed",
            "confirmed":        "Confirmed",
            "refuted":          "Refuted",
            "entered-in-error": "Entered in Error"
        }
    },
    {
        system: "http://hl7.org/fhir/allergy-intolerance-category",
        language: "en",
        codes: {
            "food":         "Food",
            "medication":   "Medication",
            "environment":  "Environment",
            "biologic":     "Biologic"
        }
    },
    {
        system: "http://hl7.org/fhir/uv/ips/CodeSystem/absent-unknown-uv-ips",
        language: "en",
        codes: {
            "no-allergy-info": "No information about allergies",
            "no-known-allergies": "No known allergies",
            "no-known-medication-allergies": "No known medication allergies",
            "no-known-environmental-allergies": "No known environmental allergies",
            "no-known-food-allergies": "No known food allergies",
            "no-device-info": "No information about devices",
            "no-known-devices": "No known devices in use",
            "no-immunization-info": "No information about immunizations",
            "no-known-immunizations": "No known immunizations",
            "no-medication-info": "No information about medications",
            "no-known-medications": "No known medications",
            "no-problem-info": "No information about problems",
            "no-known-problems": "No known problems",
            "no-procedure-info": "No information about past history of procedures",
            "no-known-procedures": "No known procedures"
        }
    },
    {
        system: "http://hl7.org/fhir/reaction-event-severity",
        language: "en",
        codes: {
            "mild":     "Mild",
            "moderate": "Moderate",
            "severe":   "Severe"
        }
    },
    {
        system: "http://hl7.org/fhir/CodeSystem/medication-status",
        language: "en",
        codes: {
            "active":           "Active",
            "inactive":         "Inactive",
            "entered-in-error": "Entered in Error"
        }
    },
    {
        system: "http://hl7.org/fhir/CodeSystem/medication-statement-status",
        language: "en",
        codes: {
            "active":           "Active",
            "completed":        "Completed",
            "entered-in-error": "Entered in Error",
            "intended":         "Intended",
            "stopped":          "Stopped",
            "on-hold":          "On Hold",
            "unknown":          "Unknown",
            "not-taken":        "Not Taken"
        }
    },
    {
        system: "http://terminology.hl7.org/CodeSystem/v3-DataOperation",
        language: "en",
        codes: {
            "OPERATE":      "Operate",
            "CREATE":       "Create",
            "DELETE":       "Delete",
            "EXECUTE":      "Execute",
            "READ":         "Read",
            "UPDATE":       "Revise",
            "APPEND":       "Append",
            "MODIFYSTATUS": "Modify status",
            "ABORT":        "Abort",
            "ACTIVATE":     "Activate",
            "CANCEL":       "Cancel",
            "COMPLETE":     "Complete",
            "HOLD":         "Hold",
            "JUMP":         "Jump",
            "NULLIFY":      "Nullify",
            "OBSOLETE":     "Obsolete",
            "DEPRECATE":    "Deprecate",
            "REACTIVATE":   "Reactivate",
            "RELEASE":      "Release",
            "RESUME":       "Resume",
            "SUSPEND":      "Suspend",
            "IMPORT":       "Import"
        }
    },
    {
        system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
        language: "en",
        codes: {
            "enterer":   "Enterer",
            "performer": "Performer",
            "author":    "Author",
            "verifier":  "Verifier",
            "legal":     "Legal Authenticator",
            "attester":  "Attester",
            "informant": "Informant",
            "custodian": "Custodian",
            "assembler": "Assembler",
            "composer":  "Composer"
        }
    }

    // eslint-disable-next-line max-nested-callbacks
], A.map(vs => R.collect( (k, v) => ({ system: vs.system, language: vs.language, code: k, display: "" + v }) )(vs.codes)), A.flatten);
