import React from 'react';
import './ModalWrapper.scss';
interface Props {
  children: React.ReactChild;
  className?: string;
}
const ModalWrapper = (props: Props) => {
  return (
    <div className={`ModalWrapper ${props.className ?? ''}`}>{props.children}</div>
  );
};

export default ModalWrapper;
