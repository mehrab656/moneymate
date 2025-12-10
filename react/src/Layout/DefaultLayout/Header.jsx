import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavDropdown, Col, Row, Collapse, Badge } from "react-bootstrap";
import { Menu, MenuItem, Divider, IconButton, Avatar, Box, Switch, FormControlLabel } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import axiosClient from "../../axios-client.js";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";

import DropDownProperties from "./DropDownProperties";
import {
  faBars,
  faBell,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

// Use compact default Switch for a cleaner, consistent look


const Header = ({
  default_currency,
  financeStatus,
  notifications,
  user,
  userRole,
  toggleSidebar,
  onLogout,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1136);
const [isBelow992, setIsBelow992] = useState(window.innerWidth < 992);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Settings context for privacy toggle
  const { applicationSettings, setApplicationSettings, themeMode, setThemeMode } = useContext(SettingsContext);
  const privacyEnabled = (applicationSettings?.privacy_field || "no") === "yes";

  const handlePrivacyToggle = (event) => {
    const next = event.target.checked ? "yes" : "no";
    // Optimistically update UI
    setApplicationSettings((prev) => ({ ...prev, privacy_field: next }));
    axiosClient
      .put("/application-settings", { privacy_field: next })
      .then(({ data }) => {
        if (data?.application_settings) {
          setApplicationSettings(data.application_settings);
        }
      })
      .catch(() => {
        // revert on error
        setApplicationSettings((prev) => ({ ...prev, privacy_field: privacyEnabled ? "yes" : "no" }));
      });
  };

  // Update screen size state on resize
  useEffect(() => {
const handleResize = () => {
  setIsLargeScreen(window.innerWidth >= 1136);
  setIsBelow992(window.innerWidth < 992);
};
    window.addEventListener("resize", handleResize);
    setOpen(isLargeScreen); // Set initial open state based on screen size
    return () => window.removeEventListener("resize", handleResize);
  }, [isLargeScreen]);

  const renderCurrencyItem = (label, amount) => (
    <Col xs={12} sm="auto" className="header-item">
      <span>
        {label}: {" "}
        {default_currency !== undefined && amount !== undefined && (
          privacyEnabled ? (
            <strong>
              {`${default_currency} `}
              <span className="privacy-blur">xxxx.xx</span>
            </strong>
          ) : (
            <strong>
              {`${default_currency} `}
              <span className="finance-amount">{amount}</span>
            </strong>
          )
        )}
      </span>
    </Col>
  );

  // Display username only, per requirement
  const displayName = (user?.username || "").trim();

  // Derive a safe avatar URL that respects configured backend base URL
  const avatarUrl = (() => {
    const src = (user?.avatar || "").trim();
    if (!src || src === "null") return "";

    // Use as-is if already absolute and not pointing to dev frontend origin
    if (src.startsWith("http://") || src.startsWith("https://")) {
      // If it accidentally points to the frontend dev origin, rewrite to backend base
      try {
        const u = new URL(src);
        if (src.includes("/avatars/")) {
          const base = window.__APP_CONFIG__?.VITE_APP_BASE_URL || "";
          const idx = src.indexOf("/avatars/");
          const path = src.substring(idx); // e.g. /avatars/filename.png
          if (base) return `${base}${path}`;
        }
        return src; // keep original
      } catch {
        // Fallback below
      }
    }

    // If relative or malformed, try to construct using configured base URL
    const base = window.__APP_CONFIG__?.VITE_APP_BASE_URL || "";
    if (src.startsWith("/avatars/")) {
      return `${base}${src}`;
    }
    if (src.includes("/avatars/")) {
      const idx = src.indexOf("/avatars/");
      const path = src.substring(idx);
      return `${base}${path}`;
    }
    return src; // last resort
  })();

  return (
    <header
      className="header-container py-3 shadow-sm main-header"
      style={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${themeMode === 'dark' ? '#384049' : theme.palette.divider}`,
        color: themeMode === 'dark' ? 'rgba(255,255,255,0.87)' : 'rgba(0,0,0,0.87)',
      }}
    >
      <Row className="align-items-center px-3">
        {/* Finance Section with Collapse */}
        <Col xs={12} md="auto" className="d-flex flex-column align-items-start">
          <Collapse in={open || isLargeScreen} dimension="height">
            <div id="finance-collapse" className="w-100">
              <Row className="d-flex flex-wrap align-items-center">
                <>
                  <Col
                    xs={12}
                    sm="auto"
                    md="auto"
                    className="text-center text-md-start mb-2 mb-md-0"
                  >
                    {renderCurrencyItem(
                      "Account Balance",
                      financeStatus.totalAccountBalance
                    )}
                  </Col>
                  <Col
                    xs={12}
                    sm="auto"
                    md="auto"
                    className="text-center text-md-start mb-2 mb-md-0"
                  >
                    {renderCurrencyItem(
                      "Total Income",
                      financeStatus.totalIncome
                    )}
                  </Col>
                  <Col
                    xs={12}
                    sm="auto"
                    md="auto"
                    className="text-center text-md-start mb-2 mb-md-0"
                  >
                    {renderCurrencyItem(
                      "Total Expense",
                      financeStatus.totalExpense
                    )}
                  </Col>
                </>
            </Row>
            </div>
          </Collapse>
        </Col>


        <Col xs="auto" className="d-flex align-items-center justify-content-center ms-auto">
          {/* Privacy toggle left beside notification icon */}
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <FormControlLabel
            control={
                <Switch 
                  size="small"
                  checked={privacyEnabled}
                  onChange={handlePrivacyToggle}
                />
              }
              label="Privacy Mode"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' }, mr: 1 }}
            />
            {/* Theme mode toggle beside Privacy Mode */}
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={themeMode === 'dark'}
                  onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')}
                />
              }
              label="Dark Mode"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' }, mr: 1 }}
            />
           {/* <FormControlLabel
              label="Privacy Mode"
              labelPlacement="start"
              control={
                <Switch
                  sx={{ mr: 2}}
                  size="small"
                  color="default"
                  checked={privacyEnabled}
                  onChange={handlePrivacyToggle}
                />
              }
            /> */}
            <NavDropdown
                title={
                  <DropDownProperties
                      icon={faBell}
                      totalNotification={notifications.length || 0}
                  />
                }
                id="notification-dropdown"
                align="end"
                className="notification-dropdown"
            >
              <NavDropdown.Header className="bg-primary p-1 text-white">
                Notifications
              </NavDropdown.Header>
              {notifications.length > 0 ? (
                  notifications.map((item) => (
                      <NavDropdown.Item
                          key={`${item.type}-${item.id}`}
                          className="notification-item"
                      >
                        {item.name} {item.type} bill date{" "}
                        {item.type === "internet"
                            ? item.internet_billing_date
                            : item.el_billing_date}
                      </NavDropdown.Item>
                  ))
              ) : (
                  <NavDropdown.Item className="text-muted">
                    No notifications
                  </NavDropdown.Item>
              )}
            </NavDropdown>
          </Box>

         <small> {displayName}</small>
            <IconButton
                aria-controls="user-menu"
                aria-haspopup="true"
                onClick={handleClick}
                className="user-dropdown ms-3"
                sx={{mt: -1}}
            >
                <Avatar
                  sx={{width: 35, height: 35}}
                  alt={displayName || "User"}
                  src={avatarUrl}
                />
            </IconButton>
            <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <MenuItem component={Link} to={`/profile`} onClick={handleClose}>
                    Profile
                </MenuItem>
                <MenuItem
                    component={Link}
                to="/settings"
                onClick={handleClose}
            >
              Activity Log
            </MenuItem>

            {userRole === "admin" && (
                <MenuItem
                    component={Link}
                    to="/settings"
                    onClick={handleClose}
                >
                  Settings
                </MenuItem>
            )}

            <Divider/>

            <MenuItem onClick={onLogout}>Logout</MenuItem>
            </Menu>

          {/* Finance Section Toggle Icon for Small Screens */}
          {!isLargeScreen && (
              <FontAwesomeIcon
                  icon={open ? faChevronUp : faChevronDown}
                  onClick={() => setOpen(!open)}
                  aria-controls="finance-collapse"
                  aria-expanded={open}
                  className="ms-3 mb-2 header-finance-collapse-toggle"
                  style={{cursor: "pointer"}}
              />
          )}

          {/* Sidebar Toggle Button */}
          {isBelow992 && (
            <FontAwesomeIcon
                icon={faBars}
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
                className="header-sidebar-toggle ms-3 mb-2"
                style={{cursor: "pointer"}}
            />
          )}
        </Col>
      </Row>
    </header>
  );
};

export default Header;
