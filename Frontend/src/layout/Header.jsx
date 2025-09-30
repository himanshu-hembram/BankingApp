import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context//useAuth.js';
import { Search, UserCircle, LogOut } from 'lucide-react';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Effect to close dropdown when clicking outside
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
    <header className="flex-shrink-0 flex justify-between items-center p-4 bg-white border-b shadow-sm z-10">
      
      {/* Left Side: Search Functionality */}
      <div className="flex items-center">
        {/* Full search for medium screens and up */}
        <div className="hidden sm:flex items-center">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={20} className="text-gray-400" />
            </span>
            <input 
              type="text" 
              className="py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-md focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-blue-500" 
              placeholder="Search..." 
            />
          </div>
          <button className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-blue-500">
            Advanced Search
          </button>
        </div>
        
        {/* Search Icon for small screens */}
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 sm:hidden">
          <Search size={22} />
        </button>
      </div>

      {/* Right Side: User Profile */}
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <UserCircle size={28} />
              <span className="hidden md:block font-medium text-sm">{user.userName}</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                <div className="px-4 py-2 text-sm text-gray-700">
                  <p className="font-semibold">{user.userName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.userEmailid}</p>
                </div>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut size={16} className="mr-2"/>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
