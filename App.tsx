import React, { useState } from 'react';
import Layout from './components/Layout';
import Capacitados from './pages/Capacitados';
import Relatorios from './pages/Relatorios';
import { Page } from './types';
import LoginPage from './components/LoginPage';
import Capacitacoes from './pages/Capacitacoes';
import Afastamentos from './pages/Afastamentos';
import Planejamento from './pages/Planejamento';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Capacitações');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (password: string) => {
    if (password === 'SGC_CETEC_2025') {
      setIsLoggedIn(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Capacitações':
        return <Capacitacoes />;
      case 'Capacitados':
        return <Capacitados />;
      case 'Afastamentos':
        return <Afastamentos />;
      case 'Planejamento':
        return <Planejamento />;
      case 'Relatórios':
        return <Relatorios />;
      default:
        return <Capacitacoes />;
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