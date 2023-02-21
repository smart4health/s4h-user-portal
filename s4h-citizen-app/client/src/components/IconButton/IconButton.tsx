import { IconButton as MUIIconButton } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './IconButton.scss';

interface Props {
  label: string;
  children: React.ReactNode;
  dataTest: string;
  disabled?: boolean;
  onClick: () => void;
}

const IconButton = ({
  label,
  dataTest,
  disabled = false,
  onClick,
  children,
}: Props) => {
  const { t } = useTranslation();

  const translatedLabel = t(label);
  return (
    <div className="IconButton">
      <MUIIconButton
        aria-label={translatedLabel}
        title={translatedLabel}
        className="IconButton__action-button"
        data-test={dataTest}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </MUIIconButton>
      <span className="IconButton__action-button-label">{translatedLabel}</span>
    </div>
  );
};

export default IconButton;
