import React from 'react';
import GlobalSidebar from './GlobalSidebar';
import { useSidebar } from '../../contexts/SidebarContext';

/**
 * Container component that connects GlobalSidebar with SidebarContext
 * This should be placed in your main layout to enable global sidebar functionality
 */
const SidebarContainer = () => {
  const {
    isOpen,
    title,
    content,
    width,
    anchor,
    showCloseButton,
    showDivider,
    customWidth,
    variant,
    elevation,
    sx,
    headerSx,
    contentSx,
    closeSidebar,
  } = useSidebar();

  return (
    <GlobalSidebar
      open={isOpen}
      onClose={closeSidebar}
      title={title}
      width={width}
      anchor={anchor}
      showCloseButton={showCloseButton}
      showDivider={showDivider}
      customWidth={customWidth}
      variant={variant}
      elevation={elevation}
      sx={sx}
      headerSx={headerSx}
      contentSx={contentSx}
    >
      {content}
    </GlobalSidebar>
  );
};

export default SidebarContainer;