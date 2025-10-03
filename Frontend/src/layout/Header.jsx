import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { Search, UserCircle, LogOut, ChevronDown, Filter } from 'lucide-react';
import CustomerContext from '../context/CustomerContext';

function Header({onOpenAdvanceSearch}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {searchCustomer} =useContext(CustomerContext);
  const [searchId, setSearchId] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // const handleAdvancedSearchClick = () => {
  //   // Implement your advanced search logic here
  //   // For now, it will show an alert.
  //   alert('Advanced Search filter clicked!');
  // };
  function handleSearch() {
    
    searchCustomer(searchId)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

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
            onClick={handleSearch} // Add your search handler here
            style={{ right: '2.5rem' }} // Position before filter button
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
      <div className="flex items-center space-x-4 ml-4">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-slate-300 hover:bg-slate-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <UserCircle size={24} className="text-blue-400" />
              <span className="hidden md:block font-medium text-sm">{user.userName}</span>
              <ChevronDown size={16} className={`hidden md:block text-slate-400 transition-transform ${isDropdownOpen && 'rotate-180'}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-lg py-2 z-20 ring-1 ring-slate-700">
                <div className="px-4 py-2 border-b border-slate-700">
                  {/* <p className="font-semibold text-white">{user.userName}</p> */}
                  <p className="text-xs text-slate-400 truncate">{user.userEmailid}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-blue-600 hover:text-white rounded-md transition-colors"
                  >
                    <LogOut size={16} className="mr-3"/>
                    Logout
                  </button>
                </div>
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
