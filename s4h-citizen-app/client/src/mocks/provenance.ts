import { ProvenanceResult } from '@d4l/s4h-fhir-xforms';

export const provenanceMock = [
  {
    id: '09ee601c-3f17-41e0-bb1e-e58b27270641',
    recorded: 1630312561608,
    activity: {
      codeableConcept: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-DataOperation',
            code: 'CREATE',
          },
        ],
      },
      resolvedText: 'Create',
    },
    agents: [
      {
        who: {
          identifier: {
            system: 'http://fhir.data4life.care/CodeSystem/user-id',
            value: '29a872d0-e029-4c6d-8c1c-abc814f2f051',
          },
        },
        type: {
          codeableConcept: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/provenance-participant-type',
                code: 'author',
                display: 'Author',
              },
            ],
          },
          resolvedText: 'Author',
        },
      },
      {
        who: {
          identifier: {
            system: 'http://fhir.smart4health.eu/CodeSystem/s4h-source-system',
            value: 'd4a82fb0-5414-4e25-9637-3143dc231227#web',
          },
        },
        type: {
          codeableConcept: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/provenance-participant-type',
                code: 'composer',
                display: 'Composer',
              },
            ],
          },
          resolvedText: 'Composer',
        },
      },
    ],
    signature: 0,
  },
];

export const mockProvenanceResponse: ProvenanceResult = {
  model: {
    modelType: 'ProvenanceList/1',
    provenances: provenanceMock,
  },
};
