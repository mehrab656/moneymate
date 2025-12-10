import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import { Menu, MenuItem, ListItemIcon } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getSideMenus } from './SideMenuConfig';

/**
 * Horizontal top menubar that mirrors sidebar items.
 * Renders at small/medium widths where the left sidebar is hidden.
 */
const TopMenubar = ({ isActive, checkPermission }) => {
  const location = useLocation();
  const currentMenu = useMemo(() => new URLSearchParams(location.search).get('menu'), [location.search]);
  // Build menu list once per route change
  const menus = useMemo(() => getSideMenus(isActive, {}, currentMenu), [isActive, currentMenu]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();


  const canShowMenu = (menu) => {
    if (!menu) return false;
    if (menu.hasMultiMenu) {
      // Show group only if any submenu is allowed
      return (menu.subMenus || []).some((sm) => !sm.permission || checkPermission(sm.permission));
    }
    return !menu.permission || checkPermission(menu.permission);
  };

  const renderSingle = (menu) => {
    const isActiveLink = Boolean(menu.link?.className?.includes('active'));
    const activeBg = alpha(theme.palette.primary.main, 0.12);
    return (
      <Nav.Link
        as={Link}
        to={menu.link.to}
        className={menu.link.className}
        style={{
          color: isActiveLink ? theme.palette.primary.main : theme.palette.text.primary,
          backgroundColor: isActiveLink ? activeBg : 'transparent',
          borderRadius: 6,
        }}
      >
        {menu.icon && <FontAwesomeIcon icon={menu.icon} className="me-2" />}
        {menu.text}
      </Nav.Link>
    );
  };

  const renderGroup = (menu) => {
    const id = `top-menu-${(menu.mainMenu?.text || menu.text || 'menu')
      .toLowerCase()
      .replace(/\s+/g, '-')}`;

    const visibleSubs = (menu.subMenus || []).filter(
      (sm) => !sm.permission || checkPermission(sm.permission)
    );
    const isGroupActive = visibleSubs.some((sm) => sm.link?.className?.includes('active'));
    const handleOpen = (e) => {
      e.preventDefault();
      setOpenDropdownId(id);
      setAnchorEl(e.currentTarget);
    };
    const handleClose = () => {
      setOpenDropdownId(null);
      setAnchorEl(null);
    };

    return (
      <Nav.Item className="top-menubar-group">
        <Nav.Link
          id={id}
          className={menu.link?.className || ''}
          style={{
            color: (openDropdownId === id || isGroupActive) ? theme.palette.primary.main : theme.palette.text.primary,
            backgroundColor: (openDropdownId === id || isGroupActive) ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
            borderRadius: 6,
          }}
          onClick={handleOpen}
        >
          {menu.mainMenu?.icon && (
            <FontAwesomeIcon icon={menu.mainMenu.icon} className="me-2" />
          )}
          {menu.mainMenu?.text || menu.text}
          <FontAwesomeIcon
            icon={openDropdownId === id ? faChevronUp : faChevronDown}
            className="ms-1"
          />
        </Nav.Link>
        <Menu
          open={openDropdownId === id}
          anchorEl={anchorEl}
          onClose={handleClose}
          container={document.body}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            className: 'top-menubar-menu',
            sx: {
              minWidth: 220,
              borderRadius: 1,
              p: 0.5,
              zIndex: 11000,
              bgcolor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
          MenuListProps={{ 'aria-labelledby': id }}
        >
          {visibleSubs.length === 0 ? (
            <MenuItem disabled>No accessible items</MenuItem>
          ) : (
            visibleSubs.map((sm, idx) => (
              <MenuItem
                key={idx}
                component={Link}
                to={sm.link.to}
                onClick={handleClose}
                className={sm.link.className}
                selected={Boolean(sm.link.className && sm.link.className.includes('active'))}
                aria-selected={Boolean(sm.link.className && sm.link.className.includes('active'))}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {sm.icon && (
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <FontAwesomeIcon icon={sm.icon} />
                  </ListItemIcon>
                )}
                {sm.text}
              </MenuItem>
            ))
          )}
        </Menu>
      </Nav.Item>
    );
  };

  return (
    <div
      className="top-menubar"
      style={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Navbar
        expand="lg"
        className="px-3"
        role="navigation"
        aria-label="Top menu"
        style={{ backgroundColor: 'transparent', color: 'inherit' }}
      >
        <Navbar.Collapse id="top-menubar-nav">
          {/* Horizontal scroll is applied to this wrapper to avoid clipping dropdowns */}
          <div className="menu-scroll">
            <Nav className="me-auto flex-nowrap" style={{ color: 'inherit' }}>
              {menus.filter(canShowMenu).map((menu, idx) => (
                <React.Fragment key={`tm-${idx}`}>
                  {!menu.hasMultiMenu ? renderSingle(menu) : renderGroup(menu)}
                </React.Fragment>
              ))}
            </Nav>
          </div>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
};

export default TopMenubar;
