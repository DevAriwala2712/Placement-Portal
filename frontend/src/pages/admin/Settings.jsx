import React, { useState } from 'react';

const Toggle = ({ checked, onChange }) => (
  <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
    <div style={{ width: 44, height: 24, background: checked ? '#004ac6' : '#e0e3e5', borderRadius: 99, transition: 'background 0.25s', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
    </div>
  </label>
);

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [settings, setSettings] = useState({
    minCGPA: 5.5,
    maxApplications: 10,
    allowMultiple: true,
    emailNotifications: true,
    autoApproval: false,
    autoRefresh: '30 seconds',
    compactMode: false,
  });

  const toggleTheme = (t) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  };

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const sectionIcon = (icon) => (
    <div style={{ padding: '0.625rem', background: 'var(--info-bg)', borderRadius: 10, color: 'var(--primary)', display: 'flex' }}>
      <span className="material-symbols-outlined">{icon}</span>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)' }}>Admin Panel</span>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', margin: '4px 0 4px', fontFamily: 'Outfit,sans-serif', color: 'var(--on-surface)' }}>Academic Architect</h1>
        <p style={{ color: 'var(--secondary)', margin: 0 }}>Manage system configuration, appearance, and placement rules.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Appearance ── */}
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            {sectionIcon('palette')}
            <div>
              <h3 style={{ margin: '0 0 2px', fontSize: 18, fontFamily: 'Outfit,sans-serif' }}>Appearance</h3>
              <p style={{ margin: 0, color: 'var(--secondary)', fontSize: 13 }}>Customize how the console looks on your device.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Light card */}
            <div onClick={() => toggleTheme('light')} style={{ border: `2px solid ${theme === 'light' ? '#004ac6' : 'transparent'}`, borderRadius: 14, padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', background: '#fff', transform: theme === 'light' ? 'scale(1.02)' : 'scale(1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>Light Mode</span>
                {theme === 'light'
                  ? <span className="material-symbols-outlined icon-filled" style={{ color: '#004ac6' }}>check_circle</span>
                  : <span className="material-symbols-outlined" style={{ color: '#94a3b8' }}>radio_button_unchecked</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.55 }}>
                <div style={{ height: 8, width: '75%', background: '#e2e8f0', borderRadius: 4 }} />
                <div style={{ height: 8, width: '50%', background: '#e2e8f0', borderRadius: 4 }} />
                <div style={{ height: 28, width: '100%', background: '#f1f5f9', borderRadius: 8, marginTop: 4 }} />
              </div>
            </div>
            {/* Dark card */}
            <div onClick={() => toggleTheme('dark')} style={{ border: `2px solid ${theme === 'dark' ? '#3b82f6' : 'transparent'}`, borderRadius: 14, padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', background: '#0f172a', transform: theme === 'dark' ? 'scale(1.02)' : 'scale(1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>Dark Mode</span>
                {theme === 'dark'
                  ? <span className="material-symbols-outlined icon-filled" style={{ color: '#3b82f6' }}>check_circle</span>
                  : <span className="material-symbols-outlined" style={{ color: '#475569' }}>radio_button_unchecked</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.3 }}>
                <div style={{ height: 8, width: '75%', background: '#1e293b', borderRadius: 4 }} />
                <div style={{ height: 8, width: '50%', background: '#1e293b', borderRadius: 4 }} />
                <div style={{ height: 28, width: '100%', background: '#1e293b', borderRadius: 8, marginTop: 4 }} />
              </div>
            </div>
          </div>
          {/* Compact toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--outline)' }}>
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 2px', color: 'var(--on-surface)', fontSize: 14 }}>Compact Mode</p>
              <p style={{ fontSize: 12, color: 'var(--secondary)', margin: 0 }}>Reduce padding to display more data at once.</p>
            </div>
            <Toggle checked={settings.compactMode} onChange={v => set('compactMode', v)} />
          </div>
        </div>

        {/* ── Placement Rules ── */}
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            {sectionIcon('rule')}
            <div>
              <h3 style={{ margin: '0 0 2px', fontSize: 18, fontFamily: 'Outfit,sans-serif' }}>Placement Rules</h3>
              <p style={{ margin: 0, color: 'var(--secondary)', fontSize: 13 }}>Configure eligibility and application constraints.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Minimum CGPA', key: 'minCGPA', type: 'number', step: 0.1, min: 0, max: 10 },
              { label: 'Max Applications / Student', key: 'maxApplications', type: 'number', step: 1, min: 1 },
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--secondary)', paddingLeft: 4 }}>{f.label}</label>
                <input
                  type={f.type} step={f.step} min={f.min} max={f.max}
                  value={settings[f.key]}
                  onChange={e => set(f.key, f.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                  style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: 'var(--on-surface)', outline: 'none' }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Allow Multiple Offers', key: 'allowMultiple', desc: 'Students can hold more than one job offer simultaneously.' },
              { label: 'Auto-approve High CGPA', key: 'autoApproval', desc: 'Automatically approve students above the CGPA threshold.' },
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--outline)' }}>
                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 2px', color: 'var(--on-surface)', fontSize: 14 }}>{f.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--secondary)', margin: 0 }}>{f.desc}</p>
                </div>
                <Toggle checked={settings[f.key]} onChange={v => set(f.key, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Productivity ── */}
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            {sectionIcon('bolt')}
            <div>
              <h3 style={{ margin: '0 0 2px', fontSize: 18, fontFamily: 'Outfit,sans-serif' }}>Productivity</h3>
              <p style={{ margin: 0, color: 'var(--secondary)', fontSize: 13 }}>Control automation and notification behaviours.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontWeight: 600, margin: '0 0 2px', color: 'var(--on-surface)', fontSize: 14 }}>Auto Refresh</p>
                <p style={{ fontSize: 12, color: 'var(--secondary)', margin: 0 }}>Keep placement records up to date automatically.</p>
              </div>
              <select value={settings.autoRefresh} onChange={e => set('autoRefresh', e.target.value)} style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', outline: 'none', cursor: 'pointer', minWidth: 140 }}>
                {['15 seconds', '30 seconds', '60 seconds', 'Disabled'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--outline)' }}>
              <div>
                <p style={{ fontWeight: 600, margin: '0 0 2px', color: 'var(--on-surface)', fontSize: 14 }}>Email Notifications</p>
                <p style={{ fontSize: 12, color: 'var(--secondary)', margin: 0 }}>Receive weekly placement summaries via email.</p>
              </div>
              <Toggle checked={settings.emailNotifications} onChange={v => set('emailNotifications', v)} />
            </div>
          </div>
        </div>

        {/* ── System Info ── */}
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            {sectionIcon('info')}
            <div>
              <h3 style={{ margin: '0 0 2px', fontSize: 18, fontFamily: 'Outfit,sans-serif' }}>System Information</h3>
              <p style={{ margin: 0, color: 'var(--secondary)', fontSize: 13 }}>Technical details about this deployment.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Version', value: 'Placement Cell 2.0' },
              { label: 'Database', value: 'PL/SQL Simulator' },
              { label: 'Backend', value: 'Express.js' },
              { label: 'Frontend', value: 'React + Vite' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--surface-container)', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--secondary)', margin: '0 0 4px' }}>{label}</p>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface)', margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--outline)' }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--secondary)', marginBottom: 8 }}>PL/SQL Functions</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['GetBranchAvgPackage()', 'AddApplication()', 'UpdateStudentStatus()', 'GetPlacementAnalytics()'].map(fn => (
                <span key={fn} style={{ background: 'var(--info-bg)', color: 'var(--primary)', fontWeight: 600, fontSize: 12, padding: '4px 12px', borderRadius: 99, fontFamily: 'monospace' }}>{fn}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingBottom: 8 }}>
          <button onClick={() => setSettings(s => ({ ...s, minCGPA: 5.5, maxApplications: 10, allowMultiple: true, emailNotifications: true, autoApproval: false }))}
            style={{ background: 'var(--surface-container)', color: 'var(--secondary)', fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span> Reset
          </button>
          <button onClick={() => { alert('Settings saved!'); }}
            style={{ background: 'linear-gradient(135deg,#004ac6,#2563eb)', color: '#fff', fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,74,198,0.25)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span> Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;