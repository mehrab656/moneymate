import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavDropdown, Col, Row, Collapse, Badge } from "react-bootstrap";
import { Menu, MenuItem, Divider, IconButton, Avatar, Box } from "@mui/material";

import DropDownProperties from "./DropDownProperties";
import {
  faBars,
  faBell,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

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
        {label}:{" "}
        {default_currency !== undefined && amount !== undefined && (
          <strong>{`${default_currency} ${amount}`}</strong>
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
              </Row>
            </div>
          </Collapse>
        </Col>


        <Col xs="auto" className="d-flex align-items-center ms-auto">
          <Box sx={{mr: 2}}>
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
