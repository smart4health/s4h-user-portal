import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TwoColumnSidebar } from '../../../components';
import { SidebarListItem } from '../../../components/TwoColumnSidebar/MenuList';
import config from '../../../config';

interface Props {
  rightColumnId: string;
}

export const SupportSidebar = (props: Props) => {
  const { t } = useTranslation(['support']);
  const sidebarItems: SidebarListItem[] = useMemo(
    () => [
      {
        title: t('user_account_sidebar.title'),
        path: config.ROUTES.support_user_account,
      },
      {
        title: t('trust_privacy_sidebar.title'),
        path: config.ROUTES.support_trust_privacy,
      },
      {
        title: t('eid_sidebar.title'),
        path: config.ROUTES.support_feature_eid,
      },
      {
        title: t('sharing_sidebar.title'),
        path: config.ROUTES.support_feature_sharing,
      },
      {
        title: t('data_ingestion_sidebar.title'),
        path: config.ROUTES.support_data_ingestion,
      },
      {
        title: t('medications_sidebar.title'),
        path: config.ROUTES.support_feature_medications,
      },
      {
        title: t('conditions_sidebar.title'),
        path: config.ROUTES.support_feature_conditions,
      },
      {
        title: t('allergies_sidebar.title'),
        path: config.ROUTES.support_feature_allergies,
      },
      { title: t('contact_sidebar.title'), path: config.ROUTES.support_contact },
    ],
    [t]
  );
  return (
    <TwoColumnSidebar
      rootTitle={t('sidebar_heading.title')}
      items={sidebarItems}
      hasActionButton={false}
      rightColumnId={props.rightColumnId}
    />
  );
};

export default SupportSidebar;
