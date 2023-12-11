import React, {useContext, useEffect, useState, useCallback} from "react";
import axiosClient from "../axios-client.js";
import MonthlyExpenseChart from "../components/MonthlyExpenseChart.jsx";
import SummeryCard from "../components/SummeryCard";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import AddCardTwoToneIcon from '@mui/icons-material/AddCardTwoTone';
import RemoveTwoToneIcon from '@mui/icons-material/RemoveTwoTone';
import WizCard from "../components/WizCard";
import {AccountBalanceRounded, AddTwoTone} from "@mui/icons-material";
import BalanceTransfer from "../components/BalanceTransfer.jsx";
import BudgetExpensesChart from "../components/BudgetExpensesChart.jsx";
import {SettingsContext} from "../contexts/SettingsContext";
import MainLoader from "../components/MainLoader.jsx";

export default function Dashboard() {


    const [getExpenses, setExpenses] = useState([]);
    const [getIncomes, setIncomes] = useState([]);
    const [totalAccountBalance, setTotalAccountBalance] = useState([]);
    const [totalBorrow, setTotalBorrow] = useState([]);
    const [totalLend, setTotalLend] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalBankAccounts, setTotalBankAccounts] = useState();
    const [subscriptionAmountOfThisMonth, setSubscriptionAmountOfThisMonth] = useState(0);
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const {
        default_currency,
        registration_type
    } = applicationSettings;

    const getDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            axiosClient.get('/dashboard-data')
                .then(({data}) => {
                    setIncomes(data.income_of_this_month);
                    setExpenses(data.expense_of_this_month);
                    setTotalAccountBalance(data.total_balance);
                    setTotalBorrow(data.total_borrow);
                    setTotalLend(data.total_lend);
                    setTotalBankAccounts(data.number_of_bank_account);
                    setSubscriptionAmountOfThisMonth(data.total_subscription_amount_of_this_month);
                    setLoading(false);
                })
        } catch (error) {
            setLoading(false)
        }
    }, []);

    const getActiveBudgets = useCallback(async () => {
        try {
            setLoading(true); // Set loading to true before making the API call
            axiosClient
                .get('/budgets/active-budgets')
                .then(({data}) => {
                    setBudgets(data);
                    setLoading(false); // Set loading to false after receiving the response
                })
        } catch (error) {
            setLoading(false); // Set loading to false if there is an error
        }
    }, []);


    useEffect(() => {
        document.title = "Dashboard";
        getActiveBudgets();
        getDashboardData();
    }, [getDashboardData, getActiveBudgets]);


    return (
        <>
        <MainLoader loaderVisible={loading} />
            <div className="mb-4">
                <div className="row g-4">
                    <div className="col-md-6 col-lg-4">

                        <SummeryCard value={getIncomes} summary="Income this month" icon={<AttachMoneyIcon/>}
                                     iconClassName="icon-success" currency={default_currency}/>
                    </div>
                    <div className="col-md-6 col-lg-4">

                        <SummeryCard value={getExpenses} summary="Expense this month" icon={<ArrowOutwardIcon/>}
                                     iconClassName="icon-danger" currency={default_currency}/>
                    </div>
                    <div className="col-md-6 col-lg-4">

                        <SummeryCard value={totalAccountBalance} summary="Total account balance"
                                     icon={<AddCardTwoToneIcon/>} iconClassName="icon-success" currency={default_currency}/>
                    </div>
                    <div className="col-md-6 col-lg-4">

                        <SummeryCard value={totalLend} summary="Total lend amount"
                                     icon={<AddTwoTone/>} iconClassName="icon-primary" currency={default_currency}/>
                    </div>

                    <div className="col-md-6 col-lg-4">

                        <SummeryCard value={totalBorrow} summary="Total borrow amount"
                                     icon={<RemoveTwoToneIcon/>} iconClassName="icon-danger" currency={default_currency}/>
                    </div>
                    <div className="col-md-6 col-lg-4">

                        <SummeryCard value={totalBankAccounts} summary="Total bank account"
                                     icon={<AccountBalanceRounded/>} iconClassName="icon-danger"/>
                    </div>

                    {registration_type === 'subscription' && userRole === 'admin' &&
                        <div className="col-md-6 col-lg-4">

                            <SummeryCard value={subscriptionAmountOfThisMonth}
                                         summary="Subscription amount of this month"
                                         icon={<AttachMoneyIcon/>} iconClassName="icon-danger" currency={default_currency}/>
                        </div>

                    }

                </div>
            </div>


            <div className="row">
                <div className="col-12 col-md-7">
                    <WizCard className="animated fadeInDown">
                        <MonthlyExpenseChart title="Monthly Expense chart"/>
                    </WizCard>
                </div>
                <div className="col-12 col-md-5">
                    <WizCard className="animated fadeInDown">
                        <BudgetExpensesChart title="Expense categories vs budget"/>
                    </WizCard>
                </div>
            </div>


            <br/>
            <WizCard className="animated fadeInDown">
                <div className="row">
                    <div className="col-12">
                        <h1 className="title-text text-center">Active Budget Information</h1>
                        <table className="table table-bordered custom-table">
                            <thead>
                            <tr className={'text-center'}>
                                <th>Budget Name</th>
                                <th>Proposed Amount</th>
                                <th>Available Amount</th>
                            </tr>
                            </thead>
                            {loading && (
                                <tbody>
                                <tr className={'text-center'}>
                                    <td colSpan={6} className="text-center">
                                        Loading...
                                    </td>
                                </tr>
                                </tbody>
                            )}
                            {!loading && (
                                <tbody>
                                {budgets.map(budget => (
                                    <tr key={budget.id} className={'text-center'}>
                                        <td>{budget.budget_name}</td>
                                        <td>{default_currency +' '+ budget.original_budget_amount}</td>
                                        <td>{default_currency +' '+ budget.amount_available}</td>
                                    </tr>
                                ))}
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            </WizCard>
            <br/>

            <WizCard className="animated fadeInDown">
                <div className="row">
                    <div className="col-12">
                        <h1 className="title-text text-center">Number of account transfer in this month</h1>
                        <BalanceTransfer/>
                    </div>
                </div>
            </WizCard>
            <br/><br/>
        </>
    )
}
