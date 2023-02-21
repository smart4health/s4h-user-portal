import axios from "axios";

import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { flow, pipe } from "fp-ts/function";
import { Ord as ordString } from "fp-ts/string";
import { Ord, fromCompare, reverse } from "fp-ts/Ord";

import { second } from "../../../utils/common";
import { IssueList_A, info, msg } from "../../../utils/issues";
import { EitherIssueResult, exec } from "../../../utils/fp-tools";
import { RefGraph, RefNode } from "../../../fhir-resources/utils/graph";
import { SupportedResource_A } from "../../../fhir-resources/base/resource";
import { refGraphToDot } from "../../../fhir-resources/utils/graph/viz/render";
import { makeMedicationUsageOrd } from "../../../fhir-resources/utils/tau/order";
import { BoxedConceptCollector, boxConceptCollector } from "../../../fhir-resources/base/concept-collector";
import { makeStaticResourceCodeSystems } from "../../../resolve-codings/code-systems/static-resource/static-resource";
import { LanguageCoding, getCannedCodeSystem } from "../../../resolve-codings/code-systems/canned/data/canned-code-systems";
import { makeDefaultCodeSystemsList, pickFirstMerger, resolveCodeableConceptTexts } from "../../../resolve-codings/concept-resolution";
import { AnnotatedCodeableConcept_A, FHIR_Dosage_A, FHIR_Dosage_doseAndRate_A, FHIR_Identifier_A, FHIR_Ratio_A, FHIR_SimpleQuantity_A, FHIR_Timing_Repeat_A } from "../../../fhir-resources/types";
import { BoxedMedication, BoxedMedicationStatement, FHIR_MedicationStatement_A, FHIR_MedicationStatement_T, FHIR_Medication_T, boxMedicationResource, boxMedicationStatementResource, insertMedicationResource, insertMedicationStatementResource } from "../../../fhir-resources/medications/medication-statement";

import { Dosage_A, Dosage_doseAndRate_A, Ingredient_A, MedicationListResult_A, MedicationList_A, MedicationStatement_A, Timing_Repeat_A } from "../defs";


export function readMedicationList (resources: SupportedResource_A[], language?: string): T.Task<EitherIssueResult<MedicationListResult_A>> {
    return async () => {
        let issues: IssueList_A = [];

        if (resources.length === 0) {
            issues.push(info({ ...msg("no relevant resources") }));
        } else {
            issues.push(info({ ...msg("number of relevant resources: " + resources.length) }));
        }

        const boxedMedicationStatements = pipe(resources, A.filter(FHIR_MedicationStatement_T.is), A.map(boxMedicationStatementResource));
        const boxedMedications          = pipe(resources, A.filter(FHIR_Medication_T.is),          A.map(boxMedicationResource));

        const resolveOptions = {
            codeSystems: [ ...await makeDefaultCodeSystemsList(), makeStaticResourceCodeSystems({ axios }) ],
            textExtractionStrategy: pickFirstMerger,
            language: language
        };
        const resolver = resolveCodeableConceptTexts(resolveOptions);

        const [ issues0, resolvedMedicationStatements ] = await resolver(boxedMedicationStatements);
        const [ issues1, resolvedMedications ] = await resolver(boxedMedications);

        issues = [ ...issues, ...issues0, ...issues1 ];

        const g = new RefGraph();

        for (const res of resolvedMedications) {
            issues = [ ...issues, ...insertMedicationResource(g, <BoxedMedication>res) ];
        }

        for (const res of resolvedMedicationStatements) {
            issues = [ ...issues, ...insertMedicationStatementResource(g, <BoxedMedicationStatement>res) ];
        }

        const dot = refGraphToDot(g, [ g.getNodes() ]);

        const medicationList: MedicationList_A = {
            modelType: "MedicationList/1",
            medicationStatements: []
        };

        const x = pipe(g.getNodesByResourceType("MedicationStatement"), A.map(flow(
            T.of,
            T.map(extractStatement(g, O.fromNullable(language))),
            T.flatten
        )));

        const y = await Promise.all(pipe(x, A.map(exec)));

        const secondaryOrd: Ord<MedicationStatement_A> = reverse(fromCompare((a, b) => ordString.compare(a.code.resolvedText, b.code.resolvedText)));
        const primaryOrd:   Ord<MedicationStatement_A> = reverse(makeMedicationUsageOrd(secondaryOrd));

        medicationList.medicationStatements = pipe(y, A.rights, A.map(second), A.sort(primaryOrd));
        issues = [ ...issues, ...pipe(y, A.lefts, A.flatten) ];

        return E.right([ issues, {
            model: medicationList,
            dot
        }]);
    };
}

