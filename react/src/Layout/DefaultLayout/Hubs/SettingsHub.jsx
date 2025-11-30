import React from 'react';
import { useLocation } from 'react-router-dom';
import Settings from '../../../views/Settings/Settings/Settings.jsx';
import UserList from '../../../views/Settings/Users/UserList.jsx';
import Roles from '../../../views/Settings/Role/Roles.jsx';

const SettingsHub = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const menu = params.get('menu');

  switch (menu) {
    case 'users':
      return <UserList />;
    case 'roles':
      return <Roles />;
    case 'settings':
    default:
      return <Settings />;
  }
};

export default SettingsHub;
