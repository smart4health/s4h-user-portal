import config from '../config';
import { client } from '.';
import { UserData } from '../types';

const getUserData = async (
  access_token: string
): Promise<UserData | { error: Error }> => {
  const userInfoEndpoint = `${config.REACT_APP_GC_HOST}${config.REACT_APP_PROXY_VEGA_BASE_ENDPOINT}`;

  try {
    const response = await client.get(`${userInfoEndpoint}/user`, {
      // @ts-ignore
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${access_token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    return { error };
  }
};

export default getUserData;