const extractStatement = (g: RefGraph, language: O.Option<string>): (node: RefNode) =>  T.Task<EitherIssueResult<MedicationStatement_A>> => node => {

    const stmtResource = node.fhir();
    if (O.isNone(stmtResource)) {
        return T.of(E.left([{
            severity: "error",
            message:  "ref node has no resource",
            context:  { graph: g },
            tags:     { medications: null }
        }]));
    }

    let medicationId: O.Option<string> = O.none;
    let medicationIdentifier: O.Option<FHIR_Identifier_A[]> = O.none;
    let ingredients: Ingredient_A[] = [];
    let code: O.Option<AnnotatedCodeableConcept_A> = O.none;
    let form: O.Option<AnnotatedCodeableConcept_A> = O.none;


    const neighbors = g.getNeighbors(node, [ "medication" ]);
    if (neighbors.length === 0) {
        const bmedst = stmtResource.value as BoxedMedicationStatement;
        if (bmedst.boxed._medicationTag !== "medicationCodeableConcept") {
            return T.of(E.left([{
                severity: "error",
                message:  "ref node has no Medication reference and no codeable concept",
                context:  { graph: g },
                tags:     { medications: null }
            }]));
        }

        code = bmedst.medication;

    } else {
        const neighbors = g.getNeighbors(node);
        if (neighbors.length !== 1) {
            return T.of(E.left([{
                severity: "error",
                message:  "MedicationStatement expected to have 1 neighbor, but has " + neighbors.length,
                context:  { graph: g, root: stmtResource.value.boxed },
                tags:     { medications: null }
            }]));
        }

        const mediRef = g.getNode(neighbors[0]);
        if (O.isNone(mediRef)) {
            return T.of(E.left([{
                severity: "error",
                message:  "could not get Medication node",
                context:  { graph: g, root: stmtResource.value.boxed },
                tags:     { medications: null }
            }]));
        }

        const mediRes = mediRef.value.fhir();
        if (O.isNone(mediRes)) {
            return T.of(E.left([{
                severity: "error",
                message:  "could not get Medication node resource",
                context:  { graph: g, root: stmtResource.value.boxed },
                tags:     { medications: null }
            }]));
        }

        code = (mediRes.value as BoxedMedication).code;
        form = (mediRes.value as BoxedMedication).form;
        medicationId = O.some(mediRes.value.boxed.id);
        medicationIdentifier = O.fromNullable((mediRes.value as BoxedMedication).boxed.identifier);

        ingredients = convertIngredients(mediRes.value as BoxedMedication);
    }

    return async () => {
        return E.right([ [], {
            medicationStatementId: stmtResource.value.boxed.id,
            medicationStatementIdentifier: (stmtResource.value as BoxedMedicationStatement).boxed.identifier,

            medicationId:          O.getOrElse(() => undefined)(medicationId),
            medicationIdentifier:  O.getOrElse(() => undefined)(medicationIdentifier),

            period: {
                min: stmtResource.value.period.min,
                max: stmtResource.value.period.max
            },

            ingredients,

            code: O.getOrElse(() => undefined)(code),
            form: O.getOrElse(() => undefined)(form),

            dosages: await Promise.all(pipe((stmtResource.value.boxed as FHIR_MedicationStatement_A).dosage,
                O.fromNullable,
                O.map(A.mapWithIndex(convertDosage(stmtResource.value as BoxedMedicationStatement, language))),
                O.getOrElse(() => []),
                A.map(exec)
            ))
        }]);
    };
};

// We implement this function on a list (rather than mapping over it), because we need the index
// to access another field in the object for getting the strength.
function convertIngredients (medication: BoxedMedication): Ingredient_A[] {
    const ingredients: Ingredient_A[] = [];

    for (let i = 0; i < medication.ingredients.length; i++) {
        const ing = medication.ingredients[i];
        if (O.isSome(ing)) {
            ingredients.push({
                ingredient: ing.value,
                strength: O.getOrElse(() => undefined)(getStrength(O.fromNullable(medication.boxed.ingredient[i].strength)))
            });
        }
    }

    return ingredients;
}


function getStrength (strength: O.Option<FHIR_Ratio_A>): O.Option<string> {
    if (O.isNone(strength)) {
        return O.none;
    }

    const parts: string[] = [];
    if (strength.value.numerator?.value && strength.value.numerator?.unit) {
        parts.push(strength.value.numerator.value + " " + strength.value.numerator?.unit);
    }

    if (strength.value.denominator?.value && strength.value.denominator?.unit) {
        parts.push(strength.value.denominator.value + " " + strength.value.denominator?.unit);
    }

    return O.some(parts.join("/"));
}

