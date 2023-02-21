import D4LSDK from '@d4l/js-sdk';
import { client } from '..';
import { eidGetInfoResponseWithEID } from '../../features/Profile/mocks';
import settings from '../../utils/settings';
import { connectEid, deleteEid, fetchEidInfo } from '../eid';
describe('connectEid', () => {
  it('makes a call to the right endpoint with the right data', async () => {
    client.post = jest.fn().mockResolvedValueOnce({
      status: 201,
    });
    D4LSDK.getCurrentUserId = jest.fn().mockReturnValueOnce('test_user_id');
    settings.getLocalStorageValue = jest.fn().mockReturnValueOnce('verifier');
    await connectEid('authToken');
    expect(client.post).toHaveBeenCalledWith(
      'http://localhost/devices/api/v1/users/test_user_id/devices/eid',
      JSON.stringify({
        device_type: 'eid',
        device_value: 'verifier',
      }),
      {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer authToken`,
        },
      }
    );
  });
  it('returns the data of the response when successful', async () => {
    const mockResponseData = {
      device_id: 'id',
      device_url: 'url',
      status: 'approved',
    };
    client.post = jest.fn().mockResolvedValueOnce({
      status: 201,
      data: mockResponseData,
    });
    D4LSDK.getCurrentUserId = jest.fn().mockReturnValueOnce('test_user_id');
    settings.getLocalStorageValue = jest.fn().mockReturnValueOnce('verifier');
    const response = await connectEid('authToken');
    expect(response).toEqual(mockResponseData);
  });
  it('throws an error in case of any errors', async () => {
    client.post = jest.fn().mockRejectedValueOnce({
      status: 400,
      response: {
        status: 400,
      },
    });
    D4LSDK.getCurrentUserId = jest.fn().mockReturnValueOnce('test_user_id');
    settings.getLocalStorageValue = jest.fn().mockReturnValueOnce('verifier');
    try {
      await connectEid('authToken');
    } catch (error: any) {
      expect(error.message).toEqual('failed to register eid');
    }
  });
  it('throws DEVICE_ID_EXISTS error when trying to link an already connected eID to another account', async () => {
    client.post = jest.fn().mockRejectedValueOnce({
      status: 400,
      response: {
        status: 400,
        data: {
          errors: [
            {
              code: 'DEVICE_ID_EXISTS',
            },
          ],
        },
      },
    });
    D4LSDK.getCurrentUserId = jest.fn().mockReturnValueOnce('test_user_id');
    settings.getLocalStorageValue = jest.fn().mockReturnValueOnce('verifier');
    try {
      await connectEid('authToken');
    } catch (error) {
      expect(error.message).toEqual('DEVICE_ID_EXISTS');
    }
  });
});

describe('deleteEid', () => {
  it('returns true when the deletion is successful', async () => {
    client.delete = jest.fn().mockResolvedValueOnce({
      status: 201,
      data: {},
    });
    const response = await deleteEid('deviceId', 'accessToken');
    expect(response).toEqual(true);
  });
  it('throws error when the deletion is unsuccessful', async () => {
    client.delete = jest.fn().mockRejectedValueOnce({
      status: 400,
    });
    try {
      await deleteEid('deviceId', 'accessToken');
    } catch (error) {
      expect(error.message).toEqual('failed removing eid');
    }
  });
});

describe('fetchEidInfo', () => {
  it('returns true when the api call is successful', async () => {
    client.get = jest.fn().mockResolvedValueOnce({
      status: 201,
      data: eidGetInfoResponseWithEID,
    });
    const response = await fetchEidInfo('accessToken');
    expect(response).toEqual(eidGetInfoResponseWithEID);
  });
  it('throws error when the api call is unsuccessful', async () => {
    client.delete = jest.fn().mockRejectedValueOnce({
      status: 400,
    });
    try {
      await fetchEidInfo('accessToken');
    } catch (error) {
      expect(error.message).toEqual('Failed fetching eid info');
    }
  });
});
