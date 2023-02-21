import { AllergiesIntolerancesState } from '../reduxSlice';

export const allergyBaseMock = {
  period: {
    min: 1,
    max: 2,
  },
  allergyIntoleranceId: 's4h-allergy-with-reaction-example',
  allergyIntoleranceIdentifier: undefined,
  code: {
    codeableConcept: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '294238000',
          display: 'Allergy to gold (finding)',
        },
      ],
    },
    resolvedText: 'Allergy to gold (finding)',
  },
};

export const allergyClinicalStatusMock = {
  ...allergyBaseMock,
  clinicalStatus: {
    codeableConcept: {
      coding: [
        {
          system:
            'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
          code: 'active',
          display: 'Active',
        },
      ],
    },
    resolvedText: 'Active',
  },
};

export const allergyCriticalityMock = {
  ...allergyBaseMock,
  criticality: 'high',
  criticalityConcept: {
    coding: [
      {
        system: 'http://hl7.org/fhir/allergy-intolerance-criticality',
        code: 'high',
      },
    ],
    resolvedText: 'High',
  },
};

export const allergyVerificationStatusMock = {
  ...allergyBaseMock,
  verificationStatus: {
    codeableConcept: {
      coding: [
        {
          system:
            'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
          code: 'confirmed',
          display: 'Confirmed',
        },
      ],
    },
    resolvedText: 'Confirmed',
  },
};

export const allergyReactionMock = {
  ...allergyBaseMock,
  reactions: [
    {
      severity: 'severe',
      onset: 1588550400000,
      manifestations: [
        {
          codeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '16932000',
                display: 'Nausea and vomiting',
              },
            ],
          },
          resolvedText: 'Nausea and vomiting (disorder)',
        },
      ],
    },
    {
      severity: 'severe',
      onset: 1588550400000,
      manifestations: [
        {
          codeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '16932000',
                display: 'Test',
              },
            ],
          },
          resolvedText: 'Nausea and vomiting (disorder)',
        },
      ],
    },
  ],
};

export const allergyVerificationAndClinicalMock = {
  ...allergyBaseMock,
  ...allergyClinicalStatusMock,
  ...allergyVerificationStatusMock,
};

export const initialState = (mock: any): AllergiesIntolerancesState => {
  return {
    data: {
      allergiesIntolerances: {
        ids: [mock.id],
        entities: {
          [mock.id]: mock,
        },
      },
    },
  };
};
