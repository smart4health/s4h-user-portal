import { AxiosResponse } from 'axios';
import { useCallback, useRef } from 'react';

interface StartPollingProps<T> {
  interval?: number;
  retries?: number;
  fn: () => AxiosResponse<T>;
  onSuccess: (response: T) => void;
  onError: () => void;
}

function usePolling<PollingReturnType>(): [
  (props: StartPollingProps<PollingReturnType>) => void,
  () => void
] {
  const intervalRef = useRef<NodeJS.Timeout>();

  const stopPolling = useCallback((): void => {
    intervalRef.current && clearInterval(intervalRef.current);
  }, []);

  const startPolling = useCallback(
    ({
      interval = 1000,
      retries = 120,
      fn,
      onSuccess,
      onError,
    }: StartPollingProps<PollingReturnType>) => {
      let retriesLeft = retries;

      intervalRef.current = setInterval(async () => {
        if (retriesLeft >= 0) {
          try {
            retriesLeft -= 1;
            const response = await fn();
            if (response.data) {
              // success case
              stopPolling();
              onSuccess(response.data);
            }
          } catch (error) {
            // We are not capturing the error
          }
        } else {
          stopPolling();
          onError();
        }
      }, interval);
    },
    [stopPolling]
  );

  return [startPolling, stopPolling];
}

export default usePolling;
