import { Problem } from '@d4l/s4h-fhir-xforms';
import { ConditionsState } from './reduxSlice';

export const conditionMock = (clinicalStatusResolvedText = 'Active') => ({
  period: {
    min: 1582714800000,
    max: Infinity,
  },
  problemId: '4f70bea1-4e97-48f6-b40f-8d76082310b7',
  clinicalStatus: {
    codeableConcept: {
      coding: [
        {
          code: clinicalStatusResolvedText.toLowerCase(),
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        },
      ],
    },
    resolvedText: clinicalStatusResolvedText,
  },
  code: {
    codeableConcept: {
      coding: [
        {
          code: '54329005',
          display: 'Acute myocardial infarction of anterior wall',
          system: 'http://snomed.info/sct',
        },
        {
          code: 'BA41&XA7RE3',
          display: 'Acute myocardial infarction & Anterior wall of heart',
          system: 'http://id.who.int/icd11/mms',
        },
      ],
    },
    resolvedText:
      'Acute myocardial infarction of anterior wall, Acute myocardial infarction & Anterior wall of heart',
  },
  category: [
    {
      codeableConcept: {
        coding: [
          {
            code: '75326-9',
            display: 'Problem',
            system: 'http://loinc.org',
          },
        ],
      },
      resolvedText: 'Problem',
    },
  ],
  verificationStatus: {
    codeableConcept: {},
    resolvedText: 'verification status resolved Text',
  },
});

export const codeMockWithoutResolvedText = {
  ...conditionMock().code,
  resolvedText: '',
};

export const clinicalStatusWithoutResolvedText = {
  ...conditionMock().clinicalStatus,
  resolvedText: undefined,
};

export const periodWithoutRecordedDate = {
  min: -Infinity,
  max: +Infinity,
};

export const conditionsSliceMock = (mockConditions: Problem[]): ConditionsState => ({
  data: {
    conditions: {
      ids: mockConditions.map(condition => condition.problemId),
      entities: mockConditions.reduce((accumulator, condition: Problem): Record<
        string,
        Problem
      > => {
        // @ts-ignore
        accumulator[condition.problemId] = condition;
        return accumulator;
      }, {}),
    },
  },
});
