import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Shared styles injected via a style tag
const authStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

  .auth-page { font-family: 'Inter', sans-serif; }
  .auth-headline { font-family: 'Manrope', sans-serif; }
  .auth-icon { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .auth-icon-filled { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  .btn-academic-gradient {
    background: linear-gradient(135deg, #004ac6 0%, #2563eb 100%);
  }
  .auth-soft-elevation {
    box-shadow: 0 24px 40px -8px rgba(25, 28, 30, 0.06);
  }
  .auth-input {
    width: 100%; background: #e0e3e5; border: none;
    border-radius: 12px; padding: 14px 16px 14px 44px;
    font-size: 15px; color: #191c1e;
    outline: none; transition: all 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .auth-input::placeholder { color: #737686; }
  .auth-input:focus {
    background: #fff;
    box-shadow: 0 0 0 2px rgba(0, 74, 198, 0.2);
  }
  .auth-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: #737686; font-size: 20px; pointer-events: none;
    transition: color 0.2s;
  }
  .auth-input-wrap:focus-within .auth-input-icon { color: #004ac6; }

  .role-card input:checked + .role-card-inner {
    border-color: #004ac6;
    background: rgba(37, 99, 235, 0.06);
  }
  .role-card-inner {
    padding: 12px; text-align: center; border-radius: 12px;
    background: #e0e3e5; border: 2px solid transparent;
    cursor: pointer; transition: all 0.2s;
  }
  .role-card-inner:hover { background: #e6e8ea; }
`;

export const Login = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email: identifier, password });
      if (res.data.user.role === 'admin') { window.location.href = '/admin/placements'; return; }
      onLogin(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ minHeight: '100vh', background: '#f7f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <style>{authStyles}</style>
      {/* Background blobs */}
      <div style={{ position: 'fixed', top: 0, right: 0, width: '33vw', height: '33vh', background: 'rgba(37,99,235,0.05)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '25vw', height: '25vh', background: 'rgba(101,109,132,0.05)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />

      <main style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="btn-academic-gradient auth-soft-elevation" style={{ width: 64, height: 64, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span className="auth-icon-filled" style={{ fontSize: 30, color: '#fff' }}>school</span>
          </div>
          <h1 className="auth-headline" style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1e', margin: '0 0 6px' }}>Placement Console</h1>
          <p style={{ color: '#515f74', fontWeight: 500, margin: 0, letterSpacing: '0.02em' }}>Academic Architect</p>
        </div>

        {/* Card */}
        <div className="auth-soft-elevation" style={{ background: '#fff', borderRadius: '16px', padding: '40px' }}>
          <h2 className="auth-headline" style={{ fontSize: 20, fontWeight: 700, color: '#191c1e', marginBottom: 32, marginTop: 0 }}>Sign In</h2>

          {error && (
            <div style={{ padding: '12px 16px', background: '#ffdad6', color: '#93000a', borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#434655', marginLeft: 4 }}>Email Address or Student ID</label>
              <div className="auth-input-wrap" style={{ position: 'relative' }}>
                <span className="auth-icon material-symbols-outlined auth-input-icon">mail</span>
                <input className="auth-input" type="text" placeholder="name@university.edu" value={identifier} onChange={e => setIdentifier(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: 4, marginRight: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#434655' }}>Password</label>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#004ac6', cursor: 'pointer' }}>Forgot password?</span>
              </div>
              <div className="auth-input-wrap" style={{ position: 'relative' }}>
                <span className="auth-icon material-symbols-outlined auth-input-icon">lock</span>
                <input className="auth-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#737686', padding: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
              <input type="checkbox" id="remember" style={{ width: 16, height: 16, accentColor: '#004ac6' }} />
              <label htmlFor="remember" style={{ fontSize: 13, fontWeight: 500, color: '#434655', cursor: 'pointer' }}>Remember this device</label>
            </div>

            <button type="submit" disabled={loading} className="btn-academic-gradient" style={{ width: '100%', color: '#fff', fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 17, padding: '16px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(0,74,198,0.2)', transition: 'transform 0.15s, box-shadow 0.15s', opacity: loading ? 0.8 : 1 }}>
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#434655', margin: 0 }}>
              New to the Console?{' '}
              <Link to="/register" style={{ color: '#004ac6', fontWeight: 700, textDecoration: 'none', marginLeft: 4 }}>Register Now</Link>
            </p>
          </div>
        </div>

        {/* Decorative dots */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 40, opacity: 0.4 }}>
          <div style={{ height: 1, width: 48, background: '#c3c6d7' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#004ac6' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#515f74' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4d556b' }} />
          </div>
          <div style={{ height: 1, width: 48, background: '#c3c6d7' }} />
        </div>
        <footer style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: '#737686', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          © 2024 Placement Console • Secure Academic Access
        </footer>
      </main>
    </div>
  );
};

const BRANCHES = ['COPC','COE','COBS','ENC','ECE','EIC','EEC','ELE','MEE','MEC','CHE','CIE','BIO','BME','MSE','CBE'];

export const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', branch: '', cgpa: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setFormData(f => ({ ...f, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreed) { setError('Please agree to the Terms of Service.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData);
      onLogin(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const roles = [
    { value: 'student', icon: 'school', label: 'Student' },
    { value: 'recruiter', icon: 'business_center', label: 'Recruiter' },
    { value: 'admin', icon: 'admin_panel_settings', label: 'Admin' },
  ];

  return (
    <div className="auth-page" style={{ minHeight: '100vh', background: '#f2f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <style>{authStyles}</style>

      <div style={{ width: '100%', maxWidth: 1080, display: 'grid', gridTemplateColumns: '5fr 7fr', borderRadius: '2rem', overflow: 'hidden', boxShadow: '0 32px 64px rgba(25,28,30,0.08)', background: '#f2f4f6', border: '1px solid rgba(195,198,215,0.15)' }}>

        {/* ── Left Panel ── */}
        <div style={{ background: '#004ac6', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', overflow: 'hidden', minHeight: 600 }}>
          {/* Background image overlay */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80" alt="University library" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25, mixBlendMode: 'overlay' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #004ac6 0%, rgba(0,74,198,0.75) 60%, transparent 100%)' }} />
          </div>

          {/* Top: brand */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontVariationSettings: "'FILL' 1", fontSize: 22 }}>architecture</span>
              </div>
              <span className="auth-headline" style={{ fontWeight: 900, fontSize: 18, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Placement Console</span>
            </div>

            <h1 className="auth-headline" style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
              Architecting<br />Future Careers.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.6, maxWidth: 320 }}>
              The premium console for elite institutions to manage placements, industry relations, and student success with precision.
            </p>
          </div>

          {/* Bottom: social proof */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'flex' }}>
                {['👩‍💼','👨‍💻','👩‍🎓'].map((em, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid #004ac6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginLeft: i ? -8 : 0 }}>{em}</div>
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 500, margin: 0 }}>Trusted by 500+ Top Institutions</p>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ background: '#fff', padding: '48px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ maxWidth: 440, margin: '0 auto', width: '100%' }}>
            <h2 className="auth-headline" style={{ fontSize: 28, fontWeight: 800, color: '#191c1e', marginBottom: 6, marginTop: 0 }}>Create Account</h2>
            <p style={{ color: '#515f74', fontWeight: 500, marginBottom: 32, marginTop: 0 }}>Join the professional placement network today.</p>

            {error && (
              <div style={{ padding: '12px 16px', background: '#ffdad6', color: '#93000a', borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500 }}>{error}</div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#434655', marginLeft: 4 }}>Full Name</label>
                <div className="auth-input-wrap" style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined auth-input-icon" style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#737686',fontSize:20,pointerEvents:'none' }}>person</span>
                  <input className="auth-input" type="text" placeholder="Johnathan Doe" value={formData.name} onChange={e => set('name', e.target.value)} required />
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#434655', marginLeft: 4 }}>Work Email</label>
                <div className="auth-input-wrap" style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined auth-input-icon" style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#737686',fontSize:20,pointerEvents:'none' }}>mail</span>
                  <input className="auth-input" type="email" placeholder="j.doe@institution.edu" value={formData.email} onChange={e => set('email', e.target.value)} required />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#434655', marginLeft: 4 }}>Password</label>
                <div className="auth-input-wrap" style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined auth-input-icon" style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#737686',fontSize:20,pointerEvents:'none' }}>lock</span>
                  <input className="auth-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={e => set('password', e.target.value)} required style={{ paddingRight: 48 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#737686',padding:0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Branch + CGPA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#434655', marginLeft: 4 }}>Branch</label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#737686',fontSize:18,pointerEvents:'none' }}>account_tree</span>
                    <select value={formData.branch} onChange={e => set('branch', e.target.value)} required style={{ width:'100%',background:'#e0e3e5',border:'none',borderRadius:12,padding:'14px 16px 14px 40px',fontSize:14,color: formData.branch ? '#191c1e' : '#737686',outline:'none',appearance:'none',cursor:'pointer' }}>
                      <option value="">Select Branch</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#434655', marginLeft: 4 }}>CGPA</label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#737686',fontSize:18,pointerEvents:'none' }}>grade</span>
                    <input type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.5" value={formData.cgpa} onChange={e => set('cgpa', e.target.value)} required style={{ width:'100%',background:'#e0e3e5',border:'none',borderRadius:12,padding:'14px 16px 14px 40px',fontSize:14,color:'#191c1e',outline:'none',boxSizing:'border-box' }} />
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#434655', marginLeft: 4 }}>Your Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {roles.map(r => (
                    <div key={r.value} onClick={() => set('role', r.value)} style={{ cursor: 'pointer', padding: 12, textAlign: 'center', borderRadius: 12, background: formData.role === r.value ? 'rgba(0,74,198,0.06)' : '#e0e3e5', border: `2px solid ${formData.role === r.value ? '#004ac6' : 'transparent'}`, transition: 'all 0.2s' }}>
                      <span className="material-symbols-outlined" style={{ display: 'block', marginBottom: 4, color: formData.role === r.value ? '#004ac6' : '#515f74', fontSize: 22 }}>{r.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#434655' }}>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingTop: 4 }}>
                <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 16, height: 16, marginTop: 2, accentColor: '#004ac6', flexShrink: 0, cursor: 'pointer' }} />
                <label htmlFor="terms" style={{ fontSize: 12, color: '#515f74', lineHeight: 1.5, cursor: 'pointer' }}>
                  I agree to the{' '}
                  <span style={{ color: '#004ac6', fontWeight: 700 }}>Terms of Service</span>{' '}and{' '}
                  <span style={{ color: '#004ac6', fontWeight: 700 }}>Privacy Policy</span>.
                </label>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-academic-gradient" style={{ width: '100%', color: '#fff', fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 17, padding: '16px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 12px 32px rgba(0,74,198,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.8 : 1 }}>
                {loading ? 'Creating Account…' : 'Create Account'}
                {!loading && <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_forward</span>}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#515f74', margin: 0 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#004ac6', fontWeight: 700, textDecoration: 'none', marginLeft: 4 }}>Sign In</Link>
              </p>
            </div>

            <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(195,198,215,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#737686', letterSpacing: '0.1em', textTransform: 'uppercase' }}>© 2024 Placement Console</span>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#737686', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Support</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#737686', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Status</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
