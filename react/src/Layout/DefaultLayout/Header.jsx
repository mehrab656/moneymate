import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavDropdown, Col, Row, Collapse, Badge } from "react-bootstrap";
import { Menu, MenuItem, Divider, IconButton, Avatar, Box, Switch, FormControlLabel, styled } from "@mui/material";
import axiosClient from "../../axios-client.js";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";

import DropDownProperties from "./DropDownProperties";
import {
  faBars,
  faBell,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

const Android12Switch = styled(Switch)(({ theme }) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&::before': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    '&::after': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
}));


const Header = ({
  default_currency,
  financeStatus,
  notifications,
  user,
  userRole,
  toggleSidebar,
  onLogout,
}) => {
  const [open, setOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 768);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Settings context for privacy toggle
  const { applicationSettings, setApplicationSettings } = useContext(SettingsContext);
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
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 768);
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
            <strong>{`${default_currency} ${amount}`}</strong>
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
    <header className="header-container bg-white py-3 shadow-sm">
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
                <Android12Switch 
                  checked={privacyEnabled}
                  onChange={handlePrivacyToggle} defaultChecked />
                  }
                  label="Privacy Mode"
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
                  className="d-md-none ms-3 mb-2"
                  style={{cursor: "pointer"}}
              />
          )}

          {/* Sidebar Toggle Button */}
          <FontAwesomeIcon
              icon={faBars}
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              className="d-lg-none ms-3 mb-2"
              style={{cursor: "pointer"}}
          />
        </Col>
      </Row>
    </header>
  );
};

export default Header;
