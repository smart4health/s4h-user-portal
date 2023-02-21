import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';
import { TwoColumnCardLayout } from '../../components';
import ViewWrapper from '../../components/ViewWrapper';
import { AppState } from '../../redux';
import { selectViewportSize, ViewportSize } from '../../redux/globalsSlice';
import { showModal } from '../modals/modalsSlice';
import './DocumentsViewer.scss';
import EmptyDocumentsViewer from './EmptyDocumentsViewer';
import GroupDetails from './GroupDetails';
import GroupList from './GroupList';
import {
  deselectGroup,
  getGroups,
  selectAllGroups,
  setGroupActive,
} from './reduxSlice';

const mapStateToProps = (state: AppState) => ({
  isLoading: state.documentsViewer.isLoading,
  groups: selectAllGroups(state),
  hasActiveGroup: !!state.documentsViewer.activeGroupId,
  viewportSize: selectViewportSize(state),
});

const mapDispatchToProps = {
  getGroups,
  showModal,
  setGroupActive,
  deselectGroup,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {}

type Props = OwnProps & PropsFromRedux & WithTranslation;

const RIGHT_COLUMN_ID = 'health-data-tab-panel';

export class DocumentsViewer extends Component<Props> {
  GROUP_DETAILS_DOM_ID = 'GroupDetails';

  componentDidMount() {
    this.props.getGroups();
  }

  componentDidUpdate() {
    const {
      groups,
      hasActiveGroup,
      setGroupActive,
      viewportSize,
      isLoading,
    } = this.props;

    if (
      !isLoading &&
      groups?.length > 0 &&
      !hasActiveGroup &&
      viewportSize === ViewportSize.WIDE
    ) {
      setGroupActive(groups[0].id);
    }
  }

  componentWillUnmount() {
    this.props.deselectGroup();
  }

  render() {
    const { isLoading, groups } = this.props;

    const isNoDataExisting = groups.length < 1;
    return (
      <ViewWrapper className="DocumentsViewer">
        {isLoading ? (
          <div>
            <d4l-spinner />
          </div>
        ) : isNoDataExisting ? (
          <EmptyDocumentsViewer />
        ) : (
          <TwoColumnCardLayout
            isRightColumnVisibleOnMobile={this.props.hasActiveGroup}
            leftColumn={
              <GroupList
                groups={groups}
                onAddButtonClick={() => {
                  this.props.showModal({ type: 'AddGroup', options: {} });
                }}
                rightColumnId={RIGHT_COLUMN_ID}
              />
            }
            rightColumn={<GroupDetails domId={RIGHT_COLUMN_ID} />}
          />
        )}
      </ViewWrapper>
    );
  }
}

export default connector(withTranslation()(DocumentsViewer));
