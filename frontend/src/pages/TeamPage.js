import React, { useState, useEffect } from 'react';
import { getTeamMembers, addTeamMember } from '../api';
import toast from 'react-hot-toast';

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ phone: '', name: '', role: 'Sales Executive' });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    getTeamMembers().then(r => setMembers(r.data)).catch(() => toast.error('Failed to load team'));
  };

  const handleAdd = async () => {
    if (!form.phone || !form.name) return toast.error('Phone and name are required');
    setAdding(true);
    try {
      await addTeamMember(form);
      toast.success(`${form.name} added to team!`);
      setForm({ phone: '', name: '', role: 'Sales Executive' });
      setShowForm(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add member');
    }
    setAdding(false);
  };

  const roles = ['Sales Executive', 'Field Agent', 'Account Manager', 'Team Lead', 'Operations'];

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-1">
        <div className="section-title">Team Members</div>
        <button className="btn btn-accent btn-sm" onClick={() => setShowForm(s => !s)}>
          <i className={`bi bi-${showForm ? 'dash' : 'plus'}-lg me-1`}></i>
          {showForm ? 'Cancel' : 'Add Member'}
        </button>
      </div>
      <div className="section-sub">Manage your team and link WhatsApp numbers to names</div>

      {showForm && (
        <div className="stat-card mb-4">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Add New Team Member</div>
          <div className="row g-3">
            <div className="col-md-4">
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>WhatsApp Number *</label>
              <input
                className="form-control form-control-dark"
                placeholder="+919876543210"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
              <small style={{ color: 'var(--text-secondary)' }}>Include country code</small>
            </div>
            <div className="col-md-4">
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>Full Name *</label>
              <input
                className="form-control form-control-dark"
                placeholder="Arjun Sharma"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="col-md-4">
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>Role</label>
              <select
                className="form-select form-select-dark"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-accent mt-3" onClick={handleAdd} disabled={adding}>
            {adding ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      )}

      <div className="row g-3">
        {members.map(m => (
          <div key={m.id} className="col-md-6">
            <div className="stat-card d-flex align-items-center gap-3">
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(37,211,102,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0
              }}>
                {m.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>{m.role}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {m.phone}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
          <i className="bi bi-people fs-1 d-block mb-2"></i>
          No team members yet. Add your first member above.
        </div>
      )}

      <div className="mt-4 p-3" style={{
        background: 'rgba(78,154,241,0.06)',
        border: '1px solid rgba(78,154,241,0.15)',
        borderRadius: 12
      }}>
        <div className="d-flex gap-2">
          <i className="bi bi-info-circle-fill" style={{ color: '#4e9af1', marginTop: 2, flexShrink: 0 }}></i>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Setting up WhatsApp:</strong> After adding team members, 
            configure your WhatsApp Business API webhook to point to <code style={{ color: '#4e9af1' }}>https://yourdomain.com/webhook/whatsapp</code>. 
            Use the verify token from your <code style={{ color: '#4e9af1' }}>.env</code> file. 
            Messages will then arrive automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
