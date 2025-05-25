import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  LineChart, 
  Briefcase, 
  List, 
  TrendingUp, 
  Settings, 
  PieChart, 
  BookOpen, 
  HelpCircle,
  LogOut
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/', icon: <BarChart3 size={20} />, label: 'Dashboard' },
    { path: '/options-chain', icon: <LineChart size={20} />, label: 'Options Chain' },
    { path: '/portfolio', icon: <Briefcase size={20} />, label: 'Portfolio' },
    { path: '/watchlist', icon: <List size={20} />, label: 'Watchlist' },
    { path: '/strategy-builder', icon: <TrendingUp size={20} />, label: 'Strategy Builder' },
    { path: '/scanner', icon: <PieChart size={20} />, label: 'Market Scanner' },
    { path: '/learn', icon: <BookOpen size={20} />, label: 'Learn Options' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-neutral-800 border-r border-neutral-700">
      <div className="p-4 border-b border-neutral-700 flex items-center">
        <LineChart className="w-8 h-8 text-primary-500 mr-2" />
        <h1 className="text-xl font-bold text-primary-400">OptiTrade</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-900 text-primary-400'
                      : 'text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-neutral-700">
        <div className="mb-4">
          <button className="flex items-center w-full px-4 py-2 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-700 transition-colors">
            <HelpCircle size={20} className="mr-3" />
            <span>Help & Support</span>
          </button>
        </div>
        <button className="flex items-center w-full px-4 py-2 text-neutral-400 hover:text-error-400 rounded-lg hover:bg-neutral-700 transition-colors">
          <LogOut size={20} className="mr-3" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;