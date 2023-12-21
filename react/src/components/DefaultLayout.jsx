import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import axiosClient from "../axios-client.js";
import React, {useContext, useEffect, useState} from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../public/custom.css'
import {
    faBars,
    faCalendar,
    faChartBar,
    faChartPie,
    faCogs,
    faDollar,
    faDollarSign,
    faEdit,
    faExchange,
    faListAlt,
    faMailBulk,
    faMoneyBill,
    faMoneyBillTrendUp,
    faMoneyCheck,
    faSection,
    faTachometerAlt,
    faWallet,
    faBell
} from '@fortawesome/free-solid-svg-icons';
import {SettingsContext, SettingsProvider} from "../contexts/SettingsContext.jsx";
import Footer from "./Footer.jsx";
import {Container, Row, Col, Button, Offcanvas, Nav} from 'react-bootstrap';
import {FloatingWhatsApp} from 'react-floating-whatsapp'
import avatar from '../../../954445_n.jpg'
import NavDropdown from 'react-bootstrap/NavDropdown';
import {compareDates} from "../helper/HelperFunctions.js";
import DropDownProperties from "./DropdownProperties";
import { useGetUserDataQuery } from "../api/slices/userSlice.js";
import { useGetSectorsDataQuery } from "../api/slices/sectorSlice.js";
import { useGetFinancialReportDataQuery } from "../api/slices/accountSlice.js";

