import { MedicationStatement } from '@d4l/s4h-fhir-xforms';

const ingredients = [
  {
    ingredient: {
      codeableConcept: {
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '36567',
            display: 'Simvastatin',
          },
        ],
      },
      resolvedText: 'Simvastatin',
    },
    strength: '40 mcg/1 tablet',
  },
  {
    ingredient: {
      codeableConcept: {
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '36567',
            display: 'Pravastatin',
          },
        ],
      },
      resolvedText: 'Pravastatin',
    },
    strength: '',
  },
  {
    ingredient: {
      codeableConcept: {
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '36567',
            display: 'Pravastatin',
          },
        ],
      },
      resolvedText: '',
    },
    strength: '40 mcg/1 tablet',
  },
];

const medicationCode = {
  codeableConcept: {
    coding: [
      {
        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
        code: '757704',
        display: 'Simvastatin 40 MG Disintegrating Oral Tablet',
      },
      {
        system: 'http://www.whocc.no/atc',
        code: 'C10AA01',
        display: 'simvastatin',
      },
    ],
    text: 'Fluspiral 50 mcg',
  },
  resolvedText: 'Fluspiral 50 mcg',
};

export const medicationEmptyDescription = {
  codeableConcept: {
    coding: [
      {
        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
        code: '1294713',
        display: 'Disintegrating Oral Product',
      },
      {
        system: 'http://standardterms.edqm.eu',
        code: '10219000',
        display: 'Tablet',
      },
    ],
  },
  resolvedText: undefined,
};

export const createMedicationItemMock = (
  minPeriod: number,
  maxPeriod: number,
  emptyTitle: boolean = false
): MedicationStatement => ({
  medicationStatementId: 'medplan-plus-de-med-statement-example-1',
  period: {
    min: minPeriod,
    max: maxPeriod,
  },
  ingredients: ingredients,
  code: emptyTitle ? medicationEmptyDescription : medicationCode,
  form: {
    codeableConcept: {
      coding: [
        {
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: '1294713',
          display: 'Disintegrating Oral Product',
        },
        {
          system: 'http://standardterms.edqm.eu',
          code: '10219000',
          display: 'Tablet',
        },
      ],
    },
    resolvedText: 'Disintegrating Oral Product, Tablet',
  },
  dosages: [
    {
      timing: {
        code: {
          codeableConcept: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-TimingEvent',
                code: 'CV',
              },
            ],
          },
          resolvedText: 'dinner',
        },
      },
    },
  ],
});
