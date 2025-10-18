
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CadastrarCapacitacao from './pages/CadastrarCapacitacao';
import Relatorios from './pages/Relatorios';
import { Page } from './types';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (password: string) => {
    if (password === 'sgc_inpi_2025') {
      setIsLoggedIn(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Cadastrar Capacitação':
        return <CadastrarCapacitacao />;
      case 'Relatórios':
        return <Relatorios />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;
