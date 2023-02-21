import docRef0 from "./documentreference/treatment-series-pre-session-force-test.documentreference.json";
import docRef1 from "./documentreference/treatment-series-post-session-force-test.documentreference.json";

import enc0 from "./encounter/treatment-series-pre-session-encounter.encounter.json";
import enc1 from "./encounter/treatment-series-post-session-encounter.encounter.json";
import enc2 from "./encounter/treatment-series-training-encounter-1.encounter.json";
import enc3 from "./encounter/treatment-series-training-encounter-2.encounter.json";
import enc4 from "./encounter/treatment-series-training-encounter-3.encounter.json";
import enc5 from "./encounter/treatment-series-training-encounter-4.encounter.json";
import enc6 from "./encounter/treatment-series-training-encounter-5.encounter.json";
import enc7 from "./encounter/treatment-series-training-encounter-6.encounter.json";

import qnr0 from "./questionnaire/back-pain-post-session-en-packed.questionnaire.json";
import qnr1 from "./questionnaire/back-pain-post-training-en-packed.questionnaire.json";
import qnr2 from "./questionnaire/back-pain-pre-session-en-packed.questionnaire.json";
import qnr3 from "./questionnaire/back-pain-pre-training-en-packed.questionnaire.json";

import qr0 from "./questionnaireresponse/treatment-series-post-session-response-en.questionnaireresponse.json";
import qr1 from "./questionnaireresponse/treatment-series-post-training-response-1-en.questionnaireresponse.json";
import qr2 from "./questionnaireresponse/treatment-series-post-training-response-2-en.questionnaireresponse.json";
import qr3 from "./questionnaireresponse/treatment-series-post-training-response-3-en.questionnaireresponse.json";
import qr4 from "./questionnaireresponse/treatment-series-post-training-response-4-en.questionnaireresponse.json";
import qr5 from "./questionnaireresponse/treatment-series-post-training-response-5-en.questionnaireresponse.json";

import qr6 from "./questionnaireresponse/treatment-series-pre-session-response-en.questionnaireresponse.json";
import qr7 from "./questionnaireresponse/treatment-series-pre-training-response-1-en.questionnaireresponse.json";
import qr8 from "./questionnaireresponse/treatment-series-pre-training-response-2-en.questionnaireresponse.json";
import qr9 from "./questionnaireresponse/treatment-series-pre-training-response-3-en.questionnaireresponse.json";
import qr10 from "./questionnaireresponse/treatment-series-pre-training-response-4-en.questionnaireresponse.json";
import qr11 from "./questionnaireresponse/treatment-series-pre-training-response-5-en.questionnaireresponse.json";
import qr12 from "./questionnaireresponse/treatment-series-pre-training-response-6-en.questionnaireresponse.json";

export const RESOURCES: unknown[] = [
    docRef0, docRef1,
    enc0, enc1, enc2, enc3, enc4, enc5, enc6, enc7,
    qnr0, qnr1, qnr2, qnr3,
    qr0, qr1, qr2, qr3, qr4, qr5, qr6, qr7, qr8, qr9, qr10, qr11, qr12
];

export const SINGLE_Q_GROUP = [
    enc2, qr1, qnr1
];
