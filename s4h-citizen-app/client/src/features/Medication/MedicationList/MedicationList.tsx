import { MedicationStatement } from '@d4l/s4h-fhir-xforms';
import React, { createRef, KeyboardEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import TwoColumnSidebarHeader from '../../../components/TwoColumnSidebar/Header';
import { isArrowDown, isArrowUp } from '../../../utils/keyboardEvents';
import MedicationSidebarItem from '../MedicationSidebarItem';
import { selectActiveMedicationId, setActiveMedication } from '../reduxSlice';
import './MedicationList.scss';

type Props = {
  medications: MedicationStatement[];
  rightColumnId: string;
};

const MedicationList = ({ medications, rightColumnId }: Props) => {
  const activeMedicationId = useSelector(selectActiveMedicationId);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const medicationTabElements = useRef(
    medications.map(() => createRef<HTMLLIElement>())
  );
  const currentlyFocusedMedicationTabIndex = useRef(0);

  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    const elementsCount = medicationTabElements.current.length;
    const currentElementIndex = currentlyFocusedMedicationTabIndex.current;
    const elements = medicationTabElements.current;

    let newElementIndex = currentElementIndex;

    if (isArrowDown(event)) {
      currentElementIndex === elementsCount - 1
        ? (newElementIndex = 0)
        : (newElementIndex = currentElementIndex + 1);
    }

    if (isArrowUp(event)) {
      currentElementIndex === 0
        ? (newElementIndex = elementsCount - 1)
        : (newElementIndex = currentElementIndex - 1);
    }

    const elementToBeFocused = elements[newElementIndex].current;
    elementToBeFocused?.focus();

    currentlyFocusedMedicationTabIndex.current = newElementIndex;
  };

  return (
    <div className="MedicationList">
      <TwoColumnSidebarHeader
        title={t('medication.headline.title')}
        subtitle={t('medication.sidebar.subtitle')}
        hasActionButton={false}
      />
      <ul
        className="MedicationList__content"
        role="tablist"
        aria-label={t('medication.headline.title')}
      >
        {medications.map((medication, index) => (
          <MedicationSidebarItem
            rightColumnId={rightColumnId}
            medication={medication}
            onSelect={() => {
              dispatch(setActiveMedication(medication.medicationStatementId));
            }}
            onKeyDown={onKeyDown}
            key={medication.medicationStatementId}
            showAsActive={medication.medicationStatementId === activeMedicationId}
            ref={medicationTabElements.current[index]}
          />
        ))}
      </ul>
    </div>
  );
};

export default MedicationList;
