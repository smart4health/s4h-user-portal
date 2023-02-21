import React from 'react';
import './TwoColumnContent.scss';

export interface TwoColumnContentProps {
  className?: string;
  header: React.ReactChild;
  body: React.ReactChild;
  id: string; // Required for accessibility
  ariaLabel: string;
}

const TwoColumnContent = (props: TwoColumnContentProps) => {
  return (
    <div
      id={props.id}
      role="tabpanel"
      tabIndex={0}
      aria-label={props.ariaLabel}
      className={`TwoColumnContent ${props.className ?? ''}`}
    >
      <div className="TwoColumnContent__header">{props.header}</div>
      <div className="TwoColumnContent__body" role="button" tabIndex={0}>
        {props.body}
      </div>
    </div>
  );
};

export default TwoColumnContent;
