import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, FolderPlus, Menu } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customer', label: 'Add Customer', icon: UserPlus },
  { path: '/add-account', label: 'Add Account', icon: FolderPlus },
];

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  return (
    <div
      className={`fixed inset-y-0 left-0 bg-slate-800 text-white flex flex-col z-30 transition-all duration-300 ease-in-out shadow-lg ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Header Section */}
      <div className="h-20 flex items-center border-b border-slate-700 px-4 shrink-0">
        <button
          onClick={toggleSidebar}
          className="text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-2 transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1
          className={`text-xl font-bold ml-3 transition-opacity duration-200 whitespace-nowrap select-none ${
            !isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        >
          MyBank
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.label}
              to={link.path}
              title={isOpen ? '' : link.label}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ease-in-out ${
                isActive
                  ? 'bg-blue-600 text-white' // Active state
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white' // Inactive state
              } ${!isOpen && 'justify-center'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <link.icon size={20} className="shrink-0" />
              <span
                className={`ml-4 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
                  !isOpen && 'opacity-0 hidden'
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
