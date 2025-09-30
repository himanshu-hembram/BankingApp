import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, FolderPlus, Menu } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customer', label: 'Add Customer', icon: UserPlus },
  { path: '/add-account', label: 'Add Account', icon: FolderPlus },
];

function Sidebar({ isOpen, toggleSidebar }) {
  // 1. Get the current location from React Router
  const location = useLocation();

  return (
    <div
      className={`fixed inset-y-0 left-0 bg-slate-800 text-white flex flex-col z-30 transition-width duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="h-20 flex items-center border-b border-slate-700 px-4">
        <button onClick={toggleSidebar} className="text-gray-300 hover:text-white focus:outline-none">
          <Menu size={28} />
        </button>
        <h1 className={`text-xl font-bold ml-4 transition-opacity duration-200 ${!isOpen && 'opacity-0'}`}>
          MyBank
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map((link) => {
          // 2. Check if the current path matches the link's path
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.label}
              to={link.path}
              // 3. Apply styles conditionally based on the 'isActive' boolean
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md' // Active state style
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white' // Inactive state style
              } ${!isOpen && 'justify-center'}`}
              title={link.label}
            >
              <link.icon size={22} />
              <span
                className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${
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
