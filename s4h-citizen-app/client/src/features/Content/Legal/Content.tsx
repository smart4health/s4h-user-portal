import React from 'react';
import { useTranslation } from 'react-i18next';
import TwoColumnContent from '../../../components/TwoColumnContent';
import config from '../../../config';
import useScrollToURIFragment from '../../../hooks/useScrollToURIFragement';
import ContentHeader from '../ContentHeader';
import ContentText from '../ContentText';

const translationNamespace = 'legal';

interface Props {
  root: string;
  id: string;
}

const LegalContent = ({ root, id }: Props) => {
  const { t } = useTranslation(translationNamespace);

  useScrollToURIFragment();

  return (
    <TwoColumnContent
      id={id}
      ariaLabel={t(`${root}.headline`)}
      header={
        <ContentHeader
          heading={t(`${root}.headline`)}
          returnPath={config.ROUTES.legal}
        />
      }
      body={<ContentText root={root} translationNamespace={translationNamespace} />}
    />
  );
};

export default LegalContent;
