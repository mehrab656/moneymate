import {createBrowserRouter, Navigate} from "react-router-dom";
import Login from "./views/Login.jsx";
import Signup from "./views/Signup.jsx";
import Users from "./views/User/Users.jsx";
import NotFound from "./views/NotFound.jsx";
import DefaultLayout from "./components/DefaultLayout.jsx";
import GuestLayout from "./components/GuestLayout.jsx";
import Dashboard from "./views/Dashboard.jsx";
import UserForm from "./views/User/UserForm.jsx";
import Accounts from "./views/Accounts.jsx";
import Categories from "./views/Categories.jsx";
import Incomes from "./views/Incomes.jsx";
import Expenses from "./views/Expenses.jsx";
import IncomeForm from "./views/IncomeForm.jsx";
import ExpenseForm from "./views/ExpenseForm.jsx";
import ApplicationSettingsForm from "./views/ApplicationSettingsForm.jsx";
import Banks from "./views/Banks.jsx";
import Budgets from "./views/Budgets.jsx";
import BudgetForm from "./views/BudgetForm.jsx";
import ExpenseReport from "./views/ExpenseReport.jsx";
import IncomeReport from "./views/IncomeReport.jsx";
import WalletForm from "./views/WalletForm.jsx";
import Debts from "./views/Debts.jsx";
import ManageDebt from "./views/ManageDebt.jsx";
import Transfers from "./views/Transfers.jsx";
import Calendar from "./views/Calendar.jsx";
import SubscriptionHistory from "./views/SubscriptionHistory.jsx";
import WarningMessage from "./views/WarningMessage.jsx";
import InvestmentForm from "./views/InvestmentForm.jsx";
import Investment from "./views/Investment.jsx";
import InvestmentReport from "./views/InvestmentReport";
import Return from "./views/Return";
import InvestmentPlan from "./views/InvestmentPlan.jsx";
import InvestmentPlanForm from "./views/InvestmentPlanForm.jsx";
import OverallReport from "./views/OverallReport";
import Sectors from "./views/Sectors/Sectors.jsx";
import SectorCreate from "./views/Sectors/SectorCreate.jsx";
import MonthlyReport from "./views/MonthlyReport.jsx";
import ActivityLogs from "./views/ActivityLogs/ActivityLogs.jsx";
import Roles from "./views/Role/Roles.jsx";
import RoleForms from "./views/Role/RoleForms.jsx";
import Companies from "./views/Company/Companies.jsx";
import CompanyCreate from "./views/Company/CompanyCreate.jsx";
import CompanySignUp from "./views/Company/CompanySignUp.jsx";
import AssetsList from "./views/CompanyAssets/AssetsList.jsx";
import AddNewAssets from "./views/CompanyAssets/AddNewAssets.jsx";
import Employee from "./views/HRMS/Employee/Employee.jsx";
import Payrolls from "./views/HRMS/Payrolls/Payrolls.jsx";
import Attendance from "./views/HRMS/Attandance/Attendance.jsx";
import Task from "./views/HRMS/Task/Task.jsx";
import UserList from "./views/User/UserList.jsx";
import MyTasks from "./views/HRMS/Task/MyTasks.jsx";

