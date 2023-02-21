import qnr0 from "./post-training.questionnaire.json";
import qnr1 from "./pre-training.questionnaire.json";
import qnr2 from "./pre-session.questionnaire.json";

import enc0 from "./training-day-1.encounter.json";

import qr0 from "./training-day-1.pre-training.questionnaireresponse.json";
import qr1 from "./training-day-1.post-training.questionnaireresponse.json";
import qr2 from "./training-day-1.pre-session.questionnaireresponse.json";

export const RESOURCES: unknown[] = [
    enc0,
    qnr0, qnr1, qnr2,
    qr0, qr1, qr2
];
