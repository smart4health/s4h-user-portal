import React from 'react';
import { useTranslation } from 'react-i18next';
import TwoColumnContent from '../../../components/TwoColumnContent';
import ProfileHeader from '../Header';
import MyDataForm from '../MyDataForm';

interface Props {
  id: string;
}

const MyData = (props: Props) => {
  const { t } = useTranslation();
  return (
    <TwoColumnContent
      id={props.id}
      ariaLabel={t('your_data')}
      className="TwoColumnContent--background-color-neutral"
      header={<ProfileHeader title={t('your_data')} />}
      body={<MyDataForm />}
    />
  );
};

export default MyData;
