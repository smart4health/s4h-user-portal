import React from 'react';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import { Footer, NavHeader } from '..';
import config from '../../config';
import { selectIsSharingMode } from '../../redux/globalsSlice';
import { connect } from '../../store';
import { RootState } from '../../types';
import GuestHeader from '../NavHeader/GuestHeader';
import SharingHeader from '../NavHeader/SharingHeader';
import './ViewWrapper.scss';

interface OwnProps {
  className?: string;
  contentClassName?: string;
  children: React.ReactElement;
  bodyClass?: string;
  topAlignedHeader?: React.ReactElement;
}

interface ConnectedProps {
  isLoggedIn: boolean;
}

type Props = OwnProps & ConnectedProps;

const ViewWrapper = (props: Props) => {
  const routeMatch = useRouteMatch();
  const isSharing = useSelector(selectIsSharingMode);
  const guestHeaderClasses = [config.ROUTES.home, config.ROUTES.share].includes(
    routeMatch.url
  )
    ? 'NavHeader--background-neutral'
    : '';
  const bodyClass = props.bodyClass ?? '';
  const contentClassName = props.contentClassName ?? '';

  return (
    <div id="view-wrapper" className={`ViewWrapper ${props.className ?? ''}`}>
      <nav className="ViewWrapper__header">
        {isSharing ? (
          <SharingHeader />
        ) : props.isLoggedIn ? (
          <NavHeader />
        ) : (
          <GuestHeader classes={guestHeaderClasses} />
        )}
      </nav>
      <main className={`ViewWrapper__body ${bodyClass}`} id="view-body">
        {props.topAlignedHeader && (
          <header className="ViewWrapper__top-aligned-header">
            {props.topAlignedHeader}
          </header>
        )}
        <div className={`ViewWrapper__large-screen-holder ${contentClassName}`}>
          {props.children}
        </div>
      </main>
      <footer className="ViewWrapper__footer">
        <Footer />
      </footer>
    </div>
  );
};

export default connect(({ loggedIn }: RootState) => ({
  isLoggedIn: loggedIn,
}))(ViewWrapper);
