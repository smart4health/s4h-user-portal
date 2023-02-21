import React from 'react';
import './AccountFormItem.scss';

interface Props {
  children: React.ReactNode;
}

const AccountFormItem = ({ children }: Props) => {
  return <div className="AccountFormItem">{children}</div>;
};

export default AccountFormItem;
