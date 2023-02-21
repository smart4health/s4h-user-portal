/** The component renders the header of the sidebar and has options
 * to configure if it has an action button or not
 */
import classnames from 'classnames';
import React from 'react';
import './Header.scss';

type CommonProps = {
  title: string;
  subtitle?: string;
};
type TruncatedProps =
  | {
      hasActionButton: false;
    }
  | {
      hasActionButton: true;
      actionButton: React.ReactChild;
    };

type Props = CommonProps & TruncatedProps;

const TwoColumnSidebarHeader = (props: Props) => {
  const classes = classnames('TwoColumnSidebarHeader', {
    'TwoColumnSidebarHeader--has-action-button': props.hasActionButton,
  });
  return (
    <div className={classes}>
      <div>
        <h1>{props.title}</h1>
        {props.subtitle && <p>{props.subtitle}</p>}
      </div>
      {props.hasActionButton && (
        <div className="SidebarHeader__button">{props.actionButton}</div>
      )}
    </div>
  );
};

export default TwoColumnSidebarHeader;
