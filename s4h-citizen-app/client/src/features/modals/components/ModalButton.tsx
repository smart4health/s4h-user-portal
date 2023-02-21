import { Components } from '@d4l/web-components-library/dist/loader';
import classNames from 'classnames';
import React from 'react';
import webComponentWrapper from '../../../utils/webComponentWrapper';

export interface Props {
  className?: string;
  dataTest?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
  text: string;
}

const ModalButton: React.FC<Props> = ({
  className,
  dataTest,
  disabled,
  isLoading,
  onClick,
  text,
}) => (
  <d4l-button
    classes={classNames(
      'button--block',
      'button--primary',
      'button--uppercase',
      className
    )}
    text={text}
    is-loading={isLoading}
    // @ts-ignore TS-FIXME
    ref={webComponentWrapper<Components.D4lButton>({
      disabled,
      handleClick: onClick,
    })}
    data-test={dataTest}
  />
);

export default ModalButton;
