import React from 'react';
import { useTranslation } from 'react-i18next';
import TwoColumnContent from '../../../components/TwoColumnContent';
import AccountForm from '../AccountForm';
import ProfileHeader from '../Header';

interface Props {
  id: string;
}

const AccountContent = (props: Props) => {
  const { t } = useTranslation();
  return (
    <TwoColumnContent
      id={props.id}
      ariaLabel={t('account_details')}
      className="TwoColumnContent--background-color-neutral"
      header={<ProfileHeader title={t('account_details')} />}
      body={<AccountForm />}
    />
  );
};

export default AccountContent;
