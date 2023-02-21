import { LanguageCode } from '../i18n';

export enum SettingKeys {
  ACCEPTS_COOKIES = 'accepts_cookies',
  ACCEPTS_TRACKING = 'accepts_tracking',
  USER_LANGUAGE = 'user_language',
  USER_REGISTERED = 'user_registered',
  LAST_SESSION_REFRESH = 'last_session_refresh',
  END_OF_LIFE_BANNER_VISIBLE = 'end_of_life_banner_visible',
  OLD_USER_LANGUAGE_KEY = 'i18nextLng',
  EID_VERIFIER = 'eidVerifier',
}

type Store = {
  [SettingKeys.ACCEPTS_COOKIES]?: boolean;
  [SettingKeys.ACCEPTS_TRACKING]?: boolean;
  [SettingKeys.USER_LANGUAGE]?: LanguageCode;
  [SettingKeys.USER_REGISTERED]?: boolean;
  [SettingKeys.LAST_SESSION_REFRESH]?: number;
  [SettingKeys.END_OF_LIFE_BANNER_VISIBLE]?: boolean;
  [SettingKeys.OLD_USER_LANGUAGE_KEY]?: string;
  [SettingKeys.EID_VERIFIER]?: string;
};

type StoreValues = Store[keyof Store];

class Settings {
  _pending: Store;
  _store: Store;
  _changeHandlers: Function[];

  constructor() {
    this._pending = {};
    this._store = {
      [SettingKeys.ACCEPTS_COOKIES]: undefined,
      [SettingKeys.ACCEPTS_TRACKING]: undefined,
      [SettingKeys.USER_LANGUAGE]: undefined,
      [SettingKeys.USER_REGISTERED]: undefined,
      [SettingKeys.LAST_SESSION_REFRESH]: undefined,
      [SettingKeys.END_OF_LIFE_BANNER_VISIBLE]: undefined,
      [SettingKeys.OLD_USER_LANGUAGE_KEY]: undefined,
      [SettingKeys.EID_VERIFIER]: undefined,
    };
    this._changeHandlers = [];
  }
  get acceptsCookies() {
    const hasAcceptedCookies =
      this.getLocalStorageValue<typeof this._store[SettingKeys.ACCEPTS_COOKIES]>(
        SettingKeys.ACCEPTS_COOKIES
      ) ?? false;
    return hasAcceptedCookies;
  }

  set acceptsCookies(isTrue: boolean) {
    this.setLocalStorageValue(SettingKeys.ACCEPTS_COOKIES, isTrue, false);
  }

  get acceptsTracking(): boolean {
    const hasAcceptedTracking =
      this.getLocalStorageValue<typeof this._store[SettingKeys.ACCEPTS_TRACKING]>(
        SettingKeys.ACCEPTS_TRACKING
      ) ?? false;
    return hasAcceptedTracking;
  }

  set acceptsTracking(isTrue: boolean) {
    this.setLocalStorageValue(SettingKeys.ACCEPTS_TRACKING, isTrue, false);
  }

  get hasMadeCookieChoice(): boolean {
    const isCookiesAccepted = this.getLocalStorageValue<
      typeof this._store[SettingKeys.ACCEPTS_COOKIES]
    >(SettingKeys.ACCEPTS_COOKIES);
    const isTrackingAccepted = this.getLocalStorageValue<
      typeof this._store[SettingKeys.ACCEPTS_TRACKING]
    >(SettingKeys.ACCEPTS_TRACKING);

    // possible values here are 'undefined' or 'false' or 'true'
    // in case its 'undefined' it means the choice is not made.
    return (
      typeof isCookiesAccepted === 'boolean' ||
      typeof isTrackingAccepted === 'boolean'
    );
  }

  get language(): LanguageCode {
    const languageCode =
      this.getLocalStorageValue<typeof this._store[SettingKeys.USER_LANGUAGE]>(
        SettingKeys.USER_LANGUAGE
      ) ||
      this.getLocalStorageValue<
        typeof this._store[SettingKeys.OLD_USER_LANGUAGE_KEY]
      >(SettingKeys.OLD_USER_LANGUAGE_KEY);
    return languageCode as LanguageCode;
    // backward compatibility
  }

