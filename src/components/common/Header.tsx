import React, { useState } from 'react';
import { Bell, Search, Menu, X, User } from 'lucide-react';
import { mockUser } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-neutral-800 border-b border-neutral-700 p-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <button 
          className="md:hidden btn-ghost rounded-full p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Search bar */}
        <div className={`${isSearchOpen ? 'flex' : 'hidden md:flex'} flex-1 max-w-md mx-4 relative`}>
          <input
            type="text"
            placeholder="Search symbols, options..."
            className="input w-full pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={18} />
          {isSearchOpen && (
            <button 
              className="md:hidden absolute right-2 top-1/2 transform -translate-y-1/2" 
              onClick={() => setIsSearchOpen(false)}
            >
              <X size={18} className="text-neutral-500" />
            </button>
          )}
        </div>

        {/* Mobile search button */}
        {!isSearchOpen && (
          <button 
            className="md:hidden btn-ghost rounded-full p-2" 
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={24} />
          </button>
        )}

        {/* Account info and actions */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-400">Account Value</span>
            <span className="font-medium">{formatCurrency(mockUser.accountValue)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-400">Buying Power</span>
            <span className="font-medium">{formatCurrency(mockUser.buyingPower)}</span>
          </div>
          <button className="relative btn-ghost rounded-full p-2">
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>
          <button className="btn-ghost rounded-full p-2">
            <User size={22} />
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div className={`md:hidden fixed inset-0 bg-neutral-900 bg-opacity-90 z-50 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-neutral-800 h-full w-64 shadow-lg p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary-400">OptiTrade</h2>
            <button onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <User size={36} className="text-neutral-400" />
              <div>
                <p className="font-medium">{mockUser.name}</p>
                <p className="text-sm text-neutral-400">{mockUser.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-neutral-700 p-3 rounded-lg">
                <p className="text-xs text-neutral-400">Account Value</p>
                <p className="font-medium">{formatCurrency(mockUser.accountValue)}</p>
              </div>
              <div className="bg-neutral-700 p-3 rounded-lg">
                <p className="text-xs text-neutral-400">Buying Power</p>
                <p className="font-medium">{formatCurrency(mockUser.buyingPower)}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation links would go here */}
        </div>
      </div>
    </header>
  );
};

export default Header;