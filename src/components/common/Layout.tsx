import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-900 text-neutral-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
        <footer className="p-4 text-center text-sm text-neutral-500 border-t border-neutral-800">
          <p>OptiTrade © {new Date().getFullYear()} | Market data is simulated for demonstration purposes</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;