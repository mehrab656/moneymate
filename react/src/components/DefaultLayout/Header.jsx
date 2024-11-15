import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavDropdown, Col, Row, Collapse } from "react-bootstrap";
import DropDownProperties from "./DropDownProperties";
import { faBars, faBell, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

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

  return (
    <header className="header-container bg-white py-3 shadow-sm">
      <Row className="align-items-center px-3">
        
       {/* Finance Section with Collapse */}
<Col xs={12} md="auto" className="d-flex flex-column align-items-start">
  <Collapse in={open || isLargeScreen} dimension="height">
    <div id="finance-collapse" className="w-100">
      <Row className="d-flex flex-wrap align-items-center">
        <Col xs={12} sm="auto" md="auto" className="text-center text-md-start mb-2 mb-md-0">
          {renderCurrencyItem("Account Balance", financeStatus.totalAccountBalance)}
        </Col>
        <Col xs={12} sm="auto" md="auto" className="text-center text-md-start mb-2 mb-md-0">
          {renderCurrencyItem("Total Income", financeStatus.totalIncome)}
        </Col>
        <Col xs={12} sm="auto" md="auto" className="text-center text-md-start mb-2 mb-md-0">
          {renderCurrencyItem("Total Expense", financeStatus.totalExpense)}
        </Col>
      </Row>
    </div>
  </Collapse>
</Col>


        {/* Notifications, User Dropdown, Toggle Icon, and Sidebar Toggle Button */}
        <Col xs="auto" className="d-flex align-items-center ms-auto">
          {/* Notifications Dropdown */}
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

          {/* User Dropdown */}
          <NavDropdown
            title={user?.username ?? "User"}
            id="user-dropdown"
            align="end"
            className="user-dropdown ms-3"
          >
            <NavDropdown.Item href="#action/3.1">Profile</NavDropdown.Item>
            <NavDropdown.Item href="application-settings">
              Activity Log
            </NavDropdown.Item>
            {userRole === "admin" && (
              <NavDropdown.Item>
                <Link className="header-dropdown-item" to="/application-settings">
                  Application Settings
                </Link>
              </NavDropdown.Item>
            )}
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={onLogout}>Logout</NavDropdown.Item>
          </NavDropdown>

          {/* Finance Section Toggle Icon for Small Screens */}
          {!isLargeScreen && (
            <FontAwesomeIcon
              icon={open ? faChevronUp : faChevronDown}
              onClick={() => setOpen(!open)}
              aria-controls="finance-collapse"
              aria-expanded={open}
              className="d-md-none ms-3"
              style={{ cursor: "pointer" }}
            />
          )}

          {/* Sidebar Toggle Button */}
          <FontAwesomeIcon
            icon={faBars}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="d-lg-none ms-3"
            style={{ cursor: "pointer" }}
          />
        </Col>
      </Row>
    </header>
  );
};

export default Header;
