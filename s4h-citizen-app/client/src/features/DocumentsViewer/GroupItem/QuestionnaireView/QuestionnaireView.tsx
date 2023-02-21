import {
  QuestionnaireGroupItem,
  QuestionnaireResponse,
  QuestionnaireSection,
} from '@d4l/s4h-fhir-xforms';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useGetFormattedDate from '../../../../hooks/useGetFormattedDate';
import { selectIsSharingMode } from '../../../../redux/globalsSlice';
import { selectProvenanceById } from '../../../../redux/provenanceSlice';
import { DOCUMENT_VIEW_DATE_FORMAT } from '../../../../utils/dateHelper';
import { showModal } from '../../../modals/modalsSlice';
import { ReactComponent as IconClock } from '../../images/clock_with_padding.svg';
import { selectActiveGroup } from '../../reduxSlice';
import './QuestionnaireView.scss';
import ResponseItem from './ResponseItem';

export interface Props {
  groupItem: QuestionnaireGroupItem;
}

const QuestionnaireView: React.FunctionComponent<Props> = props => {
  const { groupItem } = props;

  const group = useSelector(selectActiveGroup)!;
  const getFormattedDate = useGetFormattedDate();
  const provenanceList = useSelector(state => selectProvenanceById(state, group.id));
  const isSharing = useSelector(selectIsSharingMode);
  const dispatch = useDispatch();

  return (
    <div className="QuestionnaireView">
      <d4l-card classes="QuestionnaireView__card">
        <div slot="card-header" className="QuestionnaireView__card-header">
          <div className="QuestionnaireView__date">
            {getFormattedDate(
              new Date(groupItem.date as string),
              DOCUMENT_VIEW_DATE_FORMAT
            )}
          </div>
        </div>
        <div slot="card-content">
          {groupItem.sections.map((section: QuestionnaireSection) => {
            return (
              <div
                key={section.questionnaireResponseId}
                className="QuestionnaireView__section"
              >
                <div className="QuestionnaireView__section-title-wrapper">
                  <div className="QuestionnaireView__section-title">
                    {section.title}
                  </div>
                  {!isSharing && (
                    <div
                      className={`QuestionnaireView__section-title-icon-wrapper${
                        !provenanceList || provenanceList?.provenances.length === 0
                          ? '--disabled'
                          : ''
                      }`}
                    >
                      <IconClock
                        onClick={() => {
                          dispatch(
                            showModal({ type: 'ShowProvenance', options: {} })
                          );
                        }}
                      />
                    </div>
                  )}
                </div>
                {section.responses.map(
                  (response: QuestionnaireResponse, index: number) => (
                    <ResponseItem response={response} key={index} />
                  )
                )}
              </div>
            );
          })}
        </div>
      </d4l-card>
    </div>
  );
};

export default QuestionnaireView;
