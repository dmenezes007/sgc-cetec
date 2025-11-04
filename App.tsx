import React, { useState, Suspense } from 'react';
import Layout from './components/Layout';
import { Page } from './types';
import LoginPage from './components/LoginPage';

const Capacitacoes = React.lazy(() => import('./pages/Capacitacoes'));
const Capacitados = React.lazy(() => import('./pages/Capacitados'));
const Afastamentos = React.lazy(() => import('./pages/Afastamentos'));
const Planejamento = React.lazy(() => import('./pages/Planejamento'));
const Relatorios = React.lazy(() => import('./pages/Relatorios'));


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
    <Suspense fallback={<div>Loading...</div>}>
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </Layout>
    </Suspense>
  );
};

export default App;