  set language(language: LanguageCode) {
    this.setLocalStorageValue(SettingKeys.USER_LANGUAGE, language);
  }

  get eidVerifier(): string | undefined {
    const eidVerifier = this.getLocalStorageValue<
      typeof this._store[SettingKeys.EID_VERIFIER]
    >(SettingKeys.EID_VERIFIER);
    return eidVerifier;
  }

  set eidVerifier(value: string | undefined) {
    if (!!value) {
      this.setLocalStorageValue(SettingKeys.EID_VERIFIER, value, false);
    }
  }

  get endOfLifeBannerVisible(): boolean {
    const isBannerVisible = this.getLocalStorageValue<
      typeof this._store[SettingKeys.END_OF_LIFE_BANNER_VISIBLE]
    >(SettingKeys.END_OF_LIFE_BANNER_VISIBLE);
    // Initially the value is undefined. And later the value is set to true.
    return isBannerVisible === undefined || isBannerVisible ? true : false;
  }

  set endOfLifeBannerVisible(value: boolean) {
    this.setLocalStorageValue(SettingKeys.END_OF_LIFE_BANNER_VISIBLE, value, false);
  }

  get isRegisteredUser() {
    const isUserRegistered =
      this.getLocalStorageValue<typeof this._store[SettingKeys.USER_REGISTERED]>(
        SettingKeys.USER_REGISTERED
      ) ?? false;
    return (
      isUserRegistered || document.cookie.includes('userExists=1') // backwards-compatibility
    );
  }

  set isRegisteredUser(isTrue: boolean) {
    this.setLocalStorageValue(SettingKeys.USER_REGISTERED, isTrue);
  }

  get lastSessionRefresh(): number | undefined {
    const lastSessionRefresh = this.getLocalStorageValue<
      typeof this._store[SettingKeys.LAST_SESSION_REFRESH]
    >(SettingKeys.LAST_SESSION_REFRESH);
    return lastSessionRefresh;
  }

  set lastSessionRefresh(timestamp: number | undefined) {
    this.setLocalStorageValue(SettingKeys.LAST_SESSION_REFRESH, timestamp);
  }

  get hadRefreshedSessionToday(): boolean {
    const now = new Date().getTime();
    const then = this.lastSessionRefresh;
    const oneDayInMs = 86400000;

    return then ? now - then < oneDayInMs : false;
  }

  getLocalStorageValue<T>(key: SettingKeys): T | undefined {
    if (this._store[key] !== undefined) {
      return this._store[key] as T;
    }
    if (!('localStorage' in window)) {
      return;
    }
    const value = localStorage.getItem(key);
    let parsedValue: T;
    if (value !== null) {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        parsedValue = value as T;
      }
      this._store = {
        ...this._store,
        [key]: parsedValue,
      };
      return parsedValue;
    }
    // returns undefined if a choice is not made
    return;
  }

  setLocalStorageValue(key: SettingKeys, value: StoreValues, needsConsent = true) {
    if (needsConsent && !this.acceptsCookies) {
      this._pending = { ...this._pending, [key]: value };
      return;
    }
    this._store = {
      ...this._store,
      [key]: value,
    };

    if ('localStorage' in window) {
      const stringifiedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringifiedValue);
    }
    (this._changeHandlers || []).forEach(handler => handler(key, value));
    return value;
  }

  onChange(handler: Function) {
    this._changeHandlers = (this._changeHandlers || []).concat([handler]);
  }

  applyPending() {
    if (!this.acceptsCookies || !this._pending) {
      return;
    }
    for (let key in this._pending) {
      const pendingKeyValue = this._pending[key as SettingKeys];
      if (this._pending.hasOwnProperty(key) && !!pendingKeyValue) {
        this.setLocalStorageValue(key as SettingKeys, pendingKeyValue, false);
      }
    }

    this._pending = {};
  }
}

const settings = new Settings();
settings.onChange((key: SettingKeys) => {
  key === SettingKeys.ACCEPTS_COOKIES && settings.applyPending();
});

export default settings;
