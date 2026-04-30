import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Login, Register } from './components/AuthPages';

import AdminLayout from './pages/admin/AdminLayout';
import ManageStudents from './pages/admin/ManageStudents';
import ManageApplications from './pages/admin/ManageApplications';
import ManageJobs from './pages/admin/ManageJobs';
import Analytics from './pages/admin/Analytics';
import Companies from './pages/admin/Companies';
import Tracker from './pages/admin/Tracker';
import Settings from './pages/admin/Settings';
import Placements from './pages/admin/Placements';

const API_URL = 'http://localhost:5001/api';



const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- App Components ---

const Navbar = ({ user, onLogout }) => (
  <nav className="navbar-top">
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div className="sidebar-brand-mark" style={{ width: '36px', height: '36px' }}>
        <span className="material-symbols-outlined icon-filled" style={{ fontSize: '20px' }}>school</span>
      </div>
      <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }} className="text-gradient">PlacementCell</span>
    </div>
    
    <div className="nav-links">
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
      <NavLink to="/jobs" className={({ isActive }) => isActive ? 'active' : ''}>Opportunities</NavLink>
      <NavLink to="/my-applications" className={({ isActive }) => isActive ? 'active' : ''}>My Applications</NavLink>
      <NavLink to="/students" className={({ isActive }) => isActive ? 'active' : ''}>Directory</NavLink>
      <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>Settings</NavLink>
    </div>

    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface-container)', padding: '0.4rem 1rem', borderRadius: '99px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
          {user.name.charAt(0)}
        </div>
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--on-surface)' }}>{user.name}</span>
      </div>
      <button onClick={onLogout} className="btn btn-ghost btn-sm" style={{ padding: '0.5rem 1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
        Logout
      </button>
    </div>
  </nav>
);

const MyApplications = ({ user }) => {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get(`${API_URL}/admin/applications`).then(res => {
        setApps(res.data.filter(a => a.student_id === user.student_id));
      });
    }
  }, [user]);

  return (
    <div className="container fade-in">
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track your ongoing recruitment processes.</p>
      </div>
      
      <div className="glass stagger-1">
        {apps.length === 0 ? (
          <div className="console-empty">
            <span className="material-symbols-outlined">inbox</span>
            <h3>No applications yet</h3>
            <p>You haven't applied to any roles yet. Check the Opportunities page to get started.</p>
            <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Browse Opportunities</Link>
          </div>
        ) : (
          <table className="console-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Applied Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app.application_id}>
                  <td style={{ fontWeight: '600' }}>{app.company}</td>
                  <td>{app.role}</td>
                  <td style={{ color: 'var(--secondary)' }}>{app.date}</td>
                  <td>
                    <span className={`status-pill status-${app.status.toLowerCase()}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        {app.status === 'Selected' ? 'check_circle' : app.status === 'Rejected' ? 'cancel' : 'pending'}
                      </span>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/stats`).then(res => setStats(res.data));
    if (user) axios.get(`${API_URL}/admin/applications`).then(res => setApps(res.data.filter(a => a.student_id === user.student_id)));
  }, [user]);

  if (!stats) return <div className="container"><p>Loading dashboard...</p></div>;

  const interviewing = apps.filter(a => a.status === 'Interviewing' || a.status === 'Pending').length;
  const offered = apps.filter(a => a.status === 'Selected').length;

  const today = new Date();
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  return (
    <div className="container fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)' }}>Student Portal</span>
          <h1 style={{ fontSize: '44px', fontWeight: '800', letterSpacing: '-0.02em', margin: '4px 0 0', color: 'var(--on-surface)' }}>Opportunity Hub</h1>
        </div>
        {/* Bento stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="glass" style={{ padding: '20px 24px', minWidth: 160, border: '1px solid rgba(195,198,215,0.15)' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--secondary)', margin: '0 0 8px' }}>Interviewing</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', fontFamily: 'Outfit,sans-serif' }}>{String(interviewing).padStart(2,'0')}</span>
              <span className="material-symbols-outlined icon-filled" style={{ fontSize: '36px', color: 'var(--primary)', opacity: 0.3 }}>video_chat</span>
            </div>
          </div>
          <div className="glass" style={{ padding: '20px 24px', minWidth: 160, border: '1px solid rgba(195,198,215,0.15)' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--secondary)', margin: '0 0 8px' }}>Offered</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#16a34a', fontFamily: 'Outfit,sans-serif' }}>{String(offered).padStart(2,'0')}</span>
              <span className="material-symbols-outlined icon-filled" style={{ fontSize: '36px', color: '#16a34a', opacity: 0.3 }}>verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-metrics stagger-1" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Companies', value: stats.totalCompanies, icon: 'business', color: '#3b82f6', bar: 0.75 },
          { label: 'Total Jobs', value: stats.totalJobs, icon: 'work', color: '#8b5cf6', bar: 0.6 },
          { label: 'Placed Students', value: `${stats.placedStudents}/${stats.totalStudents}`, icon: 'school', color: '#10b981', bar: stats.placedStudents/Math.max(stats.totalStudents,1) },
          { label: 'Avg Package', value: `₹${stats.avgPackage}L`, icon: 'payments', color: '#f59e0b', bar: 0.5 },
        ].map((tile, i) => (
          <div key={tile.label} className="metric-tile" style={{ animationDelay: `${0.1 * i}s`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.05 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '60px' }}>{tile.icon}</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--secondary)', display: 'block', marginBottom: 8 }}>{tile.label}</span>
            <p style={{ fontSize: '36px', fontWeight: '800', color: 'var(--on-surface)', margin: '0 0 16px', fontFamily: 'Outfit, sans-serif' }}>{tile.value}</p>
            <div style={{ height: 6, background: 'var(--outline)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: tile.color, width: `${tile.bar * 100}%`, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: Promo + Events */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="glass stagger-2" style={{ padding: '2rem', background: 'linear-gradient(135deg, #004ac6, #2563eb)', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: 'none' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem' }}>Enhance your profile</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0 0 1.5rem', maxWidth: 380, fontSize: 14, lineHeight: 1.6 }}>Students with a complete profile have a 40% higher placement rate. Update your portfolio now.</p>
            <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#004ac6', fontWeight: '700', fontSize: 13, padding: '12px 24px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              Browse Opportunities
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </Link>
          </div>
          <span className="material-symbols-outlined icon-filled" style={{ position: 'absolute', bottom: -32, right: -24, fontSize: 160, color: 'rgba(255,255,255,0.08)', transform: 'rotate(12deg)' }}>rocket_launch</span>
        </div>

        <div className="glass stagger-3" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--on-surface)', margin: '0 0 4px' }}>Upcoming Events</h3>
          <p style={{ fontSize: '11px', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1.5rem', fontWeight: 600 }}>Mock Interviews • Next 48h</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { month: months[today.getMonth()], day: today.getDate(), title: 'HR Round Strategy', time: '10:00 AM • Seminar Hall B', bg: '#dae2fd', color: '#131b2e' },
              { month: months[(today.getMonth()+1)%12], day: (today.getDate()+1), title: 'Tech-Stack Deep Dive', time: '02:30 PM • Virtual Meet', bg: '#d5e3fc', color: '#0d1c2e' },
            ].map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 48, height: 48, background: ev.bg, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: ev.color }}>
                  <span style={{ fontSize: 9, fontWeight: 700, lineHeight: 1 }}>{ev.month}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>{ev.day}</span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', margin: '0 0 2px' }}>{ev.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--secondary)', margin: 0 }}>{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Jobs = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState(null);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/jobs`).then(res => setJobs(res.data.slice(0, 50)));
  }, []);

  const handleApply = (roleId) => {
    setApplying(roleId);
    axios.post(`${API_URL}/apply`, { student_id: user.student_id, role_id: roleId })
      .then(res => {
        setMessage({ text: res.data.message, type: 'success' });
        setApplying(null);
      })
      .catch(err => {
        setMessage({ text: err.response?.data?.message || 'Error applying to job', type: 'error' });
        setApplying(null);
      });
    
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="container fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>Opportunities</h1>
          <p>Available positions from recruiting companies.</p>
        </div>
        {message && (
          <div style={{ 
            padding: '12px 20px', 
            borderRadius: '12px',
            background: message.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.3s ease'
          }}>
            <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
            {message.text}
          </div>
        )}
      </div>

      <div className="grid-cards stagger-1">
        {jobs.map(job => (
          <div key={job.role_id} className="job-card">
            <div className="job-header">
              <div className="company-logo-placeholder">
                {job.company.charAt(0)}
              </div>
              <span className="status-pill status-open">Active</span>
            </div>
            
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700' }}>{job.title}</h3>
            <p style={{ margin: 0, color: 'var(--secondary)', fontWeight: '500' }}>{job.company}</p>
            
            <div className="job-tags">
              <span className="job-tag">
                <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px' }}>work</span>
                {job.type}
              </span>
              <span className="job-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px' }}>payments</span>
                {job.package} LPA
              </span>
            </div>
            
            <div style={{ flex: 1 }}></div>
            
            <div style={{ padding: '16px', background: 'var(--surface-low)', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>Min CGPA:</span>
                <span style={{ fontWeight: '700' }}>{job.cgpa || 'NA'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>Branches:</span>
                <span style={{ fontWeight: '600', textAlign: 'right', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={job.branches}>
                  {job.branches}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => handleApply(job.role_id)} 
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={applying === job.role_id}
            >
              {applying === job.role_id ? 'Applying...' : 'Apply Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    axios.get(`${API_URL}/students`).then(res => setStudents(res.data));
  }, []);

  const branches = ['All', ...Array.from(new Set(students.map(s => s.branch))).sort()];

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || String(s.student_id).includes(q) || s.branch.toLowerCase().includes(q);
    const matchBranch = branchFilter === 'All' || s.branch === branchFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchBranch && matchStatus;
  });

  const chipStyle = (active) => ({
    padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: active ? 'var(--primary)' : 'var(--surface-container)',
    color: active ? '#fff' : 'var(--secondary)',
    border: 'none', transition: 'all 0.15s'
  });

  return (
    <div className="container fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)' }}>Student Portal</span>
        <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em', margin: '4px 0 4px', color: 'var(--on-surface)' }}>Student Directory</h1>
        <p style={{ color: 'var(--secondary)', margin: 0 }}>Browse and search all registered students in the current batch.</p>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: 20, pointerEvents: 'none' }}>search</span>
          <input
            type="text"
            placeholder="Search by name, ID, or branch…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'var(--surface-container)', border: 'none', borderRadius: 12, padding: '12px 16px 12px 44px', fontSize: 14, color: 'var(--on-surface)', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 8 }}>
          {['All','Placed','Not Placed'].map(s => (
            <button key={s} style={chipStyle(statusFilter === s)} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>

        {/* Branch dropdown */}
        <div style={{ position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: 16, pointerEvents: 'none' }}>account_tree</span>
          <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 12, padding: '10px 36px 10px 36px', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <span className="material-symbols-outlined" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: 16, pointerEvents: 'none' }}>expand_more</span>
        </div>

        <span style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{filtered.length} students</span>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface-container)', borderRadius: 24, padding: 4 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 20, overflow: 'hidden' }}>
          <table className="console-table" style={{ margin: 0 }}>
            <thead>
              <tr style={{ background: 'rgba(195,198,215,0.12)' }}>
                <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--secondary)', border: 'none' }}>ID</th>
                <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--secondary)', border: 'none' }}>Student</th>
                <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--secondary)', border: 'none' }}>Branch</th>
                <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--secondary)', border: 'none' }}>CGPA</th>
                <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--secondary)', border: 'none' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)' }}>No students match your search.</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.student_id} style={{ background: i % 2 === 1 ? 'rgba(242,244,246,0.5)' : 'transparent', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-low)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 1 ? 'rgba(242,244,246,0.5)' : 'transparent'}>
                  <td style={{ padding: '18px 24px', color: 'var(--secondary)', fontWeight: 500, fontSize: 13, border: 'none' }}>#{s.student_id}</td>
                  <td style={{ padding: '18px 24px', border: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#004ac6,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14, flexShrink: 0 }}>{s.name.charAt(0)}</div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface)', margin: 0 }}>{s.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--secondary)', margin: 0 }}>{s.email || `student${s.student_id}@thapar.edu`}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '18px 24px', border: 'none' }}><span className="job-tag">{s.branch}</span></td>
                  <td style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--on-surface)', border: 'none' }}>{s.cgpa}</td>
                  <td style={{ padding: '18px 24px', border: 'none' }}>
                    <span className={`status-pill ${s.status === 'Placed' ? 'status-placed' : 'status-pending'}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{s.status === 'Placed' ? 'verified' : 'hourglass_empty'}</span>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Footer */}
          <div style={{ padding: '16px 24px', background: 'var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 500 }}>Showing {filtered.length} of {students.length} students</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentSettings = ({ user, onThemeChange }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [compactMode, setCompactMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState('30 seconds');
  
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (onThemeChange) onThemeChange(newTheme);
  };

  const Toggle = ({ checked, onChange }) => (
    <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <div style={{ width: 44, height: 24, background: checked ? 'var(--primary)' : 'var(--outline)', borderRadius: 99, transition: 'background 0.2s', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </div>
    </label>
  );

  return (
    <div className="container fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 4px', color: 'var(--on-surface)', fontFamily: 'Outfit,sans-serif' }}>Academic Architect</h1>
        <p style={{ margin: 0, color: 'var(--secondary)' }}>Manage your system preferences and account credentials.</p>
      </div>

      <div className="glass stagger-1" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--info-bg)', borderRadius: '12px', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined icon-filled">palette</span>
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '20px' }}>Appearance</h3>
            <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '14px' }}>Customize how the placement console looks on your device.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          
          <div 
            onClick={() => toggleTheme('light')}
            style={{ 
              border: `2px solid ${theme === 'light' ? 'var(--primary)' : 'var(--glass-border)'}`,
              borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s',
              background: 'white', color: '#0f172a',
              position: 'relative', overflow: 'hidden',
              boxShadow: theme === 'light' ? '0 4px 15px rgba(59, 130, 246, 0.2)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '700' }}>Light Mode</span>
              {theme === 'light' ? <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--primary)' }}>check_circle</span> : <span className="material-symbols-outlined" style={{ color: '#94a3b8' }}>radio_button_unchecked</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.6 }}>
              <div style={{ height: '8px', width: '70%', background: '#e2e8f0', borderRadius: '4px' }}></div>
              <div style={{ height: '8px', width: '40%', background: '#e2e8f0', borderRadius: '4px' }}></div>
              <div style={{ height: '40px', width: '100%', background: '#f1f5f9', borderRadius: '8px', marginTop: '8px' }}></div>
            </div>
          </div>

          <div 
            onClick={() => toggleTheme('dark')}
            style={{ 
              border: `2px solid ${theme === 'dark' ? '#3b82f6' : 'var(--glass-border)'}`,
              borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s',
              background: '#0f172a', color: 'white',
              position: 'relative', overflow: 'hidden',
              boxShadow: theme === 'dark' ? '0 4px 15px rgba(59, 130, 246, 0.2)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '700' }}>Dark Mode</span>
              {theme === 'dark' ? <span className="material-symbols-outlined icon-filled" style={{ color: '#3b82f6' }}>check_circle</span> : <span className="material-symbols-outlined" style={{ color: '#475569' }}>radio_button_unchecked</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.4 }}>
              <div style={{ height: '8px', width: '70%', background: '#1e293b', borderRadius: '4px' }}></div>
              <div style={{ height: '8px', width: '40%', background: '#1e293b', borderRadius: '4px' }}></div>
              <div style={{ height: '40px', width: '100%', background: '#1e293b', borderRadius: '8px', marginTop: '8px' }}></div>
            </div>
          </div>

        </div>
        {/* Compact Mode */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', marginTop: '1.25rem', borderTop: '1px solid var(--outline)' }}>
          <div>
            <p style={{ fontWeight: 600, margin: '0 0 2px', color: 'var(--on-surface)', fontSize: 15 }}>Compact Mode</p>
            <p style={{ fontSize: 12, color: 'var(--secondary)', margin: 0 }}>Reduce padding to show more placement data at once.</p>
          </div>
          <Toggle checked={compactMode} onChange={setCompactMode} />
        </div>
      </div>
      
      {/* Productivity */}
      <div className="glass stagger-2" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '0.625rem', background: 'var(--info-bg)', borderRadius: '10px', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined">bolt</span>
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '20px', fontFamily: 'Outfit,sans-serif' }}>Productivity</h3>
            <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '14px' }}>Control automation and notification behaviors.</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 2px', color: 'var(--on-surface)', fontSize: 15 }}>Auto Refresh</p>
              <p style={{ fontSize: 12, color: 'var(--secondary)', margin: 0 }}>Keep the student placement list up to date automatically.</p>
            </div>
            <select value={autoRefresh} onChange={e => setAutoRefresh(e.target.value)} style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', outline: 'none', cursor: 'pointer', minWidth: 140 }}>
              {['15 seconds', '30 seconds', '60 seconds', 'Disabled'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--outline)' }}>
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 2px', color: 'var(--on-surface)', fontSize: 15 }}>Email Notifications</p>
              <p style={{ fontSize: 12, color: 'var(--secondary)', margin: 0 }}>Receive weekly placement summaries via email.</p>
            </div>
            <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="glass stagger-3" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '0.625rem', background: 'var(--info-bg)', borderRadius: '10px', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '20px', fontFamily: 'Outfit,sans-serif' }}>Account</h3>
            <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '14px' }}>Update your personal information and security settings.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[
            { label: 'Full Name', value: user?.name || '', type: 'text' },
            { label: 'Email Address', value: user?.email || '', type: 'email' },
            { label: 'Branch', value: user?.branch || '', type: 'text' },
            { label: 'CGPA', value: user?.cgpa || '', type: 'text' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--secondary)', paddingLeft: 4 }}>{f.label}</label>
              <input type={f.type} defaultValue={f.value} readOnly style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: 'var(--on-surface)', outline: 'none', opacity: 0.8 }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--outline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>
            Change Password
          </span>
          <button style={{ background: 'linear-gradient(135deg, #004ac6, #2563eb)', color: '#fff', fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,74,198,0.25)' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(() => {
    // Try to load user from localStorage on init
    const saved = localStorage.getItem('placement_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // Initialize dark mode
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogin = (studentUser) => {
    setUser(studentUser);
    localStorage.setItem('placement_user', JSON.stringify(studentUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('placement_user');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        
        {/* Protected Student Routes */}
        <Route path="/*" element={
          <ProtectedRoute user={user}>
            <div className="main-layout">
              <Navbar user={user} onLogout={handleLogout} />
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/jobs" element={<Jobs user={user} />} />
                <Route path="/my-applications" element={<MyApplications user={user} />} />
                <Route path="/students" element={<StudentList />} />
                <Route path="/settings" element={<StudentSettings user={user} />} />
              </Routes>
            </div>
          </ProtectedRoute>
        } />

        {/* Admin Routes (Kept as is, assuming they have their own protection or don't need it for demo) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="placements" element={<Placements />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="applications" element={<ManageApplications />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="companies" element={<Companies />} />
          <Route path="tracker" element={<Tracker />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;