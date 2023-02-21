const inputResourceIdsMock = [
  'b057684d-aa69-4118-aab2-7d9fb188c00c',
  '43973143-89cf-4903-adec-01209c012f20',
  '8eb082b9-000d-4571-80a6-4c6ee0a63ddd',
  'ceacdadb-5279-466c-a811-ff9282b11e3e',
  '8fd8d88d-149f-498e-8787-91852c9d8db4',
  '0b20ce79-b494-4a11-a263-6892e5a521ea',
];

const personalDataMock = {
  firstName: 'first name',
  lastName: 'last name',
  gender: 'unknown',
  dateOfBirth: '1992-01-01',
  bloodGroup: {
    display: 'O',
    system: 'http://loinc.org',
    code: 'LA19708-9',
  },
  bloodRhesus: {
    display: 'Negative',
    system: 'http://loinc.org',
    code: 'LA6577-6',
  },
  weight: {
    value: 50,
    unit: 'kg',
  },
  height: {
    value: 132,
    unit: 'cm',
  },
  occupation: 'test occupation',
};

/* Shape of store when a personal data is available */
const personalDataStoreMock = {
  personalDataIds: inputResourceIdsMock,
  personalData: personalDataMock,
};

/* Shape of store when personal data is not avaialable */
const emptyPersonalDataStoreMock = {
  personalData: {},
  personalDataIds: [],
};

const emptyMedicalHistorySliceMock = {
  ...emptyPersonalDataStoreMock,
};

const medicalHistorySliceMock = {
  ...personalDataStoreMock,
};

export {
  inputResourceIdsMock,
  personalDataMock,
  emptyMedicalHistorySliceMock,
  medicalHistorySliceMock,
  emptyPersonalDataStoreMock,
};
