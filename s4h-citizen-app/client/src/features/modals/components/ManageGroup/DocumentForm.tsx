import { makeReadymadeValueSet, ValueSetLookupCoding } from '@d4l/s4h-fhir-xforms';
import { FHIR_CodeableConcept } from '@d4l/s4h-fhir-xforms/dist/typings/fhir-resources/types';
import { Components } from '@d4l/web-components-library/dist/loader';
import axios from 'axios';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import DatePicker from '../../../../components/DatePicker';
import FileInput from '../../../../components/FileInput';
import { LanguageCode } from '../../../../i18n';
import { DOCUMENT_VIEW_DATE_FORMAT } from '../../../../utils/dateHelper';
import webComponentWrapper from '../../../../utils/webComponentWrapper';

export interface DocumentFormData {
  category?: FHIR_CodeableConcept;
  date?: Date;
  doctorFirstName?: string;
  doctorLastName?: string;
  file?: File;
  id?: string;
  specialty?: FHIR_CodeableConcept;
  title?: string;
}

export interface Props {
  isEditing?: boolean;
  isMedicalDocument?: boolean;
  document: DocumentFormData;
  handleChange: (formData: DocumentFormData) => void;
  setFormValid: (isValid: boolean) => void;
}

export function isDocumentDataValid(documentData: DocumentFormData): boolean {
  const isHealthDocumentValid =
    (documentData.title?.length ?? 0) > 0 &&
    documentData.date !== undefined &&
    documentData.file !== undefined;

  const isMedicalDocument =
    !!documentData.specialty ||
    !!documentData.doctorFirstName ||
    !!documentData.doctorLastName;

  const isMedicalDocumentValid =
    !!documentData.specialty &&
    !!documentData.doctorFirstName &&
    !!documentData.doctorLastName;

  return isMedicalDocument
    ? isHealthDocumentValid && isMedicalDocumentValid
    : isHealthDocumentValid;
}

