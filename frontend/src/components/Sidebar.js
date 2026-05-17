import React from 'react';

const navItems = [
  { key: 'dashboard', icon: 'bi-grid-fill', label: 'Dashboard' },
  { key: 'query', icon: 'bi-chat-dots-fill', label: 'Ask a Question' },
  { key: 'messages', icon: 'bi-inbox-fill', label: 'Messages' },
  { key: 'team', icon: 'bi-people-fill', label: 'Team Members' },
  { key: 'simulate', icon: 'bi-whatsapp', label: 'Add Update' },
];

export default function Sidebar({ current, onNavigate }) {
  return (
    <div className="app-sidebar">
      <div className="sidebar-logo">
        <div className="d-flex align-items-center gap-2 mb-1">
          <i className="bi bi-whatsapp fs-4 whatsapp-icon"></i>
          <h5 className="mb-0">WA Intel</h5>
        </div>
        <small>Business Intelligence</small>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-item-custom ${current === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <i className={`bi ${item.icon}`}></i>
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <i className="bi bi-shield-check me-1" style={{ color: 'var(--accent)' }}></i>
          Powered by Groq AI<br/>
          <span style={{ opacity: 0.6 }}>LLaMA 3 · 70B</span>
        </div>
      </div>
    </div>
  );
}
