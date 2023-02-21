import React from 'react';
import config from '../../config';
import { connect } from '../../store';
import { RootState } from '../../types';
import './ViewLoader.scss';
interface OwnProps {
  children: React.ReactChildren;
}

type ConnectedProps = {
  appState: Object;
  appInitialized: boolean;
};

type Props = OwnProps & ConnectedProps;

const ViewLoader = ({ children, appInitialized, appState }: Props) => {
  return !appInitialized || appState === config.APP_STATE.LOADING ? (
    <div className="ViewLoader">
      <d4l-spinner />
    </div>
  ) : (
    children
  );
};

export default connect(({ appState, appInitialized }: RootState) => ({
  appState,
  appInitialized,
}))(ViewLoader);
