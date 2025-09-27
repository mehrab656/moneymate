// Export all sidebar-related components and utilities
export { default as GlobalSidebar } from './GlobalSidebar';
export { default as SidebarContainer } from './SidebarContainer';

// Export context and hooks
export { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';
export { useSidebarActions } from '../../hooks/useSidebarActions';

// Export width constants for convenience
export const SIDEBAR_WIDTHS = {
  sm: 300,
  md: 400,
  lg: 500,
  xl: 600,
  xxl: 800,
};