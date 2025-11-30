import React from 'react';
import { useLocation } from 'react-router-dom';
import Employee from '../../../views/HRMS/Employee/Employee.jsx';
import Payrolls from '../../../views/HRMS/Payrolls/Payrolls.jsx';
import Attendance from '../../../views/HRMS/Attandance/Attendance.jsx';
import Task from '../../../views/HRMS/Task/Task.jsx';
import MyTasks from '../../../views/HRMS/MyTasks.jsx';
import HrmsReport from '../../../views/HRMS/HrmsReport.jsx';

const HrmsHub = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const menu = params.get('menu');

  switch (menu) {
    case 'employee':
      return <Employee />;
    case 'payroll':
      return <Payrolls />;
    case 'attendance':
      return <Attendance />;
    case 'task-list':
      return <Task />;
    case 'my-task':
      return <MyTasks />;
    case 'hr-reports':
      return <HrmsReport />;
    default:
      return <Employee />;
  }
};

export default HrmsHub;
