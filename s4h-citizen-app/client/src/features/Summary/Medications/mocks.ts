import { MedicationStatement } from '@d4l/s4h-fhir-xforms';
import { createMedicationItemMock } from '../../Medication/MedicationDetails/mocks';
import { MedicationState } from '../../Medication/reduxSlice';

interface MedicationMock {
  minPeriod?: number;
  maxPeriod?: number;
  emptyTitle?: boolean;
}

export const medicationMock = ({
  minPeriod = 1504828800000,
  maxPeriod = new Date().getTime(),
  emptyTitle = false,
}: MedicationMock) => {
  return createMedicationItemMock(minPeriod, maxPeriod, emptyTitle);
};

export const medicationSliceMock = (
  mockMedications: MedicationStatement[]
): MedicationState => ({
  isLoading: false,
  activeMedicationId: undefined,
  downloadableResources: [],
  medications: {
    ids: mockMedications.map(medication => medication.medicationStatementId),
    entities: mockMedications.reduce(
      (
        accumulator,
        medication: MedicationStatement
      ): Record<string, MedicationStatement> => {
        // @ts-ignore
        accumulator[medication.medicationStatementId] = medication;
        return accumulator;
      },
      {}
    ),
  },
});
