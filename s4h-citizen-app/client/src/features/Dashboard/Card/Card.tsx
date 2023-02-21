/* eslint-disable react/require-default-props */
import React from 'react';
import webComponentWrapper from '../../../utils/webComponentWrapper';
import './Card.scss';

interface Props {
  title: string;
  subTitle: string;
  children: React.ReactChild;
  primaryButton?: CardButton;
  secondaryButton?: CardButton;
  noCardActionText?: string;
}

type CardButton = {
  text: string;
  dataTest?: string;
  action: () => void;
};

const DashboardCard = (props: Props) => {
  const noCardActions =
    !(props.primaryButton || props.secondaryButton) && props.noCardActionText;
  return (
    <d4l-card classes="DashboardCard">
      <div slot="card-header" className="DashboardCard__header">
        <div className="DashboardCard__title">{props.title}</div>
        <div className="DashboardCard__sub-title">{props.subTitle}</div>
      </div>
      <div slot="card-content" className="DashboardCard__content">
        {props.children}
      </div>
      <div slot="card-footer">
        <div className="DashboardCard__footer">
          {props.secondaryButton && (
            <d4l-button
              classes="button--secondary button--block 
                button--uppercase button--large"
              text={props.secondaryButton.text}
              // @ts-ignore
              ref={webComponentWrapper({
                handleClick: props.secondaryButton.action,
              })}
              data-test={props.secondaryButton.dataTest}
              data-testid={props.secondaryButton.dataTest}
            />
          )}
          {props.primaryButton && (
            <d4l-button
              classes="button--block 
                button--uppercase button--large"
              text={props.primaryButton.text}
              // @ts-ignore
              ref={webComponentWrapper({
                handleClick: props.primaryButton.action,
              })}
              data-test={props.primaryButton.dataTest}
              data-testid={props.primaryButton.dataTest}
            />
          )}
          {noCardActions && (
            <div className="DashboardCard__no-card-actions-text">
              {props.noCardActionText}
            </div>
          )}
        </div>
      </div>
    </d4l-card>
  );
};

export default DashboardCard;
