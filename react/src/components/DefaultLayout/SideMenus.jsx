import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import {genRand} from "../../helper/HelperFunctions.js";

const SideMenus = ({isActive,toggleSubmenu,handleCloseSidebar,user, submenuTransactionVisible, submenuReportVisible, submenuBankAccVisible, submenuHrModuleVisible,submenuSettingsVisible, checkPermission }) => {
  const sideMenus = useMemo(() => [
    {
      hasMultiMenu: false,
      className: 'aside-menu-item',
      link: { to: '/dashboard', className: isActive('/dashboard') ? 'active' : '' },
      icon: faTachometerAlt,
      text: 'Dashboard',
      permission: 'dashboard'
    },
    // {
    //   hasMultiMenu: false,
    //   className: 'aside-menu-item',
    //   link: { to: '/users', className: isActive('/users') ? 'active' : '' },
    //   icon: faEdit,
    //   text: 'Manage Users',
    //   permission: 'admin'
    // },
    // {
    //   hasMultiMenu: false,
    //   className: 'aside-menu-item',
    //   link: { to: '/users/' + user.id, className: isActive('/users/' + user.id) ? 'active' : '' },
    //   icon: faEdit,
    //   text: 'Manage Profile',
    //   permission: 'user'
    // },
    {
      hasMultiMenu: false,
      className: 'aside-menu-item',
      link: { to: '/companies', className: isActive('/companies') ? 'active' : '' },
      icon: faBuildingFlag,
      text: 'Company',
      permission: 'company_view'
    },
    {
      hasMultiMenu: false,
      className: 'aside-menu-item',
      link: { to: '/sectors', className: isActive('/sectors') ? 'active' : '' },
      icon: faSection,
      text: 'Sectors',
      permission: 'sector_view'
    },
    {
      hasMultiMenu: false,
      className: 'aside-menu-item',
      link: { to: '/all-assets', className: isActive('/all-assets') ? 'active' : '' },
      icon: faTools,
      text: 'Assets',
      permission: 'assets_view'
    },
    {
      hasMultiMenu: false,
      className: 'aside-menu-item',
      link: { to: '/categories', className: isActive('/categories') ? 'active' : '' },
      icon: faListAlt,
      text: 'Categories',
      permission: 'category_view'
    },
    {
      hasMultiMenu: false,
      className: 'aside-menu-item',
      link: { to: '/my-tasks', className: isActive('/my-tasks') ? 'active' : '' },
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
          link: { to: '/investments', className: isActive('/investments') ? 'active' : '' },
          icon: faMoneyBillTrendUp,
          text: 'Investments',
          permission: 'investment_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/expenses', className: isActive('/expenses') ? 'active' : '' },
          icon: faMoneyBill,
          text: 'Expenses',
          permission: 'expense_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/incomes', className: isActive('/incomes') ? 'active' : '' },
          icon: faDollar,
          text: 'Incomes',
          permission: 'income_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/returns', className: isActive('/returns') ? 'active' : '' },
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
          link: { to: '/income-report', className: isActive('/income-report') ? 'active' : '' },
          icon: faChartBar,
          text: 'Income Report',
          permission: 'income_report_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/expense-report', className: isActive('/expense-report') ? 'active' : '' },
          icon: faChartPie,
          text: 'Expenses Report',
          permission: 'expense_report_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/investment-report', className: isActive('/investment-report') ? 'active' : '' },
          icon: faMoneyBillTrendUp,
          text: 'Investment Report',
          permission: 'investment_report_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/monthly-report', className: isActive('/monthly-report') ? 'active' : '' },
          icon: faChartLine,
          text: 'Monthly Report',
          permission: 'monthly_report_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/all-report', className: isActive('/all-report') ? 'active' : '' },
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
          link: { to: '/banks', className: isActive('/banks') ? 'active' : '' },
          icon: faCity,
          text: 'Banks',
          permission: 'bank_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/accounts', className: isActive('/accounts') ? 'active' : '' },
          icon: faMoneyCheck,
          text: 'Accounts',
          permission: 'account_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/bank-account/transfer-histories', className: isActive('/bank-account/transfer-histories') ? 'active' : '' },
          icon: faExchange,
          text: 'Balance Transfer',
          permission: 'balance_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/debts', className: isActive('/debts') ? 'active' : '' },
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
          link: { to: '/all-employee', className: isActive('/all-employee') ? 'active' : '' },
          icon: faUsers,
          text: 'Employee',
          permission: 'employee_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/payroll', className: isActive('/payroll') ? 'active' : '' },
          icon: faReceipt,
          text: 'Pay Rolls',
          permission: 'pay_roll_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/all-attendance', className: isActive('/all-attendance') ? 'active' : '' },
          icon: faCalendarCheck,
          text: 'Attendance',
          permission: 'attendance_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/all-tasks', className: isActive('/all-tasks') ? 'active' : '' },
          icon: faListAlt,
          text: 'Task List',
          permission: 'task_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/my-tasks', className: isActive('/my-tasks') ? 'active' : '' },
          icon: faListUl,
          text: 'My Task',
          permission: 'task_view'
        },
        {
          className: 'aside-menu-item',
          link: { to: '/hrms-reports', className: isActive('/hrms-reports') ? 'active' : '' },
          icon: faChartSimple,
          text: 'HR Reports',
          permission: 'hr_report_view'
        }
      ],
      submenuShowPermission: submenuHrModuleVisible,
    },
    {
        hasMultiMenu: false,
        className: 'aside-menu-item',
        link: { to: '/activity-logs', className: isActive('/activity-logs') ? 'active' : '' },
        icon: faList,
        text: 'Activity Logs',
        permission: 'admin'
    },
    {
        hasMultiMenu: false,
        className: 'aside-menu-item',
        link: { to: '/budgets', className: isActive('/budgets') ? 'active' : '' },
        icon: faWallet,
        text: 'Budgets',
        permission: 'budget_view'
    },
    {
        hasMultiMenu: false,
        className: 'aside-menu-item',
        link: { to: '/investment-plan', className: isActive('/investment-plan') ? 'active' : '' },
        icon: faExchange,
        text: 'Investment Plan',
        permission: 'investment_plan_view'
    },
    {
        hasMultiMenu: false,
        className: 'aside-menu-item',
        link: { to: '/calendar', className: isActive('/calendar') ? 'active' : '' },
        icon: faCalendar,
        text: 'Calendar',
        permission: 'calendar_view'
    },
    {
        hasMultiMenu: false,
        className: 'aside-menu-item',
        link: { to: '/subscription-history', className: isActive('/subscription-history') ? 'active' : '' },
        icon: faDollar,
        text: 'Subscription History',
        permission: 'admin'
    },
    {
        hasMultiMenu: true,
        mainMenu: {
          onClickToggleType: 'settings',
          icon: faSitemap,
          text: 'Settings',
          subIcon: submenuSettingsVisible ? '▲' : '▼'
        },
        subMenus: [
          {
            className: 'aside-menu-item',
            link: { to: '/settings', className: isActive('/settings') ? 'active' : '' },
            icon: faCog,
            text: 'Settings',
            permission: 'admin'
          },
          {
            className: 'aside-menu-item',
            link: { to: '/users', className: isActive('/users') ? 'active' : '' },
            icon: faUser,
            text: 'All Users',
            permission: 'admin'
          },
          {
            className: 'aside-menu-item',
            link: { to: '/roles', className: isActive('/roles') ? 'active' : '' },
            icon: faTasksAlt,
            text: 'Roles',
            permission: 'admin'
          }
        ],
        submenuShowPermission: submenuSettingsVisible,
      },
  ], [submenuTransactionVisible, submenuReportVisible, submenuBankAccVisible, submenuHrModuleVisible,submenuSettingsVisible]);

  return (
    <ul className="aside-menu">
      {sideMenus.map((menu, index) => {
        if (menu.hasMultiMenu) {
          return (
            <li className="aside-menu-item" key={index}>
              <a onClick={() => toggleSubmenu(menu.mainMenu.onClickToggleType)} className="dropdown-menu">
                <span className="aside-menu-icon">
                  <FontAwesomeIcon icon={menu.mainMenu.icon} />
                </span>
                <span className="aside-menu-text">{menu.mainMenu.text}</span>
                <span className="submenu-toggle-icon">{menu.mainMenu.subIcon}</span>
              </a>
              {menu.submenuShowPermission && (
                <ul className="submenu">
                  {menu.subMenus.map(submenu => {
                    return checkPermission(submenu.permission) && (
                      <li className="aside-menu-item" key={submenu.permission+genRand(8)} onClick={()=> handleCloseSidebar()}>
                        <Link to={submenu.link.to} className={submenu.link.className}>
                          <span className="aside-menu-icon">
                            <FontAwesomeIcon icon={submenu.icon} />
                          </span>
                          <span className="aside-menu-text">{submenu.text}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        } else {
          return checkPermission(menu.permission) && (
            <li className={menu.className} key={index} onClick={()=> handleCloseSidebar()}>
              <Link to={menu.link.to} className={menu.link.className}>
                <span className="aside-menu-icon">
                  <FontAwesomeIcon icon={menu.icon} />
                </span>
                <span className="aside-menu-text">{menu.text}</span>
              </Link>
            </li>
          );
        }
      })}
    </ul>
  );
};

export default SideMenus;
