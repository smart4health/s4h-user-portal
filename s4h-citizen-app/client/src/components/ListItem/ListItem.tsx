import React from 'react';
import './ListItem.scss';

interface Props {
  title?: string;
  description?: JSX.Element;
  tags?: JSX.Element | null;
}

const ListItem = ({ title, description, tags }: Props) => {
  return (
    <div className="ListItem">
      {title && <div className="ListItem__title">{title}</div>}
      {description && <div className="ListItem__description">{description}</div>}
      {tags && <div className="ListItem__tags">{tags}</div>}
    </div>
  );
};

export default ListItem;
