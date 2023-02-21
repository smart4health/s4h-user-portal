import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  headline?: string;
  namespace?: string;
  children: React.ReactNode;
}

const AccountFormSection = ({ headline, namespace = 'master', children }: Props) => {
  const { t } = useTranslation(namespace);
  return (
    <section className="AccountFormSection">
      {headline && (
        <h3 data-testid="account-form-section-headline">{t(headline)}</h3>
      )}
      {children}
    </section>
  );
};

export default AccountFormSection;
