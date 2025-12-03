import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import InvestmentList from '../../../views/Transactions/Investment/InvestmentList.jsx';
import ExpenseList from '../../../views/Transactions/Expense/ExpenseList.jsx';
import IncomeList from '../../../views/Transactions/Income/IncomeList.jsx';
import Return from '../../../views/Transactions/Return.jsx';
import Budgets from '../../../views/Transactions/Budgets/Budgets.jsx';
import InvestmentPlan from '../../../views/Transactions/InvestmentPlan/InvestmentPlan.jsx';
// Theme is now applied globally in AuthLayout

const TransactionsHub = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const menu = params.get('menu');

  switch (menu) {
    case 'investments':
      return <InvestmentList />;
    case 'investment-plan':
      return <InvestmentPlan />;
    case 'expenses':
      return <ExpenseList />;
    case 'incomes':
      return <IncomeList />;
    case 'returns':
      return <Return />;
    case 'budgets':
      return <Budgets />;
    default:
      return <InvestmentList />;
  }
};

export default TransactionsHub;
