/* eslint-disable react/require-default-props */
import classnames from 'classnames';
import React from 'react';
import './CardContent.scss';

export interface Props {
  isLoading?: boolean;
  icon?: React.ReactElement;
  label: string;
  latestItemTitle?: string;
  isActive: boolean;
}

const CardContent = (props: Props) => {
  const { icon, label, latestItemTitle, isActive, isLoading } = props;
  return isLoading ? (
    <d4l-spinner />
  ) : (
    <div
      className={classnames('DashboardCardContent', {
        'DashboardCardContent--active': isActive,
      })}
      data-test="dashboardCardContent"
    >
      <figure className="DashboardCardContent__container">
        {icon && <div className="DashboardCardContent__icon">{icon}</div>}
        <figcaption className="DashboardCardContent__caption">
          <div className="DashboardCardContent__label">{label}</div>
          {latestItemTitle && (
            <div className="DashboardCardContent__item">{latestItemTitle}</div>
          )}
        </figcaption>
      </figure>
    </div>
  );
};

export default CardContent;