const router = createBrowserRouter([

    {
        path: '/',
        element: <DefaultLayout/>,
        children: [
            {
                path: '/',
                element: <Navigate to="/dashboard"/> // Default route after login
            },
            {
                path: '/dashboard',
                element: <Dashboard/>
            },
            {
                path: '/users',
                element: <UserList/>
            },
            {
                path: '/sectors',
                element: <Sectors/>
            },
            {
                path: '/all-assets',
                element: <AssetsList/>
            },
            {
                path: '/asset/new',
                element: <AddNewAssets key="AssetCreate"/>
            },
            {
                path: '/asset/update/:id',
                element: <AddNewAssets key="AssetCreate"/>
            },
            {
                path: '/sector/new',
                element: <SectorCreate key="SectorCreate"/>
            },
            {
                path: '/sector/update/:id',
                element: <SectorCreate key="SectorCreate"/>
            },
            {
                path: '/categories',
                element: <Categories/>
            },
            {
                path: '/returns',
                element: <Return/>
            },
            {
                path: '/incomes',
                element: <Incomes/>
            },
            {
                path: '/income/new',
                element: <IncomeForm key="incomeCreate"/>
            },
            {
                path: '/income/:id',
                element: <IncomeForm key="incomeUpdate"/>
            },
            {
                path: '/expenses',
                element: <Expenses/>
            },
            {
                path: '/expense/new',
                element: <ExpenseForm key="expenseCreate"/>
            },
            {
                path: '/expense/:id',
                element: <ExpenseForm key="expenseUpdate"/>
            },
            {
                path: '/banks',
                element: <Banks/>
            },

            {
                path: '/accounts',
                element: <Accounts/>
            },

            {
                path: '/debts',
                element: <Debts/>
            },
            {
                path: '/investments',
                element: <Investment/>
            },
            {
                path: '/investments/new',
                element: <InvestmentForm key="investmentCreate"/>
            },
            {
                path: '/investment/:id',
                element: <InvestmentForm key="investmentUpdate"/>
            },
            {
                path: '/investment-plan',
                element: <InvestmentPlan/>
            },
            {
                path: '/investment-plan/new',
                element: <InvestmentPlanForm key="investmentPlanCreate"/>
            },
            {
                path: '/investment-plan/:id',
                element: <InvestmentPlanForm key="investmentPlanUpdate"/>
            },
            {
                path: '/manage-debt/:id',
                element: <ManageDebt key="debtEdit"/>

            },
            {
                path: '/wallet/:id',
                element: <WalletForm key="walletEdit"/>
            },


            {
                path: '/bank-account/transfer-histories',
                element: <Transfers/>
            },
            {
                path: '/users/new',
                element: <UserForm key="userCreate"/>
            },
            {
                path: '/users/:id',
                element: <UserForm key="userUpdate"/>
            },
            {
                path: '/budgets',
                element: <Budgets/>
            },
            {
                path: '/budget/add',
                element: <BudgetForm key="budgetCreate"/>
            },
            {
                path: '/budget/:id',
                element: <BudgetForm key="budgetUpdate"/>
            },
            {
                path: '/income-report',
                element: <IncomeReport key="incomeReportListing"/>
            },
            {
                path: '/expense-report',
                element: <ExpenseReport key="expenseReportListing"/>
            },
            {
                path: '/investment-report',
                element: <InvestmentReport/>
            },
            {
                path: '/calendar',
                element: <Calendar/>
            },

            {
                path: '/subscription-history',
                element: <SubscriptionHistory/>
            },
            {
                path: '/all-report',
                element: <OverallReport/>
            },
            {
                path: '/monthly-report',
                element: <MonthlyReport/>
            },
            {
                path: 'activity-logs',
                element: <ActivityLogs />
            },
            {
                path: 'application-settings',
                element: <ApplicationSettingsForm key="applicationSettings"/>
            },
            {
                path: '/roles',
                element: <Roles />
            },
            {
                path: '/roles/new',
                element: <RoleForms key={"rolesCreate"} />
            },
            {
                path: '/role/:id',
                element: <RoleForms key={"rolesUpdate"} />
            },
            {
                path: '/companies',
                element: <Companies />
            },
            {
                path: '/company/add',
                element: <CompanyCreate key={"companyCreate"}/>
            },
            {
                path: '/company/:id',
                element: <CompanyCreate key={"companyUpdate"}/>
            },
            {
                path: '/all-employee',
                element: <Employee />
            },
            {
                path: '/all-payrolls',
                element: <Payrolls />
            },
            {
                path: '/all-tasks',
                element: <Task />
            },
            {
                path: '/my-tasks',
                element: <MyTasks />
            },
            {
                path: '/all-attendance',
                element: <Attendance />
            },
        ]
    },
    {
        path: '/',
        element: (
            <GuestLayout/>
        ),
        children: [
            {
                path: '/warning-message',
                element: <WarningMessage/>
            },
            {
                path: '/login',
                element: <Login/>
            },
            {
                path: '/signup',
                element: <Signup/>
            },
            {
                path: '/signup/company',
                element: <CompanySignUp/>
            }
        ]
    },

    {
        path: '*',
        element: <NotFound/>
    }
]);


export default router;
