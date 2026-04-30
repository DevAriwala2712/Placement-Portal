import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/admin';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [newStudent, setNewStudent] = useState({ name: '', branch: 'COPC', cgpa: '', email: '', grad_year: 2026 });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    axios.get(`${API_URL}/students`).then(res => setStudents(res.data));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/students`, newStudent).then(() => {
      fetchStudents();
      setNewStudent({ name: '', branch: 'COPC', cgpa: '', email: '', grad_year: 2026 });
      alert('Student added successfully!');
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      axios.delete(`${API_URL}/students/${id}`).then(fetchStudents);
    }
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.student_id && s.student_id.toString().includes(search)));

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 4px', color: 'var(--on-surface)', fontFamily: 'Outfit,sans-serif' }}>Student Management</h1>
        <p style={{ margin: 0, color: 'var(--secondary)' }}>Add, view, and manage student records in the directory.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass stagger-1" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', flex: '1 1 auto', maxWidth: '300px' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: 20, pointerEvents: 'none' }}>search</span>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', background: 'var(--surface-container)', border: 'none', borderRadius: 12, padding: '10px 16px 10px 44px', fontSize: 14, color: 'var(--on-surface)', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
              />
            </div>
            <span style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{filtered.length} students</span>
          </div>

          <div style={{ overflowX: 'auto', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--outline)' }}>
            <table className="console-table" style={{ margin: 0, width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 20px' }}>ID</th>
                  <th style={{ padding: '16px 20px' }}>Student</th>
                  <th style={{ padding: '16px 20px' }}>Branch</th>
                  <th style={{ padding: '16px 20px' }}>CGPA</th>
                  <th style={{ padding: '16px 20px' }}>Status</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)' }}>No students found.</td></tr>
                ) : filtered.slice(0, 50).map((s, i) => (
                  <tr key={s.student_id} style={{ background: i % 2 === 1 ? 'rgba(242,244,246,0.02)' : 'transparent', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 20px', color: 'var(--secondary)', fontWeight: 500, fontSize: 13 }}>#{s.student_id}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#004ac6,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13, flexShrink: 0 }}>{s.name.charAt(0)}</div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface)', margin: 0 }}>{s.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--secondary)', margin: 0 }}>{s.email || `student${s.student_id}@thapar.edu`}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}><span className="job-tag">{s.branch}</span></td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--on-surface)' }}>{s.cgpa}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`status-pill ${s.status === 'Placed' ? 'status-placed' : 'status-pending'}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{s.status === 'Placed' ? 'verified' : 'hourglass_empty'}</span>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button onClick={() => handleDelete(s.student_id)} className="btn btn-sm btn-danger" style={{ padding: '6px 12px', fontSize: 12 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass stagger-2" style={{ padding: '24px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            <div style={{ padding: '0.625rem', background: 'var(--info-bg)', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <div>
              <h3 style={{ margin: '0 0 2px', fontSize: 18, fontFamily: 'Outfit,sans-serif' }}>Add New Student</h3>
              <p style={{ margin: 0, color: 'var(--secondary)', fontSize: 13 }}>Register a new student account manually.</p>
            </div>
          </div>

          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="E.g., John Doe"
                value={newStudent.name}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="field">
                <label>Branch</label>
                <select
                  value={newStudent.branch}
                  onChange={(e) => setNewStudent({...newStudent, branch: e.target.value})}
                  style={{ appearance: 'none', backgroundPosition: 'right 16px center' }}
                >
                  {['COPC', 'COE', 'COBS', 'ENC', 'ECE', 'EIC', 'EEC', 'ELE', 'MEE', 'MEC', 'CHE', 'CIE'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  min="0" max="10"
                  placeholder="E.g., 8.5"
                  value={newStudent.cgpa}
                  onChange={(e) => setNewStudent({...newStudent, cgpa: parseFloat(e.target.value)})}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="johndoe@thapar.edu"
                value={newStudent.email}
                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
              <span className="material-symbols-outlined">add_circle</span> Add Student
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;