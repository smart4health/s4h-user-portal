import {
  DecimalResponse,
  IntegerResponse,
  QuestionnaireResponse,
  ScaleResponse,
  TextResponse,
} from '@d4l/s4h-fhir-xforms';
import { Components } from '@d4l/web-components-library';
import classnames from 'classnames';
import React from 'react';
import webComponentWrapper from '../../../../utils/webComponentWrapper';

type Props = {
  response: QuestionnaireResponse;
};

const ScaleResponseItem = (props: ScaleResponse) => {
  return (
    <d4l-scale-bar
      // @ts-ignore TS-FIXME
      ref={webComponentWrapper<Components.D4lScaleBar>({
        getValueDescription: (value: number, max: number) => `${value} of ${max}`,
        max: props.scaleMaxValue,
        minLabel: props.scaleMinValueLabel,
        maxLabel: props.scaleMaxValueLabel,
        value: props.scaleValue,
      })}
    />
  );
};

const TextResponseItem = ({ responseText }: TextResponse) => {
  return <div>{responseText.join(', ')}</div>;
};

const NumberResponseItem = (props: IntegerResponse | DecimalResponse) => {
  return <div>{props.responseNumber}</div>;
};

const ResponseItem: React.FC<Props> = ({ response }) => {
  const questionClasses = classnames('QuestionnaireView__response-title', {
    'QuestionnaireView__response-title--text': response.type === 'Text',
  });

  return (
    <>
      <div className={questionClasses}>{response.questionTitle}</div>
      <div className="QuestionnaireView__response-answer">
        {response.type === 'Scale' && <ScaleResponseItem {...response} />}
        {response.type === 'Text' && <TextResponseItem {...response} />}
        {(response.type === 'Integer' || response.type === 'Decimal') && (
          <NumberResponseItem {...response} />
        )}
      </div>
    </>
  );
};

export default ResponseItem;
