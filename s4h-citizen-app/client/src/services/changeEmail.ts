// @ts-ignore
import D4LSDK from '@d4l/js-sdk';
import { client } from '.';
import config from '../config';
import i18n from '../i18n';

const changeEmail = async (
  oldEmail: string,
  newEmail: string,
  password: string,
  accessToken: string
  // eslint-disable-next-line max-params
): Promise<number> => {
  const userId = D4LSDK.getCurrentUserId();
  const endpoint = `${config.REACT_APP_AUTH_SERVICE_USERS_URL}/${userId}/email`;

  let response;

  try {
    response = await client.put(
      endpoint,
      {
        current_email: oldEmail,
        new_email: newEmail,
        // @ts-ignore
        password_hash: await D4LSDK.crypto.createLoginHash(password),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'X-User-Language': i18n.language,
        },
      }
    );
  } catch (error: any) {
    response = error.response;
  }

  if (!response || !response.status) {
    throw new Error('COULD_NOT_CONNECT');
  }

  return response.status;
};

export default changeEmail;
