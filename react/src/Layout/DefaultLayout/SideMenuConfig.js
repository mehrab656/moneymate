// SideMenuConfig.js
import {
  faTachometerAlt,
  faBuildingFlag,
  faSection,
  faTools,
  faListAlt,
  faListUl,
  faMoneyBill,
  faMoneyBillTrendUp,
  faDollar,
  faHandHoldingDollar,
  faSitemap,
  faChartBar,
  faChartPie,
  faChartLine,
  faChartSimple,
  faBuildingColumns,
  faCity,
  faMoneyCheck,
  faExchange,
  faMailBulk,
  faUsers,
  faReceipt,
  faCalendarCheck,
  faList,
  faWallet,
  faCog,
  faUser,
  faTasksAlt,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';

export const getSideMenus = (isActive, submenuVisible) => [
  {
    hasMultiMenu: false,
    className: 'aside-menu-item',
    link: { to: '/dashboard', className: isActive('/dashboard') ? 'active' : '' },
    icon: faTachometerAlt,
    text: 'Dashboard',
    permission: 'dashboard'
  },
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
  // {
  //   hasMultiMenu: false,
  //   className: 'aside-menu-item',
  //   link: { to: '/my-tasks', className: isActive('/my-tasks') ? 'active' : '' },
  //   icon: faListUl,
  //   text: 'My Task',
  //   permission: 'task_view'
  // },
  {
    hasMultiMenu: true,
    mainMenu: { onClickToggleType: 'transaction', icon: faMoneyBill, text: 'Transactions', subIcon: submenuVisible.transaction ? '▲' : '▼' },
    subMenus: [
      { link: { to: '/investments', className: isActive('/investments') ? 'active' : '' }, icon: faMoneyBillTrendUp, text: 'Investments', permission: 'investment_view' },
      { link: { to: '/expenses', className: isActive('/expenses') ? 'active' : '' }, icon: faMoneyBill, text: 'Expenses', permission: 'expense_view' },
      { link: { to: '/incomes', className: isActive('/incomes') ? 'active' : '' }, icon: faDollar, text: 'Incomes', permission: 'income_view' },
      { link: { to: '/returns', className: isActive('/returns') ? 'active' : '' }, icon: faHandHoldingDollar, text: 'Returns', permission: 'return_view' }
    ],
    submenuShowPermission: submenuVisible.transaction
  },
  {
    hasMultiMenu: true,
    mainMenu: { onClickToggleType: 'report', icon: faSitemap, text: 'Reports', subIcon: submenuVisible.report ? '▲' : '▼' },
    subMenus: [
      { link: { to: '/income-report', className: isActive('/income-report') ? 'active' : '' }, icon: faChartBar, text: 'Income Report', permission: 'income_report_view' },
      { link: { to: '/expense-report', className: isActive('/expense-report') ? 'active' : '' }, icon: faChartPie, text: 'Expenses Report', permission: 'expense_report_view' },
      { link: { to: '/investment-report', className: isActive('/investment-report') ? 'active' : '' }, icon: faMoneyBillTrendUp, text: 'Investment Report', permission: 'investment_report_view' },
      { link: { to: '/monthly-report', className: isActive('/monthly-report') ? 'active' : '' }, icon: faChartLine, text: 'Monthly Report', permission: 'monthly_report_view' },
      { link: { to: '/all-report', className: isActive('/all-report') ? 'active' : '' }, icon: faChartSimple, text: 'Overall Report', permission: 'overall_report_view' }
    ],
    submenuShowPermission: submenuVisible.report
  },
  {
    hasMultiMenu: true,
    mainMenu: { onClickToggleType: 'bankAccount', icon: faBuildingColumns, text: 'Bank & Acc.', subIcon: submenuVisible.bankAccount ? '▲' : '▼' },
    subMenus: [
      { link: { to: '/banks', className: isActive('/banks') ? 'active' : '' }, icon: faCity, text: 'Banks', permission: 'bank_view' },
      { link: { to: '/accounts', className: isActive('/accounts') ? 'active' : '' }, icon: faMoneyCheck, text: 'Accounts', permission: 'account_view' },
      { link: { to: '/bank-account/transfer-histories', className: isActive('/bank-account/transfer-histories') ? 'active' : '' }, icon: faExchange, text: 'Balance Transfer', permission: 'balance_view' },
      { link: { to: '/debts', className: isActive('/debts') ? 'active' : '' }, icon: faMailBulk, text: 'Debts/Loans', permission: 'debt_view' }
    ],
    submenuShowPermission: submenuVisible.bankAccount
  },
  {
    hasMultiMenu: true,
    mainMenu: { onClickToggleType: 'hrModule', icon: faSitemap, text: 'HRMS', subIcon: submenuVisible.hrModule ? '▲' : '▼' },
    subMenus: [
      { link: { to: '/all-employee', className: isActive('/all-employee') ? 'active' : '' }, icon: faUsers, text: 'Employee', permission: 'employee_view' },
      { link: { to: '/payroll', className: isActive('/payroll') ? 'active' : '' }, icon: faReceipt, text: 'Pay Rolls', permission: 'pay_roll_view' },
      { link: { to: '/all-attendance', className: isActive('/all-attendance') ? 'active' : '' }, icon: faCalendarCheck, text: 'Attendance', permission: 'attendance_view' },
      { link: { to: '/all-tasks', className: isActive('/all-tasks') ? 'active' : '' }, icon: faListAlt, text: 'Task List', permission: 'task_view' },
      { link: { to: '/my-tasks', className: isActive('/my-tasks') ? 'active' : '' }, icon: faListUl, text: 'My Task', permission: 'task_view' },
      { link: { to: '/hrms-reports', className: isActive('/hrms-reports') ? 'active' : '' }, icon: faChartSimple, text: 'HR Reports', permission: 'hr_report_view' }
    ],
    submenuShowPermission: submenuVisible.hrModule
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
    mainMenu: { onClickToggleType: 'settings', icon: faSitemap, text: 'Settings', subIcon: submenuVisible.settings ? '▲' : '▼' },
    subMenus: [
      { link: { to: '/settings', className: isActive('/settings') ? 'active' : '' }, icon: faCog, text: 'Settings', permission: 'admin' },
      { link: { to: '/users', className: isActive('/users') ? 'active' : '' }, icon: faUser, text: 'All Users', permission: 'admin' },
      { link: { to: '/roles', className: isActive('/roles') ? 'active' : '' }, icon: faTasksAlt, text: 'Roles', permission: 'admin' }
    ],
    submenuShowPermission: submenuVisible.settings
  }
];
