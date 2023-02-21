import React, { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { approveSharing, validatePin } from '../../../Sharing/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';

const QRReaderComponent = React.lazy(() => import('react-qr-reader'));

export interface Props {
  setPin: Dispatch<SetStateAction<string>>;
}

const QRScanner: React.FC<Props> = ({ setPin }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleScan = async (data: string | null) => {
    if (data) {
      setPin(data);
      dispatch(hideModal());
      await dispatch(validatePin(data));
      await dispatch(approveSharing());
    }
  };

  const handleError = () => {};

  return (
    <ModalWrapper className="ModalWrapper ModalWrapper--full-height">
      <React.Suspense fallback={<d4l-spinner />}>
        <ModalHeader title={t('scan_qr_code_modal')} />
        {/*
          FIXME: Strange typescript error
          @ts-ignore */}
        <QRReaderComponent onScan={handleScan} onError={handleError} />
        <ModalFooter isCancelable></ModalFooter>
      </React.Suspense>
    </ModalWrapper>
  );
};

export default QRScanner;
