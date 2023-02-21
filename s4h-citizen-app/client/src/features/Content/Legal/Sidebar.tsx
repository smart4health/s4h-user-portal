import React from 'react';
import { useTranslation } from 'react-i18next';
import { TwoColumnSidebar } from '../../../components';
import { SidebarListItem } from '../../../components/TwoColumnSidebar/MenuList';
import config from '../../../config';

interface Props {
  rightColumnId: string;
}
const LegalSidebar = (props: Props) => {
  const { t } = useTranslation(['master', 'legal']);
  const sidebarItems: SidebarListItem[] = [
    { title: t('consent'), path: config.ROUTES.legal_consent },
    { title: t('terms_of_service'), path: config.ROUTES.legal_terms },
    { title: t('data_privacy'), path: config.ROUTES.legal_data },
    { title: t('imprint'), path: config.ROUTES.legal_imprint },
    { title: t('features'), path: config.ROUTES.legal_features },
    { title: t('end_of_life'), path: config.ROUTES.legal_eol },
    {
      title: t('licensing_and_copyright'),
      path: config.ROUTES.legal_licensing,
    },
  ];
  return (
    <TwoColumnSidebar
      rootTitle={t('legal')}
      items={sidebarItems}
      hasActionButton={false}
      rightColumnId={props.rightColumnId}
    />
  );
};

export default LegalSidebar;
