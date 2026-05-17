import React, { useState, useEffect } from 'react';
import { addMessage, getTeamMembers, simulateWhatsApp } from '../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function SimulatePage() {
  const [members, setMembers] = useState([]);
  const [mode, setMode] = useState('manual'); // 'manual' or 'simulate'
  const [form, setForm] = useState({
    phone: '', sender_name: '', content: '',
    message_date: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTeamMembers().then(r => setMembers(r.data)).catch(() => {});
  }, []);

  const handleMemberSelect = (phone) => {
    const m = members.find(x => x.phone === phone);
    if (m) setForm(f => ({ ...f, phone: m.phone, sender_name: m.name }));
    else setForm(f => ({ ...f, phone, sender_name: '' }));
  };

  const handleSubmit = async () => {
    if (!form.content.trim() || !form.sender_name.trim() || !form.phone.trim()) {
      return toast.error('Phone, name, and message are required');
    }
    setLoading(true);
    try {
      if (mode === 'simulate') {
        await simulateWhatsApp(form);
        toast.success('WhatsApp message simulated!');
      } else {
        await addMessage(form);
        toast.success('Message added!');
      }
      setForm(f => ({ ...f, content: '' }));
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add message');
    }
    setLoading(false);
  };

  const bulkMessages = [
    "Met Rajan today. Interested in 50 units. Will confirm pricing by Friday.",
    "Closed deal with ABC Corp - 20 units at ₹45k each. Sending invoice.",
    "3 new leads from the trade fair. Following up tomorrow.",
    "Client complaint from XYZ Ltd about delivery delay. Escalated to ops.",
    "Pending: follow up with Kapoor, collect payment from Mehta.",
  ];

  return (
    <div>
      <div className="section-title">Add Team Update</div>
      <div className="section-sub">Manually add a WhatsApp-style update from a team member</div>

      {/* Mode Toggle */}
      <div className="d-flex gap-2 mb-4">
        {['manual', 'simulate'].map(m => (
          <button
            key={m}
            className="btn btn-sm"
            style={{
              background: mode === m ? 'var(--accent)' : 'var(--bg-card)',
              color: mode === m ? '#000' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8, fontWeight: 600
            }}
            onClick={() => setMode(m)}
          >
            {m === 'manual' ? '📝 Manual Entry' : '📱 Simulate WhatsApp'}
          </button>
        ))}
      </div>

      <div className="stat-card mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>
              Team Member
            </label>
            <select
              className="form-select form-select-dark"
              value={form.phone}
              onChange={e => handleMemberSelect(e.target.value)}
            >
              <option value="">Select a member...</option>
              {members.map(m => <option key={m.id} value={m.phone}>{m.name} ({m.phone})</option>)}
              <option value="custom">+ Custom number</option>
            </select>
          </div>
          {(form.phone === 'custom' || !members.find(m => m.phone === form.phone)) && (
            <>
              <div className="col-md-3">
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>Phone</label>
                <input
                  className="form-control form-control-dark"
                  placeholder="+91..."
                  value={form.phone === 'custom' ? '' : form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="col-md-3">
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>Name</label>
                <input
                  className="form-control form-control-dark"
                  placeholder="Sender name"
                  value={form.sender_name}
                  onChange={e => setForm(f => ({ ...f, sender_name: e.target.value }))}
                />
              </div>
            </>
          )}
          <div className="col-md-6">
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>Date</label>
            <input
              type="date"
              className="form-control form-control-dark"
              value={form.message_date}
              onChange={e => setForm(f => ({ ...f, message_date: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-3">
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>
            Message / Update
          </label>
          <textarea
            rows={4}
            className="form-control form-control-dark"
            placeholder="Type the team member's update here..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          />
        </div>

        <button className="btn btn-accent mt-3" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : <><i className="bi bi-plus-circle-fill me-2"></i>Add Update</>}
        </button>
      </div>

      {/* Sample Messages */}
      <div>
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>
          <i className="bi bi-lightbulb me-2" style={{ color: 'var(--accent)' }}></i>
          Sample Messages (click to use)
        </div>
        <div className="d-flex flex-column gap-2">
          {bulkMessages.map((msg, i) => (
            <div
              key={i}
              className="suggestion-chip"
              style={{ borderRadius: 8, whiteSpace: 'normal', textAlign: 'left', display: 'block', cursor: 'pointer' }}
              onClick={() => setForm(f => ({ ...f, content: msg }))}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
