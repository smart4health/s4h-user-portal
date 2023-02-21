import React from 'react';
import { useTranslation } from 'react-i18next';
import TwoColumnContent from '../../../components/TwoColumnContent';
import config from '../../../config';
import useScrollToURIFragment from '../../../hooks/useScrollToURIFragement';
import ContentHeader from '../ContentHeader';
import ContentText from '../ContentText';

const translationNamespace = 'support';

interface Props {
  root: string;
  id: string;
}

const SupportContent = (props: Props) => {
  const { t } = useTranslation(translationNamespace);

  useScrollToURIFragment();

  return (
    <TwoColumnContent
      id={props.id}
      ariaLabel={t(`${props.root}.headline`)}
      header={
        <ContentHeader
          heading={t(`${props.root}.headline`)}
          returnPath={config.ROUTES.support}
        />
      }
      body={
        <ContentText root={props.root} translationNamespace={translationNamespace} />
      }
    />
  );
};
export default SupportContent;
