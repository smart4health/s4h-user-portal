import React from 'react';
import { Link } from 'react-router-dom';
import { HeaderLangComponent } from '..';
import config from '../../config';
import s4hLogo from './images/logo-s4h.svg';

type Props = {
  classes?: string;
};

const GuestHeader = (props: Props) => {
  const { classes = '' } = props;

  return (
    <div className={`NavHeader NavHeader--is-unauthorized ${classes}`}>
      <div className="NavHeader__container">
        <div className="NavHeader__bar">
          <Link
            to={{
              pathname: config.ROUTES.home,
              search: window.location.search,
            }}
            className="NavHeader__brand"
            data-test="logo"
          >
            <img src={s4hLogo} alt="smart4health" />
          </Link>
          <HeaderLangComponent />
        </div>
      </div>
    </div>
  );
};

export default GuestHeader;
