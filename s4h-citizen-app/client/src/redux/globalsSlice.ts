import {
  makeReadymadeValueSet,
  ValueSetSourceLookupParameters,
} from '@d4l/s4h-fhir-xforms';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
// @ts-ignore
import Bowser from 'bowser';
import { featureNames, Flags } from '../config/flags';
import {
  getGroups,
  selectHasHealthData,
} from '../features/DocumentsViewer/reduxSlice';
import {
  getPatient,
  selectHasMedicalHistory,
  selectHasPersonalData,
} from '../features/MedicalHistory/reduxSlice';
import {
  getMedications,
  selectHasMedications,
  selectIsCurrentMedicationsEmpty,
} from '../features/Medication/reduxSlice';
import {
  fetchAllergiesIntolerances,
  selectIsAllergiesIntolerancesEmpty,
} from '../features/Summary/AllergiesIntolerances/reduxSlice';
import {
  fetchConditions,
  selectIsConditionsEmpty,
} from '../features/Summary/Conditions/reduxSlice';
import i18n from '../i18n';
import * as d4lServices from '../services/D4L';
import { getState as waterfallGlobalState } from '../store';
import { Browser, Platform, UserAgent } from '../types';
import settings from '../utils/settings';
import { AppState } from './index';

export enum ViewportSize {
  NARROW = 'NARROW',
  MEDIUM = 'MEDIUM',
  WIDE = 'WIDE',
}

export const determineViewportSize = (): ViewportSize => {
  return window.innerWidth < 768
    ? ViewportSize.NARROW
    : window.innerWidth < 960
    ? ViewportSize.MEDIUM
    : ViewportSize.WIDE;
};

const getUserAgent = (): UserAgent => {
  let currentPlatform: Platform = 'web';
  const bowser = Bowser.getParser(window.navigator.userAgent);
  const checkForTouchDevice = () => {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    );
  };

  const { os, platform, browser } = bowser.getResult();
  // platform.type can be 'desktop', 'tablet' and 'mobile'
  if (platform.type !== 'desktop') {
    if (os.name === 'Android') {
      currentPlatform = 'android';
    }

    if (os.name === 'iOS') {
      currentPlatform = 'ios';
    }
  } else if (
    platform.type === 'desktop' &&
    os.name === 'macOS' &&
    checkForTouchDevice()
  ) {
    // specifically detecting safari on iPad as they have same
    currentPlatform = 'ios';
  }
  return {
    platform: currentPlatform,
    browser: browser.name?.toLocaleLowerCase() as Browser,
  };
};

interface GlobalsState {
  viewportSize: ViewportSize | null;
  userAgent: UserAgent | null;
  isSDKSetup: boolean;
  isSharingMode: boolean;
  isEOLBannerVisible: boolean;
  isCookieChoiceMade: boolean;
}
const initialState: GlobalsState = {
  viewportSize: typeof window === 'object' ? determineViewportSize() : null,
  userAgent: typeof window === 'object' ? getUserAgent() : null,
  isSDKSetup: false,
  isSharingMode: false,
  isEOLBannerVisible: settings.endOfLifeBannerVisible,
  isCookieChoiceMade: settings.hasMadeCookieChoice,
};

const setupSDK = createAsyncThunk(
  'globals/setupSDK',
  async ({
    privateKey,
    accessToken,
  }: {
    privateKey: CryptoKey;
    accessToken: string;
  }) => {
    await d4lServices.setupSDK(privateKey, accessToken);
  }
);

const fetchValueSet = createAsyncThunk(
  'globals/fetchValueSet',
  async (
    valueSetUrl: string,
    lookupParams: ValueSetSourceLookupParameters | {} = {}
  ) => {
    const response = await makeReadymadeValueSet({
      valueSetUrl,
      axios,
    });
    const lookupResponse = await response.lookup(lookupParams);
    return lookupResponse;
  }
);

