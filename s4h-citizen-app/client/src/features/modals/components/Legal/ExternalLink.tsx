import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import ModalWrapper from '../../ModalWrapper';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';

export interface Props {
  targetUrl: string;
}

const ExternalLink: React.FC<Props> = ({ targetUrl }) => {
  const { t } = useTranslation();

  const handleClick = useCallback(
    event => {
      event.preventDefault();
      window.open(targetUrl, '_blank');
      window.focus();
    },
    [targetUrl]
  );

  return (
    <ModalWrapper>
      <>
        <ModalHeader title={t('external_link_headline')} />
        <section className={'ExternalLink__content'}>
          {t('external_link_paragraph')}
          <p>
            <a
              href={targetUrl}
              className="modal-external-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {targetUrl}
            </a>
          </p>
        </section>
        <ModalFooter isCancelable>
          <d4l-button
            classes="button--block button--uppercase"
            /*
          // @ts-ignore */
            ref={webComponentWrapper({
              handleClick: handleClick,
            })}
            data-test="goBtn"
            text={t('external_link_go')}
          />
        </ModalFooter>
      </>
    </ModalWrapper>
  );
};

export default ExternalLink;
