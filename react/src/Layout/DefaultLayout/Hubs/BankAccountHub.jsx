import React from 'react';
import { useLocation } from 'react-router-dom';
import Banks from '../../../views/Bank&Acc/Banks/Banks.jsx';
import Accounts from '../../../views/Bank&Acc/Accounts/Accounts.jsx';
import BalanceTransfers from '../../../views/Bank&Acc/Balance Transfer/BalanceTransfers.jsx';
import DebtList from '../../../views/Bank&Acc/Debts/DebtList.jsx';

const BankAccountHub = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const menu = params.get('menu');

  switch (menu) {
    case 'banks':
      return <Banks />;
    case 'accounts':
      return <Accounts />;
    case 'balance-transfer':
      return <BalanceTransfers />;
    case 'debts':
      return <DebtList />;
    default:
      return <Banks />;
  }
};

export default BankAccountHub;
