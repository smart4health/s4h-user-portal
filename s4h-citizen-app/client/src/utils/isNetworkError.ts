import { AxiosError } from 'axios';

const isNetworkError = (error: AxiosError) =>
  !!error.isAxiosError && !error.response;

export default isNetworkError;
