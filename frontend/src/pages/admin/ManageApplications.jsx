import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/admin';

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    axios.get(`${API_URL}/applications`).then(res => setApplications(res.data));
  };

  const handleStatusChange = (id, newStatus) => {
    axios.patch(`${API_URL}/applications/${id}`, { status: newStatus })
      .then(() => {
        fetchApplications();
        alert('Status updated successfully!');
      });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Application Tracking</h1>
        <p>Track and manage student applications.</p>
      </div>

      <div className="glass">
        <table className="console-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Company</th>
              <th>Role</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.slice(0, 50).map(app => (
              <tr key={app.application_id}>
                <td style={{ fontWeight: '600' }}>{app.student}</td>
                <td>{app.company}</td>
                <td>{app.role}</td>
                <td>{app.date}</td>
                <td>
                  <span className={`status-pill status-${app.status.toLowerCase()}`}>{app.status}</span>
                </td>
                <td>
                  <div className="row-actions">
                    <button onClick={() => handleStatusChange(app.application_id, 'Selected')} className="btn btn-sm btn-ghost">Select</button>
                    <button onClick={() => handleStatusChange(app.application_id, 'Rejected')} className="btn btn-sm btn-danger">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageApplications;