import { Menu } from '@material-ui/core';
import MUIIconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './ModalMenu.scss';

interface Props {
  isOpen: boolean;
  onOpen: Function;
  onClose: Function;
  children: (JSX.Element | null)[];
}

const ModalMenu = ({ isOpen, onOpen, onClose, children }: Props) => {
  const anchor = useRef(null);
  const { t } = useTranslation();
  return (
    <div className="ModalMenu">
      <div className="Button__with-label">
        <MUIIconButton
          aria-label={t('more_document_actions')}
          aria-controls="expanded-options-menu"
          aria-haspopup="true"
          className="Button"
          onClick={() => onOpen()}
          ref={anchor}
        >
          <MoreVertIcon />
        </MUIIconButton>
        <Menu
          id="expanded-options-menu"
          anchorEl={anchor.current}
          anchorOrigin={{
            horizontal: -25,
            vertical: 5,
          }}
          classes={{
            paper: 'Menu__PaperComponent',
          }}
          getContentAnchorEl={null}
          open={isOpen}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          onClose={() => onClose()}
        >
          {children}
        </Menu>
        <span className="Button__label">{t('more_document_actions')}</span>
      </div>
    </div>
  );
};

export default ModalMenu;
