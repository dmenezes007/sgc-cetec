
import React from 'react';
import { Page } from '../types';
import { ChartBarIcon, DocumentAddIcon, TableIcon } from './icons/Icons';

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
}> = ({ page, currentPage, setCurrentPage, icon, text }) => (
  <button
    onClick={() => setCurrentPage(page)}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 ease-in-out rounded-lg ${
      currentPage === page
        ? 'bg-primary text-white shadow-md'
        : 'text-gray-200 hover:bg-secondary hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-3">{text}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  return (
    <div className="flex h-screen bg-light-bg font-sans">
      <aside className="w-64 flex-shrink-0 bg-secondary p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-8 px-2">
             <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                S
             </div>
            <h1 className="ml-3 text-xl font-bold text-white">Gestão de Capacitações</h1>
          </div>
          <nav className="space-y-2">
            <NavLink
              page="Dashboard"
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              icon={<ChartBarIcon />}
              text="Dashboard"
            />
            <NavLink
              page="Cadastrar Capacitação"
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              icon={<DocumentAddIcon />}
              text="Cadastrar"
            />
            <NavLink
              page="Relatórios"
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              icon={<TableIcon />}
              text="Relatórios"
            />
          </nav>
        </div>
        <div className="text-center text-gray-400 text-xs">
          <p>&copy; {new Date().getFullYear()} SGC</p>
          <p>Todos os direitos reservados.</p>
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
