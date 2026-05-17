import React, { useEffect, useState } from 'react';
import { getStats } from '../api';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: 'Total Messages', value: stats.total_messages, icon: 'bi-chat-left-text-fill', color: '#25D366' },
    { label: 'Today', value: stats.today, icon: 'bi-calendar-day-fill', color: '#00b8a9' },
    { label: 'This Week', value: stats.this_week, icon: 'bi-calendar-week-fill', color: '#4e9af1' },
    { label: 'Team Members', value: stats.team_members, icon: 'bi-people-fill', color: '#f1a94e' },
    { label: 'Queries Asked', value: stats.queries_made, icon: 'bi-question-circle-fill', color: '#b44ef1' },
  ] : [];

  const quickActions = [
    { label: 'Ask a Question', icon: 'bi-chat-dots-fill', page: 'query', desc: 'Get AI answers from your team updates' },
    { label: 'Add Update', icon: 'bi-whatsapp', page: 'simulate', desc: 'Manually add a team message' },
    { label: 'View Messages', icon: 'bi-inbox-fill', page: 'messages', desc: 'Browse all team updates' },
    { label: 'Manage Team', icon: 'bi-people-fill', page: 'team', desc: 'Add or edit team members' },
  ];

  return (
    <div>
      <div className="section-title">Good morning, Boss 👋</div>
      <div className="section-sub">Here's what's happening with your team</div>

      <div className="row g-3 mb-4">
        {cards.map((c, i) => (
          <div key={i} className="col-6 col-md-4 col-lg-2-4">
            <div className="stat-card">
              <div className="mb-2">
                <i className={`bi ${c.icon}`} style={{ color: c.color, fontSize: '1.4rem' }}></i>
              </div>
              <div className="stat-number" style={{ color: c.color }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
        {!stats && <div style={{ color: 'var(--text-secondary)' }}>Loading stats...</div>}
      </div>

      <div className="section-title" style={{ fontSize: '1.1rem' }}>Quick Actions</div>
      <div className="row g-3 mt-1">
        {quickActions.map((a, i) => (
          <div key={i} className="col-md-6">
            <div
              className="stat-card d-flex align-items-center gap-3"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate(a.page)}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'rgba(37,211,102,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <i className={`bi ${a.icon}`} style={{ color: 'var(--accent)', fontSize: '1.2rem' }}></i>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{a.label}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{a.desc}</div>
              </div>
              <i className="bi bi-arrow-right ms-auto" style={{ color: 'var(--text-secondary)' }}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3" style={{
        background: 'rgba(37,211,102,0.05)',
        border: '1px solid rgba(37,211,102,0.15)',
        borderRadius: 12
      }}>
        <div className="d-flex align-items-start gap-2">
          <i className="bi bi-lightbulb-fill" style={{ color: 'var(--accent)', marginTop: 2 }}></i>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>How it works</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              Your team sends WhatsApp updates → they get saved here → you ask questions in plain English → Groq AI reads all messages and answers intelligently. No more scrolling through hundreds of messages!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
