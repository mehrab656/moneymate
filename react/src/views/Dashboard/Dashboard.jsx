import React, { useContext, useEffect } from "react";
import MonthlyExpenseChart from "../../components/chart/MonthlyExpenseChart.jsx";
import SummeryCard from "../../components/SummeryCard.jsx";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import AddCardTwoToneIcon from "@mui/icons-material/AddCardTwoTone";
import RemoveTwoToneIcon from "@mui/icons-material/RemoveTwoTone";
import WizCard from "../../components/WizCard.jsx";
import { AccountBalanceRounded, AddTwoTone } from "@mui/icons-material";
import BudgetExpensesChart from "../../components/chart/BudgetExpensesChart.jsx";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import MainLoader from "../../components/loader/MainLoader.jsx";
import {
  useGetBudgetPieDataQuery,
  useGetDashboardDataQuery,
  useGetExpenseGraphDataQuery,
} from "../../api/slices/dashBoardSlice.js";
import DashboardCardLoader from "../../components/loader/DashboardCardLoader.jsx";

export default function Dashboard() {
  const { applicationSettings, userRole } = useContext(SettingsContext);
  const { default_currency, registration_type } = applicationSettings;

  // api call
  const { data: getDashboardData, isFetching: dashboardDataFetching } =
    useGetDashboardDataQuery();
  const { data: getExpenseGraphData, isFetching: expenseGraphDataFetching } =
    useGetExpenseGraphDataQuery();
  const { data: getBudgetPieData, isFetching: budgetPieDataFetching } =
    useGetBudgetPieDataQuery();

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  const isLoading =
    dashboardDataFetching || expenseGraphDataFetching || budgetPieDataFetching;
  const currency = default_currency !== undefined ? default_currency : "";

  return (
    <>
      <MainLoader loaderVisible={isLoading} />
      {dashboardDataFetching  && <DashboardCardLoader />}
      {!dashboardDataFetching  && (
        <div className="mb-4">
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <SummeryCard
                value={getDashboardData?.income_of_this_month}
                summary="Income this month"
                icon={<AttachMoneyIcon />}
                iconClassName="icon-success"
                currency={currency}
              />
            </div>
            <div className="col-md-6 col-lg-4">
              <SummeryCard
                value={getDashboardData?.expense_of_this_month}
                summary="Expense this month"
                icon={<ArrowOutwardIcon />}
                iconClassName="icon-danger"
                currency={currency}
              />
            </div>
            <div className="col-md-6 col-lg-4">
              <SummeryCard
                value={getDashboardData?.total_balance}
                summary="Total account balance"
                icon={<AddCardTwoToneIcon />}
                iconClassName="icon-success"
                currency={currency}
              />
            </div>
            <div className="col-md-6 col-lg-4">
              <SummeryCard
                value={getDashboardData?.total_lend}
                summary="Total lend amount"
                icon={<AddTwoTone />}
                iconClassName="icon-primary"
                currency={currency}
              />
            </div>

            <div className="col-md-6 col-lg-4">
              <SummeryCard
                value={getDashboardData?.total_borrow}
                summary="Total borrow amount"
                icon={<RemoveTwoToneIcon />}
                iconClassName="icon-danger"
                currency={currency}
              />
            </div>
            <div className="col-md-6 col-lg-4">
              <SummeryCard
                value={getDashboardData?.number_of_bank_account}
                summary="Total bank account"
                icon={<AccountBalanceRounded />}
                iconClassName="icon-danger"
              />
            </div>

            {registration_type === "subscription" && userRole === "admin" && (
              <div className="col-md-6 col-lg-4">
                <SummeryCard
                  value={
                    getDashboardData?.total_subscription_amount_of_this_month
                  }
                  summary="Subscription amount of this month"
                  icon={<AttachMoneyIcon />}
                  iconClassName="icon-danger"
                  currency={default_currency}
                />
              </div>
            )}
          </div>
        </div>
      )}

     {/* chart */}
      <div className="row">
        <div className="col-12 col-md-7">
          <WizCard className="animated fadeInDown">
            <MonthlyExpenseChart
              title="Monthly Expense chart"
              getExpenseGraphData={getExpenseGraphData}
              loading={expenseGraphDataFetching}
            />
          </WizCard>
        </div>
        <div className="col-12 col-md-5">
          <WizCard className="animated fadeInDown">
            <BudgetExpensesChart
              title="Expense categories vs budget"
              getBudgetPieData={getBudgetPieData}
              loading={budgetPieDataFetching}
            />
          </WizCard>
        </div>
      </div>

      <br />
      <WizCard className="animated fadeInDown">
        <div className="row">
          <div className="col-12">
            <h1 className="title-text text-center">
              Active Budget Information
            </h1>
            <table className="table table-bordered custom-table">
              <thead>
                <tr className={"text-center"}>
                  <th>Budget Name</th>
                  <th>Proposed Amount</th>
                  <th>Available Amount</th>
                </tr>
              </thead>
              {dashboardDataFetching && (
                <tbody>
                  <tr className={"text-center"}>
                    <td colSpan={6} className="text-center">
                      Loading...
                    </td>
                  </tr>
                </tbody>
              )}
              {!dashboardDataFetching && (
                <tbody>
                  {getDashboardData?.active_budget &&
                    getDashboardData?.active_budget.length > 0 &&
                    getDashboardData?.active_budget.map((budget) => (
                      <tr key={budget.id} className={"text-center"}>
                        <td>{budget.budget_name}</td>
                        <td>
                          {default_currency +
                            " " +
                            budget.original_budget_amount}
                        </td>
                        <td>
                          {default_currency + " " + budget.amount_available}
                        </td>
                      </tr>
                    ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </WizCard>
      <br />

      {/*Commented by Mehrab; Noo need right now*/}
      {/*<WizCard className="animated fadeInDown">*/}
      {/*    <div className="row">*/}
      {/*        <div className="col-12">*/}
      {/*            <h1 className="title-text text-center">Number of account transfer in this month</h1>*/}
      {/*            <BalanceTransfer/>*/}
      {/*        </div>*/}
      {/*    </div>*/}
      {/*</WizCard>*/}
      {/*<br/><br/>*/}
    </>
  );
}
