import React from 'react';
import './ViewHeader.scss';

interface Props {
  title: string;
}

const ViewHeader: React.FC<Props> = ({ title }) => {
  return (
    <div className="ViewHeader">
      <h1>{title}</h1>
    </div>
  );
};

export default ViewHeader;
