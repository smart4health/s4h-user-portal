// @ts-ignore
import D4LSDK from '@d4l/js-sdk';
import { client } from '..';
import changeEmail from '../changeEmail';

D4LSDK.getCurrentUserId = jest.fn().mockImplementationOnce(() => '1337-abcdef');

const userData = {
  email: 'carol@danvers.com',
  newEmail: 'steve@romanoff.com',
  password: 'iAmCptMarvel',
  accessToken: `token:${Date.now()}`,
};

describe('changeEmail', () => {
  it('should be able to change email', async () => {
    client.put = jest.fn().mockReturnValue(Promise.resolve({ status: 200 }));
    const changeResult = await changeEmail(
      userData.email,
      userData.newEmail,
      userData.password,
      userData.accessToken
    );
    expect(changeResult).toBe(200);
  });

  it('returns error', async () => {
    client.put = jest.fn().mockImplementationOnce(() => {
      throw new Error(JSON.stringify({ response: { status: 400 } }));
    });
    try {
      const changeResult = await changeEmail(
        userData.email,
        userData.newEmail,
        userData.password,
        userData.accessToken
      );
      expect(changeResult).toBe(400);
    } catch (error) {}
  });
});
