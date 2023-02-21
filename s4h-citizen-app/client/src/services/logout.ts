// @ts-ignore
import D4LSDK from '@d4l/js-sdk';
import { client } from '.';
import i18n from '../i18n';

type LogoutReturn = {
  success: boolean;
};

const logout = async (): Promise<LogoutReturn | { error: Error }> => {
  try {
// @ts-ignore
    D4LSDK.reset();
// @ts-ignore
    const { setCurrentUserLanguage } = D4LSDK;
    setCurrentUserLanguage && setCurrentUserLanguage(i18n.language);

    await client.post('/logout', null, { params: { retry: false } });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export default logout;
