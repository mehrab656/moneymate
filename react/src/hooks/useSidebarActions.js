import { useCallback } from 'react';
import { useSidebar } from '../contexts/SidebarContext';

/**
 * Custom hook for sidebar actions and utilities
 * Provides convenient methods for common sidebar operations
 */
export const useSidebarActions = () => {
  const sidebar = useSidebar();

  // Quick form display with common configurations
  const showQuickForm = useCallback((FormComponent, title, options = {}) => {
    sidebar.showForm(FormComponent, {
      title,
      width: 'md',
      showCloseButton: true,
      showDivider: true,
      ...options,
    });
  }, [sidebar]);

  // Quick details display with common configurations
  const showQuickDetails = useCallback((title, DetailsComponent, options = {}) => {
    sidebar.showDetails(DetailsComponent, {
      title,
      width: 'lg',
      showCloseButton: true,
      showDivider: true,
      ...options,
    });
  }, [sidebar]);

  // Show large content (like reports, charts)
  const showLargeContent = useCallback((title, content, options = {}) => {
    sidebar.showContent(content, {
      title,
      width: 'xxl',
      showCloseButton: true,
      showDivider: true,
      ...options,
    });
  }, [sidebar]);

  // Show small content (like quick actions, notifications)
  const showSmallContent = useCallback((title, content, options = {}) => {
    sidebar.showContent(content, {
      title,
      width: 'sm',
      showCloseButton: true,
      showDivider: true,
      ...options,
    });
  }, [sidebar]);

  // Show full-width content (mobile-friendly)
  const showFullContent = useCallback((title, content, options = {}) => {
    sidebar.showContent(content, {
      title,
      customWidth: '100vw',
      showCloseButton: true,
      showDivider: true,
      ...options,
    });
  }, [sidebar]);

  // Show content with custom pixel width
  const showCustomWidth = useCallback((title, content, options = {}) => {
    sidebar.showContent(content, {
      title,
      customWidth: widthPx,
      showCloseButton: true,
      showDivider: true,
      ...options,
    });
  }, [sidebar]);

  // Show content from left side
  const showFromLeft = useCallback((title, content, options = {}) => {
    sidebar.showContent(content, {
      title,
      anchor: 'left',
      width: 'md',
      showCloseButton: true,
      showDivider: true,
      ...options,
    });
  }, [sidebar]);

  // Show modal-like content (no header, custom styling)
  const showModal = useCallback((content, options = {}) => {
    sidebar.showContent(content, {
      showCloseButton: false,
      showDivider: false,
      title: '',
      width: 'md',
      sx: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      },
      contentSx: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      },
      ...options,
    });
  }, [sidebar]);

  // Utility functions
  const isOpen = sidebar.isOpen;
  const close = sidebar.closeSidebar;
  const toggle = sidebar.toggle;

  return {
    // Basic actions
    showForm: sidebar.showForm,
    showDetails: sidebar.showDetails,
    showContent: sidebar.showContent,
    openSidebar: sidebar.openSidebar,
    closeSidebar: sidebar.closeSidebar,
    updateSidebar: sidebar.updateSidebar,

    // Quick actions
    showQuickForm,
    showQuickDetails,
    showLargeContent,
    showSmallContent,
    showFullContent,
    showCustomWidth,
    showFromLeft,
    showModal,

    // Utilities
    isOpen,
    close,
    toggle,

    // State access
    currentTitle: sidebar.title,
    currentWidth: sidebar.width,
    currentAnchor: sidebar.anchor,
  };
};

export default useSidebarActions;