import { Group } from '@d4l/s4h-fhir-xforms';
import { findNextGroup } from '../DeleteGroup';

describe('DeleteGroup', () => {
  const severalGroupsMock: Group[] = [
    {
      groupType: 'Document',
      id: '6972914e-2a6e-4ae2-9d7d-61605ba99e57',
      title: 'Test1',
      date: '2021-01-05T11:00:00.000Z',
      items: [],
    },
    {
      groupType: 'Document',
      id: '6972914e-2a6e-4ae2-9d7d-61605ba99e58',
      title: 'Test2',
      date: '2021-01-05T11:00:00.000Z',
      items: [],
    },
    {
      groupType: 'Document',
      id: '6972914e-2a6e-4ae2-9d7d-61605ba99e59',
      title: 'Test3',
      date: '2021-01-05T11:00:00.000Z',
      items: [],
    },
  ];

  const singleGroupMock: Group[] = [severalGroupsMock[0]];

  it('should return the previous group if the given item was at any index higher than 0', () => {
    const group = findNextGroup(severalGroupsMock, severalGroupsMock[2].id);
    expect(group?.id).toBe(severalGroupsMock[1].id);
  });

  it('should return the next group if the given item was at index 0', () => {
    const group = findNextGroup(severalGroupsMock, severalGroupsMock[0].id);
    expect(group?.id).toBe(severalGroupsMock[1].id);
  });

  it('should return undefined if there is only one group in the list', () => {
    const group = findNextGroup(singleGroupMock, singleGroupMock[0].id);
    expect(group).toBe(undefined);
  });
});
