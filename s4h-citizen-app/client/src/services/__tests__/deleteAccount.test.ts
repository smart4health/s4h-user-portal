import { client } from '..';
import deleteAccount from '../deleteAccount';

const mockedClient = client as jest.Mocked<typeof client>;

describe('deleteAccount', () => {
  beforeEach(() => {
    mockedClient.delete = jest.fn();
    mockedClient.delete.mockReturnValueOnce(Promise.resolve({ status: 200 }));
  });

  afterEach(() => {
    mockedClient.delete.mockReset();
  });

  it('should be able to delete', async () => {
    const userData = {
      userId: `id:${Date.now()}`,
      accessToken: `token:${Date.now()}`,
    };

    const deleteResult = await deleteAccount(userData.userId, userData.accessToken);
    expect(deleteResult.status).toBe(200);
  });
});
