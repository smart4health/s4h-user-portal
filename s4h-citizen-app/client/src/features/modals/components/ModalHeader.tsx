import classnames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ReactComponent as IconClose } from '../images/close.svg';
import { hideModal } from '../modalsSlice';

interface Props {
  title?: string;
  isSmallHeading?: boolean;
}
const ModalHeader: React.FC<Props> = props => {
  const { title, isSmallHeading } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <header
      className={classnames('ModalHeader', {
        'ModalHeader--is-small-heading': isSmallHeading,
      })}
    >
      <div className="Modal__title-wrapper">
        <button
          type="button"
          className="Button--reset"
          onClick={() => dispatch(hideModal())}
          aria-label={t('document.modal_close_button.fieldlabel')}
          data-test="cancelBtnHeader"
        >
          <IconClose />
        </button>
        {title && <h3>{title}</h3>}
      </div>
    </header>
  );
};

export default ModalHeader;
