import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider.jsx";
import axiosClient from "../../axios-client.js";
import React, { useContext, useEffect, useState } from "react";

import Footer from "./Footer.jsx";
import { Container, Row, Col, Button, Offcanvas } from "react-bootstrap";
import { compareDates } from "../../helper/HelperFunctions.js";
import { useGetSectorListDataQuery } from "../../api/slices/sectorSlice.js";
import { useGetFinancialReportDataQuery } from "../../api/slices/accountSlice.js";
import Dropdown from "react-bootstrap/Dropdown";
import { notification } from "../../components/ToastNotification";
import { Tooltip } from "react-tooltip";
import SideMenus from "./SideMenus.jsx";
import Header from "./Header.jsx";
import LeftSideBarSkeleton from "../../components/loader/LeftSideBarSkeleton.jsx";
import {
  useGetCurrentCompanyDataQuery,
  useGetSideBarCompanyListsDataQuery,
} from "../../api/slices/dashBoardSlice.js";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import { SidebarContainer } from "../../components/GlobalSidebar/index.js";

const defaultQuery = {
  searchTerm: "",
  payment_account_id: "",
  contract_start_date: "",
  contract_end_date: "",
  orderBy: "DESC",
  order: "",
  limit: 10,
};

export default function AuthLayout() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState(defaultQuery);
  const isActive = (linkPath) => location.pathname === linkPath;
  const { user, token, setUser, setToken } = useStateContext();
  const navigate = useNavigate();
  const [financeStatus, setFinanceStatus] = useState({
    totalAccountBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
  });
  const [className, setClassName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  const [submenuVisible, setSubmenuVisible] = useState({
    transaction: false,
    report: false,
    bankAccount: false,
    settings: false,
    hrModule: false,
  });

  // remaining open multiple
  // const toggleSubmenu = (type) => {
  //   setSubmenuVisible((prev) => ({
  //     ...prev,
  //     [type]: !prev[type],
  //   }));
  // };

  // will open one at a time
  const toggleSubmenu = (type) => {
    const keys = ["transaction","report","bankAccount","settings","hrModule"];
    
    setSubmenuVisible((prev) => {
      if (type === "single") {
        // Close all submenus
        return keys.reduce((acc, key) => ({ ...acc, [key]: false }), {});
      }
      // Toggle the clicked submenu, close others
      return keys.reduce(
        (acc, key) => ({
          ...acc,
          [key]: key === type ? !prev[key] : false,
        }),
        {}
      );
    });
  };

  // Context and other hooks
  const { applicationSettings, userRole, setUserRole, checkPermission } =
    useContext(SettingsContext);
  const { num_data_per_page, default_currency } = applicationSettings;
  const currentCompanyID = localStorage.getItem("CURRENT_COMPANY");
  const pageSize = num_data_per_page;

  // API calls with conditional skipping
  const {
    data: getSectorListData,
    isFetching: sectorListFetching,
    isError: sectorListError,
  } = useGetSectorListDataQuery(undefined);

  const { data: getCompanyData } =
    useGetSideBarCompanyListsDataQuery(undefined);

  const { data: getCurrentCompanyData } = useGetCurrentCompanyDataQuery({
    id: currentCompanyID,
  });

  const { data: getFinancialReportData } = useGetFinancialReportDataQuery({
    token,
  });

  // Other effects
  useEffect(() => {
    if (getSectorListData?.data) {
      let notificationsArray = [];
      getSectorListData?.data.map((item) => {
        if (compareDates(item.internet_billing_date) === "danger") {
          item = { ...item, type: "internet" };
          notificationsArray.push(item);
        }
        if (compareDates(item.el_billing_date) === "danger") {
          item = { ...item, type: "electricity" };
          notificationsArray.push(item);
        }
      });

      setNotifications(notificationsArray);
    }
  }, [getSectorListData]);

  // Screen resize effect
  const handleResize = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setClassName("");
    } else if (width >= 768 && width < 992) {
      setClassName("wrapper");
    } else {
      setClassName("wrapper");
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Event handlers
  const onLogout = (ev) => {
    ev.preventDefault();

    axiosClient
      .post("/logout")
      .then(() => {
        setUser({});
        setUserRole({});
        setToken(null);
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("ACCESS_USER");
        localStorage.removeItem("ACCESS_ROLE");
        localStorage.removeItem("CURRENT_COMPANY");
      })
      .catch((error) => {
        console.warn("Error occurred", error);
      });
  };

  const handleCloseSidebar = () => setShowSidebar(false);
  const handleShowSidebar = () => setShowSidebar(true);

  const switchCompany = (id) => {
    axiosClient
      .post(`/switch-company/${id}`)
      .then(({ data }) => {
        if (data.status === "success") {
          localStorage.setItem("CURRENT_COMPANY", id);
        }
        notification(data.status, data?.message, data?.description);
        window.location.reload();
      })
      .catch((error) => {
        console.warn("Error occurred", error);
      });
  };

  // Main render
  return (
    <>
      <Container fluid>
        <Row>
          <Col xs={12} sm={12}>
            <div className={`${className}`} id="wrappingContent">
              <aside className="wrapping-aside d-none d-md-block d-lg-block">
                {!getCurrentCompanyData?.data?.name && (
                  <div className="aside-content">
                    <LeftSideBarSkeleton />
                  </div>
                )}
                {getCurrentCompanyData?.data?.name && (
                  <div className="aside-content">
                    {userRole !== "employee" && (
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="dark"
                          id="dropdown-basic"
                          className={"current-company-name"}
                          data-tooltip-id="switch-company"
                          data-tooltip-content={"Switch to another company "}
                        >
                          {getCurrentCompanyData?.data
                            ? getCurrentCompanyData?.data.name
                            : "company"}
                        </Dropdown.Toggle>
                        <Tooltip id="switch-company" />
                        <Dropdown.Menu className="scrollable-dropdown">
                          {getCompanyData &&
                            getCompanyData?.data.length > 0 &&
                            getCompanyData?.data.map((company) => (
                              <Dropdown.Item
                                key={company.uid}
                                active={
                                  getCurrentCompanyData?.data?.name ===
                                  company.name
                                }
                                onClick={() => switchCompany(company.id)}
                                className={"company-list-dropdown"}
                              >
                                {company.name}
                              </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                    <hr />
                    <ul
                      className="aside-menu"
                      key={Math.random().toString(36).slice(2)}
                    >
                      <SideMenus
                        isActive={isActive}
                        handleCloseSidebar={handleCloseSidebar}
                        user={user}
                        toggleSubmenu={toggleSubmenu}
                        submenuVisible={submenuVisible}
                        checkPermission={checkPermission}
                      />
                    </ul>
                  </div>
                )}
              </aside>
              <div className="wrapping-body">
                <div className="body-content d-flex flex-column">
                  <Header
                    default_currency={default_currency}
                    financeStatus={
                      getFinancialReportData
                        ? getFinancialReportData
                        : financeStatus
                    }
                    notifications={notifications}
                    user={user}
                    userRole={userRole}
                    toggleSidebar={handleShowSidebar}
                    onLogout={onLogout}
                  />
                  <main className="flex-grow-1 py-2">
                    <Outlet />
                  </main>
                  <Footer />
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Offcanvas
          show={showSidebar}
          onHide={(e) => setShowSidebar(false)}
          placement="start"
        >
          <Offcanvas.Body>
            <div className={`wrapper`} id="wrappingContent">
              <aside className="wrapping-aside overflow-auto h-100">
                <div className="aside-content">
                  <ul className="aside-menu">
                    <SideMenus
                      isActive={isActive}
                      toggleSubmenu={toggleSubmenu}
                      handleCloseSidebar={handleCloseSidebar}
                      user={user}
                      checkPermission={checkPermission}
                    />
                  </ul>
                </div>
              </aside>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
        
        {/* Global Sidebar */}
        <SidebarContainer />
      </Container>
    </>
  );
}
