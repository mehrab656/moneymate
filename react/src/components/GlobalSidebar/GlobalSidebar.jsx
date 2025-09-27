import React from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
  Slide
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Width configurations
const SIDEBAR_WIDTHS = {
  sm: 300,
  md: 400,
  lg: 500,
  xl: 600,
  xxl: 800,
};

const GlobalSidebar = ({
  open = false,
  onClose,
  title = '',
  children,
  width = 'md',
  anchor = 'right',
  showCloseButton = true,
  showDivider = true,
  customWidth = null,
  variant = 'temporary',
  elevation = 16,
  sx = {},
  headerSx = {},
  contentSx = {},
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Calculate sidebar width
  const getSidebarWidth = () => {
    if (customWidth) {
      return typeof customWidth === 'number' ? customWidth : parseInt(customWidth);
    }
    return SIDEBAR_WIDTHS[width] || SIDEBAR_WIDTHS.md;
  };

  const sidebarWidth = getSidebarWidth();
  const responsiveWidth = isMobile ? '100vw' : sidebarWidth;

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      onClose && onClose();
    }
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={handleClose}
      variant={variant}
      elevation={elevation}
      sx={{
        '& .MuiDrawer-paper': {
          width: responsiveWidth,
          maxWidth: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
          ...sx,
        },
        zIndex: theme.zIndex.drawer + 1,
      }}
      {...props}
    >
      <Slide direction={anchor === 'right' ? 'left' : 'right'} in={open} mountOnEnter unmountOnExit>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          {(title || showCloseButton) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                px: 3,
                py: 2.5,
                minHeight: 72,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderBottom: `1px solid ${theme.palette.divider}`,
                ...headerSx,
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  flex: 1,
                  mr: showCloseButton ? 2 : 0,
                  letterSpacing: '0.02em',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  alignSelf: 'center',
                }}
              >
                {title}
              </Typography>
              
              {showCloseButton && (
                <IconButton
                  onClick={onClose}
                  sx={{
                    color: theme.palette.primary.contrastText,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    width: 40,
                    height: 40,
                    alignSelf: 'flex-start',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  size="medium"
                  aria-label="Close sidebar"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}

          {showDivider && (title || showCloseButton) && (
            <Divider sx={{ borderColor: theme.palette.divider }} />
          )}

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 0,
              ...contentSx,
            }}
          >
            {children}
          </Box>
        </Box>
      </Slide>
    </Drawer>
  );
};

export default GlobalSidebar;