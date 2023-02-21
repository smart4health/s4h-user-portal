import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '../../redux';
import {
  connectEid,
  deleteEid,
  fetchCountryList,
  fetchEidInfo,
} from '../../services/eid';
import { AuthDevice, EidRegisterSuccessResponseData } from '../../services/types';
import { getState as waterfallGlobalState } from '../../store';

export interface EidInfo {
  id: string;
  registeredAt: string;
}

export type CountryListItem = {
  country: string;
  countryCode: string;
};

interface ProfileState {
  eidInfo: EidInfo | undefined;
  eidEnabledCountries: CountryListItem[];
}

const initialState: ProfileState = {
  eidInfo: undefined,
  eidEnabledCountries: [],
};

export const registerEid = createAsyncThunk('profile/registerEid', async () => {
  const accessToken = waterfallGlobalState().access_token!;
  const response = await connectEid(accessToken);
  return response;
});

export const removeEid = createAsyncThunk(
  'profile/removeEid',
  async (_, { getState }) => {
    const accessToken = waterfallGlobalState().access_token!;
    const state = getState() as AppState;
    const deviceId = selectDeviceId(state)!;
    await deleteEid(deviceId, accessToken);
  }
);

export const getLatestEidInfo = createAsyncThunk(
  'profile/getLatestEidInfo',
  async () => {
    const accessToken = waterfallGlobalState().access_token!;
    const response = await fetchEidInfo(accessToken);
    const eidDevice = response.find((device: AuthDevice) => device.type === 'eid');
    // There would be only one device with type eid always returned in this api call
    if (!eidDevice) {
      return undefined;
    }

    return {
      id: eidDevice.id,
      registeredAt: new Date(eidDevice.createdAt).toISOString(),
    };
  }
);

export const getEidEnabledCountries = createAsyncThunk(
  'profile/getEidEnabledCountries',
  async () => {
    const response = await fetchCountryList();
    return response;
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(
        registerEid.fulfilled,
        (state, action: PayloadAction<EidRegisterSuccessResponseData>) => {
          if (action.payload) {
            state.eidInfo = {
              id: action.payload.device_id,
              registeredAt: new Date().toISOString(),
            };
          }
        }
      )
      .addCase(registerEid.rejected, (_state, action) => {
        console.log('Eid registration failed', action);
      })
      .addCase(removeEid.fulfilled, state => {
        state.eidInfo = undefined;
      })
      .addCase(removeEid.rejected, (_, action) => {
        console.log('eid removal failed', action.error.message);
      })
      .addCase(
        getLatestEidInfo.fulfilled,
        (state, action: PayloadAction<EidInfo | undefined>) => {
          state.eidInfo = action.payload;
        }
      )
      .addCase(getLatestEidInfo.rejected, (_, action) => {
        console.log('latest eid fetch failed', action.error.message);
      })
      .addCase(
        getEidEnabledCountries.fulfilled,
        (state, action: PayloadAction<CountryListItem[]>) => {
          state.eidEnabledCountries = action.payload;
        }
      ),
});

export const selectEidInfo = (state: AppState) => state.profile.eidInfo;

export const selectDeviceId = (state: AppState): string | undefined =>
  state.profile.eidInfo?.id;

export const selectEidEnabledCountries = (state: AppState): CountryListItem[] =>
  state.profile.eidEnabledCountries;

const { reducer } = profileSlice;

export default reducer;
