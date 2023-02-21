import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import useGetFormattedDate from '../../../../hooks/useGetFormattedDate';
import { IApplication } from '../../../../types';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../../../utils/analytics';
import { DE_DISPLAY_DATE_FORMAT } from '../../../../utils/dateHelper';
import webComponentWrapper from '../../../../utils/webComponentWrapper';
import { showModal } from '../../../modals/modalsSlice';
import './SessionsListItem.scss';

interface Props {
  handShakeApplication: IApplication;
}

const SessionListItem: React.FC<Props> = ({ handShakeApplication }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const getFormattedDate = useGetFormattedDate();
  return (
    <>
      <li className="SessionsListItem">
        <div className="SessionsListItem__title">
          {getFormattedDate(
            new Date(handShakeApplication.activated),
            DE_DISPLAY_DATE_FORMAT
          )}
        </div>
        <d4l-button
          classes="button--secondary button--uppercase"
          text={t('revoke')}
          /*
          // @ts-ignore */
          ref={webComponentWrapper({
            handleClick: () => {
              pushTrackingEvent(TRACKING_EVENTS.REVOKE_START);
              dispatch(
                showModal({
                  type: 'RevokeSession',
                  options: { application: handShakeApplication },
                })
              );
            },
          })}
        />
      </li>
      <d4l-divider />
    </>
  );
};

export default SessionListItem;
