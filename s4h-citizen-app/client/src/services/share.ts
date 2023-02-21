// @ts-ignore
import D4LSDK from '@d4l/js-sdk';
import { apiUpdateTags } from '@d4l/s4h-fhir-xforms';
import axios, { AxiosResponse } from 'axios';
// @ts-ignore
import queryString from 'query-string';
import { client } from '.';
import config from '../config';
import d4lDB from '../utils/D4LDB';
import {
  ClientAccessTokenResponse,
  DocumentSharePinResponse,
  DocumentSharePinResponseData,
} from './types';

// we use axios call instead of client because of polling
export const getClientAccessToken = (
  pin: string
): Promise<AxiosResponse<ClientAccessTokenResponse>> =>
  axios.get('/handshake/oauth/token', { params: { pin } });

export const generateHandshakePin = async (): Promise<{
  pin: string;
  privateKey: CryptoKey;
}> => {
  // @ts-ignore
  const keyPair = await D4LSDK.createCAP();
  const { publicKey, privateKey } = keyPair;

  // @ts-ignore
  const sealedPrivateKey = await D4LSDK.sealCAP(privateKey);

  /* post request to doctor's page. needs to be sent by proxy
    since it involves CORS and cookies sharing.
  */

  const pinResponse: DocumentSharePinResponse = await client.post('/handshake', {
    public_key: publicKey,
  });
  return { pin: pinResponse.data.pin, privateKey: sealedPrivateKey };
};

export const submitHandshakePin = async (pin: string, accessToken: string) => {
  const pinResponse: DocumentSharePinResponse = await client.get('/handshake', {
    params: { pin },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!pinResponse.data.public_key) {
    throw Error('PIN_INVALID');
  }
  // BREAKING_CHANGE: Here the pinRespnose itself was sent
  return pinResponse.data;
};

type approveShareSessionProps = {
  pinResponseData: DocumentSharePinResponseData;
  access_token: string;
  selectedResourceIds: string[];
  pin: string;
};

export const approveShareSession = async ({
  pinResponseData,
  access_token,
  selectedResourceIds,
  pin,
}: approveShareSessionProps) => {
  const approveEndpoint = `${config.REACT_APP_GC_HOST}${config.REACT_APP_PROXY_VEGA_BASE_ENDPOINT}${config.REACT_APP_VEGA_APPROVE_ENDPOINT}`;
  const commonKeysEndpoint = `${
    config.REACT_APP_AUTH_SERVICE_USERS_URL
  }/${D4LSDK.getCurrentUserId()}/commonkeys`;

  const userinfoResponse = await client.get(`${config.REACT_APP_GC_HOST}/userinfo`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (userinfoResponse.status === 200 && userinfoResponse.data) {
    const cap = await d4lDB.get('cap');
    const commonKey = userinfoResponse.data.common_key;
    const tagEncryptionKey = userinfoResponse.data.tag_encryption_key;

    const commonKeyHistoryResponse = await client.get(commonKeysEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });

    const tag = `sessionvalidpin${pin}`;

    const requesterPublicKey = pinResponseData.public_key;
    const args = {
      keys: {
        cap,
        encryptedCommonKey: commonKey,
        encryptedTagEncryptionKey: tagEncryptionKey,
      },
      requesterPublicKey: JSON.parse(atob(requesterPublicKey)),
      tag: `custom=${tag}`,
      commonKeyHistory: commonKeyHistoryResponse.data,
    };
    const {
      requesterCommonKeyHistory,
      encryptedTag,
      // @ts-ignore
    } = await D4LSDK.crypto.createShareApproveDetails(args);
    const [issueList, report] = await apiUpdateTags({
      sdk: D4LSDK,
      dateTime: new Date(),
      tags: [tag],
      resourceIds: selectedResourceIds,
    });
    console.log('sharing issues', issueList);
    let sharingSuccessful = false;
    if (report?.status) {
      sharingSuccessful = Object.values(report.status).every(
        status => status === 'OK'
      );
    }
    if (!sharingSuccessful) {
      throw new Error('tagging during sharing failed');
    }
    // The solution helps to solve the issue with assigning to a read only object
    // which in this case is pinResponseData. In development mode ie when running
    // in localhost, there was an issue when pinResponseData.scope = 'xyz' was assigned
    // This could be related to the immutability of the store object.
    const updatedPinResponseData = {
      ...pinResponseData,
      scope: `${pinResponseData.scope} tag:${encryptedTag}`,
    };

    try {
      await client.post(
        approveEndpoint,
        queryString.stringify({
          ...updatedPinResponseData,
          common_keys: requesterCommonKeyHistory.map(
            (
              // as the content type is form-encoded, sending key-value pairs is not straightforward
              // sending them as a string with a comma separator is the option we decided on
              keyInfo: { common_key_id: any; common_key: any }
            ) => `${keyInfo.common_key_id},${keyInfo.common_key}`
          ),
          response_type: 'code',
        }),
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
    } catch (error: any) {
      const { response } = error;
      if (response && response.status >= 400 && response.status < 500) {
        throw new Error('TOKEN_EXPIRED');
      }

      throw new Error('SHARE_ERROR');
    }
  }
};
