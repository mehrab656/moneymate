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
    faBell,
    faSitemap,
    faBuildingColumns,
    faHandHoldingDollar,
    faChartSimple,
    faChartLine,
    faCity,
    faBuildingFlag,
    faTasksAlt,
    faUser,
    faUsers,
    faReceipt,
    faCalendarCheck,
    faListUl, faMoneyBill1Wave, faSunPlantWilt, faList, faCog, faTools
} from '@fortawesome/free-solid-svg-icons';
import {SettingsContext, SettingsProvider} from "../contexts/SettingsContext.jsx";
import Footer from "./Footer.jsx";
import {Container, Row, Col, Button, Offcanvas} from 'react-bootstrap';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { compareDates} from "../helper/HelperFunctions.js";
import DropDownProperties from "./DropdownProperties";
import {useGetSectorsDataQuery} from "../api/slices/sectorSlice.js";
import {useGetFinancialReportDataQuery} from "../api/slices/accountSlice.js";
import Dropdown from "react-bootstrap/Dropdown";
import {notification} from "./ToastNotification.jsx";
import {Tooltip} from "react-tooltip";

export default function DefaultLayout() {

    const {user, token, setUser, setToken} = useStateContext();
    const navigate = useNavigate();
    const [financeStatus, setFinanceStatus] = useState({
        totalAccountBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
    })
    const [className, setClassName] = useState('');
    const [notifications, setNotifications] = useState([]);
    const {applicationSettings, userRole, setUserRole,checkPermission} = useContext(SettingsContext);
    let {
        default_currency
    } = applicationSettings;


    const {data: getSectorsData} = useGetSectorsDataQuery({token})
    const {data: getFinancialReportData} = useGetFinancialReportDataQuery({token})
    const [companies, setCompanies] = useState([]);
    const [currentCompany, setCurrentCompany] = useState()
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }

        //get total account balance
    }, [token]);

    const getCompanies = () => {
        axiosClient.get('companies').then(({data}) => {
            if (data.data.length > 0) {
                setCompanies(data.data);
            }
        })
    };

    const getCurrentCompany = () => {
        const currentCompanyID = localStorage.getItem("CURRENT_COMPANY");

        axiosClient.get(`/getCurrentCompany/${currentCompanyID}`).then(({data}) => {
            if (data.status === "success") {
                setCurrentCompany(data.data);
            }
        });
    }


    useEffect(() => {
        getCompanies();
        getCurrentCompany();
        if (getFinancialReportData) {
            setFinanceStatus(getFinancialReportData)
        }
    }, [getFinancialReportData])

    useEffect(() => {
        if (getSectorsData?.data) {
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
    }, [getSectorsData])


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
                setCurrentCompany({});
                setCompanies([]);
                localStorage.removeItem('ACCESS_TOKEN');
                localStorage.removeItem('ACCESS_USER');
                localStorage.removeItem('ACCESS_ROLE');
                localStorage.removeItem('CURRENT_COMPANY');
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

    const [submenuTransactionVisible, setSubmenuTransactionVisible] = useState(false);
    const [submenuReportVisible, setSubmenuReportVisible] = useState(false);
    const [submenuBankAccVisible, setSubmenuBankAccVisible] = useState(false);
    const [submenuSettingsVisible, setSubmenuSettingsVisible] = useState(false);
    const [submenuHrModuleVisible, setSubmenuHrModuleVisible] = useState(false);
    const toggleSubmenu = (type) => {
        if (type === 'transaction') {
            setSubmenuTransactionVisible(!submenuTransactionVisible);
        }
        if (type === 'report') {
            setSubmenuReportVisible(!submenuReportVisible);
        }
        if (type === 'bankAcc') {
            setSubmenuBankAccVisible(!submenuBankAccVisible);
        }
        if (type === 'settings') {
            setSubmenuSettingsVisible(!submenuSettingsVisible);
        }
        if (type === 'hr') {
            setSubmenuHrModuleVisible(!submenuHrModuleVisible);
        }
    };

    const switchCompany = (id) => {

        axiosClient
            .post(`/switch-company/${id}`)
            .then(({data}) => {
                if (data.status === "success") {
                    setCurrentCompany(data.data);
                    localStorage.setItem('CURRENT_COMPANY', id);
                }
                notification(data.status, data?.message, data?.description)
                window.location.reload();

            })
            .catch(error => {
                console.warn('Error occurred', error);
            });
    }

    const sideMenus = [
        {
            hasMultiMenu: false,
            className: 'aside-menu-item',
            link: {
                to: '/dashboard',
                className: isActive('/dashboard') ? 'active' : ''
            },
            icon: faTachometerAlt,
            text: 'Dashboard',
            permission: 'dashboard'
        },
        {
            hasMultiMenu: false,
            className: 'aside-menu-item',
            link: {
                to: '/companies',
                className: isActive('/companies') ? 'active' : ''
            },
            icon: faBuildingFlag,
            text: 'Company',
            permission: 'company_view'
        },
        {
            hasMultiMenu: false,
            className: 'aside-menu-item',
            link: {
                to: '/sectors',
                className: isActive('/sectors') ? 'active' : ''
            },
            icon: faSection,
            text: 'Sectors',
            permission: 'sector_view'
        },
        {
            hasMultiMenu: false,
            className: 'aside-menu-item',
            link: {
                to: '/all-assets',
                className: isActive('/all-assets') ? 'active' : ''
            },
            icon: faTools,
            text: 'Assets',
            permission: 'assets_view'
        },
        {
            hasMultiMenu: false,
            className: 'aside-menu-item',
            link: {
                to: '/categories',
                className: isActive('/categories') ? 'active' : ''
            },
            icon: faListAlt,
            text: 'Categories',
            permission: 'category_view'
        },
        {
            hasMultiMenu: false,
            className: 'aside-menu-item',
            link: {
                to: '/my-tasks',
                className: isActive('/my-tasks') ? 'active' : ''
            },
            icon: faListUl,
            text: 'My Task',
            permission: 'task_view'
        },
        {
            hasMultiMenu: true,
            mainMenu: {
                onClickToggleType: 'transaction',
                icon: faMoneyBill,
                text: 'Transactions',
                subIcon: submenuTransactionVisible ? '▲' : '▼'
            },
            subMenus: [
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/investments',
                        className: isActive('/investments') ? 'active' : ''
                    },
                    icon: faMoneyBillTrendUp,
                    text: 'Investments',
                    permission: 'investment_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/expenses',
                        className: isActive('/expenses') ? 'active' : ''
                    },
                    icon: faMoneyBill,
                    text: 'Expenses',
                    permission: 'expense_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/incomes',
                        className: isActive('/incomes') ? 'active' : ''
                    },
                    icon: faDollar,
                    text: 'Incomes',
                    permission: 'income_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/returns',
                        className: isActive('/returns') ? 'active' : ''
                    },
                    icon: faHandHoldingDollar,
                    text: 'Returns',
                    permission: 'return_view'
                },
            ],
            submenuShowPermission: submenuTransactionVisible,
        },
        {
            hasMultiMenu: true,
            mainMenu: {
                onClickToggleType: 'report',
                icon: faSitemap,
                text: 'Reports',
                subIcon: submenuReportVisible ? '▲' : '▼'
            },
            subMenus: [
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/income-report',
                        className: isActive('/income-report') ? 'active' : ''
                    },
                    icon: faChartBar,
                    text: 'Income Report',
                    permission: 'income_report_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/expense-report',
                        className: isActive('/expense-report') ? 'active' : ''
                    },
                    icon: faChartPie,
                    text: 'Expenses Report',
                    permission: 'expense_report_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/investment-report',
                        className: isActive('/investment-report') ? 'active' : ''
                    },
                    icon: faMoneyBillTrendUp,
                    text: 'Investment Report',
                    permission: 'investment_report_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/monthly-report',
                        className: isActive('/monthly-report') ? 'active' : ''
                    },
                    icon: faChartLine,
                    text: 'Monthly Report',
                    permission: 'monthly_report_view'
                },

                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/all-report',
                        className: isActive('/all-report') ? 'active' : ''
                    },
                    icon: faChartSimple,
                    text: 'Overall Report',
                    permission: 'overall_report_view'
                },
            ],
            submenuShowPermission: submenuReportVisible,
        },
        {
            hasMultiMenu: true,
            mainMenu: {
                onClickToggleType: 'bankAcc',
                icon: faBuildingColumns,
                text: 'Bank & Acc.',
                subIcon: submenuBankAccVisible ? '▲' : '▼'
            },
            subMenus: [
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/banks',
                        className: isActive('/banks') ? 'active' : ''
                    },
                    icon: faCity,
                    text: 'Banks',
                    permission: 'bank_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/accounts',
                        className: isActive('/accounts') ? 'active' : ''
                    },
                    icon: faMoneyCheck,
                    text: 'Accounts',
                    permission: 'account_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/bank-account/transfer-histories',
                        className: isActive('/bank-account/transfer-histories') ? 'active' : ''
                    },
                    icon: faExchange,
                    text: 'Balance Transfer',
                    permission: 'balance_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/debts',
                        className: isActive('/debts') ? 'active' : ''
                    },
                    icon: faMailBulk,
                    text: 'Debts/Loans',
                    permission: 'debt_view'
                }
            ],
            submenuShowPermission: submenuBankAccVisible,
        },
        {
            hasMultiMenu: true,
            mainMenu: {
                onClickToggleType: 'hr',
                icon: faSitemap,
                text: 'HRMS',
                subIcon: submenuHrModuleVisible ? '▲' : '▼'
            },
            subMenus: [
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/all-employee',
                        className: isActive('/all-employee') ? 'active' : ''
                    },
                    icon: faUsers,
                    text: 'Employee',
                    permission: 'employee_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/payroll',
                        className: isActive('/payroll') ? 'active' : ''
                    },
                    icon: faReceipt,
                    text: 'Pay Rolls',
                    permission: 'pay_roll_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/all-attendance',
                        className: isActive('/all-attendance') ? 'active' : ''
                    },
                    icon: faCalendarCheck,
                    text: 'Attendance',
                    permission: 'attendance_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/all-tasks',
                        className: isActive('/all-tasks') ? 'active' : ''
                    },
                    icon: faListAlt,
                    text: 'Task List',
                    permission: 'task_view'
                },

                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/my-tasks',
                        className: isActive('/my-tasks') ? 'active' : ''
                    },
                    icon: faListUl,
                    text: 'My Task',
                    permission: 'task_view'
                },
                {
                    className: 'aside-menu-item',
                    link: {
                        to: '/hrms-reports',
                        className: isActive('/hrms-reports') ? 'active' : ''
                    },
                    icon: faChartSimple,
                    text: 'Overall Report',
                    permission: 'hr_report_view'
                },
            ],
            submenuShowPermission: submenuHrModuleVisible,
        },
        {
            hasMultiMenu: false,
            className: 'aside-menu-item',
            link: {
                to: '/budgets',
                className: isActive('/budgets') ? 'active' : ''
            },
            icon: faMoneyBill1Wave,
            text: 'Budgets',
            permission: 'budget_view'
        },
        {
            hasMultiMenu: false,
            className: 'aside-menu-item',
            link: {
                to: '/investment-plan',
                className: isActive('/investment-plan') ? 'active' : ''
            },
            icon: faSunPlantWilt,
            text: 'Investment Plan',
            permission: 'investment_plan_view'
        },
        {
            hasMultiMenu: false,
            className: 'aside-menu-item',
            link: {
                to: '/calendar',
                className: isActive('/calendar') ? 'active' : ''
            },
            icon: faCalendar,
            text: 'Calendar',
            permission: 'calendar_view'
        },
        {
            hasMultiMenu: false,
            className: 'aside-menu-item',
            link: {
                to: '/subscription-history',
                className: isActive('/subscription-history') ? 'active' : ''
            },
            icon: faDollar,
            text: 'Subscription History',
            permission: 'admin_view'
        },
    ]

    return (
        <>
            <Container fluid>
                <Row>
                    {/* Sidebar Toggle Button */}
                    <Col xs={1} className="ml-2">
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
                                    {
                                        userRole !=='employee'&&
                                        <Dropdown>
                                            <Dropdown.Toggle variant="dark" id="dropdown-basic"
                                                             className={"current-company-name"}
                                                             data-tooltip-id='switch-company'
                                                             data-tooltip-content={"Switch to another company "}>
                                                {currentCompany ? currentCompany.name : 'company'}
                                            </Dropdown.Toggle>
                                            <Tooltip id='switch-company'/>
                                            <Dropdown.Menu>
                                                {
                                                    companies.length > 0 &&
                                                    companies.map((company) => (
                                                        <Dropdown.Item key={company.uid}
                                                                       active={currentCompany?.name === company.name}
                                                                       onClick={() => switchCompany(company.id)}
                                                                       className={"company-list-dropdown"}>{company.name}</Dropdown.Item>
                                                    ))
                                                }
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    }
                                    <hr/>
                                    <ul className="aside-menu">
                                        {sideMenus.map((menu,index) => {
                                            if (menu.hasMultiMenu !== true) {
                                                return <>
                                                    {checkPermission(menu.permission) &&
                                                        <li className="aside-menu-item" key={index+menu.permission}>
                                                            <Link
                                                                to={menu.link.to}
                                                                className={menu.link.className}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={menu.icon}/></span>
                                                                <span className="aside-menu-text"> {menu.text} </span>
                                                            </Link>
                                                        </li>
                                                    }
                                                </>
                                            } else {
                                                return <>
                                                    <li className="aside-menu-item">
                                                        <a onClick={() => toggleSubmenu(menu.mainMenu.onClickToggleType)}
                                                           className='dropdown-menu'>
                                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                                    icon={menu.mainMenu.icon}/></span>
                                                            <span
                                                                className="aside-menu-text">{menu.mainMenu.text}</span>
                                                            <span
                                                                className="submenu-toggle-icon">{menu.mainMenu.subIcon}</span>
                                                        </a>
                                                        {
                                                            menu.submenuShowPermission && (
                                                                <ul className="submenu" key={'ul-'+menu.permission}>
                                                                    {menu.subMenus.map(submenu => {
                                                                        return <>
                                                                            {
                                                                                checkPermission(submenu.permission) &&
                                                                                <li className="aside-menu-item" key={submenu.permission}>
                                                                                    <Link to={submenu.link.to}
                                                                                          className={submenu.link.className}>
                                                                                        <span
                                                                                            className="aside-menu-icon"><FontAwesomeIcon
                                                                                            icon={submenu.icon}/></span>
                                                                                        <span
                                                                                            className="aside-menu-text"> {submenu.text}</span>
                                                                                    </Link>
                                                                                </li>
                                                                            }
                                                                        </>
                                                                    })}
                                                                </ul>
                                                            )
                                                        }
                                                    </li>
                                                </>
                                            }
                                        })}

                                        {userRole === 'admin' &&
                                            <>
                                                <li className="aside-menu-item">
                                                    <Link to="/activity-logs"
                                                          className={isActive('/activity-logs') ? 'active' : ''}>
                                                  <span className="aside-menu-icon"><FontAwesomeIcon
                                                      icon={faList}/></span>
                                                        <span className="aside-menu-text">Activity Logs</span>
                                                    </Link>
                                                </li>
                                                <li className="aside-menu-item">
                                                    <a
                                                        className='dropdown-menu'
                                                        onClick={() => toggleSubmenu('settings')}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faCogs}/></span>
                                                        <span className="aside-menu-text">Settings</span>
                                                        <span
                                                            className="submenu-toggle-icon">{submenuSettingsVisible ? '▲' : '▼'}</span>

                                                    </a>
                                                    {submenuSettingsVisible && (
                                                        <ul className="submenu">
                                                            <li className="aside-menu-item">
                                                                <Link to="/application-settings"
                                                                      className={isActive('/application-settings') ? 'active' : ''}>
                                                                    <span className="aside-menu-icon"><FontAwesomeIcon
                                                                        icon={faCog}/></span>
                                                                    <span className="aside-menu-text">Application Settings </span>
                                                                </Link>
                                                            </li>
                                                            <li className="aside-menu-item">
                                                                <Link to="/users"
                                                                      className={isActive('/users') ? 'active' : ''}>
                                                                    <span className="aside-menu-icon"><FontAwesomeIcon
                                                                        icon={faUser}/></span>
                                                                    <span className="aside-menu-text"> All Users </span>
                                                                </Link>
                                                            </li>

                                                            <li className="aside-menu-item">
                                                                <Link
                                                                    to="/roles"
                                                                    className={isActive('/roles') ? 'active' : ''}>
                                                <span className="aside-menu-icon">
                                                    <FontAwesomeIcon icon={faTasksAlt}/></span>
                                                                    <span className="aside-menu-text"> Roles </span>
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    )}
                                                </li>
                                            </>
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
                                                <NavDropdown.Header className={'bg-primary p-3'}></NavDropdown.Header>
                                                {
                                                    notifications.map(item => {
                                                        if (item.type === 'internet') {
                                                            return (
                                                                <li key={'internet-' + item.id}>
                                                                    <NavDropdown.Item href="#action/3.1"
                                                                                      key={item.id}>
                                                                        {item.name + ' ' + item.type + ' bill date ' + item.internet_billing_date}
                                                                    </NavDropdown.Item>
                                                                    <NavDropdown.Divider/>
                                                                </li>
                                                            )
                                                        } else {
                                                            return (
                                                                <li key={'electricity-' + item.id}>
                                                                    <NavDropdown.Item href="#action/3.1">
                                                                        {item.name + ' ' + item.type + ' bill date ' + item.el_billing_date}</NavDropdown.Item>
                                                                    <NavDropdown.Divider/>
                                                                </li>
                                                            )
                                                        }
                                                    })
                                                }
                                            </NavDropdown>

                                            {/*user Sections */}
                                            <NavDropdown title={user?.username ?? 'User'} id="basic-nav-dropdown">
                                                <NavDropdown.Item href="#action/3.1">Profile</NavDropdown.Item>
                                                <NavDropdown.Item href="application-settings">Activity
                                                    Log</NavDropdown.Item>
                                                {userRole === 'admin' &&
                                                    <NavDropdown.Item>
                                                        <Link className={"header-dropdown-item"}
                                                              to="/application-settings">
                                                            Application Settings
                                                        </Link>
                                                    </NavDropdown.Item>
                                                }
                                                <NavDropdown.Divider/>
                                                <NavDropdown.Item onClick={onLogout}>
                                                    {/*<a onClick={onLogout} href="#"></a>*/}
                                                    Logout
                                                </NavDropdown.Item>
                                            </NavDropdown>

                                        </header>
                                    <main className="flex-grow-1 py-2">
                                        <Outlet/>

                                        {/*{notification &&*/}
                                        {/*    <div className="notification">*/}
                                        {/*        {notification}*/}
                                        {/*    </div>*/}
                                        {/*}*/}
                                    </main>
                                    <SettingsProvider>

                                    </SettingsProvider>
                                    <Footer/>
                                </div>
                            </div>

                        </div>
                    </Col>
                </Row>

                {/* Off canvas Sidebar */}
                <Offcanvas show={showSidebar} onHide={toggleSidebar} placement="start">

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
                                        {
                                            checkPermission('assets_view') &&
                                            <li className="aside-menu-item">
                                                <Link to="/all-assets"
                                                      className={isActive('/all-assets') ? 'active' : ''}>
                                                <span className="aside-menu-icon">
                                                    <FontAwesomeIcon icon={faBuildingFlag}/></span>
                                                    <span className="aside-menu-text"> Assets </span>
                                                </Link>
                                            </li>
                                        }
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
                                            <a
                                                className='dropdown-menu'>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faMoneyBill}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={() => toggleSubmenu('transaction')}>Transactions</span>
                                                <span
                                                    className="submenu-toggle-icon">{submenuTransactionVisible ? '▲' : '▼'}</span>

                                            </a>
                                            {submenuTransactionVisible && (
                                                <ul className="submenu">
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
                                                        <Link to="/expenses"
                                                              className={isActive('/expenses') ? 'active' : ''}>
                                                            <span className="aside-menu-icon"><FontAwesomeIcon
                                                                icon={faMoneyBill}/></span>
                                                            <span className="aside-menu-text"> Expenses</span>
                                                        </Link>
                                                    </li>
                                                    <li className="aside-menu-item">
                                                        <Link to="/incomes"
                                                              className={isActive('/incomes') ? 'active' : ''}>
                                                            <span className="aside-menu-icon"><FontAwesomeIcon
                                                                icon={faDollar}/></span>
                                                            <span className="aside-menu-text"> Incomes</span>
                                                        </Link>
                                                    </li>
                                                    <li className="aside-menu-item">
                                                        <Link to="/returns"
                                                              className={isActive('/returns') ? 'active' : ''}>
                                                            <span className="aside-menu-icon"><FontAwesomeIcon
                                                                icon={faHandHoldingDollar}/></span>
                                                            <span className="aside-menu-text"> Returns</span>
                                                        </Link>
                                                    </li>

                                                </ul>
                                            )}
                                        </li>
                                        <li className="aside-menu-item">
                                            <a
                                                className='dropdown-menu'>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faSitemap}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={() => toggleSubmenu('report')}>Reports</span>
                                                <span
                                                    className="submenu-toggle-icon">{submenuReportVisible ? '▲' : '▼'}</span>

                                            </a>
                                            {submenuReportVisible && (
                                                <ul className="submenu">
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
                                                        <Link to="/monthly-report"
                                                              className={isActive('/monthly-report') ? 'active' : ''}>
                                                            <span className="aside-menu-icon"><FontAwesomeIcon
                                                                icon={faChartLine}/></span>
                                                            <span className="aside-menu-text"> Monthly Report</span>
                                                        </Link>
                                                    </li>
                                                    <li className="aside-menu-item">
                                                        <Link to="/all-report"
                                                              className={isActive('/all-report') ? 'active' : ''}>
                                                            <span className="aside-menu-icon"><FontAwesomeIcon
                                                                icon={faChartSimple}/></span>
                                                            <span className="aside-menu-text"> Overall Report</span>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>
                                        <li className="aside-menu-item">
                                            <a
                                                className='dropdown-menu'>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faBuildingColumns}/></span>
                                                <span className="aside-menu-text"
                                                      onClick={() => toggleSubmenu('bankAcc')}>Bank & Acc.</span>
                                                <span
                                                    className="submenu-toggle-icon">{submenuBankAccVisible ? '▲' : '▼'}</span>

                                            </a>
                                            {submenuBankAccVisible && (
                                                <ul className="submenu">
                                                    <li className="aside-menu-item">
                                                        <Link
                                                            to="/banks"
                                                            className={isActive('/banks') ? 'active' : ''}>
                                                            <span className="aside-menu-icon"><FontAwesomeIcon
                                                                icon={faCity}/></span>
                                                            <span className="aside-menu-text"> Banks</span>
                                                        </Link>
                                                    </li>
                                                    <li className="aside-menu-item">
                                                        <Link
                                                            to="/accounts"
                                                            className={isActive('/accounts') ? 'active' : ''}>
                                                            <span className="aside-menu-icon"><FontAwesomeIcon
                                                                icon={faMoneyCheck}/></span>
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
                                                </ul>
                                            )}
                                        </li>

                                        <li className="aside-menu-item">
                                            <Link to="/budgets" className={isActive('/budgets') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faWallet}/></span>
                                                <span className="aside-menu-text"> Budgets</span>
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
                                            <Link to="/calendar" className={isActive('/calendar') ? 'active' : ''}>
                                                <span className="aside-menu-icon"><FontAwesomeIcon
                                                    icon={faCalendar}/></span>
                                                <span className="aside-menu-text"> Calendar</span>
                                            </Link>
                                        </li>

                                        {userRole === 'admin' &&
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
    )
}
