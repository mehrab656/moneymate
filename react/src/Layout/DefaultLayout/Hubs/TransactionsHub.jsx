import React from 'react';
import { useLocation } from 'react-router-dom';
import InvestmentList from '../../../views/Transactions/Investment/InvestmentList.jsx';
import ExpenseList from '../../../views/Transactions/Expense/ExpenseList.jsx';
import IncomeList from '../../../views/Transactions/Income/IncomeList.jsx';
import Return from '../../../views/Transactions/Return.jsx';

const TransactionsHub = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const menu = params.get('menu');

  switch (menu) {
    case 'investments':
      return <InvestmentList />;
    case 'expenses':
      return <ExpenseList />;
    case 'incomes':
      return <IncomeList />;
    case 'returns':
      return <Return />;
    default:
      return <InvestmentList />;
  }
};

export default TransactionsHub;
