import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { upsertDocument } from '../../../../DocumentsViewer/reduxSlice';
import { hideModal } from '../../../modalsSlice';
import ModalWrapper from '../../../ModalWrapper';
import ModalButton from '../../ModalButton';
import ModalFooter from '../../ModalFooter';
import ModalHeader from '../../ModalHeader';
import DocumentForm, {
  DocumentFormData,
  isDocumentDataValid,
} from '../DocumentForm';
import './AddGroup.scss';

export interface AddGroupData {
  document: DocumentFormData;
}

export interface StepProps {
  data: AddGroupData;
  handleChange: (formData: Partial<AddGroupData>) => void;
  handleSubmit: () => Promise<void>;
}

export interface Props {}

const AddGroup: React.FC<Props> = _props => {
  const { t } = useTranslation();
  const [data, setData] = useState({ document: {} });
  const [isFormValid, setFormValid] = useState(isDocumentDataValid(data.document));
  const [isLoading, setIsLoading] = useState(false);

  function setDocumentValue(document: DocumentFormData) {
    handleChange({ ...data, document: { ...data.document, ...document } });
  }

  const dispatch = useDispatch();

  function handleChange(newData: Partial<AddGroupData>) {
    setData({ ...data, ...newData });
  }

  const handleSubmit = useCallback(async () => {
    try {
      const result = await dispatch(upsertDocument(data.document));
      unwrapResult(result);
      dispatch(hideModal());
    } catch (error) {
      console.log(error);
    }
  }, [dispatch, data]);

  return (
    <ModalWrapper className="ModalWrapper ModalWrapper--full-height">
      <>
        <ModalHeader title={t('add_new_document')} />
        <section>
          <DocumentForm
            document={data.document}
            handleChange={setDocumentValue}
            setFormValid={setFormValid}
          />
        </section>
        <ModalFooter isCancelable>
          <ModalButton
            dataTest="doneBtn"
            disabled={!isFormValid}
            isLoading={isLoading}
            onClick={() => {
              setIsLoading(true);
              handleSubmit().catch(() => {
                setIsLoading(false);
              });
            }}
            text={t('done')}
          />
        </ModalFooter>
      </>
    </ModalWrapper>
  );
};

export default AddGroup;
