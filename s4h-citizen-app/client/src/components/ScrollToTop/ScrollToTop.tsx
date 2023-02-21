import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { selectIsDeviceMobile } from '../../redux/globalsSlice';

const ScrollToTop = ({ location }: RouteComponentProps) => {
  const isMobile = useSelector(selectIsDeviceMobile);

  useEffect(() => {
    // On mobile scroll to view-wrapper and cookie banner if exists
    if (isMobile) {
      const viewWrapper = document.getElementById('view-wrapper');
      viewWrapper && viewWrapper.scrollIntoView();

      const cookieBanner = document.getElementsByClassName('CookieBanner')[0];
      cookieBanner && cookieBanner.scrollIntoView();
    } else {
      // Scroll to view-body
      const viewBody = document.getElementById('view-body');
      viewBody && viewBody.scrollIntoView();
    }
  }, [location.pathname, isMobile]);

  return null;
};

export default withRouter(ScrollToTop);
