import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="dashboard-layout">
            <Header />
            <div className="dashboard-content">
                <Sidebar />
                <main>{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;