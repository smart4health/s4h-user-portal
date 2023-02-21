// FIXME: Having the button defined as div here was not the best choice after all
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import classNames from 'classnames';
import React from 'react';
import './GroupItemThumbnail.scss';

interface Props {
  onClick?: () => void;
  className?: string;
  isActive: boolean;
  isLarger?: boolean;
  isSquare?: boolean;
  title?: string;
  mimeTypeShort?: string;
  isButton?: boolean;
}

const ThumbnailButton: React.FC<Props> = ({
  onClick,
  children,
  className,
  isActive,
  isLarger,
  isSquare,
  title,
  mimeTypeShort,
  isButton = false,
}) => {
  if (isButton) {
    return (
      <button
        title={title}
        onClick={onClick}
        className={classNames('GroupItemThumbnail', className, {
          'GroupItemThumbnail--active': isActive,
          'GroupItemThumbnail--larger': isLarger,
          'GroupItemThumbnail--square': isSquare,
        })}
        data-type-short={mimeTypeShort}
      >
        {children}
      </button>
    );
  }
  return (
    <div
      title={title}
      onClick={onClick}
      className={classNames('GroupItemThumbnail', className, {
        'GroupItemThumbnail--active': isActive,
        'GroupItemThumbnail--larger': isLarger,
        'GroupItemThumbnail--square': isSquare,
      })}
      data-type-short={mimeTypeShort}
    >
      {children}
    </div>
  );
};

export default ThumbnailButton;
