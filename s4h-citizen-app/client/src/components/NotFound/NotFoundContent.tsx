import React from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { EmptyState, TitleCaption } from '..';
import config from '../../config';
import webComponentWrapper from '../../utils/webComponentWrapper';
import { emptyStateButtonClasses } from '../EmptyState/EmptyState';
import { ReactComponent as NotFoundImage } from './images/404.svg';

interface Props extends RouteComponentProps {}

const PageNotFoundComponent = (props: Props) => {
  const { t } = useTranslation('general_reuse');
  const { history } = props;
  const { ROUTES } = config;

  return (
    <EmptyState
      header={
        <TitleCaption
          title={t('page_not_found.title')}
          subtitle={t('page_not_found.subtitle')}
        />
      }
      content={<NotFoundImage />}
      footer={
        <d4l-button
          classes={emptyStateButtonClasses}
          text={t('page_not_found.button')}
          /*
            // @ts-ignore */
          ref={webComponentWrapper({
            handleClick: () => {
              history.push({
                pathname: ROUTES.app_home,
              });
            },
          })}
          data-test="RedirectBtn"
        />
      }
    />
  );
};

export default withRouter(PageNotFoundComponent);
