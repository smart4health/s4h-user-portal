// expects fn() to throw if it failed
// if it runs out of retries, poll() will resolve to an rejected promise,
// containing the latest error
// fn = axios call (not the client instance one)
type args = {
  fn: Function;
  shouldIStop: Function;
  retries: number;
  timeoutBetweenAttempts: number;
};

export async function poll({
  fn,
  shouldIStop,
  retries = 120,
  timeoutBetweenAttempts = 1000,
}: args) {
  const validate = (response: { status: number; data: any }) =>
    response.status === 200 && response.data;

  // @ts-ignore
  async function retry(error: ErrorEvent) {
    if (retries-- > 0) {
      await delay(timeoutBetweenAttempts);
      try {
        const response = await fn();
        if (validate(response)) {
          return response.data;
        }
      } catch (error: any) {
        if (shouldIStop()) {
          return;
        }
        return await retry(error);
      }
    } else {
      throw error;
    }
  }

  try {
    const response = await fn();

    if (validate(response)) {
      return response.data;
    }
  } catch (error: any) {
    return await retry(error);
  }
}

export function delay(ms: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}
