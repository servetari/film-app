import React from 'react';
import Sidebar from '../../../components/admin/sidebar/Sidebar';
import Topbar from '../../../components/admin/topbar/Topbar';
import { Outlet } from 'react-router-dom';
import './adminHome.scss';

const AdminHome = () => {
  return (
    <>
      <Topbar />
      <div className="container">
        <Sidebar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminHome;