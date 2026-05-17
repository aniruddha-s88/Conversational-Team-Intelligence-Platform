import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import QueryPage from './pages/QueryPage';
import MessagesPage from './pages/MessagesPage';
import TeamPage from './pages/TeamPage';
import SimulatePage from './pages/SimulatePage';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    switch(page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'query': return <QueryPage />;
      case 'messages': return <MessagesPage />;
      case 'team': return <TeamPage />;
      case 'simulate': return <SimulatePage />;
      default: return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1d27', color: '#e8eaf0', border: '1px solid rgba(255,255,255,0.08)' }
      }} />
      <Sidebar current={page} onNavigate={setPage} />
      <div className="app-main">{renderPage()}</div>
    </div>
  );
}
