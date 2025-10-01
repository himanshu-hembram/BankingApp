import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AdvanceSearch from '../components/AdvanceSearch';

function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAdvOpen, setAdvOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative min-h-screen bg-gray-100 font-sans flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <Header onOpenAdvanceSearch={() => setAdvOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {/* Full width content wrapper */}
          <div className="w-full">
            {children}
          </div>
        </main>

        <AdvanceSearch isOpen={isAdvOpen}
        onClose={() => setAdvOpen(false)}
        />

      </div>
    </div>
  );
}

export default Layout;
