import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import ViewHeader from '../../../components/ViewHeader';
import config from '../../../config';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import { selectHandshakeConnections } from '../handshakeConnectionsSlice';
import {
  revokeAllHandshakeConnections,
  selectHasShareableData,
  setActiveView,
  ShareSteps,
} from '../reduxSlice';
import SessionListItem from './SessionListItem';
import './SessionsView.scss';

const SessionsView = () => {
  const { t } = useTranslation(['master', 'sharing']);
  const dispatch = useDispatch();
  const handshakeConnections = useSelector(selectHandshakeConnections);
  const hasShareableData = useSelector(selectHasShareableData);

  const revokeAllConnections = useCallback(async () => {
    try {
      await dispatch(revokeAllHandshakeConnections(handshakeConnections));
      if (hasShareableData) {
        dispatch(setActiveView(ShareSteps.PICKER));
      } else {
        dispatch(setActiveView(ShareSteps.EMPTY));
      }
    } catch (error) {
      console.debug(error);
    }
  }, [dispatch, handshakeConnections, hasShareableData]);

  return (
    <div className="SessionsView">
      <d4l-card classes="Sharing__card">
        <div slot="card-header">
          <ViewHeader title={t('sharing.sessions_view.title')} />
        </div>
        <div slot="card-content" className="SessionsView__card-content">
          <p className="SessionsView__card-description">
            <span>{t('sharing_sessions_description')}</span>
          </p>
          <div className="SessionsView__session-info">
            <div className="SessionsView__session-number">
              {t('active_session_with_count', {
                count: handshakeConnections.length,
              })}
            </div>
            {config.REACT_APP_ENVIRONMENT === 'development' && (
              <d4l-button
                classes="button button--text SessionsView__revoke-all-button"
                text={t('revoke_all')}
                /*
              // @ts-ignore */
                ref={webComponentWrapper({
                  handleClick: revokeAllConnections,
                })}
              />
            )}
          </div>

          <ul className="SessionsView__sessions-list">
            <d4l-divider />
            {handshakeConnections.map(connection => (
              <SessionListItem
                handShakeApplication={connection}
                key={connection.app_id}
              />
            ))}
          </ul>
        </div>
        <div slot="card-footer">
          <d4l-button
            classes="button--block button--uppercase"
            text={t('start_new_sharing_session')}
            /*
              // @ts-ignore */
            ref={webComponentWrapper({
              handleClick: () => dispatch(setActiveView(ShareSteps.PICKER)),
            })}
          />
        </div>
      </d4l-card>
    </div>
  );
};

export default SessionsView;
