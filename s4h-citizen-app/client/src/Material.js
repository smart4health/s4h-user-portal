import createMuiTheme from '@material-ui/core/styles/createTheme';
import colors from './colors';

const theme = createMuiTheme();

const styles = {
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  typography: {
    useNextVariants: true,
    htmlFontSize: 10,
  },
  palette: {
    primary: {
      main: colors.grayColor,
    },
  },
  overrides: {
    MuiTypography: {
      body1: {
        color: 'var(--color-secondary)',
      },
    },
    MuiButtonBase: {
      root: {
        '&:focus:not(:hover):not(.Mui-focusVisible)': {
          outline: 'none',
          backgroundColor: 'transparent',
        },
        '&.Mui-focusVisible': {
          backgroundColor: 'var(--color-neutral-lightest)',
          color: 'var(--color-primary)',
          outline: '2px solid var(--color-primary)',
        },
      },
    },
    MuiButton: {
      root: {
        borderRadius: 8,
        letterSpacing: '0.5px',
        textTransform: 'initial',
        boxSizing: 'border-box',
        fontWeight: 700,
        padding: '6px 16px',
        '&$disabled': {
          color: `${colors.grayColor} !important`,
        },
      },
      text: {
        color: 'var(--color-secondary)',
        '&:hover': {
          backgroundColor: 'var(--color-neutral-lightest)',
          color: 'var(--color-primary)',
        },
        '&:active': {
          color: 'var(--color-primary)',
          backgroundColor: 'var(--color-neutral-lightest)',
        },
        '&$disabled': {
          backgroundColor: 'transparent',
        },
      },
      textPrimary: {
        color: 'var(--color-secondary)',
      },
      contained: {
        boxShadow: 'none',
        backgroundColor: 'var(--color-secondary)',
        color: colors.white,
        '&:active': {
          boxShadow: 'none',
          backgroundColor: 'var(--color-primary) !important',
        },
        '&:hover': {
          backgroundColor: 'var(--color-primary-light)',
        },
        '&$disabled': {
          backgroundColor:
            'var(--color-background-button-primary-disabled) !important',
        },
      },
      containedPrimary: {
        boxShadow: 'none',
        backgroundColor: 'var(--color-secondary)',
        color: colors.white,
        '&:active': {
          boxShadow: 'none',
          color: colors.white,
          backgroundColor: 'var(--color-primary)',
        },
        '&:hover': {
          color: colors.white,
          backgroundColor: 'var(--color-primary-light)',
        },
      },
      outlined: {
        color: 'var(--color-secondary)',
        border: 'none !important',
        backgroundColor: 'transparent',
        '&::after': {
          content: "''",
          display: 'block',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: 8,
          border: `1px solid var(--color-secondary)`,
        },
        '&:hover, &:active': {
          color: 'var(--color-secondary)',
          backgroundColor: 'transparent',
          '&::after': {
            border: `2px solid var(--color-secondary)`,
          },
        },
        '&$disabled': {
          border:
            '1px solid var(--color-border-button-secondary-disabled) !important',
          '&::after': {
            display: 'none !important',
          },
        },
      },
      outlinedPrimary: {
        color: 'var(--color-secondary)',
        '&:hover, &:active': {
          backgroundColor: 'transparent',
        },
        '&$disabled': {
          '&::after': {
            content: '',
          },
        },
      },
      sizeSmall: {},
      sizeLarge: {
        minWidth: '50px',
        padding: '8px 15px',
      },
    },
    MuiIconButton: {
      root: {
        color: 'var(--color-primary)',
        padding: '0px',
        '&:hover': {
          backgroundColor: 'var(--color-neutral-lightest)',
        },
      },
      colorPrimary: {
        color: 'var(--color-primary)',
      },
    },
    MuiInputLabel: {
      root: {
        fontSize: '1.6rem',
        color: 'var(--color-primary)',
        [theme.breakpoints.down(769)]: {
          fontSize: '1.6rem',
          fontWeight: '400',
        },
        '&$focused': {
          color: 'var(--color-neutral)',
        },
        '&$error': {
          color: 'var(--color-feedback-alarm)',
        },
        '&$disabled': {
          color: 'var(--color-neutral-light)',
        },
      },
      shrink: {
        transform: 'translate(0, 1.5px) scale(0.87)',
        color: 'var(--color-neutral)',
      },
    },
    MuiInputBase: {
      input: {
        color: 'var(--color-primary)',
      },
    },
    MuiInput: {
      root: {
        color: 'var(--color-primary)',
        fontSize: '1.6rem',
        [theme.breakpoints.down(769)]: {
          fontSize: '1.6rem',
        },
        lineHeight: '2rem',
        minHeight: '4rem',
        '&$disabled': {
          color: 'var(--color-primary)',
        },
      },
      underline: {
        '&:before': {
          borderBottom: `2px solid var(--color-neutral-lighter)`,
        },
        '&:after': {
          borderBottom: `2px solid var(--color-primary)`,
        },
        '&:hover:not($disabled):not($focused):not($error):before': {
          borderBottom: `2px solid var(--color-neutral-lighter)`,
        },
      },
      inputMultiline: {
        height: 'auto !important',
      },
    },
    MuiListItem: {
      button: {
        '&:hover': {
          backgroundColor: 'var(--color-neutral-lightest)',
        },
        '&.Mui-focusVisible': {
          outlineOffset: '-2px',
        },
      },
    },
    MuiListItemIcon: {
      root: {
        minWidth: 'initial',
        marginRight: 'var(--space-s)',
      },
    },
    MuiSvgIcon: {
      root: {
        fill: 'var(--color-primary)',
      },
    },
    MuiListItemText: {
      root: {
        color: 'var(--color-neutral)',
      },
      primary: {
        color: 'var(--color-primary)',
      },
    },
    MuiMenu: {
      paper: {
        boxShadow: 'var(--shadow-m)',
        minWidth: '155px',
        borderRadius: 'var(--border-radius-s)',
      },
    },
    MuiMenuItem: {
      root: {
        font: 'var(--typography-desktop-body-level-1)',
        lineHeight: 1.5,
        color: 'var(--color-primary)',
      },
    },
  },
};

const GHTheme = createMuiTheme(styles);

export default GHTheme;
