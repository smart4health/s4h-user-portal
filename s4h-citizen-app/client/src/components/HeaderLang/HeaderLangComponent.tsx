import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsEditingMedicalHistory } from '../../features/MedicalHistory/reduxSlice';
import { showModal } from '../../features/modals/modalsSlice';
import i18n, { LANGUAGES } from '../../i18n';
import webComponentWrapper from '../../utils/webComponentWrapper';
import './HeaderLangComponent.scss';

export const HeaderLangSwitch = () => {
  const [activeLanguage, setActiveLanguage] = useState(
    LANGUAGES.find(({ code }) => code === i18n.language)
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isDisabled = useSelector(selectIsEditingMedicalHistory);

  return (
    <>
      <d4l-multi-language-switcher
        data-test="languageSwitcher"
        /*
        // @ts-ignore */
        ref={webComponentWrapper(
          {
            activeLanguage,
            style: 'float: right',
            listboxPosition: 'right',
            languages: LANGUAGES,
            classes: `HeaderLangComponent${isDisabled ? ' disabled' : ''}`,
          },
          {
            changeLanguage: async ({
              detail: language,
            }: {
              detail: {
                label: string;
                code: string;
              };
            }) => {
              if (isDisabled) {
                dispatch(
                  showModal({
                    type: 'SimpleModal',
                    options: {
                      title: t(
                        'medical_history.change_language_disabled_modal.title'
                      ),
                      content: t(
                        'medical_history.change_language_disabled_modal.message'
                      ),
                    },
                  })
                );

                return;
              }

              await i18n.changeLanguage(language.code);
              setActiveLanguage(language);
            },
          }
        )}
      />
    </>
  );
};

export default HeaderLangSwitch;