const DocumentForm: React.FC<Props> = ({
  isEditing,
  document,
  handleChange,
  setFormValid,
}) => {
  const { t, i18n } = useTranslation();
  const { t: tdocuments } = useTranslation('documents');
  const { t: tcs } = useTranslation('specialtiesAndCategories');
  const [categories, setCategories] = useState<ValueSetLookupCoding[]>([]);
  const [specialties, setSpecialties] = useState<ValueSetLookupCoding[]>([]);
  const [fileInputError, setFileInputError] = useState<string | null>();

  const fetchCategoryValues = async (language: string) => {
    const categoryValueSets = await makeReadymadeValueSet({
      valueSetUrl: 'http://fhir.smart4health.eu/ValueSet/s4h-user-doc-types',
      version: '0.1.0',
      language,
      axios,
    });
    const categoryValueSet = await categoryValueSets.lookup({});

    return categoryValueSet;
  };

  const fetchSpecialtyValueSets = async (language: string) => {
    const specialtyValueSets = await makeReadymadeValueSet({
      valueSetUrl: 'http://hl7.org/fhir/ValueSet/c80-practice-codes',
      version: '4.0.1',
      language,
      axios,
    });
    const specialtyValueSet = await specialtyValueSets.lookup({});

    return specialtyValueSet;
  };

  useEffect(() => {
    async function getCodes() {
      const alphabeticallyAfterTranslation = (
        valueA: ValueSetLookupCoding,
        valueB: ValueSetLookupCoding
      ) => {
        const valueATranslated = tcs(valueA.display);
        const valueBTranslated = tcs(valueB.display);

        if (valueATranslated > valueBTranslated) {
          return 1;
        }
        if (valueATranslated < valueBTranslated) {
          return -1;
        }

        return 0;
      };

      try {
        let categoryValueSet = await fetchCategoryValues(i18n.language);
        if (!categoryValueSet.length) {
          categoryValueSet = await fetchCategoryValues(LanguageCode.en);
        }

        categoryValueSet.sort(alphabeticallyAfterTranslation);

        setCategories(categoryValueSet);

        let specialtyValueSet = await fetchSpecialtyValueSets(i18n.language);

        if (!specialtyValueSet.length) {
          specialtyValueSet = await fetchSpecialtyValueSets(LanguageCode.en);
        }

        specialtyValueSet.sort(alphabeticallyAfterTranslation);

        setSpecialties(specialtyValueSet);
      } catch (_error) {
        setCategories([]);
      }
    }

    getCodes();
  }, [i18n.language, setCategories, tcs]);

  function setDocumentValue<K extends keyof DocumentFormData>(
    key: K,
    value: DocumentFormData[K]
  ) {
    const newDocument: DocumentFormData = {
      ...document,
      [key]: value,
    };
    setFormValid(isDocumentDataValid(newDocument));
    handleChange(newDocument);
  }

  function setDocumentFile(files: File[]) {
    const file = files[0];

    const newDocument: DocumentFormData = {
      ...document,
      file,
    };

    setFormValid(isDocumentDataValid(newDocument));
    handleChange(newDocument);
  }

  if (categories.length === 0 || specialties.length === 0) {
    return null;
  }

  const selectedCategory = categories.find(c =>
    document.category?.coding?.map(coding => coding.display).includes(c.display)
  );

  const selectedSpecialty = specialties.find(s =>
    document.specialty?.coding?.map(coding => coding.display).includes(s.display)
  );

  const hasIntersection = (
    valueSetCoding: ValueSetLookupCoding,
    codeableConcept?: FHIR_CodeableConcept
  ): boolean => {
    if (!codeableConcept || !codeableConcept.coding) {
      return false;
    }

    const hasIntersection = codeableConcept.coding.some(
      coding =>
        coding.system === valueSetCoding.system &&
        coding.code === valueSetCoding.code
    );

    return hasIntersection;
  };

  const datePickerInputProps = {
    required: true,
  };

  return (
    <form className="Form Form--2Col" data-test="documentUploadForm">
      <div className="Form__field Form__field--full-width">
        <d4l-input
          data-test="documentFieldInput"
          type="text"
          label={t('document_title')}
          value={document.title}
          // @ts-ignore TYPE-FIXME
          ref={webComponentWrapper<Components.D4lInput>({
            // @ts-ignore TYPE-FIXME
            handleInput: (event: ChangeEvent<HTMLInputElement>) => {
              setDocumentValue('title', event.target?.value);
            },
          })}
        >
          <span slot="input-required"> *</span>
        </d4l-input>
      </div>

      <div className="Form__field Form__field--full-width">
        <DatePicker
          name="date"
          dateFormat={DOCUMENT_VIEW_DATE_FORMAT}
          value={document.date}
          onDayChange={(date: Date) => {
            setDocumentValue('date', date);
          }}
          inputProps={datePickerInputProps}
        />
      </div>

      <div className="Form__field Form__field--full-width">
        <d4l-select
          defaultValue={selectedCategory?.display}
          label={t('document_category')}
          // @ts-ignore TS-FIXME
          ref={webComponentWrapper<Components.D4lSelect>({
            // @ts-ignore TS-FIXME
            handleChange: (event: ChangeEvent<HTMLSelectElement>) => {
              const category = categories.find(
                c => c.display === event.target?.value
              );

              setDocumentValue(
                'category',
                category ? { coding: [category] } : undefined
              );
            },
          })}
          required
          selectedValue={selectedCategory?.display}
        >
          <option
            slot="select-option"
            value={undefined}
            selected={document.category === undefined}
          />

          {categories.map((category, index) => (
            <option
              key={index}
              selected={hasIntersection(category, document.category)}
              slot="select-option"
              value={category.display}
            >
              {tcs(category.display)}
            </option>
          ))}
        </d4l-select>
      </div>

      {!isEditing && (
        <div className="Form__field Form__field--full-width">
          <label className="Form__field-label">{t('file')} *</label>
          <FileInput
            acceptedFiles={document.file ? [document.file] : []}
            onDropFiles={files => {
              setFileInputError(null);
              setDocumentFile(files);
            }}
            onDropRejected={(fileRejections: FileRejection[]) => {
              const tooLargeFiles = fileRejections.find(fileRejectionItem =>
                fileRejectionItem.errors.find(err => err.code === 'file-too-large')
              );

              if (tooLargeFiles) {
                setFileInputError(tdocuments('max_file_size_error.infotext'));
              }
            }}
          />
        </div>
      )}
      {fileInputError && <div className="Form__field-error">{fileInputError}</div>}
      <h4 className="Form__field-sub-headline">
        {tdocuments('add_modal_speciality_headline.title')}
      </h4>
      <p>{tdocuments('add_modal_speciality_section.infotext')}</p>
      <div className="Form__field">
        <d4l-input
          type="text"
          label={tdocuments('add_modal_speciality_firstName.title')}
          value={document.doctorFirstName}
          // @ts-ignore TS-FIXME
          ref={webComponentWrapper<Components.D4lInput>({
            // @ts-ignore TS-FIXME
            handleInput: (event: ChangeEvent<HTMLInputElement>) => {
              setDocumentValue('doctorFirstName', event.target?.value);
            },
          })}
        ></d4l-input>
      </div>

      <div className="Form__field">
        <d4l-input
          type="text"
          label={tdocuments('add_modal_speciality_lastName.title')}
          value={document.doctorLastName}
          // @ts-ignore TS-FIXME
          ref={webComponentWrapper<Components.D4lInput>({
            // @ts-ignore TS-FIXME
            handleInput: (event: ChangeEvent<HTMLInputElement>) => {
              setDocumentValue('doctorLastName', event.target?.value);
            },
          })}
        ></d4l-input>
      </div>

      <div className="Form__field Form__field--full-width">
        <d4l-select
          defaultValue={selectedSpecialty?.display}
          label={tdocuments('add_modal_speciality.title')}
          // @ts-ignore TS-FIXME
          ref={webComponentWrapper<Components.D4lSelect>({
            // @ts-ignore TS-FIXME
            handleChange: (event: ChangeEvent<HTMLSelectElement>) => {
              const specialty = specialties.find(
                s => s.display === event.target?.value
              );

              setDocumentValue(
                'specialty',
                specialty ? { coding: [specialty] } : undefined
              );
            },
          })}
          required
          selectedValue={selectedSpecialty?.display}
        >
          <option
            slot="select-option"
            value={undefined}
            selected={document.specialty === undefined}
          />

          {specialties.map((specialty, index) => (
            <option
              key={index}
              selected={hasIntersection(specialty, document.specialty)}
              slot="select-option"
              value={specialty.display}
            >
              {tcs(specialty.display!)}
            </option>
          ))}
        </d4l-select>
      </div>
    </form>
  );
};

export default DocumentForm;
