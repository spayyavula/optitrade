import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import LegalFooter from './LegalFooter';
import { Outlet } from 'react-router-dom';
import { RealTimeDataProvider } from './RealTimeDataProvider';

const Layout: React.FC = () => {
  return (
    <RealTimeDataProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-neutral-900 text-neutral-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
          <LegalFooter />
        </div>
      </div>
    </RealTimeDataProvider>
  );
};

export default Layout;