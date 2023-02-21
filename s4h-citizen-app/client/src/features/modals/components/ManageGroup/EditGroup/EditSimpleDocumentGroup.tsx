import { GroupItem, SimpleDocumentGroup } from '@d4l/s4h-fhir-xforms';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  WORKAROUND_GET_AUTHOR,
  WORKAROUND_GET_MEDICAL_METADATA,
} from '../../../../../services';
import { dataURLtoFile } from '../../../../../utils/documentUtils';
import {
  selectFileByGroupItemId,
  selectRecordById,
  upsertDocument,
} from '../../../../DocumentsViewer/reduxSlice';
import { hideModal } from '../../../modalsSlice';
import ModalButton from '../../ModalButton';
import ModalFooter from '../../ModalFooter';
import ModalHeader from '../../ModalHeader';
import DocumentForm, { DocumentFormData } from '../DocumentForm';

export interface Props {
  group: SimpleDocumentGroup;
}

const EditGroup: React.FC<Props> = ({ group }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const record = useSelector(state => selectRecordById(state, group.id));
  const groupItem: GroupItem = group.items[0];
  const attachment = useSelector(state =>
    selectFileByGroupItemId(state, groupItem.id)
  );

  const [isLoading, setLoading] = useState(false);
  const [isFormValid, setFormValid] = useState(false);

  const hasAuthor = record ? !!WORKAROUND_GET_AUTHOR(record) : false;
  const isMedicalDocument = !!groupItem.specialty && hasAuthor;
  const medicalDocumentData = record
    ? WORKAROUND_GET_MEDICAL_METADATA(record)
    : undefined;
  const [formData, setFormData] = useState<DocumentFormData>({
    // Till some point of time, we were not saving category info
    // Hence old documents till May 2021 would need this fix to make them editable
    category: groupItem.category[0]?.codeableConcept,
    date: groupItem.date ? new Date(groupItem.date) : undefined,
    doctorFirstName: medicalDocumentData?.practitionerFirstName,
    doctorLastName: medicalDocumentData?.practitionerLastName,
    file: undefined,
    id: group.id,
    specialty: groupItem.specialty?.codeableConcept,
    title: group.title,
  });

  /*
   * We only have a base64 encoded version of the attachment in the
   * application store but need to submit the raw bytes to the sdk for
   * updating. That is because of how the sdk tries to detect file types:
   * https://github.com/d4l-data4life/js-sdk/blob/78a79fd9ac9592058058080818b4931bcbca7e93/src/lib/fileValidator.ts#L23
   * which fails if we submit a base64 encoded file instead of its raw bytes.
   * The code below uses fetch is one for converting the base64 into the
   * represented bytes.
   */
  useEffect(
    () => {
      (async function updateFile() {
        if (attachment && attachment.contentType) {
          try {
            const file = dataURLtoFile(attachment.file, attachment.title ?? '');
            setFormData({
              ...formData,
              file,
            });
          } catch (_error) {
            // No-op
          }
        }
      })();
    },
    // TODO: Unfortunately the way this code is written does not allow us
    // to add all necessary dependencies to the dependency array. That's
    // why the rule is disabled for this instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group.id]
  );

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setFormValid(false);

    try {
      const result = await dispatch(upsertDocument(formData));
      unwrapResult(result);
      dispatch(hideModal());
    } catch (error) {
      console.error('Document could not be updated', error);
      setLoading(false);
    }
  }, [dispatch, formData]);

  return (
    <>
      <ModalHeader title={t('edit_my_document')} />
      <section>
        <DocumentForm
          isEditing
          isMedicalDocument={isMedicalDocument}
          document={formData}
          handleChange={setFormData}
          setFormValid={setFormValid}
        />
      </section>
      <ModalFooter isCancelable>
        <ModalButton
          dataTest="doneBtn"
          disabled={isLoading || !isFormValid}
          isLoading={isLoading}
          onClick={handleSubmit}
          text={t('done')}
        />
      </ModalFooter>
    </>
  );
};

export default EditGroup;
