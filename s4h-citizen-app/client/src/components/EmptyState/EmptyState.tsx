import classNames from 'classnames';
import React from 'react';
import './EmptyState.scss';

type Props = {
  header?: React.ReactNode;
  headerClass?: string;
  content?: React.ReactNode;
  contentClass?: string;
  footer?: React.ReactNode;
  footerClass?: string;
  className?: string;
};

export const emptyStateButtonClasses = 'button--block button--uppercase';

const EmptyState = (props: Props) => {
  const {
    header,
    headerClass,
    content,
    contentClass,
    footer,
    footerClass,
    className,
  } = props;
  return (
    <div
      className={classNames('EmptyState', className)}
      data-test="emptyStateContainer"
    >
      {header && (
        <div className={classNames('EmptyState__header', headerClass)}>{header}</div>
      )}
      {content && (
        <div className={classNames('EmptyState__content', contentClass)}>
          {content}
        </div>
      )}
      {footer && (
        <div className={classNames('EmptyState__footer', footerClass)}>{footer}</div>
      )}
    </div>
  );
};

export default EmptyState;
