import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/admin';

const STATUS_COLORS = {
  Pending:     { bg: '#fef3c7', color: '#92400e', icon: 'hourglass_empty' },
  Selected:    { bg: '#d1fae5', color: '#065f46', icon: 'check_circle' },
  Rejected:    { bg: '#fee2e2', color: '#991b1b', icon: 'cancel' },
  Interviewing:{ bg: '#dbeafe', color: '#1e40af', icon: 'video_chat' },
};

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = () => {
    setLoading(true);
    axios.get(`${API_URL}/applications`)
      .then(res => { setApplications(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await axios.patch(`${API_URL}/applications/${id}`, { status: newStatus });
      setApplications(prev =>
        prev.map(a => a.application_id === id ? { ...a, status: newStatus } : a)
      );
      showToast(`Application ${newStatus === 'Selected' ? 'accepted ✅' : newStatus === 'Rejected' ? 'rejected ❌' : 'updated'}`, newStatus === 'Rejected' ? 'error' : 'success');
    } catch (e) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = applications.filter(a => {
    const matchFilter = filter === 'All' || a.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || 
      (a.student_name || '').toLowerCase().includes(q) ||
      (a.company || '').toLowerCase().includes(q) ||
      (a.role || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const counts = {
    All: applications.length,
    Pending: applications.filter(a => a.status === 'Pending').length,
    Interviewing: applications.filter(a => a.status === 'Interviewing').length,
    Selected: applications.filter(a => a.status === 'Selected').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  const chipStyle = (active, color) => ({
    padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
    background: active ? (color || '#004ac6') : 'var(--surface-container)',
    color: active ? '#fff' : 'var(--secondary)',
  });

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 999,
          padding: '14px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14,
          background: toast.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: toast.type === 'success' ? '#065f46' : '#991b1b',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <h1>Application Tracking</h1>
        <p>Review and manage all student job applications.</p>
      </div>

      {/* Summary Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries(counts).map(([label, count]) => (
          <button key={label} style={chipStyle(filter === label, label === 'Selected' ? '#065f46' : label === 'Rejected' ? '#991b1b' : label === 'Interviewing' ? '#1e40af' : undefined)} onClick={() => setFilter(label)}>
            {label} <span style={{ opacity: 0.75, marginLeft: 4 }}>({count})</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: 18, pointerEvents: 'none' }}>search</span>
          <input
            placeholder="Search student, company, role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 12, padding: '10px 16px 10px 38px', fontSize: 13, color: 'var(--on-surface)', outline: 'none', width: 260 }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface-container)', borderRadius: 20, padding: 4 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 16, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>Loading applications…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 8 }}>inbox</span>
              No applications found.
            </div>
          ) : (
            <table className="console-table" style={{ margin: 0 }}>
              <thead>
                <tr style={{ background: 'rgba(195,198,215,0.12)' }}>
                  {['Student', 'Company', 'Role', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '16px 20px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--secondary)', border: 'none' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((app, i) => {
                  const sc = STATUS_COLORS[app.status] || STATUS_COLORS.Pending;
                  const busy = updating === app.application_id;
                  return (
                    <tr key={app.application_id} style={{ background: i % 2 === 1 ? 'rgba(242,244,246,0.4)' : 'transparent' }}>
                      <td style={{ padding: '14px 20px', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#004ac6,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {(app.student_name || '?').charAt(0)}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{app.student_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', border: 'none', fontWeight: 600, fontSize: 14 }}>{app.company}</td>
                      <td style={{ padding: '14px 20px', border: 'none', fontSize: 13, color: 'var(--secondary)', maxWidth: 200 }}>
                        <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.role}>{app.role}</span>
                      </td>
                      <td style={{ padding: '14px 20px', border: 'none', fontSize: 13, color: 'var(--secondary)' }}>{app.date}</td>
                      <td style={{ padding: '14px 20px', border: 'none' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{sc.icon}</span>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', border: 'none' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {app.status !== 'Selected' && (
                            <button
                              onClick={() => handleStatusChange(app.application_id, 'Selected')}
                              disabled={busy}
                              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: busy ? 'not-allowed' : 'pointer', background: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, opacity: busy ? 0.6 : 1 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                              Accept
                            </button>
                          )}
                          {app.status !== 'Interviewing' && app.status !== 'Rejected' && app.status !== 'Selected' && (
                            <button
                              onClick={() => handleStatusChange(app.application_id, 'Interviewing')}
                              disabled={busy}
                              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: busy ? 'not-allowed' : 'pointer', background: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, opacity: busy ? 0.6 : 1 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>video_chat</span>
                              Interview
                            </button>
                          )}
                          {app.status !== 'Rejected' && (
                            <button
                              onClick={() => handleStatusChange(app.application_id, 'Rejected')}
                              disabled={busy}
                              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: busy ? 'not-allowed' : 'pointer', background: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, opacity: busy ? 0.6 : 1 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cancel</span>
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <div style={{ padding: '12px 20px', background: 'var(--surface-container)', fontSize: 12, color: 'var(--secondary)', fontWeight: 500 }}>
            Showing {Math.min(filtered.length, 100)} of {filtered.length} applications
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageApplications;