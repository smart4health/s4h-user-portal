import { makeStyles, Menu } from '@material-ui/core';
import MUIIconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectIsSharingMode } from '../../../redux/globalsSlice';
import './Card.scss';

const useStyles = makeStyles({
  root: {
    marginRight: 'calc(var(--space-xs) * -1)',
  },
});

type Props = {
  title: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
  menuContent?: React.ReactNode[];
  id: string;
  infoLink?: string;
};

const SummaryCard = (props: Props) => {
  const { footer, content, menuContent, title, id } = props;
  const { t } = useTranslation();
  const classes = useStyles();
  const isSharingMode = useSelector(selectIsSharingMode);

  const [isMoreOptionsMenuOpen, setMoreOptionsMenuOpen] = useState(false);

  const moreOptionsMenuButton = useRef<HTMLButtonElement>(null);

  const moreOptionsMenuButtonId = `${id}-more-options-menu-button`;
  const moreOptionsMenuId = `${id}-more-options-menu`;

  const footerClasses = classNames('SummaryCard__footer', {
    'SummaryCard__footer--is-visible': footer,
  });

  const menu = menuContent?.length && (
    <>
      <MUIIconButton
        id={moreOptionsMenuButtonId}
        data-testid={moreOptionsMenuButtonId}
        className={classes.root}
        onClick={() => setMoreOptionsMenuOpen(!isMoreOptionsMenuOpen)}
        ref={moreOptionsMenuButton}
        aria-label={t('patient_summary.card_more_options.button')}
        aria-controls={`${id}-more-options-menu`}
        aria-haspopup="true"
        aria-expanded={isMoreOptionsMenuOpen || undefined}
      >
        <MoreVertIcon />
      </MUIIconButton>
      <Menu
        anchorEl={moreOptionsMenuButton.current}
        getContentAnchorEl={null}
        keepMounted
        anchorOrigin={{
          horizontal: -54,
          vertical: -8,
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={isMoreOptionsMenuOpen}
        onClick={() => setMoreOptionsMenuOpen(false)}
        onKeyDown={event => {
          // There is existing keydown functionality for the Escape key in
          // MUI. We are preserving that behavior and also extend it with the
          // Enter key.
          if (event.key === 'Enter' || event.key === 'Escape') {
            setMoreOptionsMenuOpen(false);
          }
        }}
        onClose={() => setMoreOptionsMenuOpen(false)}
        MenuListProps={{
          id: moreOptionsMenuId,
          'aria-labelledby': moreOptionsMenuButtonId,
        }}
      >
        {menuContent}
      </Menu>
    </>
  );

  return (
    <d4l-card classes="SummaryCard card--no-padding">
      <div slot="card-header" className="SummaryCard__header">
        <div id={id} className="SummaryCard__anchor"></div>
        <h2 className="SummaryCard__title">{title}</h2>
        {!isSharingMode && menu}
        {isSharingMode && props.infoLink && (
          <Link
            to={props.infoLink}
            className="SummaryCard__info-link"
            target="_blank"
          >
            <d4l-icon-questionmark classes="SummaryCard__info-icon" />
          </Link>
        )}
      </div>
      <div slot="card-content">{content}</div>
      <div slot="card-footer" className={footerClasses}>
        {footer ?? null}
      </div>
    </d4l-card>
  );
};

export default SummaryCard;
