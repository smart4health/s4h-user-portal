import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '../../redux';
import * as shareService from '../../services/share';
import { actions as waterfallGlobalActions } from '../../store';

interface ExternalSharingState {
  pin: string;
  privateKey: CryptoKey | null;
  isFetchingAccessToken: boolean;
  accessToken: string;
}

const initialState: ExternalSharingState = {
  pin: '',
  privateKey: null,
  isFetchingAccessToken: false,
  accessToken: '',
};

const generatePin = createAsyncThunk('shared/generatePin', async () => {
  const response = await shareService.generateHandshakePin();
  return response;
});

const documentSharingSlice = createSlice({
  name: 'externalSharing',
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isFetchingAccessToken = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(generatePin.fulfilled, (state, action) => {
        state.pin = action.payload.pin;
        state.privateKey = action.payload.privateKey;
        // immediately starts fetching access token
        state.isFetchingAccessToken = true;
      })
      .addCase(generatePin.rejected, () => {
        waterfallGlobalActions.setNotification('PIN_ERROR_REFRESH', 'error');
      });
  },
});

// selectors

const selectExternalSharingState = (state: AppState) => state.externalSharing;

const { actions, reducer } = documentSharingSlice;

const { setAccessToken } = actions;

export { setAccessToken };
export { generatePin };
export { selectExternalSharingState };
export default reducer;
