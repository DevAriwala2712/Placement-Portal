import React from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/placements', label: 'Placements', icon: 'emoji_events' },
    { path: '/admin/students',   label: 'Students',   icon: 'school' },
    { path: '/admin/applications', label: 'Applications', icon: 'assignment' },
    { path: '/admin/jobs',       label: 'Jobs',       icon: 'work' },
    { path: '/admin/analytics',  label: 'Analytics',  icon: 'bar_chart' },
    { path: '/admin/companies',  label: 'Companies',  icon: 'business' },
    { path: '/admin/tracker',    label: 'Tracker',    icon: 'find_in_page' },
  ];

  const currentLabel = [...navItems, { path: '/admin/settings', label: 'Settings' }]
    .find(t => location.pathname === t.path)?.label || 'Placement Console';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, width: 260, height: '100vh',
        display: 'flex', flexDirection: 'column',
        background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--glass-border)',
        boxShadow: '2px 0 32px rgba(0,0,0,0.04)', zIndex: 40,
      }}>
        {/* Brand */}
        <div style={{ padding: '28px 24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg,#004ac6,#2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 14px rgba(0,74,198,0.35)',
          }}>
            <span className="material-symbols-outlined icon-filled" style={{ fontSize: 22 }}>school</span>
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: '#004ac6', margin: 0, letterSpacing: '-0.01em' }}>Placement</h1>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#515f74', textTransform: 'uppercase', letterSpacing: '0.18em', margin: 0 }}>Academic Architect</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {navItems.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => `adm-nav-link${isActive ? ' adm-nav-active' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) => `adm-nav-link${isActive ? ' adm-nav-active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>settings</span>
            <span>Settings</span>
          </NavLink>
          <Link to="/login" style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
            borderRadius: 12, color: 'var(--secondary)', textDecoration: 'none',
            fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ marginLeft: 260, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: 68,
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--on-surface)', margin: 0 }}>
              {currentLabel}
            </h2>
            {/* Mini search */}
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: 18, pointerEvents: 'none' }}>search</span>
              <input
                placeholder="Search students, companies…"
                style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 12, padding: '9px 16px 9px 38px', fontSize: 13, color: 'var(--on-surface)', outline: 'none', width: 260 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            <div style={{ width: 1, height: 28, background: 'var(--outline)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#004ac6,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>A</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>Administrator</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Super User</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px' }}>
          <Outlet />
        </main>
      </div>

      {/* ── FAB ── */}
      <button style={{
        position: 'fixed', bottom: 32, right: 32, zIndex: 50,
        width: 60, height: 60, borderRadius: '50%',
        background: 'linear-gradient(135deg,#004ac6,#2563eb)',
        color: '#fff', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(0,74,198,0.4)',
        transition: 'all 0.2s',
        fontSize: 28,
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}
        title="New Record"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add</span>
      </button>
    </div>
  );
};

export default AdminLayout;