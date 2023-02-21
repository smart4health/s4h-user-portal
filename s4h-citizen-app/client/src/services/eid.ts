import D4LSDK from '@d4l/js-sdk';
import { client } from '.';
import config from '../config';
import settings from '../utils/settings';
import {
  EidCountryListItem,
  EidErrorData,
  EidGetInfoSuccessResponseData,
  EidRegisterSuccessResponseData,
} from './types';

export const connectEid = async (
  accessToken: string
): Promise<EidRegisterSuccessResponseData> => {
  const verifier = settings.eidVerifier;
  const requestBody = JSON.stringify({
    device_type: 'eid',
    device_value: verifier,
  });
  try {
    const response = await client.post(
      `${
        config.REACT_APP_GC_HOST
      }/devices/api/v1/users/${D4LSDK.getCurrentUserId()}/devices/eid`,
      requestBody,
      {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response.status === 400) {
      if (
        error.response.data?.errors
          .map((error: EidErrorData) => error.code)
          .includes('DEVICE_ID_EXISTS')
      ) {
        throw new Error('DEVICE_ID_EXISTS');
      }
    }
    throw new Error('failed to register eid');
  }
};

export const deleteEid = async (
  deviceId: string,
  accessToken: string
): Promise<boolean> => {
  try {
    await client.delete(
      `${
        config.REACT_APP_GC_HOST
      }/devices/api/v1/users/${D4LSDK.getCurrentUserId()}/devices/${deviceId}`,
      {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return true;
  } catch (error) {
    throw new Error('failed removing eid');
  }
};

export const fetchEidInfo = async (
  accessToken: string
): Promise<EidGetInfoSuccessResponseData> => {
  try {
    const response = await client.get(
      `${
        config.REACT_APP_GC_HOST
      }/devices/api/v1/users/${D4LSDK.getCurrentUserId()}/devices`,
      {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed fetching eid info');
  }
};

export const fetchCountryList = async (): Promise<EidCountryListItem[]> => {
  try {
    const response = await client.get(
      `${config.REACT_APP_GC_HOST}/devices/api/v1/eidas/countries`,
      {
        headers: {
          'Content-type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed fetching country list');
  }
};
