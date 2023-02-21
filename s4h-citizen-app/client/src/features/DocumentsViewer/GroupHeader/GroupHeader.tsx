import { Group, GroupItem } from '@d4l/s4h-fhir-xforms';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import MenuItem from '@material-ui/core/MenuItem';
import SvgIcon from '@material-ui/core/SvgIcon';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { connect as reduxConnect, ConnectedProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { BackButton } from '../../../components';
import IconButton from '../../../components/IconButton';
import ModalMenu from '../../../components/ModalMenu';
import config from '../../../config';
import { ReactComponent as DeleteIcon } from '../../../images/Delete.svg';
import { ReactComponent as EditIcon } from '../../../images/Edit.svg';
import { ReactComponent as ShareIcon } from '../../../images/Share.svg';
import { AppState } from '../../../redux';
import {
  selectIsSharingMode,
  selectViewportSize,
  ViewportSize,
} from '../../../redux/globalsSlice';
import { connect } from '../../../store';
import { RootState } from '../../../types';
import { pushTrackingEvent, TRACKING_EVENTS } from '../../../utils/analytics';
import groupTitle from '../../../utils/groupTitle';
import { showModal } from '../../modals/modalsSlice';
import {
  addToSharingData,
  addToSharingGroupIds,
  setActiveView,
  ShareableFeatures,
  ShareSteps,
} from '../../Sharing/reduxSlice';
import { ReactComponent as FileDownload } from '../images/FileDownload.svg';
import { deselectGroup, selectFilesLoadedStatus } from '../reduxSlice';

const mapStateToProps = (state: AppState, ownProps: OwnProps) => ({
  isGroupFilesNotLoaded: selectFilesLoadedStatus(ownProps.group.id)(state),
  viewportSize: selectViewportSize(state),
  isSharingMode: selectIsSharingMode(state),
});

const mapDispatchToProps = {
  deselectGroup,
  showModal,
  setActiveView,
  addToSharingData,
  addToSharingGroupIds,
};

const connector = reduxConnect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps extends RouteComponentProps, WithTranslation {
  author?: Object;
  group: Group;
  groupItem?: GroupItem;
  openInfoPanel?: Function;
}

type PropsFromReactWaterfall = {
  loggedIn: boolean;
};

type Props = OwnProps & PropsFromRedux & PropsFromReactWaterfall;

type State = {
  isModalMenuOpen: boolean;
};

export class GroupHeader extends React.Component<Props, State> {
  state = {
    isModalMenuOpen: false,
  };

  get canShare() {
    return this.props.loggedIn && !this.props.isSharingMode;
  }

  get canEdit() {
    if (!this.props.loggedIn || this.props.isSharingMode) return false;

    if (this.props.group.groupType === 'Course') {
      return false;
    }

    return true;
  }

  get canDelete() {
    if (!this.props.loggedIn || this.props.isSharingMode) return false;

    return true;
  }

  get canDownload() {
    if (!this.props.loggedIn) return false;

    return true;
  }

  get subtitle(): string {
    return this.props.group.groupType;
  }

  get title(): string {
    return groupTitle(this.props.group);
  }

  showMenu = () => {
    this.setState({
      isModalMenuOpen: true,
    });
  };

  closeMenu = () => {
    this.setState({ isModalMenuOpen: false });
  };

  handleShareButtonClick = () => {
    const { history, group } = this.props;
    const resourceIds =
      group.groupType === 'Document' ? [group.id] : [...group.inputResourceIds];
    this.props.addToSharingData({
      type: ShareableFeatures.DOCUMENTS,
      ids: resourceIds,
    });
    this.props.addToSharingGroupIds([group.id]);
    this.props.setActiveView(ShareSteps.PIN);
    history.push(config.ROUTES.app_share);
  };

  renderShareButton = () => {
    const { items } = this.props.group;

    return (
      <IconButton
        label="share"
        disabled={items.length <= 0}
        onClick={() => {
          this.handleShareButtonClick();
        }}
        dataTest="shareBtn"
      >
        <ShareIcon />
      </IconButton>
    );
  };

  renderShareListItem = () => {
    if (!this.canShare) {
      return null;
    }
    const { t } = this.props;
    const { items } = this.props.group;
    const shareLabel = t('share');

    return (
      <MenuItem
        aria-label={shareLabel}
        title={shareLabel}
        className="Menu__ListItem"
        dense
        data-test="shareMenuItem"
        disabled={items.length <= 0}
        onClick={() => {
          this.closeMenu();
          this.handleShareButtonClick();
        }}
      >
        <ListItemIcon>
          <SvgIcon>
            <ShareIcon />
          </SvgIcon>
        </ListItemIcon>
        {shareLabel}
      </MenuItem>
    );
  };

  renderEditListItem = () => {
    if (!this.canEdit) {
      return null;
    }
    const { group, t } = this.props;
    const editLabel = t('menu_document_edit');

    return (
      <MenuItem
        aria-label={editLabel}
        title={editLabel}
        className="Menu__ListItem"
        dense
        data-test="editBtn"
        onClick={() => {
          this.closeMenu();
          this.props.showModal({
            type: 'EditGroup',
            options: { groupId: group.id },
          });
          pushTrackingEvent(TRACKING_EVENTS.DOCUMENT_EDIT_START);
        }}
      >
        <ListItemIcon>
          <SvgIcon>
            <EditIcon />
          </SvgIcon>
        </ListItemIcon>
        {editLabel}
      </MenuItem>
    );
  };

  renderDeleteListItem = () => {
    if (!this.canDelete) {
      return null;
    }
    const { group, t } = this.props;
    const deleteLabel = t('delete');
    return (
      <MenuItem
        aria-label={deleteLabel}
        title={deleteLabel}
        className="Menu__ListItem Menu__ListItem--deleteDocument"
        dense
        data-test="deleteBtn"
        onClick={() => {
          this.closeMenu();
          this.props.showModal({
            type: 'DeleteGroup',
            options: { group },
          });
        }}
      >
        <ListItemIcon>
          <SvgIcon>
            <DeleteIcon />
          </SvgIcon>
        </ListItemIcon>
        {deleteLabel}
      </MenuItem>
    );
  };

  renderDownloadListItem = () => {
    if (!this.canDownload) {
      return null;
    }
    const { group, isGroupFilesNotLoaded, t } = this.props;
    const downloadLabel = t('download');
    const { items } = this.props.group;

    return (
      <MenuItem
        aria-label={downloadLabel}
        title={downloadLabel}
        className="Menu__ListItem"
        dense
        data-test="downloadBtn"
        onClick={() => {
          this.closeMenu();
          this.props.showModal({
            type: 'DownloadGroup',
            options: { group },
          });
          pushTrackingEvent(TRACKING_EVENTS.DOCUMENT_DOWNLOAD_START);
        }}
        disabled={items.length <= 0 || isGroupFilesNotLoaded}
      >
        <ListItemIcon>
          <SvgIcon>
            <FileDownload />
          </SvgIcon>
        </ListItemIcon>
        {downloadLabel}
      </MenuItem>
    );
  };

  render() {
    const { subtitle, title } = this;
    const { viewportSize } = this.props;

    return (
      <div className="GroupDetails__header">
        <div className="GroupDetails__title">
          <>
            {viewportSize !== ViewportSize.WIDE && (
              <BackButton onClick={() => this.props.deselectGroup()} />
            )}
            <div>
              <h3>{title}</h3>
              <p>{subtitle}</p>
            </div>
          </>
        </div>

        <div className="GroupDetails__actions">
          {this.canShare && this.renderShareButton()}

          <ModalMenu
            isOpen={this.state.isModalMenuOpen}
            onOpen={this.showMenu}
            onClose={this.closeMenu}
          >
            {this.renderShareListItem()}
            {this.renderEditListItem()}
            {this.renderDownloadListItem()}
            {this.renderDeleteListItem()}
          </ModalMenu>
        </div>
      </div>
    );
  }
}

const GroupHeaderConnectedToReactWaterfall = connect(({ loggedIn }: RootState) => ({
  loggedIn,
}))(GroupHeader);

export default withRouter(
  connector(withTranslation()(GroupHeaderConnectedToReactWaterfall))
);
