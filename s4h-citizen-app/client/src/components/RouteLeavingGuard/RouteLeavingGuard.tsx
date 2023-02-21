import { Location } from 'history';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { showModal } from '../../features/modals/modalsSlice';

type Props = {
  isShowingPrompt: boolean;
};

const RouteLeavingGuard: React.FC<Props> = props => {
  const dispatch = useDispatch();

  const handleBlockedNavigation = (nextLocation: Location) => {
    if (nextLocation.pathname !== null) {
      dispatch(
        showModal({
          type: 'RouteLeaveGuard',
          options: {
            lastLocation: nextLocation,
          },
        })
      );
    }
    return false;
  };
  return <Prompt when={props.isShowingPrompt} message={handleBlockedNavigation} />;
};

export default RouteLeavingGuard;
