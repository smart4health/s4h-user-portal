import isNetworkError from '../isNetworkError';

describe('isNetworkError', () => {
  it('is a network error', () => {
// @ts-ignore
    expect(isNetworkError({ isAxiosError: true, response: null })).toBe(true);
// @ts-ignore
    expect(isNetworkError({ isAxiosError: true })).toBe(true);
  });

  it('is not a network error', () => {
// @ts-ignore
    expect(isNetworkError({ response: null })).toBe(false);
// @ts-ignore
    expect(isNetworkError({ response: { status: 200 } })).toBe(false);
  });
});
