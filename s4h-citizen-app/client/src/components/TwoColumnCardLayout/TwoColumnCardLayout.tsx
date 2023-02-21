import classnames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsDeviceDesktop } from '../../redux/globalsSlice';
import './TwoColumnCardLayout.scss';
interface Props {
  leftColumn: React.ReactChild;
  rightColumn: React.ReactChild;
  isRightColumnVisibleOnMobile: boolean;
}
const TwoColumnCardLayout = ({
  leftColumn,
  rightColumn,
  isRightColumnVisibleOnMobile,
}: Props) => {
  const isDesktop = useSelector(selectIsDeviceDesktop);

  const leftColumnClasses = classnames('TwoColumnCardLayout__left-column', {
    'TwoColumnCardLayout--column-hidden': !isDesktop && isRightColumnVisibleOnMobile,
  });
  const rightColumnClasses = classnames('TwoColumnCardLayout__right-column', {
    'TwoColumnCardLayout--column-hidden':
      !isDesktop && !isRightColumnVisibleOnMobile,
  });
  return (
    <div className="TwoColumnCardLayout">
      <d4l-card classes="TwoColumnCardLayout__card">
        <div slot="card-content" className="TwoColumnCardLayout__card-content">
          <div className={leftColumnClasses}>{leftColumn}</div>
          <div className={rightColumnClasses}>{rightColumn}</div>
        </div>
      </d4l-card>
    </div>
  );
};

export default TwoColumnCardLayout;