export default function DefaultLayout() {

    const {user, token, setUser, setToken, notification} = useStateContext();
    const navigate = useNavigate();
    const [financeStatus, setFinanceStatus] = useState({
        totalAccountBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
    })
    const [className, setClassName] = useState('');
    const [notifications, setNotifications] = useState([]);
    const {applicationSettings, userRole, setUserRole} = useContext(SettingsContext);
    let {
        default_currency,
        registration_type
    } = applicationSettings;

    const {data:getSectorsData} = useGetSectorsDataQuery({token})
    const {data:getFinancialReportData} = useGetFinancialReportDataQuery({token})

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
        //get total account balance
    }, [token]);


    useEffect(()=>{
        if(getFinancialReportData){
            setFinanceStatus(getFinancialReportData)
        }
    },[getFinancialReportData])

    useEffect(()=>{
        if(getSectorsData?.data){
            let notificationsArray = [];
            getSectorsData?.data.map(item => {
                if (compareDates(item.internet_billing_date) === 'danger') {
                    item = {...item, type: 'internet'}
                    notificationsArray.push(item)
                }
                if (compareDates(item.el_billing_date) === 'danger') {
                    item = {...item, type: 'electricity'}

                    notificationsArray.push(item)
                }
            });

            setNotifications(notificationsArray);
        }
    },[getSectorsData])



    //screen resize for responsive dynamic class
    const handleResize = () => {
        const width = window.innerWidth;
        if (width < 768) {
            setClassName('');
        } else if (width >= 768 && width < 992) {
            setClassName('wrapper');
        } else {
            setClassName('wrapper');
        }
    }

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);




    const onLogout = (ev) => {
        ev.preventDefault();

        axiosClient
            .post('/logout')
            .then(() => {
                setUser({});
                setUserRole({});
                setToken(null);
                localStorage.removeItem('ACCESS_TOKEN');
                localStorage.removeItem('ACCESS_USER');
                localStorage.removeItem('ACCESS_ROLE');
            })
            .catch(error => {
                console.warn('Error occurred', error);
            });
    };

    const location = useLocation();

    const isActive = (linkPath) => {
        return location.pathname === linkPath;
    };

    // Handle link click


    const [showSidebar, setShowSidebar] = useState(false);

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };
    const [anchorEl, setAnchorEl] = useState(null);


    const handleOpenPopover = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Container fluid>
                <Row>
                    {/* Sidebar Toggle Button */}
                    <Col xs={1} className="mt-3 ml-2 mb-2">
                        <Button
                            variant="primary"
                            onClick={toggleSidebar}
                            className="d-lg-none"
                        >
                            <FontAwesomeIcon icon={faBars}/>
                        </Button>
                    </Col>
                    {/* Main Content */}
                    <Col xs={12} sm={12}>
                        {/* Your page content goes here */}
                        <div className={`${className}`} id="wrappingContent">
                            <aside className="wrapping-aside overflow-auto h-100 d-none d-md-block d-lg-block">
                                <div className="aside-content">
                                    <ul className="aside-menu">
                                        <li className="aside-menu-item">
                                            <Link
                                                to="/dashboard"
                                                className={isActive('/dashboard') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faTachometerAlt}/></span>
                                                <span className="aside-menu-text"> Dashboard </span>
                                            </Link>
                                        </li>

                                        {userRole === 'admin' &&
                                            <li className="aside-menu-item">
                                                <Link
                                                    to="/users"
                                                    className={isActive('/users') ? 'active' : ''}>
                                                    <span className="aside-menu-icon"><FontAwesomeIcon
                                                        icon={faEdit}/></span>
                                                    <span className="aside-menu-text"> Manage Users </span>
                                                </Link>
                                            </li>
                                        }

                                        {userRole === 'user' &&
                                            <li className="aside-menu-item">
                                                <Link
                                                    to={'/users/' + user.id}
                                                    className={isActive('/users') ? 'active' : ''}>
                                                    <span className="aside-menu-icon"><FontAwesomeIcon
                                                        icon={faEdit}/></span>
                                                    <span className="aside-menu-text"> Manage Profile </span>
                                                </Link>
                                            </li>
                                        }

                                        <li className="aside-menu-item">
                                            <Link
                                                to="/sectors"
                                                className={isActive('/sectors') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faSection}/></span>
                                                <span className="aside-menu-text"> Sectors</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link
                                                to="/categories"
                                                className={isActive('/categories') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faListAlt}/></span>
                                                <span className="aside-menu-text"> Categories</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link
                                                to="/banks"
                                                className={isActive('/banks') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faDollarSign}/></span>
                                                <span className="aside-menu-text"> Banks</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link
                                                to="/accounts"
                                                className={isActive('/accounts') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faMoneyCheck}/></span>
                                                <span className="aside-menu-text"> Accounts</span>
                                            </Link>
                                        </li>

                                        <li className="aside-menu-item">
                                            <Link
                                                to="/bank-account/transfer-histories"
                                                className={isActive('/bank-account/transfer-histories') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faExchange}/></span>
                                                <span className="aside-menu-text"> Balance Transfer</span>
                                            </Link>
                                        </li>

                                        <li className="aside-menu-item">
                                            <Link
                                                to="/debts"
                                                className={isActive('/debts') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faMailBulk}/></span>
                                                <span className="aside-menu-text"> Debts/Loans</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link
                                                to="/investments"
                                                className={isActive('/investments') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faMoneyBillTrendUp}/></span>
                                                <span className="aside-menu-text"> Investments</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/investment-plan"
                                                  className={isActive('/investment-plan') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faExchange}/></span>
                                                <span className="aside-menu-text">Investment Plan</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/incomes" className={isActive('/incomes') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faDollar}/></span>
                                                <span className="aside-menu-text"> Incomes</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/returns" className={isActive('/returns') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faDollar}/></span>
                                                <span className="aside-menu-text"> Returns</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/expenses" className={isActive('/expenses') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faMoneyBill}/></span>
                                                <span className="aside-menu-text"> Expenses</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/budgets" className={isActive('/budgets') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faWallet}/></span>
                                                <span className="aside-menu-text"> Budgets</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/income-report"
                                                  className={isActive('/income-report') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faChartBar}/></span>
                                                <span className="aside-menu-text"> Income Report</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/expense-report"
                                                  className={isActive('/expense-report') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faChartPie}/></span>
                                                <span className="aside-menu-text"> Expense Report</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/investment-report"
                                                  className={isActive('/investment-report') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faMoneyBillTrendUp}/></span>
                                                <span className="aside-menu-text"> Investment Report</span>
                                            </Link>
                                        </li>

                                        <li className="aside-menu-item">
                                            <Link to="/all-report"
                                                  className={isActive('/all-report') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faDollar}/></span>
                                                <span className="aside-menu-text"> Overall Report</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/calendar" className={isActive('/calendar') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faCalendar}/></span>
                                                <span className="aside-menu-text"> Calendar</span>
                                            </Link>
                                        </li>

                                        {registration_type === 'subscription' && userRole === 'admin' &&
                                            <li className="aside-menu-item">
                                                <Link to="/subscription-history"
                                                      className={isActive('/subscription-history') ? 'active' : ''}>
                                                    <span className="aside-menu-icon"><FontAwesomeIcon icon={faDollar}/></span>
                                                    <span className="aside-menu-text"> Subscription History</span>
                                                </Link>
                                            </li>
                                        }


                                        {userRole === 'admin' &&
                                            <li className="aside-menu-item">
                                                <Link
                                                    to="/application-settings"
                                                    className={isActive('/application-settings') ? 'active' : ''}>
                                                    <span className="aside-menu-icon"><FontAwesomeIcon
                                                        icon={faCogs}/></span>
                                                    <span className="aside-menu-text"> Application Settings </span>
                                                </Link>
                                            </li>
                                        }
                                    </ul>
                                </div>
                            </aside>
                            <div className="wrapping-body">
                                <div className="body-content d-flex flex-column">
                                    <header className="d-flex justify-content-between bg-white py-3 shadow-sm">
                                        <div className="d-none d-sm-block">
                                            <span>Account Balance : {(default_currency !== undefined && financeStatus.totalAccountBalance !== undefined) &&
                                                <b>{default_currency + ' ' + financeStatus.totalAccountBalance}</b>}</span>
                                        </div>

                                        <div className="d-none d-sm-block">
                                            <span>Total Income : {(default_currency !== undefined && financeStatus.totalIncome !== undefined) &&
                                                <b>{default_currency + ' ' + financeStatus.totalIncome}</b>} </span>
                                        </div>

                                        <div className="d-none d-sm-block">
                                            <span>Total Expense : {(default_currency !== undefined && financeStatus.totalExpense !== undefined) &&
                                                <b>{default_currency + ' ' + financeStatus.totalExpense}</b>}</span>
                                        </div>

                                        <NavDropdown title={<DropDownProperties
                                            icon={faBell}
                                            totalNotification={notifications.length}
                                        />} id="basic-nav-dropdown">
                                            {
                                                notifications.map((item, index) => {
                                                    if (item.type === 'internet') {
                                                        return (
                                                            <>
                                                                <NavDropdown.Item href="#action/3.1"
                                                                                  key={item.id}>
                                                                    {Number(index + 1) + '. ' + item.name + ' ' + item.type + ' bill date ' + item.internet_billing_date}
                                                                </NavDropdown.Item>
                                                                <NavDropdown.Divider/>

                                                            </>

                                                        )
                                                    } else {
                                                        return (
                                                            <>
                                                                <NavDropdown.Item href="#action/3.1"
                                                                                  key={item.id}>
                                                                    {Number(index + 1) + '. ' + item.name + ' ' + item.type + ' bill date ' + item.el_billing_date}</NavDropdown.Item>
                                                                <NavDropdown.Divider/>
                                                            </>
                                                        )
                                                    }

                                                })
                                            }
                                        </NavDropdown>

                                        {/*user Sections */}
                                        <NavDropdown title={user?.name ?? 'User'} id="basic-nav-dropdown">
                                            <NavDropdown.Item href="#action/3.1">Profile</NavDropdown.Item>
                                            <NavDropdown.Item href="application-settings">Activity
                                                Log</NavDropdown.Item>
                                            {userRole === 'admin' &&
                                                <NavDropdown.Item><Link className={"header-dropdown-item"}
                                                                        to="/application-settings">Application
                                                    Settings</Link></NavDropdown.Item>
                                            }
                                            <NavDropdown.Divider/>
                                            <NavDropdown.Item onClick={onLogout}>
                                                {/*<a onClick={onLogout} href="#"></a>*/}
                                                Logout
                                            </NavDropdown.Item>
                                        </NavDropdown>

                                    </header>


                                    <main className="flex-grow-1 py-4">
                                        <Outlet/>

                                        {notification &&
                                            <div className="notification">
                                                {notification}
                                            </div>
                                        }
                                    </main>
                                    <SettingsProvider>
                                        <Footer/>
                                    </SettingsProvider>
                                </div>
                            </div>

                        </div>
                    </Col>
                </Row>

                {/* Offcanvas Sidebar */}
                <Offcanvas show={showSidebar} onHide={toggleSidebar} placement="start">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Moneymate</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        {/* Sidebar menu items go here */}
                        <div className={`wrapper`}
                             id="wrappingContent">
                            <aside className="wrapping-aside overflow-auto h-100">
                                <div className="aside-content">
                                    <ul className="aside-menu">
                                        <li className="aside-menu-item">
                                            <Link
                                                to="/dashboard"
                                                className={isActive('/dashboard') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faTachometerAlt}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Dashboard </span>
                                            </Link>
                                        </li>

                                        {userRole === 'admin' &&
                                            <li className="aside-menu-item">
                                                <Link
                                                    to="/users"
                                                    className={isActive('/users') ? 'active' : ''}>
                                                    <span className="aside-menu-icon"><FontAwesomeIcon
                                                        icon={faEdit}/></span>
                                                    <span className="aside-menu-text" onClick={toggleSidebar}> Manage Users </span>
                                                </Link>
                                            </li>
                                        }

                                        {userRole === 'user' &&
                                            <li className="aside-menu-item">
                                                <Link
                                                    to={'/users/' + user.id}
                                                    className={isActive('/users') ? 'active' : ''}>
                                                    <span className="aside-menu-icon"><FontAwesomeIcon
                                                        icon={faEdit}/></span>
                                                    <span className="aside-menu-text" onClick={toggleSidebar}> Manage Profile </span>
                                                </Link>
                                            </li>
                                        }

                                        <li className="aside-menu-item">
                                            <Link
                                                to="/sectors"
                                                className={isActive('/sectors') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faListAlt}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Sectors</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link
                                                to="/categories"
                                                className={isActive('/categories') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faListAlt}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Categories</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link
                                                to="/banks"
                                                className={isActive('/banks') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faDollarSign}/></span>
                                                <span className="aside-menu-text" onClick={toggleSidebar}> Banks</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link
                                                to="/accounts"
                                                className={isActive('/accounts') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faMoneyCheck}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Accounts</span>
                                            </Link>
                                        </li>

                                        <li className="aside-menu-item">
                                            <Link
                                                to="/bank-account/transfer-histories"
                                                className={isActive('/bank-account/transfer-histories') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faExchange}/></span>
                                                <span className="aside-menu-text" onClick={toggleSidebar}> Balance Transfer</span>
                                            </Link>
                                        </li>

                                        <li className="aside-menu-item">
                                            <Link
                                                to="/debts"
                                                className={isActive('/debts') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faMailBulk}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Debts/Loans</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link
                                                to="/investments"
                                                className={isActive('/investments') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faMoneyBillTrendUp}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Investments</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/investment-plan"
                                                  className={isActive('/investment-plan') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faExchange}/></span>
                                                <span className="aside-menu-text" onClick={toggleSidebar}>Investment Plan</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/incomes" className={isActive('/incomes') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faDollar}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Incomes</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/returns" className={isActive('/returns') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faDollar}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Returns</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/expenses" className={isActive('/expenses') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faMoneyBill}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Expenses</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/budgets" className={isActive('/budgets') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faWallet}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Budgets</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/income-report"
                                                  className={isActive('/income-report') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faChartBar}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Income Report</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/expense-report"
                                                  className={isActive('/expense-report') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faChartPie}/></span>
                                                <span className="aside-menu-text" onClick={toggleSidebar}> Expense Report</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/investment-report"
                                                  className={isActive('/investment-report') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faMoneyBillTrendUp}/></span>
                                                <span className="aside-menu-text" onClick={toggleSidebar}> Investment Report</span>
                                            </Link>
                                        </li>

                                        <li className="aside-menu-item">
                                            <Link to="/all-report"
                                                  className={isActive('/all-report') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faDollar}/></span>
                                                <span className="aside-menu-text" onClick={toggleSidebar}> Overall Report</span>
                                            </Link>
                                        </li>
                                        <li className="aside-menu-item">
                                            <Link to="/calendar" className={isActive('/calendar') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faCalendar}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={toggleSidebar}> Calendar</span>
                                            </Link>
                                        </li>

                                        <li className="aside-menu-item">
                                            <Link to="/subscription-history"
                                                  className={isActive('/subscription-history') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faDollar}/></span>
                                                <span className="aside-menu-text" onClick={toggleSidebar}> Subscription History</span>
                                            </Link>
                                        </li>

                                    </ul>
                                </div>
                            </aside>
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>
            </Container>


            <FloatingWhatsApp
                phoneNumber="+971551258910"
                accountName="Mehrab Hossain"
                avatar={avatar}
                allowEsc
                allowClickAway
                notification
                notificationSound
            />
        </>
    )
}
