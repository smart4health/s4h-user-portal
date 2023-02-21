import classnames from 'classnames';
import React from 'react';
import webComponentWrapper from '../../utils/webComponentWrapper';
import './Tag.scss';

export enum TagColors {
  secondaryLightest = 'Tag--secondary-lightest',
  neutralExtraLightest = 'Tag--neutral-extra-lightest',
  primaryLightest = 'Tag--primary-lightest',
  redLight = 'Tag--red-light',
  redLightest = 'Tag--red-lightest',
  grayLightest = 'Tag-gray-lightest',
}

interface Props {
  text: string;
  handleClick?: () => void;
  color?: TagColors;
  dataTestId?: string;
}

const Tag = ({
  text,
  color = TagColors.neutralExtraLightest,
  handleClick,
  dataTestId,
}: Props) => {
  const classes = classnames(
    'Tag',
    {
      'Tag--is-clickable': handleClick,
    },
    color
  );
  return (
    <d4l-tag
      data-testid={dataTestId}
      classes={classes}
      text={text}
      disabled={!handleClick}
      // @ts-ignore
      ref={webComponentWrapper({
        handleClick: handleClick ?? null,
      })}
    />
  );
};

export default Tag;
