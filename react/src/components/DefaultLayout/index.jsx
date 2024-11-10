import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider.jsx";
import axiosClient from "../../axios-client.js";
import React, { useContext, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../public/custom.css";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import Footer from "./Footer.jsx";
import { Container, Row, Col, Button, Offcanvas } from "react-bootstrap";
import { compareDates } from "../../helper/HelperFunctions.js";
import { useGetSectorsDataQuery } from "../../api/slices/sectorSlice.js";
import { useGetFinancialReportDataQuery } from "../../api/slices/accountSlice.js";
import Dropdown from "react-bootstrap/Dropdown";
import { notification } from "../ToastNotification.jsx";
import { Tooltip } from "react-tooltip";
import SideMenus from "./SideMenus.jsx";
import Header from "./Header.jsx";
import LeftSideBarSkeleton from "../SkeletonLoader/LeftSideBarSkeleton.jsx";
import { useGetCurrentCompanyDataQuery, useGetSideBarCompanyListsDataQuery } from "../../api/slices/dashBoardSlice.js";

export default function DefaultLayout() {
  const location = useLocation();
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
  const { applicationSettings, userRole, setUserRole, checkPermission } =
    useContext(SettingsContext);
  let { default_currency } = applicationSettings;
  const currentCompanyID = localStorage.getItem("CURRENT_COMPANY");

  const { data: getSectorsData } = useGetSectorsDataQuery({ token });
  const { data: getCompanyData } = useGetSideBarCompanyListsDataQuery();
  const { data: getCurrentCompanyData } = useGetCurrentCompanyDataQuery({id:currentCompanyID});
  const { data: getFinancialReportData } = useGetFinancialReportDataQuery({token})

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }

    //get total account balance
  }, [token]);

  useEffect(() => {
    if (getSectorsData?.data) {
      let notificationsArray = [];
      getSectorsData?.data.map((item) => {
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
  }, [getSectorsData]);

  //screen resize for responsive dynamic class
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

  // Handle link click
  const [showSidebar, setShowSidebar] = useState(false);
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  const [submenuTransactionVisible, setSubmenuTransactionVisible] =
    useState(false);
  const [submenuReportVisible, setSubmenuReportVisible] = useState(false);
  const [submenuBankAccVisible, setSubmenuBankAccVisible] = useState(false);
  const [submenuSettingsVisible, setSubmenuSettingsVisible] = useState(false);
  const [submenuHrModuleVisible, setSubmenuHrModuleVisible] = useState(false);
  const toggleSubmenu = (type) => {
    if (type === "transaction") {
      setSubmenuTransactionVisible(!submenuTransactionVisible);
    }
    if (type === "report") {
      setSubmenuReportVisible(!submenuReportVisible);
    }
    if (type === "bankAcc") {
      setSubmenuBankAccVisible(!submenuBankAccVisible);
    }
    if (type === "settings") {
      setSubmenuSettingsVisible(!submenuSettingsVisible);
    }
    if (type === "hr") {
      setSubmenuHrModuleVisible(!submenuHrModuleVisible);
    }
  };

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

  return (
    <>
      <Container fluid>
        <Row>
          {/* Main Content */}
          <Col xs={12} sm={12}>
            {/* Your page content goes here */}
            <div className={`${className}`} id="wrappingContent">
              <aside className="wrapping-aside overflow-auto h-100 d-none d-md-block d-lg-block">
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
                          {getCurrentCompanyData?.data ? getCurrentCompanyData?.data.name : "company"}
                        </Dropdown.Toggle>
                        <Tooltip id="switch-company" />
                        <Dropdown.Menu>
                          {getCompanyData && getCompanyData?.data.length > 0 &&
                            getCompanyData?.data.map((company) => (
                              <Dropdown.Item
                                key={company.uid}
                                active={getCurrentCompanyData?.data?.name === company.name}
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
                        toggleSubmenu={toggleSubmenu}
                        user={user}
                        submenuTransactionVisible={submenuTransactionVisible}
                        submenuReportVisible={submenuReportVisible}
                        submenuBankAccVisible={submenuBankAccVisible}
                        submenuHrModuleVisible={submenuHrModuleVisible}
                        submenuSettingsVisible={submenuSettingsVisible}
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
                    financeStatus={getFinancialReportData ? getFinancialReportData : financeStatus}
                    notifications={notifications}
                    user={user}
                    userRole={userRole}
                    toggleSidebar={toggleSidebar}
                    onLogout={onLogout}
                  />
                  <main className="flex-grow-1 py-2">
                    <Outlet />

                    {/*{notification &&*/}
                    {/*    <div className="notification">*/}
                    {/*        {notification}*/}
                    {/*    </div>*/}
                    {/*}*/}
                  </main>
                  <Footer />
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Off canvas Sidebar */}
        <Offcanvas
          show={showSidebar}
          onClick={(e) => toggleSidebar()}
          placement="start"
        >
          <Offcanvas.Body>
            {/* Sidebar menu items go here */}
            <div className={`wrapper`} id="wrappingContent">
              <aside className="wrapping-aside overflow-auto h-100">
                <div className="aside-content">
                  <ul className="aside-menu">
                    <SideMenus
                      isActive={isActive}
                      toggleSubmenu={toggleSubmenu}
                      user={user}
                      submenuTransactionVisible={submenuTransactionVisible}
                      submenuReportVisible={submenuReportVisible}
                      submenuBankAccVisible={submenuBankAccVisible}
                      submenuHrModuleVisible={submenuHrModuleVisible}
                      submenuSettingsVisible={submenuSettingsVisible}
                      checkPermission={checkPermission}
                    />
                  </ul>
                </div>
              </aside>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </Container>

      {/*<FloatingWhatsApp*/}
      {/*    phoneNumber="+971551258910"*/}
      {/*    accountName="Mehrab Hossain"*/}
      {/*    // avatar={avatar}*/}
      {/*    allowEsc*/}
      {/*    allowClickAway*/}
      {/*    notification*/}
      {/*    notificationSound*/}
      {/*/>*/}
    </>
  );
}
