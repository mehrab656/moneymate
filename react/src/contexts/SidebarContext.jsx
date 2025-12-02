import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the sidebar context
const SidebarContext = createContext();

// Custom hook to use the sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Sidebar Provider Component
export const SidebarProvider = ({ children }) => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: false,
    title: '',
    content: null,
    width: 'md',
    anchor: 'right',
    showCloseButton: true,
    showDivider: true,
    customWidth: null,
    variant: 'temporary',
    elevation: 16,
    sx: {},
    headerSx: {},
    contentSx: {},
    onClose: null,
  });

  // Open sidebar with configuration
  const openSidebar = useCallback((config = {}) => {
    setSidebarState(prevState => ({
      ...prevState,
      isOpen: true,
      ...config,
    }));
  }, []);

  // Close sidebar
  const closeSidebar = useCallback(() => {
    setSidebarState(prevState => ({
      ...prevState,
      isOpen: false,
    }));
  }, []);

  // Update sidebar configuration without opening/closing
  const updateSidebar = useCallback((config = {}) => {
    setSidebarState(prevState => ({
      ...prevState,
      ...config,
    }));
  }, []);

  // Show form in sidebar
  const showForm = useCallback((formComponent, options = {}) => {
    openSidebar({
      content: formComponent,
      title: options.title || 'Form',
      width: options.width || 'md',
      ...options,
    });
  }, [openSidebar]);

  // Show details in sidebar
  const showDetails = useCallback((detailsComponent, options = {}) => {
    openSidebar({
      content: detailsComponent,
      title: options.title || 'Details',
      width: options.width || 'lg',
      ...options,
    });
  }, [openSidebar]);

  // Show custom content in sidebar
  const showContent = useCallback((content, options = {}) => {
    openSidebar({
      content,
      ...options,
    });
  }, [openSidebar]);

  const contextValue = {
    // State
    ...sidebarState,
    
    // Actions
    openSidebar,
    closeSidebar,
    updateSidebar,
    
    // Convenience methods
    showForm,
    showDetails,
    showContent,
    
    // Utility methods
    isOpen: sidebarState.isOpen,
    toggle: () => sidebarState.isOpen ? closeSidebar() : openSidebar(),
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;