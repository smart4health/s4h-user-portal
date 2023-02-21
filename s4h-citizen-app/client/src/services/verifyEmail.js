/* eslint-disable camelcase */
import i18n from '../i18n';
import config from '../config';
import { client } from '.';

const verifyEmail = async (email, validation_code) => {
  const URL = `${config.REACT_APP_AUTH_SERVICE_USERS_URL}/validate`;
  return await client.post(
    URL,
    { email, validation_code },
    {
      headers: {
        'X-User-Language': i18n.language,
        'Content-Type': 'application/json',
      },
    }
  );
};

export default verifyEmail;
