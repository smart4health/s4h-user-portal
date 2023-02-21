import config from '.';
import { client } from '../services';

export enum featureNames {
  MEDICAL_HISTORY = 'medical_history',
  SUMMARY = 'summary',
  SHARING = 'sharing',
  HEALTH_DATA = 'health_data',
  MEDICATION = 'medication',
  EID = 'eid',
  DATA_DONATION = 'data_donation',
}

export type FeatureNamesKeys = keyof typeof featureNames;
export type FeatureNamesValues = typeof featureNames[FeatureNamesKeys];
export type Flags = {
  [key in FeatureNamesValues]: boolean;
};

const flagsToPopulate: FeatureNamesValues[] = [
  featureNames.MEDICATION,
  featureNames.EID,
  featureNames.DATA_DONATION,
];

// Flags which are by default enabled
export const fixedFlags = {
  [featureNames.MEDICAL_HISTORY]: true,
  [featureNames.SHARING]: true,
  [featureNames.HEALTH_DATA]: true,
  [featureNames.SUMMARY]: true,
};

// Initially all flags are set to false
export const initialDynamicFlags = flagsToPopulate.reduce((acc, flag) => {
  acc[flag] = false;
  return acc;
}, {} as Flags);

async function getDynamicFlags(accessToken: string): Promise<Flags> {
  const populatedFlags = initialDynamicFlags;
  for (const flag of flagsToPopulate) {
    try {
      const res = await client.get(
        `${config.FEATURE_FLAGS_HOST}/api/v1/features/${flag}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 1000,
        }
      );
      if (res.data) {
        populatedFlags[flag] = res.data;
      }
    } catch (e) {
      console.log('flag error', e);
    }
  }
  return populatedFlags;
}

/**
 * Get dynamically created feature flags object that's used after successful login
 */
export async function getFlags(accessToken?: string): Promise<Flags> {
  const dynamicFlags =
    (accessToken && (await getDynamicFlags(accessToken))) || initialDynamicFlags;
  return {
    ...fixedFlags,
    [featureNames.MEDICATION]:
      config.IS_DEV || dynamicFlags[featureNames.MEDICATION],
    [featureNames.EID]: config.IS_DEV || dynamicFlags[featureNames.EID],
    [featureNames.DATA_DONATION]:
      config.IS_DEV || dynamicFlags[featureNames.DATA_DONATION],
  };
}
