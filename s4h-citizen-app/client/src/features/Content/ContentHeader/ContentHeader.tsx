import React from 'react';
import { useSelector } from 'react-redux';
import { BackButton } from '../../../components';
import { selectIsDeviceDesktop } from '../../../redux/globalsSlice';
import './ContentHeader.scss';

type ContentHeaderProps = {
  returnPath: string;
  heading: string;
};

export const ContentHeader = (props: ContentHeaderProps) => {
  const isDesktop = useSelector(selectIsDeviceDesktop);
  return (
    <div className="ContentHeader">
      {!isDesktop && <BackButton toRoute={props.returnPath} />}
      <h2>{props.heading}</h2>
    </div>
  );
};

export default ContentHeader;
