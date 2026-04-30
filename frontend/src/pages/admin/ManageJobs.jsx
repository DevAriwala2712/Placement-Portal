import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ title: '', company: '', type: 'FTE', package: '', cgpa: '', branches: 'COPC,COE,ENC' });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    axios.get(`${API_URL}/jobs`).then(res => setJobs(res.data));
  };

  const handleBulkImport = () => {
    axios.post(`${API_URL}/admin/import-pdf`)
      .then(res => {
        fetchJobs();
        alert(`Successfully imported from EDPEEE.pdf:\n- ${res.data.stats.jobs} jobs\n- ${res.data.stats.companies} companies\n- ${res.data.stats.placed} placed`);
      });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/jobs`, { ...newJob, company_name: newJob.company }).then(() => {
      fetchJobs();
      setNewJob({ title: '', company: '', type: 'FTE', package: '', cgpa: '', branches: 'COPC,COE,ENC' });
      alert('Job posted successfully!');
    });
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 4px', color: 'var(--on-surface)', fontFamily: 'Outfit,sans-serif' }}>Job Management</h1>
          <p style={{ margin: 0, color: 'var(--secondary)' }}>Post new roles and import job histories from EDPEEE.pdf.</p>
        </div>

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass stagger-1" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
             <div style={{ padding: '0.625rem', background: 'var(--info-bg)', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
              <span className="material-symbols-outlined">work_history</span>
            </div>
            <div>
              <h3 style={{ margin: '0 0 2px', fontSize: 18, fontFamily: 'Outfit,sans-serif' }}>Active Postings</h3>
              <p style={{ margin: 0, color: 'var(--secondary)', fontSize: 13 }}>Current job opportunities available.</p>
            </div>
          </div>
          <div style={{ overflowX: 'auto', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--outline)' }}>
            <table className="console-table" style={{ margin: 0, width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 20px' }}>Company</th>
                  <th style={{ padding: '16px 20px' }}>Role</th>
                  <th style={{ padding: '16px 20px' }}>Type</th>
                  <th style={{ padding: '16px 20px' }}>Package</th>
                  <th style={{ padding: '16px 20px' }}>Min CGPA</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)' }}>No jobs posted yet.</td></tr>
                ) : jobs.slice(0, 50).map((job, i) => (
                  <tr key={job.role_id} style={{ background: i % 2 === 1 ? 'rgba(242,244,246,0.02)' : 'transparent', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--on-surface)' }}>{job.company}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--secondary)' }}>{job.title}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="job-tag" style={{ background: 'var(--info-bg)', color: 'var(--primary-dark)' }}>{job.type}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: '600', color: 'var(--success)' }}>{job.package} LPA</td>
                    <td style={{ padding: '14px 20px', color: 'var(--secondary)' }}>{job.cgpa || 'NA'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass stagger-2" style={{ padding: '24px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            <div style={{ padding: '0.625rem', background: 'var(--info-bg)', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
              <span className="material-symbols-outlined">post_add</span>
            </div>
            <div>
              <h3 style={{ margin: '0 0 2px', fontSize: 18, fontFamily: 'Outfit,sans-serif' }}>Post New Role</h3>
              <p style={{ margin: 0, color: 'var(--secondary)', fontSize: 13 }}>Create a new opportunity for students.</p>
            </div>
          </div>

          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="field">
              <label>Job Title</label>
              <input
                type="text"
                placeholder="E.g., Software Development Engineer"
                value={newJob.title}
                onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                required
              />
            </div>
            <div className="field">
              <label>Company Name</label>
              <input
                type="text"
                placeholder="E.g., Google"
                value={newJob.company}
                onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="field">
                <label>Job Type</label>
                <select value={newJob.type} onChange={(e) => setNewJob({...newJob, type: e.target.value})}>
                  <option value="FTE">FTE</option>
                  <option value="Intern">Intern</option>
                  <option value="Intern+FTE">Intern + FTE</option>
                </select>
              </div>
              <div className="field">
                <label>Package (LPA)</label>
                <input
                  type="number"
                  placeholder="E.g., 20"
                  value={newJob.package}
                  onChange={(e) => setNewJob({...newJob, package: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Minimum CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0" max="10"
                placeholder="E.g., 8.0"
                value={newJob.cgpa}
                onChange={(e) => setNewJob({...newJob, cgpa: e.target.value})}
              />
            </div>
            <div className="field">
              <label>Eligible Branches (comma separated)</label>
              <input
                type="text"
                placeholder="E.g., COPC,COE,ENC"
                value={newJob.branches}
                onChange={(e) => setNewJob({...newJob, branches: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
              <span className="material-symbols-outlined">rocket_launch</span> Post Role
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;