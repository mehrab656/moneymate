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

export const getSideMenus = (isActive, submenuVisible, currentMenu) => [
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
    link: { to: '/categories', className: isActive('/categories') ? 'active' : '' },
    icon: faListAlt,
    text: 'Categories',
    permission: 'category_view'
  },
  {
    hasMultiMenu: false,
    className: 'aside-menu-item',
    link: { to: '/all-assets', className: isActive('/all-assets') ? 'active' : '' },
    icon: faTools,
    text: 'Assets',
    permission: 'assets_view'
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
      { link: { to: '/transactions?menu=investments', className: (isActive('/transactions') && currentMenu === 'investments') || isActive('/investments') ? 'active' : '' }, icon: faMoneyBillTrendUp, text: 'Investments', permission: 'investment_view' },
      { link: { to: '/transactions?menu=investment-plan', className: (isActive('/transactions') && currentMenu === 'investment-plan') || isActive('/investment-plan') ? 'active' : '' }, icon: faExchange, text: 'Investment Plan', permission: 'investment_plan_view' },
      { link: { to: '/transactions?menu=expenses', className: (isActive('/transactions') && currentMenu === 'expenses') || isActive('/expenses') ? 'active' : '' }, icon: faMoneyBill, text: 'Expenses', permission: 'expense_view' },
      { link: { to: '/transactions?menu=incomes', className: (isActive('/transactions') && currentMenu === 'incomes') || isActive('/incomes') ? 'active' : '' }, icon: faDollar, text: 'Incomes', permission: 'income_view' },
      { link: { to: '/transactions?menu=returns', className: (isActive('/transactions') && currentMenu === 'returns') || isActive('/returns') ? 'active' : '' }, icon: faHandHoldingDollar, text: 'Returns', permission: 'return_view' },
      { link: { to: '/transactions?menu=budgets', className: (isActive('/transactions') && currentMenu === 'budgets') || isActive('/budgets') ? 'active' : '' }, icon: faWallet, text: 'Budgets', permission: 'budget_view' }
    ],
    submenuShowPermission: submenuVisible.transaction
  },
  {
    hasMultiMenu: true,
    mainMenu: { onClickToggleType: 'report', icon: faSitemap, text: 'Reports', subIcon: submenuVisible.report ? '▲' : '▼' },
    subMenus: [
      { link: { to: '/reports?menu=income-report', className: (isActive('/reports') && currentMenu === 'income-report') || isActive('/income-report') ? 'active' : '' }, icon: faChartBar, text: 'Income Report', permission: 'income_report_view' },
      { link: { to: '/reports?menu=expense-report', className: (isActive('/reports') && currentMenu === 'expense-report') || isActive('/expense-report') ? 'active' : '' }, icon: faChartPie, text: 'Expenses Report', permission: 'expense_report_view' },
      { link: { to: '/reports?menu=investment-report', className: (isActive('/reports') && currentMenu === 'investment-report') || isActive('/investment-report') ? 'active' : '' }, icon: faMoneyBillTrendUp, text: 'Investment Report', permission: 'investment_report_view' },
      { link: { to: '/reports?menu=monthly-report', className: (isActive('/reports') && currentMenu === 'monthly-report') || isActive('/monthly-report') ? 'active' : '' }, icon: faChartLine, text: 'Monthly Report', permission: 'monthly_report_view' },
      { link: { to: '/reports?menu=all-report', className: (isActive('/reports') && currentMenu === 'all-report') || isActive('/all-report') ? 'active' : '' }, icon: faChartSimple, text: 'Overall Report', permission: 'overall_report_view' }
    ],
    submenuShowPermission: submenuVisible.report
  },
  {
    hasMultiMenu: true,
    mainMenu: { onClickToggleType: 'bankAccount', icon: faBuildingColumns, text: 'Bank & Acc.', subIcon: submenuVisible.bankAccount ? '▲' : '▼' },
    subMenus: [
      { link: { to: '/bank-account?menu=banks', className: (isActive('/bank-account') && currentMenu === 'banks') || isActive('/banks') ? 'active' : '' }, icon: faCity, text: 'Banks', permission: 'bank_view' },
      { link: { to: '/bank-account?menu=accounts', className: (isActive('/bank-account') && currentMenu === 'accounts') || isActive('/accounts') ? 'active' : '' }, icon: faMoneyCheck, text: 'Accounts', permission: 'account_view' },
      { link: { to: '/bank-account?menu=balance-transfer', className: (isActive('/bank-account') && currentMenu === 'balance-transfer') || isActive('/bank-account/transfer-histories') ? 'active' : '' }, icon: faExchange, text: 'Balance Transfer', permission: 'balance_view' },
      { link: { to: '/bank-account?menu=debts', className: (isActive('/bank-account') && currentMenu === 'debts') || isActive('/debts') ? 'active' : '' }, icon: faMailBulk, text: 'Debts/Loans', permission: 'debt_view' }
    ],
    submenuShowPermission: submenuVisible.bankAccount
  },
  {
    hasMultiMenu: true,
    mainMenu: { onClickToggleType: 'hrModule', icon: faSitemap, text: 'HRMS', subIcon: submenuVisible.hrModule ? '▲' : '▼' },
    subMenus: [
      { link: { to: '/hrms?menu=employee', className: (isActive('/hrms') && currentMenu === 'employee') || isActive('/all-employee') ? 'active' : '' }, icon: faUsers, text: 'Employee', permission: 'employee_view' },
      { link: { to: '/hrms?menu=payroll', className: (isActive('/hrms') && currentMenu === 'payroll') || isActive('/payroll') ? 'active' : '' }, icon: faReceipt, text: 'Pay Rolls', permission: 'pay_roll_view' },
      { link: { to: '/hrms?menu=attendance', className: (isActive('/hrms') && currentMenu === 'attendance') || isActive('/all-attendance') ? 'active' : '' }, icon: faCalendarCheck, text: 'Attendance', permission: 'attendance_view' },
      { link: { to: '/hrms?menu=task-list', className: (isActive('/hrms') && currentMenu === 'task-list') || isActive('/all-tasks') ? 'active' : '' }, icon: faListAlt, text: 'Task List', permission: 'task_view' },
      { link: { to: '/hrms?menu=my-task', className: (isActive('/hrms') && currentMenu === 'my-task') || isActive('/my-tasks') ? 'active' : '' }, icon: faListUl, text: 'My Task', permission: 'task_view' },
      { link: { to: '/hrms?menu=hr-reports', className: (isActive('/hrms') && currentMenu === 'hr-reports') || isActive('/hrms-reports') ? 'active' : '' }, icon: faChartSimple, text: 'HR Reports', permission: 'hr_report_view' }
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
      { link: { to: '/settings?menu=settings', className: (isActive('/settings') && (!currentMenu || currentMenu === 'settings')) ? 'active' : '' }, icon: faCog, text: 'Settings', permission: 'admin' },
      { link: { to: '/settings?menu=users', className: (isActive('/settings') && currentMenu === 'users') || isActive('/users') ? 'active' : '' }, icon: faUser, text: 'All Users', permission: 'admin' },
      { link: { to: '/settings?menu=roles', className: (isActive('/settings') && currentMenu === 'roles') || isActive('/roles') ? 'active' : '' }, icon: faTasksAlt, text: 'Roles', permission: 'admin' }
    ],
    submenuShowPermission: submenuVisible.settings
  }
];
