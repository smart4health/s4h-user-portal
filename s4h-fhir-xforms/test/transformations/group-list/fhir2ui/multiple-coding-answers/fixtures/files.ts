import enc from "./encounter.json";
import qnr from "./questionnaire.json";
import qrOk from "./ok.questionnaire-response.json";
import qrNotOk from "./not-ok.questionnaire-response.json";

export const RESOURCES_OK: unknown[] = [
    qnr, qrOk, enc
];

export const RESOURCES_NOT_OK: unknown[] = [
    qnr, qrNotOk, enc
];
