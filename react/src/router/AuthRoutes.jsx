// AuthRoutes.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import LazyRoute from "./LazyRoute";
import DefaultLayout from "../Layout/DefaultLayout";
import NotFound from "../views/NotFound";

// ------------------ Lazy-loaded views ------------------

// Dashboard
const Dashboard = lazy(() => import("../views/Dashboard/Dashboard.jsx"));

// Company
const Companies = lazy(() => import("../views/Company/Companies.jsx"));

// Sectors
const Sectors = lazy(() => import("../views/Sectors/Sectors.jsx"));
const WelcomeScreen = lazy(() => import("../views/Sectors/WelcomeScreen.jsx"));

// Assets
const AssetsList = lazy(() => import("../views/Assets/AssetsList.jsx"));

// Categories
const Categories = lazy(() => import("../views/Categories/Categories.jsx"));

// Transactions
const IncomeList = lazy(() => import("../views/Transactions/Income/IncomeList.jsx"));
const ExpenseList = lazy(() => import("../views/Transactions/Expense/ExpenseList.jsx"));
const InvestmentList = lazy(() => import("../views/Transactions/Investment/InvestmentList.jsx"));
const ExpenseForm = lazy(() => import("../views/Transactions/Expense/ExpenseForm.jsx"));
const Return = lazy(() => import("../views/Return"));

// Reports
const ExpenseReport = lazy(() => import("../views/Reports/ExpenseReport.jsx"));
const IncomeReport = lazy(() => import("../views/Reports/IncomeReport.jsx"));
const InvestmentReport = lazy(() => import("../views/Reports/InvestmentReport"));
const OverallReport = lazy(() => import("../views/Reports/OverAllReport/OverallReport.jsx"));
const MonthlyReport = lazy(() => import("../views/Reports/MonthlyReport/MonthlyReport.jsx"));

// Bank & Accounts
const Banks = lazy(() => import("../views/Bank&Acc/Banks.jsx"));
const Accounts = lazy(() => import("../views/Bank&Acc/Accounts.jsx"));
const BalanceTransfers = lazy(() => import("../views/Bank&Acc/BalanceTransfers.jsx"));
const Debts = lazy(() => import("../views/Debts/DebtList.jsx"));
const ManageDebt = lazy(() => import("../views/Debts/ManageDebt.jsx"));
const WalletForm = lazy(() => import("../views/Wallets/WalletForm.jsx"));

// HRMS
const Employee = lazy(() => import("../views/HRMS/Employee/Employee.jsx"));
const Payrolls = lazy(() => import("../views/HRMS/Payrolls/Payrolls.jsx"));
const Attendance = lazy(() => import("../views/HRMS/Attandance/Attendance.jsx"));
const Task = lazy(() => import("../views/HRMS/Task/Task.jsx"));
const MyTasks = lazy(() => import("../views/HRMS/MyTasks.jsx"));
const HrmsReport = lazy(() => import("../views/HRMS/HrmsReport.jsx"));

// Budgets
const Budgets = lazy(() => import("../views/Budgets/Budgets.jsx"));

// Investment Plan
const InvestmentPlan = lazy(() => import("../views/InvestmentPlan/InvestmentPlan.jsx"));
const InvestmentPlanForm = lazy(() => import("../views/InvestmentPlan/InvestmentPlanForm.jsx"));

// Calendar
const Calendar = lazy(() => import("../views/Calender/Calendar.jsx"));

// Subscription History
const SubscriptionHistory = lazy(() => import("../views/SubscriptionHistory/SubscriptionHistory.jsx"));

// Activity Logs
const ActivityLogs = lazy(() => import("../views/ActivityLogs/ActivityLogs.jsx"));

// Settings
const Settings = lazy(() => import("../views/Settings/Settings/Settings.jsx"));
const UserList = lazy(() => import("../views/Settings/Users/UserList.jsx"));
const UserForm = lazy(() => import("../views/Settings/Users/UserForm.jsx"));
const Roles = lazy(() => import("../views/Settings/Role/Roles.jsx"));
const RoleForms = lazy(() => import("../views/Settings/Role/RoleForms.jsx"));

