import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/jobs`).then(res => {
      const unique = [...new Set(res.data.map(j => j.company))];
      setCompanies(unique.map((name, i) => ({ id: i + 1, name })));
    });
  }, []);

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <h1>Company Management</h1>
        <p>View all recruiting companies.</p>
      </div>

      <div className="glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Search companies..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span style={{ color: '#515f74', fontWeight: '600' }}>{filtered.length} companies</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.slice(0, 50).map(company => (
            <div key={company.id} className="metric-tile" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#004ac6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: 'white' }}>business</span>
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>{company.name}</p>
                  <p style={{ fontSize: '12px', color: '#515f74', margin: 0 }}>Active Recruiter</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Companies;