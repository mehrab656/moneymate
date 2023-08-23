import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import axiosClient from "../axios-client.js";
import React, {useContext, useEffect} from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../public/custom.css'
import {
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
    faMoneyBill1Wave,
    faMoneyBillTrendUp,
    faMoneyCheck,
    faTachometerAlt,
    faWallet,
} from '@fortawesome/free-solid-svg-icons';
import {SettingsContext, SettingsProvider} from "../contexts/SettingsContext.jsx";
import Footer from "./Footer.jsx";

export default function DefaultLayout() {

    const {user, token, setUser, setToken, notification} = useStateContext();
    const navigate = useNavigate();

    const {applicationSettings, userRole, setUserRole} = useContext(SettingsContext);
    const {
        registration_type
    } = applicationSettings;

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }

        // Check if user data is available
        //if (!user.id) {
        axiosClient.get('/user').then(({data}) => {
            setUser(data);
        });
        //}
    }, []);

    //token, setUser, navigate, user.id was set those dependencies which was causing error.

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }

        // axiosClient.get('/user').then(({data}) => {
        //     setUser(data);
        // });

    }, [token, setUser]);

    const onLogout = (ev) => {
        ev.preventDefault();

        axiosClient
            .post('/logout')
            .then(() => {
                setUser({});
                setUserRole({});
                setToken(null);
            })
            .catch((error) => {
                // console.log('Error occurred', error);
            });
    };

    const location = useLocation();

    const isActive = (linkPath) => {
        return location.pathname === linkPath;
    };

    // Handle link click


    return (
        // <div className={`wrapper ${isCollapsed ? 'collapsed' : ''}`} id="defaultLayout">
        <div className={`wrapper`}
             id="wrappingContent">
            <aside className="wrapping-aside overflow-auto h-100">
                <div className="aside-content">
                    <ul className="aside-menu">
                        <li className="aside-menu-item">
                            <Link
                                to="/dashboard"
                                className={isActive('/dashboard') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faTachometerAlt}/></span>
                                <span className="aside-menu-text"> Dashboard </span>
                            </Link>
                        </li>

                        {userRole === 'admin' &&
                            <li className="aside-menu-item">
                                <Link
                                    to="/users"
                                    className={isActive('/users') ? 'active' : ''}>
                                    <span className="aside-menu-icon"><FontAwesomeIcon icon={faEdit}/></span>
                                    <span className="aside-menu-text"> Manage Users </span>
                                </Link>
                            </li>
                        }

                        {userRole === 'user' &&
                            <li className="aside-menu-item">
                                <Link
                                    to={'/users/' + user.id}
                                    className={isActive('/users') ? 'active' : ''}>
                                    <span className="aside-menu-icon"><FontAwesomeIcon icon={faEdit}/></span>
                                    <span className="aside-menu-text"> Manage Profile </span>
                                </Link>
                            </li>
                        }

                        <li className="aside-menu-item">
                            <Link
                                to="/categories"
                                className={isActive('/categories') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faListAlt}/></span>
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
                                <span className="aside-menu-text"> Bank Accounts</span>
                            </Link>
                        </li>

                        <li className="aside-menu-item">
                            <Link
                                to="/bank-account/transfer-histories"
                                className={isActive('/bank-account/transfer-histories') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faExchange}/></span>
                                <span className="aside-menu-text"> Balance Transfer</span>
                            </Link>
                        </li>

                        <li className="aside-menu-item">
                            <Link
                                to="/debts"
                                className={isActive('/debts') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faMailBulk}/></span>
                                <span className="aside-menu-text"> Debts/Loans</span>
                            </Link>
                        </li>
                        <li className="aside-menu-item">
                            <Link
                                to="/investments"
                                className={isActive('/investments') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faMoneyBillTrendUp}/></span>
                                <span className="aside-menu-text"> Investments</span>
                            </Link>
                        </li>
                        <li className="aside-menu-item">
                            <Link to="/investment-plan" className={isActive('/investment-plan') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faExchange}/></span>
                                <span className="aside-menu-text">Investment Plan</span>
                            </Link>
                        </li>
                        <li className="aside-menu-item">
                            <Link to="/incomes" className={isActive('/incomes') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faDollar}/></span>
                                <span className="aside-menu-text"> Incomes</span>
                            </Link>
                        </li>
                        <li className="aside-menu-item">
                            <Link to="/returns" className={isActive('/returns') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faDollar}/></span>
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
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faWallet}/></span>
                                <span className="aside-menu-text"> Budgets</span>
                            </Link>
                        </li>
                        <li className="aside-menu-item">
                            <Link to="/income-report" className={isActive('/income-report') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faChartBar}/></span>
                                <span className="aside-menu-text"> Income Report</span>
                            </Link>
                        </li>
                        <li className="aside-menu-item">
                            <Link to="/expense-report" className={isActive('/expense-report') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faChartPie}/></span>
                                <span className="aside-menu-text"> Expense Report</span>
                            </Link>
                        </li>
                        <li className="aside-menu-item">
                            <Link to="/investment-report" className={isActive('/investment-report') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faMoneyBillTrendUp}/></span>
                                <span className="aside-menu-text"> Investment Report</span>
                            </Link>
                        </li>

                        <li className="aside-menu-item">
                            <Link to="/all-report"
                                  className={isActive('/all-report') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faDollar}/></span>
                                <span className="aside-menu-text"> Overall Report</span>
                            </Link>
                        </li>
                        <li className="aside-menu-item">
                            <Link to="/calendar" className={isActive('/calendar') ? 'active' : ''}>
                                <span className="aside-menu-icon"><FontAwesomeIcon icon={faCalendar}/></span>
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
                                    <span className="aside-menu-icon"><FontAwesomeIcon icon={faCogs}/></span>
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
                        <div>

                        </div>

                        <div>
                            {user.name} &nbsp; &nbsp;
                            <a onClick={onLogout} className="btn-logout" href="#">Logout</a>
                        </div>
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
    )
}
