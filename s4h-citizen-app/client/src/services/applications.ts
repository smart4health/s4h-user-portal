// @ts-ignore
import D4LSDK from '@d4l/js-sdk';
import { client } from '.';
import config from '../config';
import d4lDB from '../utils/D4LDB';
import { FetchApplicationsResponse } from './types';

const PERMISSIONS_ENDPOINT = `${config.REACT_APP_GC_HOST}/permissions`;
const USERINFO_ENDPOINT = `${config.REACT_APP_GC_HOST}/userinfo`;

export const fetchApplications = async (access_token: String) => {
  const applications: FetchApplicationsResponse = await client.get(
    PERMISSIONS_ENDPOINT,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return applications.data;
};

export const revokeAccessOfApplication = async (
  access_token: string,
  permission_id: string,
  permissions: { permission_id: string; grantee_public_key: string }[]
) => {
  const cap = await d4lDB.get('cap');
  const userRootUrl = `${
    config.REACT_APP_AUTH_SERVICE_USERS_URL
  }/${D4LSDK.getCurrentUserId()}`;

  const userinfoResponse = await client.get(USERINFO_ENDPOINT, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
  });

  const publicKeyResponse = await client.get(`${userRootUrl}/publickey`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
  });

  const keys = {
    cap,
    encryptedCommonKey: userinfoResponse.data.common_key,
    encryptedTagEncryptionKey: userinfoResponse.data.tag_encryption_key,
  };

  const publicKey = JSON.parse(atob(publicKeyResponse.data.public_key));
  // The permissions of all the applications are to be sent here
  // which are split into permissionIdsToRevoke and permissionsToKeep.
  // A subset of permissions here doesnt work.
  // This is because under the hood, when revoking application access,
  // new keys are generated for each of them
  // @ts-ignore
  const payload = await D4LSDK.crypto.createKeyRotationPayload({
    keys,
    permissionIdsToRevoke: permissions
      .filter(permission => permission.permission_id === permission_id)
      .map(permission => permission.permission_id),
    permissionsToKeep: permissions.filter(
      permission => permission.permission_id !== permission_id
    ),
    userPublicKey: publicKey,
  });

  await client.post(`${userRootUrl}/keys`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
  });
};
