import Button from '@material-ui/core/Button';
import ArrowBack from '@material-ui/icons/ArrowBack';
import React, { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import './BackButton.scss';

type Props = {
  toRoute?: string;
  onClick?: MouseEventHandler;
};

const BackButton = ({ toRoute, onClick }: Props) => {
  if (toRoute) {
    return (
      <Button
        className="Button BackButton"
        variant="text"
        component={Link}
        onClick={onClick}
        to={toRoute}
      >
        <ArrowBack />
      </Button>
    );
  }
  return (
    <Button className="Button BackButton" variant="text" onClick={onClick}>
      <ArrowBack />
    </Button>
  );
};

export default BackButton;
