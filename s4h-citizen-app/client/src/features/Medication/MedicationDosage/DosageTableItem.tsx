import React from 'react';
import { useTranslation } from 'react-i18next';
interface DosageTableItemProps {
  title: string;
  value: string;
}

const DosageTableItem = ({ title, value }: DosageTableItemProps) => {
  const { t } = useTranslation();
  return (
    <div className="DosageTable__item">
      <div className="DosageTable__left-column">{t(title)}</div>
      <div className="DosageTable__right-column">{value}</div>
    </div>
  );
};

export default DosageTableItem;
