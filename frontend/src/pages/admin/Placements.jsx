import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/admin';

const Placements = () => {
  const [placements, setPlacements] = useState([]);
  const [unplaced, setUnplaced] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('placed');
  const [branchFilter, setBranchFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [branchFilter]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${API_URL}/applications`),
      axios.get(`${API_URL}/students`)
    ]).then(([appsRes, studentsRes]) => {
      const selectedApps = appsRes.data.filter(a => a.status === 'Selected');
      const unplacedStudents = studentsRes.data.filter(s => s.status === 'Unplaced');
      setPlacements(selectedApps);
      setUnplaced(unplacedStudents);
      setLoading(false);
    });
  };

  const branches = [...new Set(unplaced.map(s => s.branch))].filter(Boolean).sort();

  const placedApps = branchFilter ? placements.filter(p => {
    const student = unplaced.find(s => s.student === p.student);
    return student?.branch === branchFilter;
  }) : placements;

  const unplacedFiltered = branchFilter ? unplaced.filter(s => s.branch === branchFilter) : unplaced;

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Placement Board</h1>
        <p>View placed and unplaced students.</p>
      </div>

      {/* Summary Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="metric-tile" style={{ borderLeft: '4px solid #059669' }}>
          <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#515f74' }}>Placed</p>
          <p style={{ fontSize: '32px', fontWeight: '800' }}>{placements.length}</p>
        </div>
        <div className="metric-tile" style={{ borderLeft: '4px solid #b45309' }}>
          <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#515f74' }}>Unplaced</p>
          <p style={{ fontSize: '32px', fontWeight: '800' }}>{unplaced.length}</p>
        </div>
        <div className="metric-tile" style={{ borderLeft: '4px solid #004ac6' }}>
          <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#515f74' }}>Rate</p>
          <p style={{ fontSize: '32px', fontWeight: '800' }}>
            {placements.length + unplaced.length > 0 ? ((placements.length / (placements.length + unplaced.length)) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="metric-tile" style={{ borderLeft: '4px solid #a855f7' }}>
          <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#515f74' }}>Companies</p>
          <p style={{ fontSize: '32px', fontWeight: '800' }}>{[...new Set(placements.map(p => p.company))].length}</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="glass" style={{ padding: '16px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button 
          onClick={() => setView('placed')}
          className={view === 'placed' ? 'btn btn-primary' : 'btn btn-ghost'}
        >
          <span className="material-symbols-outlined">verified</span>
          Placed ({placements.length})
        </button>
        <button 
          onClick={() => setView('unplaced')}
          className={view === 'unplaced' ? 'btn btn-primary' : 'btn btn-ghost'}
        >
          <span className="material-symbols-outlined">person_search</span>
          Unplaced ({unplaced.length})
        </button>
        <select 
          style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '12px', border: 'none', background: '#f2f4f6' }}
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
        >
          <option value="">All Branches</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass">
        <table className="console-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>{view === 'placed' ? 'Company' : 'Branch'}</th>
              <th>{view === 'placed' ? 'Role' : 'CGPA'}</th>
              <th>{view === 'placed' ? 'Package' : 'Email'}</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(view === 'placed' ? placedApps : unplacedFiltered).slice(0, 50).map((item, i) => (
              <tr key={view === 'placed' ? item.application_id : item.student_id}>
                <td style={{ fontWeight: '600' }}>{item.student || item.name}</td>
                <td>{view === 'placed' ? item.company : (item.branch || '-')}</td>
                <td>{view === 'placed' ? item.role : (item.cgpa || '-')}</td>
                <td style={{ color: view === 'placed' ? '#059669' : '#515f74' }}>
                  {view === 'placed' ? 'Selected' : (item.email || '-')}
                </td>
                <td>
                  <span className={`status-pill ${view === 'placed' ? 'status-accepted' : 'status-pending'}`}>
                    {view === 'placed' ? 'Placed' : 'Unplaced'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {((view === 'placed' ? placedApps : unplacedFiltered).length === 0) && (
          <div className="console-empty">
            <h3>{view === 'placed' ? 'No students placed yet' : 'No unplaced students'}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Placements;