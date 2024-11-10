import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavDropdown, Button, Col, Row } from "react-bootstrap";
import DropDownProperties from "./DropDownProperties";
import { faBars, faBell } from "@fortawesome/free-solid-svg-icons";

const Header = ({
  default_currency,
  financeStatus,
  notifications,
  user,
  userRole,
  toggleSidebar,
  onLogout,
}) => {
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
      <Row className="align-items-center justify-content-between px-3">
        {/* Finance Info */}
        {renderCurrencyItem("Account Balance", financeStatus.totalAccountBalance)}
        {renderCurrencyItem("Total Income", financeStatus.totalIncome)}
        {renderCurrencyItem("Total Expense", financeStatus.totalExpense)}

        {/* Notifications and User Dropdown */}
        <Col xs={12} sm="auto" className="d-flex align-items-center justify-content-center">
          <NavDropdown
            title={
              <DropDownProperties
                icon={faBell}
                totalNotification={notifications.length}
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
        </Col>

        {/* Sidebar Toggle Button */}
        <Col xs={12} sm="auto" className="d-flex align-items-center justify-content-center">
          {/* User Name and Dropdown */}
          <NavDropdown
            title={user?.username ?? "User"}
            id="user-dropdown"
            align="end"
            className="user-dropdown"
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
          <Button
            variant="primary"
            onClick={toggleSidebar}
            className="d-lg-none ml-2"
            size="sm"
          >
            <FontAwesomeIcon icon={faBars} />
          </Button>
        </Col>
      </Row>
    </header>
  );
};

export default Header;
