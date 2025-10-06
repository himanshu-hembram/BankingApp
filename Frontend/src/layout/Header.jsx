import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Search, UserCircle, LogOut, ChevronDown, Filter } from 'lucide-react';
import CustomerContext from '../context/CustomerContext';

function Header({ onOpenAdvanceSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownContainerRef = useRef(null); // Use a single ref for the container
  const { searchCustomer } = useContext(CustomerContext);
  const [searchId, setSearchId] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  function handleSearch() {
    searchCustomer(searchId);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header className="flex-shrink-0 flex justify-between items-center px-4 sm:px-6 py-3 bg-slate-800 border-b border-slate-700 shadow-sm z-10">
      {/* Left Side: Search Functionality */}
      <div className="flex-1 flex justify-start">
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full py-2 pl-10 pr-20 text-white bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-600 transition"
            placeholder="Search..."
          />
          {/* Search button */}
          <button
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white transition-colors"
            aria-label="Search"
            onClick={handleSearch}
            style={{ right: '2.5rem' }}
          >
            <Search size={18} />
          </button>
          {/* Filter button */}
          <button
            onClick={onOpenAdvanceSearch}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white transition-colors"
            aria-label="Advanced search"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Right Side: User Profile */}
      <div className="flex items-center space-x-4 ml-4" ref={dropdownContainerRef}>
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-slate-300 hover:bg-slate-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <UserCircle size={24} className="text-blue-400" />
              <span className="hidden md:block font-medium text-sm">
                {user.userName ||
                  user.name ||
                  (typeof user === 'string' ? user : 'User')}
              </span>
              <ChevronDown
                size={16}
                className={`hidden md:block text-slate-400 transition-transform ${
                  isDropdownOpen && 'rotate-180'
                }`}
              />
            </button>

            {/* Beautified Dropdown menu */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 rounded-xl shadow-xl z-50 border border-blue-900"
              >
                <div className="flex items-center p-4 border-b border-blue-800 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-800 rounded-t-xl">
                  <div className="flex-shrink-0 mr-3">
                    <UserCircle size={40} className="text-blue-300 bg-white rounded-full p-1 shadow" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-100 text-base">
                      {user?.userName ||
                        user?.name ||
                        (typeof user === 'string' ? user : 'User')}
                    </div>
                    <div className="text-xs text-blue-300">
                      {user?.userEmailid || user?.email || ''}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-medium bg-blue-900 text-blue-100 hover:bg-blue-800 rounded-b-xl transition flex items-center"
                >
                  <LogOut size={16} className="inline mr-2 text-blue-300" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
