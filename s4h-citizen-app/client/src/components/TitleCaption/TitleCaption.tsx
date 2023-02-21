import React from 'react';
import './TitleCaption.scss';

type Props = {
  title?: string;
  subtitle?: string;
};

const TitleCaption = (props: Props) => {
  const { title, subtitle } = props;
  return (
    <>
      {title && <div className="TitleCaption__title">{title}</div>}
      {subtitle && <div className="TitleCaption__subtitle">{subtitle}</div>}
    </>
  );
};

TitleCaption.defaultProps = {
  subtitle: null,
};

export default TitleCaption;
