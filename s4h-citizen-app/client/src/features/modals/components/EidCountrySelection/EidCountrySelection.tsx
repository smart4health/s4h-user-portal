import { Components } from '@d4l/web-components-library/dist/loader';
import { unwrapResult } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
// @ts-ignore
import { hash } from '@d4l/js-crypto';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import config from '../../../../config';
import { usePolling } from '../../../../hooks';
import { selectPlatform } from '../../../../redux/globalsSlice';
import { base64ToHex } from '../../../../utils/base64ToHex';
import settings from '../../../../utils/settings';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import {
  CountryListItem,
  getEidEnabledCountries,
} from '../../../Profile/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';
import './EidCountrySelection.scss';

export interface Props {}

type SupportedEIDCountryItem = {
  id: string;
  image?: ReactElement;
  name: string;
};

const EidCountrySelection: React.FC = () => {
  const { t } = useTranslation('profile');
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [countryList, setCountryList] = useState<SupportedEIDCountryItem[]>([]);
  const [isAusweisAppEnabled, setIsAusweisAppEnabled] = useState(true);
  const [startPolling, stopPolling] = usePolling();
  const [isDynamicCountryListFetched, setIsDynamicCountryListFetched] =
    useState(false);
  const dispatch = useDispatch();
  const platform = useSelector(selectPlatform);

  const getEidUrl = async () => {
    const protocol =
      platform === 'ios' || platform === 'android' ? 'eid://' : 'http://';
    const verifier = uuid();
    settings.eidVerifier = verifier;
    const challengeBase64 = await hash(verifier, 'SHA-256');
    const challengeHex = base64ToHex(challengeBase64);

    if (selectedCountry === 'DE') {
      const tcTokenUrl = `${config.TCTOKEN_URL}?usecase=cardadd&challenge=${challengeHex}`;
      const url = `${protocol}127.0.0.1:24727/eID-Client?tcTokenURL=${encodeURIComponent(
        tcTokenUrl
      )}`;
      return url;
    } else {
      return `${config.TCTOKEN_URL_EIDAS}?usecase=cardadd&challenge=${challengeHex}&country=${selectedCountry}`;
    }
  };

  useEffect(
    function onMount() {
      const supportedEIDCountries: SupportedEIDCountryItem[] = [
        {
          id: 'BE',
          image: <d4l-icon icon-name="flag-be" />,
          name: t('eid_country_list_be.radio_button'),
        },
        // {
        //   id: 'HR',
        //   image: <d4l-icon icon-name="flag-hr" />,
        //   name: t('eid_country_list_hr.radio_button'),
        // },
        {
          id: 'CZ',
          image: <d4l-icon icon-name="flag-cz" />,
          name: t('eid_country_list_cz.radio_button'),
        },
        {
          id: 'DE',
          image: <d4l-icon icon-name="flag-de" />,
          name: t('eid_country_list_de.radio_button'),
        },
        // {
        //   id: 'EE',
        //   image: <d4l-icon icon-name="flag-ee" />,
        //   name: t('eid_country_list_ee.radio_button'),
        // },
        // {
        //   id: 'IT',
        //   image: <d4l-icon icon-name="flag-it" />,
        //   name: t('eid_country_list_it.radio_button'),
        // },
        // {
        //   id: 'LV',
        //   image: <d4l-icon icon-name="flag-lv" />,
        //   name: t('eid_country_list_lv.radio_button'),
        // },
        {
          id: 'LU',
          image: <d4l-icon icon-name="flag-lu" />,
          name: t('eid_country_list_lu.radio_button'),
        },
        {
          id: 'NL',
          image: <d4l-icon icon-name="flag-nl" />,
          name: t('eid_country_list_nl.radio_button'),
        },
        {
          id: 'PT',
          image: <d4l-icon icon-name="flag-pt" />,
          name: t('eid_country_list_pt.radio_button'),
        },
        // {
        //   id: 'SK',
        //   image: <d4l-icon icon-name="flag-sk" />,
        //   name: t('eid_country_list_sk.radio_button'),
        // },
        {
          id: 'ES',
          image: <d4l-icon icon-name="flag-es" />,
          name: t('eid_country_list_es.radio_button'),
        },
      ].sort((c1, c2) => {
        if (c1.name < c2.name) return -1;
        if (c1.name > c2.name) return 1;
        return 0;
      });
      supportedEIDCountries.push({
        id: 'test',
        name: t('eid_country_list_test.radio_button'),
      });

      (async () => {
        try {
          const response: CountryListItem[] = unwrapResult(
            await dispatch(getEidEnabledCountries())
          );
          const extendedCountryList = [
            ...response,
            {
              countryCode: 'DE',
              country: 'Germany',
            },
          ];
          const extendedCountryCodes = extendedCountryList.map(
            country => country.countryCode
          );
          const enabledCountryList = supportedEIDCountries.filter(country =>
            extendedCountryCodes.includes(country.id)
          );
          setCountryList(enabledCountryList);
        } catch (error) {
          console.error(error);
        }

        setIsDynamicCountryListFetched(true);
      })();
    },
    [dispatch, t]
  );

  useEffect(() => {
    const pollAusweisApp = (): Promise<AxiosResponse> =>
      axios.get('http://127.0.0.1:24727/eID-Client?Status');

    // Start polling if on desktop
    if (platform !== 'android' && platform !== 'ios') {
      // Initialize Germany radio button as disabled, until polling works
      setIsAusweisAppEnabled(false);

      startPolling({
        // @ts-ignore
        fn: () => pollAusweisApp(),
        onSuccess: () => setIsAusweisAppEnabled(true),
        // We don't need to do anything onError
      });
    }

    // Clean-up for the timer if it's still running
    return () => {
      stopPolling();
    };
  }, [platform, startPolling, stopPolling]);

  const getName = (countryName: string, code: string) => {
    if (platform === 'android' || platform === 'ios') return countryName;

    // If platform is desktop add Ausweisapp warning for Germany
    return code === 'DE'
      ? `${countryName} ${t('eid_ausweisapp_warning.label')}`
      : countryName;
  };

  return (
    <ModalWrapper className="ModalWrapper ModalWrapper--full-height">
      <div className="EidCountrySelection">
        <ModalHeader title={t('eid_country_selection.headline')} />
        <section>
          {isDynamicCountryListFetched ? (
            countryList.map(country => {
              return (
                <d4l-radio
                  title={t(
                    `eid_country_list_${country.id.toLowerCase()}.radio_button`
                  )}
                  // @ts-ignore
                  key={country.name}
                  classes="EidCountrySelection__radio-button"
                  radio-id={country.id}
                  name="countrySelection"
                  data-test="countrySelectionRadio"
                  data-test-context={country.id}
                  checked={selectedCountry === country.id}
                  value={country.id}
                  disabled={country.id === 'DE' && !isAusweisAppEnabled}
                  required
                  // @ts-ignore
                  ref={webComponentWrapper<Components.D4lRadio>({
                    handleChange: () => {
                      setSelectedCountry(country.id);
                    },
                  })}
                  // @ts-ignore
                >
                  <div
                    className="EidCountrySelection__country-selection-item"
                    slot="radio-label"
                  >
                    {country.image && (
                      <div className="EidCountrySelection__country-selection-item-flag">
                        {country.image}
                      </div>
                    )}
                    <strong
                      className="EidCountrySelection__country-selection-item-name"
                      dangerouslySetInnerHTML={{
                        __html: getName(country.name, country.id),
                      }}
                    ></strong>
                  </div>
                </d4l-radio>
              );
            })
          ) : (
            <div className="EidCountrySelection__loader">
              <d4l-spinner />
            </div>
          )}
        </section>
        <ModalFooter isCancelable>
          <ModalButton
            dataTest="doneBtn"
            disabled={!selectedCountry}
            onClick={async () => {
              const eidUrl = await getEidUrl();
              window.location.assign(eidUrl);
              dispatch(hideModal());
            }}
            text={t('eid_country_selection_next.button')}
          />
        </ModalFooter>
      </div>
    </ModalWrapper>
  );
};

export default EidCountrySelection;