const fetchDataOnAppInit = createAsyncThunk(
  'globals/fetchDataOnAppInit',
  async (_, { getState, dispatch }) => {
    // loads all the data that are necessary to properly render Dashboard and External shared view
    const state = getState() as AppState;
    const isHealthDataLoaded = selectHasHealthData(state);
    const isMedicalHistoryDataLoaded = selectHasMedicalHistory(state);
    const isMedicationsDataLoaded = selectHasMedications(state);
    const isConditionsEmpty = selectIsConditionsEmpty(state);
    const isAllergiesIntolerancesEmpty = selectIsAllergiesIntolerancesEmpty(state);
    const flags: Flags = waterfallGlobalState().flags;
    // Check and load the data only if they are not previously loaded
    const dataFetchActions = [];
    if (!isHealthDataLoaded) {
      dataFetchActions.push(dispatch(getGroups()));
    }
    if (!isMedicalHistoryDataLoaded) {
      dataFetchActions.push(dispatch(getPatient()));
    }
    if (isConditionsEmpty) {
      dataFetchActions.push(dispatch(fetchConditions()));
    }
    if (isAllergiesIntolerancesEmpty) {
      dataFetchActions.push(dispatch(fetchAllergiesIntolerances()));
    }
    if (!isMedicationsDataLoaded && flags[featureNames.MEDICATION]) {
      dataFetchActions.push(dispatch(getMedications(i18n.language)));
    }
    await Promise.allSettled(dataFetchActions);
  }
);

const globalsSlice = createSlice({
  name: 'globals',
  initialState,
  reducers: {
    viewportSizeChanged: state => {
      state.viewportSize = determineViewportSize();
    },
    setSharingMode: (state, action: PayloadAction<boolean>) => {
      state.isSharingMode = action.payload;
    },
    setIsEOLBannerVisible: (state, action: PayloadAction<boolean>) => {
      state.isEOLBannerVisible = action.payload;
      settings.endOfLifeBannerVisible = action.payload;
    },
    setIsCookieChoiceMade: (state, action: PayloadAction<boolean>) => {
      state.isCookieChoiceMade = action.payload;
    },
  },
  extraReducers: builder =>
    builder.addCase(setupSDK.fulfilled, state => {
      state.isSDKSetup = true;
    }),
});

export const selectViewportSize = (state: AppState): ViewportSize | null =>
  state.globals.viewportSize;

export const selectIsDeviceMobile = (state: AppState): boolean =>
  state.globals.viewportSize === ViewportSize.NARROW;

export const selectIsDeviceTablet = (state: AppState): boolean =>
  state.globals.viewportSize === ViewportSize.MEDIUM;

export const selectIsDeviceDesktop = (state: AppState): boolean =>
  state.globals.viewportSize === ViewportSize.WIDE;

export const selectPlatform = (state: AppState): Platform | null =>
  state.globals.userAgent?.platform ?? null;

export const selectBrowser = (state: AppState): Browser | null =>
  state.globals.userAgent?.browser ?? null;

export const selectUserAgent = (state: AppState): UserAgent | null =>
  state.globals.userAgent;

export const selectIsSharingMode = (state: AppState) => state.globals.isSharingMode;

export const selectIsCookieChoiceMade = (state: AppState) =>
  state.globals.isCookieChoiceMade;

export const selectIsEOLBannerVisible = (state: AppState) =>
  state.globals.isEOLBannerVisible;

const selectHasSummaryData = (state: AppState) =>
  selectHasPersonalData(state) ||
  !selectIsCurrentMedicationsEmpty(state) ||
  !selectIsAllergiesIntolerancesEmpty(state) ||
  !selectIsConditionsEmpty(state);

const { actions, reducer } = globalsSlice;
export const {
  viewportSizeChanged,
  setSharingMode,
  setIsEOLBannerVisible,
  setIsCookieChoiceMade,
} = actions;
export { setupSDK, fetchDataOnAppInit, fetchValueSet, selectHasSummaryData };

export default reducer;