// ------------------ Auth Router ------------------
export const createAuthRouter = () => {
  return createBrowserRouter([
    {
      path: "/",
      element: <DefaultLayout />,
      children: [
        // Dashboard
        { path: "/", element: <Navigate to="/dashboard" replace /> },
        { path: "/dashboard", element: <LazyRoute><Dashboard /></LazyRoute> },

        // Company
        { path: "/companies", element: <LazyRoute><Companies /></LazyRoute> },

        // Sectors
        { path: "/sectors", element: <LazyRoute><Sectors /></LazyRoute> },
        { path: "/manage-welcome-screen/:id", element: <LazyRoute><WelcomeScreen key="WelcomeScreen" /></LazyRoute> },

        // Assets
        { path: "/all-assets", element: <LazyRoute><AssetsList /></LazyRoute> },

        // Categories
        { path: "/categories", element: <LazyRoute><Categories /></LazyRoute> },

        // Transactions
        { path: "/incomes", element: <LazyRoute><IncomeList /></LazyRoute> },
        { path: "/expenses", element: <LazyRoute><ExpenseList /></LazyRoute> },
        { path: "/expense/new", element: <LazyRoute><ExpenseForm key="expenseCreate" /></LazyRoute> },
        { path: "/expense/:id", element: <LazyRoute><ExpenseForm key="expenseUpdate" /></LazyRoute> },
        { path: "/returns", element: <LazyRoute><Return /></LazyRoute> },
        { path: "/investments", element: <LazyRoute><InvestmentList /></LazyRoute> },

        // Reports
        { path: "/income-report", element: <LazyRoute><IncomeReport key="incomeReportListing" /></LazyRoute> },
        { path: "/expense-report", element: <LazyRoute><ExpenseReport key="expenseReportListing" /></LazyRoute> },
        { path: "/investment-report", element: <LazyRoute><InvestmentReport /></LazyRoute> },
        { path: "/all-report", element: <LazyRoute><OverallReport /></LazyRoute> },
        { path: "/monthly-report", element: <LazyRoute><MonthlyReport /></LazyRoute> },

        // Bank & Accounts
        { path: "/banks", element: <LazyRoute><Banks /></LazyRoute> },
        { path: "/accounts", element: <LazyRoute><Accounts /></LazyRoute> },
        { path: "/bank-account/transfer-histories", element: <LazyRoute><BalanceTransfers /></LazyRoute> },
        { path: "/debts", element: <LazyRoute><Debts /></LazyRoute> },
        { path: "/manage-debt/:id", element: <LazyRoute><ManageDebt key="debtEdit" /></LazyRoute> },
        { path: "/wallet/:id", element: <LazyRoute><WalletForm key="walletEdit" /></LazyRoute> },

        // HRMS
        { path: "/all-employee", element: <LazyRoute><Employee /></LazyRoute> },
        { path: "/all-payrolls", element: <LazyRoute><Payrolls /></LazyRoute> },
        { path: "/all-attendance", element: <LazyRoute><Attendance /></LazyRoute> },
        { path: "/all-tasks", element: <LazyRoute><Task /></LazyRoute> },
        { path: "/my-tasks", element: <LazyRoute><MyTasks /></LazyRoute> },
        { path: "/hrms-reports", element: <LazyRoute><HrmsReport /></LazyRoute> },

        // Budgets
        { path: "/budgets", element: <LazyRoute><Budgets /></LazyRoute> },

        // Investment Plan
        { path: "/investment-plan", element: <LazyRoute><InvestmentPlan /></LazyRoute> },
        { path: "/investment-plan/new", element: <LazyRoute><InvestmentPlanForm key="investmentPlanCreate" /></LazyRoute> },
        { path: "/investment-plan/:id", element: <LazyRoute><InvestmentPlanForm key="investmentPlanUpdate" /></LazyRoute> },

        // Calendar
        { path: "/calendar", element: <LazyRoute><Calendar /></LazyRoute> },

        // Subscription History
        { path: "/subscription-history", element: <LazyRoute><SubscriptionHistory /></LazyRoute> },

        // Activity Logs
        { path: "/activity-logs", element: <LazyRoute><ActivityLogs /></LazyRoute> },

        // Settings
        { path: "/settings", element: <LazyRoute><Settings key="settings" /></LazyRoute> },
        { path: "/users", element: <LazyRoute><UserList /></LazyRoute> },
        { path: "/users/new", element: <LazyRoute><UserForm key="userCreate" /></LazyRoute> },
        { path: "/users/:id", element: <LazyRoute><UserForm key="userUpdate" /></LazyRoute> },
        { path: "/roles", element: <LazyRoute><Roles /></LazyRoute> },
        { path: "/roles/new", element: <LazyRoute><RoleForms key="rolesCreate" /></LazyRoute> },
        { path: "/role/:id", element: <LazyRoute><RoleForms key="rolesUpdate" /></LazyRoute> },
      ],
    },
    { path: "*", element: <NotFound /> },
  ]);
};
