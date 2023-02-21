import React from 'react';
import { useSelector } from 'react-redux';
import { BackButton } from '../../../components';
import config from '../../../config';
import { selectIsDeviceDesktop } from '../../../redux/globalsSlice';
import './Header.scss';
interface Props {
  title: string;
}

export const ProfileHeader = (props: Props) => {
  const isDesktop = useSelector(selectIsDeviceDesktop);

  return (
    <div className="ProfileHeader">
      {!isDesktop && <BackButton toRoute={config.ROUTES.profile} />}
      <h3>{props.title}</h3>
    </div>
  );
};

export default ProfileHeader;
