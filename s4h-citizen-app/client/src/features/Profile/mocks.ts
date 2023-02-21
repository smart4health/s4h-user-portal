import { AuthDevice } from '../../services/types';

export const eidGetInfoResponse: AuthDevice[] = [
  {
    id: 'd94f5638-daaf-4ffc-acc5-d03ad1f22fc8',
    type: 'sms',
    status: 'approved',
    createdAt: '2020-03-17T12:37:15.715316Z',
  },
];

export const eidGetInfoResponseWithEID: AuthDevice[] = [
  ...eidGetInfoResponse,
  {
    id: '327136e8-c2dd-4be4-9359-7e45c6c4bc69',
    type: 'eid',
    status: 'approved',
    createdAt: '2021-06-17T10:15:06.702866Z',
  },
];
