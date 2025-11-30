import React from 'react';
import { useLocation } from 'react-router-dom';
import IncomeReport from '../../../views/Reports/IncomeReport.jsx';
import ExpenseReport from '../../../views/Reports/ExpenseReport.jsx';
import InvestmentReport from '../../../views/Reports/InvestmentReport';
import MonthlyReport from '../../../views/Reports/MonthlyReport/MonthlyReport.jsx';
import OverallReport from '../../../views/Reports/OverAllReport/OverallReport.jsx';

const ReportsHub = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const menu = params.get('menu');

  switch (menu) {
    case 'income-report':
      return <IncomeReport />;
    case 'expense-report':
      return <ExpenseReport />;
    case 'investment-report':
      return <InvestmentReport />;
    case 'monthly-report':
      return <MonthlyReport />;
    case 'all-report':
      return <OverallReport />;
    default:
      return <IncomeReport />;
  }
};

export default ReportsHub;
