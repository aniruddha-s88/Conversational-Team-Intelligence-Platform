import React, { useState, useEffect } from 'react';
import { getMessages, deleteMessage, getTeamMembers } from '../api';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [filterPhone, setFilterPhone] = useState('');
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTeamMembers().then(r => setMembers(r.data)).catch(() => {});
    loadMessages();
  }, []);

  const loadMessages = async (phone, from, to) => {
    setLoading(true);
    const p = {};
    if (phone ?? filterPhone) p.phone = phone ?? filterPhone;
    if (from ?? fromDate) p.from_date = from ?? fromDate;
    if (to ?? toDate) p.to_date = to ?? toDate;
    try {
      const r = await getMessages(p);
      setMessages(r.data);
    } catch { toast.error('Failed to load messages'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
      setMessages(m => m.filter(x => x.id !== id));
      toast.success('Message deleted');
    } catch { toast.error('Delete failed'); }
  };

  const grouped = messages.reduce((acc, m) => {
    const d = m.message_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(m);
    return acc;
  }, {});

  return (
    <div>
      <div className="section-title">Messages Inbox</div>
      <div className="section-sub">All team updates in one place</div>

      {/* Filters */}
      <div className="stat-card mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>Team Member</label>
            <select
              className="form-select form-select-dark"
              value={filterPhone}
              onChange={e => { setFilterPhone(e.target.value); loadMessages(e.target.value); }}
            >
              <option value="">All Members</option>
              {members.map(m => <option key={m.id} value={m.phone}>{m.name}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>From</label>
            <input type="date" className="form-control form-control-dark" value={fromDate}
              onChange={e => { setFromDate(e.target.value); loadMessages(undefined, e.target.value); }} />
          </div>
          <div className="col-md-3">
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>To</label>
            <input type="date" className="form-control form-control-dark" value={toDate}
              onChange={e => { setToDate(e.target.value); loadMessages(undefined, undefined, e.target.value); }} />
          </div>
          <div className="col-md-3">
            <button className="btn btn-accent w-100" onClick={() => loadMessages()}>
              <i className="bi bi-funnel-fill me-2"></i>Filter
            </button>
          </div>
        </div>
      </div>

      {loading && <div style={{ color: 'var(--text-secondary)' }}><span className="spinner-border spinner-border-sm me-2 spinner-accent"></span>Loading...</div>}

      {!loading && messages.length === 0 && (
        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
          No messages found. Try adjusting filters or add some updates.
        </div>
      )}

      {Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(date => (
        <div key={date} className="mb-4">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            <i className="bi bi-calendar3 me-2"></i>{date}
          </div>
          {grouped[date].map(m => (
            <div key={m.id} className="message-row">
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span className="sender-badge">{m.sender_name}</span>
                    {m.role && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.role}</span>}
                    <span className="source-badge">{m.source}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>{m.phone}</span>
                  </div>
                  <div style={{ lineHeight: 1.6 }}>{m.content}</div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{ color: 'var(--danger)', background: 'none', border: 'none', padding: '0 4px', flexShrink: 0 }}
                  onClick={() => handleDelete(m.id)}
                  title="Delete"
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        {messages.length} message{messages.length !== 1 ? 's' : ''} found
      </div>
    </div>
  );
}
