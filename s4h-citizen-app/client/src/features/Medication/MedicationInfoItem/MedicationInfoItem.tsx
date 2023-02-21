import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import './MedicationInfoItem.scss';

interface MedicationInfoItemProps {
  title: string;
  content?: string | ReactNode;
  dataTestId?: string;
}
interface Props {
  items: MedicationInfoItemProps[];
  bordered?: boolean;
}

const MedicationInfoItem = ({ items, bordered = false }: Props) => {
  const { t } = useTranslation();

  const isDataAvailable = items.find(item => item.content) !== undefined;

  if ((isDataAvailable && items.length === 0) || !isDataAvailable) {
    return null;
  }

  return (
    <div
      className={`MedicationInfoItem ${
        bordered ? 'MedicationInfoItem__bordered' : ''
      }`}
    >
      {items.length > 0 &&
        items.map((item, index) =>
          item.content ? (
            <div
              className="MedicationInfoItem__content"
              data-testid="info-item-content"
              key={index}
            >
              <div
                className="MedicationInfoItem__content-label"
                data-testid={item.dataTestId}
              >
                {t(item.title)}
              </div>
              <div data-testid={`${item.dataTestId}-content`}>{item.content}</div>
            </div>
          ) : null
        )}
    </div>
  );
};

export default MedicationInfoItem;
