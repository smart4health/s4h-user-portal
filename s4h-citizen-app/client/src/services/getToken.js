import config from '../config';
import { client } from '.';

const getToken = async code => {
  const URL = config.REACT_APP_TOKEN_URL;
  return await client.post(
    URL,
    { code, redirectURI: config.REACT_APP_OAUTH_REDIRECT_URI },
    {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { retry: false },
    }
  );
};

export default getToken;
