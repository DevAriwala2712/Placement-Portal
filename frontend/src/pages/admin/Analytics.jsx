import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/admin';

const Analytics = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runReport = () => {
    setLoading(true);
    axios.get(`${API_URL}/analytics/branch-avg`)
      .then(res => {
        setReport(res.data);
        setLoading(false);
        setHasRun(true);
      })
      .catch(() => setLoading(false));
  };

  // Show nothing until button is pressed
  if (!hasRun) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <button 
          onClick={runReport} 
          className="btn btn-primary" 
          style={{ padding: '1.5rem 3rem', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>play_arrow</span>
          Run PL/SQL Analytics Procedure
        </button>
      </div>
    );
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #004ac6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ marginLeft: '12px' }}>Executing PL/SQL procedure...</p>
    </div>
  );

  const placementRate = parseFloat(report?.totals?.placement_rate || 0);

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      
      <div className="page-header">
        <h1>PL/SQL Analytics Engine</h1>
        <p>Executes GetBranchAvgPackage() and GetPlacementAnalytics() procedures.</p>
      </div>

      {/* Run Button */}
      <div className="glass" style={{ padding: '16px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Analytics Report</h3>
          <p style={{ margin: '4px 0 0', color: '#515f74', fontSize: '13px' }}>Click to refresh real-time data</p>
        </div>
        <button onClick={runReport} className="btn btn-primary" disabled={loading}>
          <span className="material-symbols-outlined">refresh</span>
          {loading ? 'Running...' : 'Run Procedure'}
        </button>
      </div>

      {/* KPI Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Students', value: report?.totals?.total_students || 0, icon: 'school' },
          { label: 'Placed', value: report?.totals?.placed_students || 0, icon: 'verified' },
          { label: 'Open Jobs', value: report?.totals?.open_jobs || 0, icon: 'work' },
          { label: 'Applications', value: report?.totals?.total_applications || 0, icon: 'assignment' },
        ].map((tile, i) => (
          <div key={tile.label} className="metric-tile">
            <div style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', borderRadius: '12px', background: '#004ac6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined icon-filled" style={{ color: 'white' }}>{tile.icon}</span>
            </div>
            <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#515f74' }}>{tile.label}</p>
            <p style={{ fontSize: '32px', fontWeight: '800', color: '#191c1e', marginTop: '8px' }}>{tile.value}</p>
          </div>
        ))}
      </div>

      {/* Placement Rate Gauge + Branch Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Rate Gauge */}
        <div className="metric-tile" style={{ padding: '32px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px' }}>Placement Rate</h3>
          <svg viewBox="0 0 120 80" style={{ width: '160px', margin: '0 auto' }}>
            <path d="M10,70 A50,50 0 0,1 110,70" stroke="#e0e3e5" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path
              d="M10,70 A50,50 0 0,1 110,70"
              stroke="url(#gaugeGrad)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(placementRate / 100) * 157} 157`}
            />
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#004ac6" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <text x="60" y="68" textAnchor="middle" fontSize="20" fontWeight="900" fill="#191c1e">
              {placementRate}%
            </text>
          </svg>
          <p style={{ fontSize: '14px', color: '#515f74', marginTop: '8px' }}>
            {report?.totals?.placed_students} of {report?.totals?.total_students} students placed
          </p>
        </div>

        {/* Branch Progress */}
        <div className="metric-tile" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Branch-wise Placement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(report?.branch_stats || []).slice(0, 8).map(branch => (
              <div key={branch.branch}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{branch.branch}</span>
                  <span style={{ color: '#515f74', fontSize: '13px' }}>{branch.placed}/{branch.total} ({branch.percent}%)</span>
                </div>
                <div style={{ height: '8px', background: '#f2f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${branch.percent}%`, background: 'linear-gradient(90deg, #004ac6, #2563eb)', borderRadius: '4px', transition: 'width 0.7s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salary Cards + Top Companies */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Salary */}
        <div className="metric-tile" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Package Analytics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Average', value: `₹${report?.salary?.average || 0}L` },
              { label: 'Highest', value: `₹${report?.salary?.highest || 0}L` },
              { label: 'Lowest', value: `₹${report?.salary?.lowest || 0}L` },
            ].map(item => (
              <div key={item.label} style={{ background: '#f2f4f6', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#515f74', marginBottom: '4px' }}>{item.label}</p>
                <p style={{ fontSize: '20px', fontWeight: '800', color: '#191c1e' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recruiters */}
        <div className="metric-tile" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Top Recruiters</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(report?.top_companies || []).map((company, i) => (
              <div key={company.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#004ac6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, fontWeight: '600', fontSize: '14px' }}>{company.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '60px', height: '6px', background: '#f2f4f6', borderRadius: '3px' }}>
                    <div style={{ width: `${(company.placements / (report?.top_companies?.[0]?.placements || 1)) * 60}px`, height: '100%', background: '#004ac6', borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>{company.placements}</span>
                </div>
              </div>
            ))}
            {(!report?.top_companies?.length) && (
              <p style={{ color: '#515f74', textAlign: 'center' }}>No placements yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;