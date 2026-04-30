import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const Tracker = () => {
  const [stats, setStats] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/stats`).then(res => setStats(res.data));
  }, []);

  const handleImport = () => {
    setImporting(true);
    axios.post(`${API_URL}/admin/import-pdf`)
      .then(res => {
        axios.get(`${API_URL}/stats`).then(res => setStats(res.data));
        alert(`Successfully imported:\n- ${res.data.stats.jobs} jobs\n- ${res.data.stats.companies} companies\n- ${res.data.stats.placed} placed`);
      })
      .finally(() => setImporting(false));
  };

  return (
    <div>
      <div className="page-header">
        <h1>EDPEEE Tracker</h1>
        <p>Import and manage placement data from PDF.</p>
      </div>

      {/* Import Section */}
      <div className="metric-tile" style={{ padding: '24px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #004ac6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '28px' }}>find_in_page</span>
            </div>
            <div>
              <h3>Import from EDPEEE.pdf</h3>
              <p style={{ color: '#515f74', fontSize: '14px' }}>Re-import all placement data from the PDF tracker.</p>
            </div>
          </div>
          <button 
            onClick={handleImport} 
            className="btn btn-primary"
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Re-import Data'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[
          { label: 'Job Roles', value: stats?.totalJobs || 0, icon: 'work' },
          { label: 'Companies', value: stats?.totalCompanies || 0, icon: 'business' },
          { label: 'Applications', value: stats?.totalOffers || 0, icon: 'assignment' },
          { label: 'Placed', value: stats?.placedStudents || 0, icon: 'school' },
        ].map(stat => (
          <div key={stat.label} className="metric-tile" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#004ac6', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined icon-filled" style={{ color: 'white' }}>{stat.icon}</span>
            </div>
            <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#515f74' }}>{stat.label}</p>
            <p style={{ fontSize: '28px', fontWeight: '800' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="metric-tile" style={{ padding: '24px', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '16px' }}>Data Source</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#515f74', marginBottom: '4px' }}>Source File</p>
            <p style={{ fontWeight: '600' }}>EDPEEE.pdf</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#515f74', marginBottom: '4px' }}>Description</p>
            <p>Enhanced Data for Employment & Placement Process</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker;