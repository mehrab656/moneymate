import { createTheme } from '@mui/material/styles';

const designTokens = {
  spacingBase: 8,
  radius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
  },
  elevations: {
    0: 'none',
    1: '0 1px 2px rgba(16,24,40,0.04)',
    2: '0 4px 8px rgba(16,24,40,0.06)',
    3: '0 10px 20px rgba(16,24,40,0.08)',
  },
  zIndex: {
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },
  typography: {
    fontFamily: "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial",
    h1: { fontSize: '2rem', lineHeight: 1.25, fontWeight: 700 }, // 32px
    h2: { fontSize: '1.75rem', lineHeight: 1.285, fontWeight: 700 }, // 28px
    h3: { fontSize: '1.375rem', lineHeight: 1.273, fontWeight: 600 }, // 22px
    h4: { fontSize: '1.125rem', lineHeight: 1.333, fontWeight: 600 }, // 18px
    h5: { fontSize: '1rem', lineHeight: 1.375, fontWeight: 600 }, // 16px
    h6: { fontSize: '0.875rem', lineHeight: 1.428, fontWeight: 600 }, // 14px
    subtitle1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 600 }, // 16px
    body1: { fontSize: '0.875rem', lineHeight: 1.428, fontWeight: 400 }, // 14px
    body2: { fontSize: '0.8125rem', lineHeight: 1.385, fontWeight: 400 }, // 13px
    caption: { fontSize: '0.75rem', lineHeight: 1.333, fontWeight: 400 }, // 12px
    button: { fontSize: '0.875rem', lineHeight: 1.142, fontWeight: 600 }, // 14px
  },
};

const paletteTokens = {
  light: {
    primary: { main: '#0063F7', contrastText: '#FFFFFF' },
    secondary: { main: '#7C4DFF' },
    background: { default: '#F7F9FC', paper: '#FFFFFF' },
    text: { primary: '#0B1726', secondary: '#44566A' },
    divider: 'rgba(15,23,36,0.08)',
    success: { main: '#12B76A' },
    warning: { main: '#F79009' },
    error: { main: '#FF4D4F' },
    info: { main: '#2B8CF1' },
  },
  dark: {
    primary: { main: '#80B8FF', contrastText: '#0B1A2B' },
    secondary: { main: '#CFC0FF' },
    background: { default: '#0B1220', paper: '#0F1724' },
    text: { primary: '#E6EEF8', secondary: '#B9C6D8' },
    divider: 'rgba(255,255,255,0.06)',
    success: { main: '#7EF3C4' },
    warning: { main: '#FFD9A6' },
    error: { main: '#FFB3B8' },
    info: { main: '#7FC3FF' },
  },
};

export function createCmsTheme(mode = 'light') {
  const palette = paletteTokens[mode] || paletteTokens.light;
  return createTheme({
    palette: { mode, ...palette },
    spacing: designTokens.spacingBase,
    shape: { borderRadius: designTokens.radius.sm },
    zIndex: designTokens.zIndex,
    typography: {
      fontFamily: designTokens.typography.fontFamily,
      h1: designTokens.typography.h1,
      h2: designTokens.typography.h2,
      h3: designTokens.typography.h3,
      h4: designTokens.typography.h4,
      h5: designTokens.typography.h5,
      h6: designTokens.typography.h6,
      subtitle1: designTokens.typography.subtitle1,
      body1: designTokens.typography.body1,
      body2: designTokens.typography.body2,
      caption: designTokens.typography.caption,
      button: designTokens.typography.button,
    },
    shadows: [
      'none',
      designTokens.elevations[1],
      designTokens.elevations[2],
      designTokens.elevations[3],
      ...Array(21).fill(designTokens.elevations[0]),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
          },
          '*:focus-visible': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${palette.primary.main}40`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: designTokens.elevations[2],
            backgroundColor: palette.background.paper,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: palette.background.paper,
            borderRight: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.radius.sm,
            textTransform: 'none',
          },
          containedPrimary: {
            boxShadow: designTokens.elevations[1],
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.divider,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.text.secondary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.primary.main,
              boxShadow: `0 0 0 3px ${palette.primary.main}1F`,
            },
          },
          input: {
            '::placeholder': {
              color: palette.text.secondary,
              opacity: 0.8,
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.radius.md,
            boxShadow: designTokens.elevations[2],
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: designTokens.radius.lg,
            boxShadow: designTokens.elevations[3],
            backgroundColor: palette.background.paper,
          },
        },
      },
      MuiSnackbar: {
        defaultProps: {
          anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        },
      },
    },
  });
}

export default createCmsTheme;

