export type ZipItem<T> = {
  type: 'File' | 'JSON';
  filename: string;
  data: T;
};

export type FileZipItem = ZipItem<string>;
export type JSONZipItem = ZipItem<object>;

export type ZipData = {
  filename: string;
  items: Array<FileZipItem | JSONZipItem>;
};

export type DocumentSharePinResponseData = {
  client_id: string;
  public_key: string;
  redirect_uri: string;
  scope: string;
  state: string;
  pin: string;
};

export type DocumentSharePinResponse = {
  data: DocumentSharePinResponseData;
};

export type FetchApplicationsResponse = {
  data: Application[];
};

export type ClientAccessTokenResponse = {
  access_token: string;
};

export interface AuthDevice {
  id: string;
  type: 'sms' | 'eid';
  status: 'pending' | 'approved';
  createdAt: string;
}

enum EidRegistrationStatus {
  pending = 'pending',
  approved = 'approved',
}

export type EidRegisterSuccessResponseData = {
  device_id: string;
  device_url: string;
  status: EidRegistrationStatus;
};

export type EidGetInfoSuccessResponseData = AuthDevice[];

export type EidErrorData = {
  code: string;
  trace_id: string;
};

export type EidCountryListItem = {
  countryCode: string;
  country: string;
};
