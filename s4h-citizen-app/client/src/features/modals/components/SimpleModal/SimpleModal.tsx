import React from 'react';
import ModalWrapper from '../../ModalWrapper';
import ModalFooter from '../ModalFooter';
import ModalHeader from '../ModalHeader';

export interface Props {
  title: string;
  content: string;
}

const SimpleModal: React.FC<Props> = props => {
  return (
    <ModalWrapper>
      <div className="SimpleModal">
        <ModalHeader title={props.title} />
        <section>{props.content}</section>
        <ModalFooter isCancelable></ModalFooter>
      </div>
    </ModalWrapper>
  );
};

export default SimpleModal;
