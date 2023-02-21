/* eslint-disable max-nested-callbacks */

import { assertEitherRight, consoleLogInspect, shouldDump } from "../../utils";
import { FHIR_QuestionnaireResponse_T } from "../../../src/fhir-resources/diagnostics/questionnaire-response";


describe("QuestionnaireResponse suite", () => {

    it("decode - 1", () => {
        const raw = {
            "resourceType": "QuestionnaireResponse",
            "id": "86194DDD-CCC8-47EE-BFDD-08CC29FA2D72",
            "language": "en",
            "questionnaire": "http://fhir.smart4health.eu/Questionnaire/pre-training-questionnaire|0.0.1",
            "status": "completed",
            "authored": "2020-02-06",
            "encounter": {
                "identifier": {
                    "system": "http://fhir.smart4health.eu/CodeSystem/ittm-training-id",
                    "value": "day-1"
                }
            },
            "item": [
                {
                    "linkId": "training_no",
                    "text": "Training Number",
                    "answer": [{
                        "valueInteger": 1
                    }]
                },
                {
                    "linkId": "back_pain_level_before",
                    "text": "Lower back pain level before training",
                    "answer": [{
                        "valueCoding": {
                            "system": "http://loinc.org",
                            "code": "LA6115-5"
                        }
                    }]
                },
                {
                    "linkId": "well_being",
                    "text": "Well being",
                    "answer": [{
                        "valueCoding": {
                            "system": "http://loinc.org",
                            "code": "LA10137-0"
                        }
                    }]
                },
                {
                    "linkId": "pre_training_condition",
                    "text": "Pre-training condition",
                    "answer": [{
                        "valueCoding": {
                            "system": "http://code.system",
                            "code": "01"
                        }
                    }]
                }
            ]
        };

        const qr = FHIR_QuestionnaireResponse_T.decode(raw);

        if (shouldDump()) {
            consoleLogInspect(qr);
        }

        assertEitherRight(qr);
    });


    it("decode - 2", () => {
        const raw = {
            "resourceType": "QuestionnaireResponse",
            "id": "E6001FA7-8C34-4BB9-8805-D62132C3DF9B",
            "language": "en",
            "questionnaire": "http://fhir.smart4health.eu/Questionnaire/pre-session-questionnaire|0.0.1",
            "status": "completed",
            "authored": "2020-05-04T14:15:00-05:00",
            "encounter": {
              "identifier": {
                  "system": "http://fhir.smart4health.eu/CodeSystem/ittm-training-id",
                  "value": "day-1"
              }
            },
            "item": []
        };

        const qr = FHIR_QuestionnaireResponse_T.decode(raw);

        if (shouldDump()) {
            consoleLogInspect(qr);
        }

        assertEitherRight(qr);
    });


    it("decode - 3", () => {
        const raw = {
            "resourceType": "QuestionnaireResponse",
            "id": "s4h-post-training-response-example",
            "language": "en",
            "questionnaire": "http://fhir.smart4health.eu/Questionnaire/post-training-questionnaire|0.0.1",
            "status": "completed",
            "authored": "2020-05-04T14:15:00-05:00",
            "encounter": {
              "identifier": {
                  "system": "http://fhir.smart4health.eu/CodeSystem/ittm-training-id",
                  "value": "day-1"
              }
            },
            "item": [{
                    "linkId": "training_no",
                    "text": "Training Number",
                    "answer": [{
                        "valueInteger": 1
                    }]
                },
                {
                    "linkId": "post_training_condition",
                    "text": "Post-training condition",
                    "answer": [{
                        "valueCoding": {
                            "system": "http://code.system",
                            "code": "03"
                        }
                    }]
                },
                {
                    "linkId": "training_weight_recommendation",
                    "text": "Training weight recommendation for the next training.",
                    "answer": [{
                        "valueCoding": {
                            "system": "http://snomed.info/sct",
                            "code": "35105006"
                        }
                    }]
                }
            ]
        };

        const qr = FHIR_QuestionnaireResponse_T.decode(raw);

        if (shouldDump()) {
            consoleLogInspect(qr, 10);
        }

        assertEitherRight(qr);
    });

});