const convertDosage = (boxedStmt: BoxedMedicationStatement, language: O.Option<string>): (i: number, fhirDosage: FHIR_Dosage_A) => T.Task<Dosage_A> => (i, fhirDosage) => {
    return async () => {
        const dosage: Dosage_A = {};

        dosage.text = fhirDosage.text; // might be undefined

        if (fhirDosage.timing) {
            dosage.timing = {
                code:   pipe(boxedStmt.dosage[i].timingCode, O.getOrElse(() => undefined)),
                repeat: pipe(fhirDosage.timing.repeat, O.fromNullable, O.map(getTimingRepeat(language)), O.getOrElse(() => undefined))
            };
        } else {
            dosage.timing = undefined;
        }

        dosage.route  = pipe(boxedStmt.dosage[i].route,  O.getOrElse(() => undefined));
        dosage.site   = pipe(boxedStmt.dosage[i].site,   O.getOrElse(() => undefined));
        dosage.method = pipe(boxedStmt.dosage[i].method, O.getOrElse(() => undefined));

        dosage.doseAndRate = await Promise.all(pipe(fhirDosage.doseAndRate,
            O.fromNullable,
            O.map(A.map(convertDoseAndRate)),
            O.getOrElse(() => [] as T.Task<Dosage_doseAndRate_A>[]),
            A.map(exec)
        ));

        return dosage;
    };
};

const getTimingRepeat = (language: O.Option<string>): (fhirRepeat: FHIR_Timing_Repeat_A) => Timing_Repeat_A => fhirRepeat => {
    return {
        frequency:  fhirRepeat.frequency,
        period:     fhirRepeat.period,
        periodUnit: pipe(fhirRepeat.periodUnit, O.fromNullable, O.map(resolveCode(UCUM_CODESYSTEM, language)),          O.getOrElse(() => undefined)),
        when:       pipe(fhirRepeat.when,       O.fromNullable, O.map(A.map(resolveCode(TIMING_CODESYSTEM, language))), O.getOrElse(() => undefined))
    };
};

const UCUM_CODESYSTEM   = getCannedCodeSystem("ucum");
const TIMING_CODESYSTEM = getCannedCodeSystem("timing");

const resolveCode = (codeSystem: O.Option<LanguageCoding[]>, language: O.Option<string>): (code: string) => AnnotatedCodeableConcept_A => code => {
    if (O.isNone(codeSystem)) {
        return {
            codeableConcept: { coding: [{ code }] },
            resolvedText: code
        };
    } else {
        const coding = pipe(codeSystem.value, A.filter(c => (c.code === code) && (O.isSome(language) ? language.value === c.language : true)));
        if (coding.length === 0) {
            return {
                codeableConcept: { coding: [{ code }] },
                resolvedText: code
            };
        } else {
            return {
                codeableConcept: {
                    coding: [{
                        system: coding[0].system,
                        code,
                        display: coding[0].display
                    }]
                },
                resolvedText: coding[0].display
            };
        }
    }
};


function convertDoseAndRate (fhirDoseAndRate: FHIR_Dosage_doseAndRate_A): T.Task<Dosage_doseAndRate_A> {
    return async () => {
        const doseAndRate: Dosage_doseAndRate_A = {};

        if (fhirDoseAndRate._doseTag === "doseQuantity") {
            const cc = quantitiesToBoxedConceptCollector([ fhirDoseAndRate.doseQuantity ]);

            await resolveCodeableConceptTexts({
                codeSystems: await makeDefaultCodeSystemsList(),
                textExtractionStrategy: pickFirstMerger
            })([ cc ]);

            doseAndRate.doseQuantity = {
                value: fhirDoseAndRate.doseQuantity.value,
                unit: {
                    codeableConcept: cc.boxed.concepts[0],
                    resolvedText: pipe(cc.concepts[0], O.getOrElse(() => undefined))
                }
            };
        }

        if (fhirDoseAndRate._doseTag === "doseRange") {
            const cc = quantitiesToBoxedConceptCollector([ fhirDoseAndRate.doseRange.low, fhirDoseAndRate.doseRange.high ]);

            await resolveCodeableConceptTexts({
                codeSystems: await makeDefaultCodeSystemsList(),
                textExtractionStrategy: pickFirstMerger
            })([ cc ]);

            doseAndRate.doseRange = {};

            if (typeof fhirDoseAndRate.doseRange.low !== "undefined") {
                doseAndRate.doseRange.low = {
                    value: fhirDoseAndRate.doseRange.low.value,
                    unit: {
                        codeableConcept: cc.boxed.concepts[0],
                        resolvedText: pipe(cc.concepts[0], O.getOrElse(() => undefined))
                    }
                };
            }

            if (typeof fhirDoseAndRate.doseRange.high !== "undefined") {
                doseAndRate.doseRange.high = {
                    value: fhirDoseAndRate.doseRange.high.value,
                    unit: {
                        codeableConcept: cc.boxed.concepts[1],
                        resolvedText: pipe(cc.concepts[1], O.getOrElse(() => undefined))
                    }
                };
            }
        }

        return doseAndRate;
    };
}

function quantitiesToBoxedConceptCollector (quantities: (FHIR_SimpleQuantity_A | undefined)[]): BoxedConceptCollector {
    return boxConceptCollector({
        resourceType: "ConceptCollector",
        identifier: [],
        concepts: pipe(quantities, A.map(q => ({
            coding: [{
                system:  q ? q.system : "unknown",
                code:    q ? q.code   : "unknown",
                display: q ? q.unit   :  undefined
            }]
        })))
    });
}
