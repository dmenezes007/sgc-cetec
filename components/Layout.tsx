import React, { useState } from 'react';
import { Page } from '../types';
import { FaCertificate } from 'react-icons/fa/FaCertificate';
import { FaUserCheck } from 'react-icons/fa/FaUserCheck';
import { FaSuitcase } from 'react-icons/fa/FaSuitcase';
import { FaTasks } from 'react-icons/fa/FaTasks';
import { FaChartBar } from 'react-icons/fa/FaChartBar';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavLink: React.FC<{
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  icon: React.ReactNode;
  text: string;
  isExpanded: boolean;
}> = ({ page, currentPage, setCurrentPage, icon, text, isExpanded }) => (
  <button
    onClick={() => setCurrentPage(page)}
    className={`flex items-center w-full py-3 text-sm font-medium transition-colors duration-200 ease-in-out rounded-lg ${
      isExpanded ? 'px-4' : 'justify-center'
    } ${
      currentPage === page
        ? 'bg-primary text-white shadow-md'
        : 'text-gray-400 hover:bg-slate-700 hover:text-white'
    }`}
    title={!isExpanded ? text : ''}
  >
    {icon}
    {isExpanded && <span className="ml-3">{text}</span>}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex h-screen bg-slate-900 font-sans">
      <aside className={`bg-slate-800 flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}>
        <div className={`p-6 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          {isExpanded && (
            <div className="text-2xl font-bold text-primary">
              SGC
            </div>
          )}
          <button onClick={toggleSidebar} className="p-1 rounded-full text-gray-400 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-grow px-4 space-y-2">
          <NavLink
            page="Capacitações"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<FaCertificate />}
            text="Capacitações"
            isExpanded={isExpanded}
          />
          <NavLink
            page="Capacitados"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<FaUserCheck />}
            text="Capacitados"
            isExpanded={isExpanded}
          />
          <NavLink
            page="Afastamentos"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<FaSuitcase />}
            text="Afastamentos"
            isExpanded={isExpanded}
          />
          <NavLink
            page="Planejamento"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<FaTasks />}
            text="Planejamento"
            isExpanded={isExpanded}
          />
          <NavLink
            page="Relatórios"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<FaChartBar />}
            text="Relatórios"
            isExpanded={isExpanded}
          />
        </nav>

        <div className="p-4 text-center">
          <div className={`flex justify-center text-xs text-gray-400 mt-4 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            <img 
                src="https://dmenezes007.github.io/pgi-inpi/files/imgs/logo_inpi_branco_fundo_transparente.png" 
                alt="Logo do INPI" 
                className="h-8"
            />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;