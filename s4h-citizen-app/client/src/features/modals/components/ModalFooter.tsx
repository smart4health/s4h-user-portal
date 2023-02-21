import classnames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { hideModal } from '../modalsSlice';
import ModalButton from './ModalButton';

interface Props {
  isCancelable?: boolean;
  isFullWidthButton?: boolean;
  cancelableCallback?: () => void;
}

const ModalFooter: React.FC<Props> = ({
  children,
  isCancelable,
  isFullWidthButton,
  cancelableCallback,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleCancelButtonClick = () => {
    dispatch(hideModal());
    cancelableCallback && cancelableCallback();
  };

  return (
    <footer
      className={classnames('ModalFooter', {
        'ModalFooter--is-full-width': isFullWidthButton,
      })}
    >
      {isCancelable && (
        <ModalButton
          className="button--secondary"
          dataTest="cancelBtnFooter"
          onClick={handleCancelButtonClick}
          text={t('cancel')}
        />
      )}
      {children}
    </footer>
  );
};

export default ModalFooter;
