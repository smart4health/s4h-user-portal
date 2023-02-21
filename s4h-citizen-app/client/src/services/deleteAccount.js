import config from '../config';
import { client } from '.';
import i18n from '../i18n';

const deleteAccount = (userId, access_token) =>
  client.delete(`${config.REACT_APP_AUTH_SERVICE_USERS_URL}/${userId}/account`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
      'X-User-Language': i18n.language,
    },
  });

export default deleteAccount;
