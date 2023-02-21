import { Provenance } from '@d4l/s4h-fhir-xforms';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectProvenanceById } from '../../../../redux/provenanceSlice';
import { selectActiveGroup } from '../../../DocumentsViewer/reduxSlice';
import { hideModal } from '../../modalsSlice';
import ModalWrapper from '../../ModalWrapper';
import ModalButton from '../ModalButton';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';
import ProvenanceItem from './ProvenanceItem';
import './ShowProvenance.scss';

export interface Props {}

const ShowProvenance: React.FC<Props> = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const group = useSelector(selectActiveGroup)!;
  const provenanceList = useSelector(state => selectProvenanceById(state, group.id));

  const handleCancelButtonClick = () => {
    dispatch(hideModal());
  };

  return (
    <ModalWrapper className="ModalWrapper ModalWrapper--full-height">
      <>
        <ModalHeader title={t('provenance.modal.title')} />
        <section className="Provenance">
          <p className="Provenance__infotext">
            {t('provenance.description.infotext')}
          </p>
          {provenanceList &&
            provenanceList.provenances.map((provenanceItem: Provenance) => (
              <ProvenanceItem data={provenanceItem} key={provenanceItem.id} />
            ))}
          <d4l-notification-bar
            text={t('provenance.signature_notification.message')}
            classes="Provenance__notification-bar"
          />
        </section>
        <ModalFooter>
          <ModalButton
            className="button--primary"
            dataTest="cancelBtnFooter"
            onClick={handleCancelButtonClick}
            text={t('close')}
          />
        </ModalFooter>
      </>
    </ModalWrapper>
  );
};

export default ShowProvenance;
