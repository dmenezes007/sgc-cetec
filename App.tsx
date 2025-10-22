import React, { useState } from 'react';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Cadastro from './pages/Cadastro';
import Relatorios from './pages/Relatorios';
import { Page } from './types';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Overview');
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
      case 'Overview':
        return <Overview />;
      case 'Cadastro':
        return <Cadastro />;
      case 'Relatórios':
        return <Relatorios />;
      default:
        return <Overview />;
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