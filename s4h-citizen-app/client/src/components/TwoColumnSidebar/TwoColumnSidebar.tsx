/** Component which is responsible for rendering the sidebar in a Two column layout
 * Renders a header and a list menu
 */
import React from 'react';
import TwoColumnSidebarHeader from './Header';
import TwoColumnSidebarMenuList, { SidebarListItem } from './MenuList';
import './TwoColumnSidebar.scss';

type OwnProps = {
  rootTitle: string;
  items: SidebarListItem[];
  rightColumnId: string;
};

type TruncatedProps =
  | {
      hasActionButton: false;
    }
  | {
      hasActionButton: true;
      actionButton: React.ReactChild;
    };

export type Props = OwnProps & TruncatedProps;

export const TwoColumnSidebar = (props: Props) => {
  const { rootTitle, items } = props;

  return (
    <div className="TwoColumnSidebar">
      <TwoColumnSidebarHeader
        title={rootTitle}
        {...(props.hasActionButton
          ? {
              hasActionButton: true,
              actionButton: props.actionButton,
            }
          : {
              hasActionButton: false,
            })}
      />
      <TwoColumnSidebarMenuList
        items={items}
        title={rootTitle}
        rightColumnId={props.rightColumnId}
      />
    </div>
  );
};

export default TwoColumnSidebar;
