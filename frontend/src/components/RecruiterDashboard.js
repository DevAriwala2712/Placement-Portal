import React, { useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import useApiResource from './useApiResource';
import { ActionButton, ConsoleLayout, ConsoleTable, Field, StatusPill } from './ConsoleLayout';
import SettingsWorkspace from './SettingsWorkspace';

const tabs = [
    { id: 'jobs',         label: 'Jobs',          icon: 'work' },
    { id: 'companies',    label: 'Companies',     icon: 'business' },
    { id: 'applications', label: 'Applications',  icon: 'assignment_turned_in' },
    { id: 'placements',   label: 'Placements',    icon: 'emoji_events' },
    { id: 'tracker',      label: 'Tracker',       icon: 'track_changes' },
    { id: 'settings',     label: 'Settings',      icon: 'settings' },
];

const emptyCompany   = { name: '', description: '', website: '', contactEmail: '', contactPhone: '' };
const emptyJob       = { title: '', description: '', requirements: '', companyId: '', location: '', salaryMin: '', salaryMax: '', status: 'open' };
const linkedJobTemplate = { title: '', description: '', requirements: '', location: '', salaryMin: '', salaryMax: '' };

const fmtLPA = (min, max) => {
    const toL = v => v ? `₹${(Number(v)/100000).toFixed(1)}L` : null;
    const a = toL(min), b = toL(max);
    if (a && b) return `${a} – ${b}`;
    return a || b || '—';
};

const RecruiterDashboard = () => {
    const [activeTab,    setActiveTab]    = useState('jobs');
    const [editingCompany, setEditingCompany] = useState(null);
    const [editingJob,   setEditingJob]   = useState(null);
    const [newCompanyJob, setNewCompanyJob] = useState(linkedJobTemplate);
    const [createJobWithCompany, setCreateJobWithCompany] = useState(false);
    const [newJobCompany, setNewJobCompany] = useState(emptyCompany);
    const [applications, setApplications] = useState([]);
    const [selectedJob,  setSelectedJob]  = useState(null);
    const [placements,   setPlacements]   = useState([]);
    const [notice, setNotice]             = useState('');
    const [query,  setQuery]              = useState('');
    const [selectedAppIds, setSelectedAppIds] = useState(new Set());
    const [bulkStatus, setBulkStatus] = useState('shortlisted');
    const companies = useApiResource('companies', { limit: 100 });
    const jobs      = useApiResource('jobs',      { limit: 50  });
    const tracker   = useApiResource('placement-drives', { limit: 50 });

    const companyOptions = companies.rows;
    const filteredJobs   = useMemo(() => {
        const q = query.toLowerCase();
        if (!q) return jobs.rows;
        return jobs.rows.filter(j => [j.title, j.company_name, j.eligible_branches].join(' ').toLowerCase().includes(q));
    }, [jobs.rows, query]);

    const flash = useCallback((msg) => { setNotice(msg); setTimeout(() => setNotice(''), 2200); }, []);
    const refresh = useCallback(() => { companies.fetchRows(); jobs.fetchRows(); tracker.fetchRows(); }, [companies, jobs, tracker]);

    const saveCompany = async (e) => {
        e.preventDefault();
        if (editingCompany.id) { await axios.put(`${API_BASE_URL}/companies/${editingCompany.id}`, editingCompany); flash('Company updated'); }
        else { await axios.post(`${API_BASE_URL}/companies`, { ...editingCompany, createDefaultJob: newCompanyJob.title ? newCompanyJob : null }); flash('Company created'); }
        setNewCompanyJob(linkedJobTemplate); setEditingCompany(null); refresh();
    };

    const saveJob = async (e) => {
        e.preventDefault();
        const payload = { ...editingJob, companyId: editingJob.companyId || editingJob.company_id };
        if (!editingJob.id && createJobWithCompany) payload.createCompany = newJobCompany;
        if (editingJob.id) { await axios.put(`${API_BASE_URL}/jobs/${editingJob.id}`, payload); flash('Job updated'); }
        else { await axios.post(`${API_BASE_URL}/jobs`, payload); flash('Job created'); }
        setCreateJobWithCompany(false); setNewJobCompany(emptyCompany); setEditingJob(null); refresh();
    };

    const deleteRecord = async (resource, id, name) => {
        if (!window.confirm(`Delete ${name}?`)) return;
        await axios.delete(`${API_BASE_URL}/${resource}/${id}`);
        flash('Record deleted'); refresh();
    };

    const loadApplications = async (job) => {
        const res = await axios.get(`${API_BASE_URL}/applications/job/${job.id}?limit=100`);
        setApplications(res.data.applications || []);
        setSelectedJob(job);
        setSelectedAppIds(new Set());
        setActiveTab('applications');
    };

    const updateStatus = async (application, status) => {
        await axios.put(`${API_BASE_URL}/applications/${application.id}/status`, { status });
        flash('Status updated');
        if (selectedJob) loadApplications(selectedJob);
    };

    const doBulkStatus = async () => {
        if (!selectedAppIds.size) return;
        await axios.put(`${API_BASE_URL}/placements/bulk-status`, {
            applicationIds: [...selectedAppIds],
            status: bulkStatus,
        });
        flash(`${selectedAppIds.size} applications updated to "${bulkStatus}"`);
        setSelectedAppIds(new Set());
        if (selectedJob) loadApplications(selectedJob);
    };

    const loadPlacements = async () => {
        const r = await axios.get(`${API_BASE_URL}/placements`);
        setPlacements(r.data.placements || []);
    };

    const allSelected = applications.length > 0 && applications.every(a => selectedAppIds.has(a.id));
    const toggleAll   = () => allSelected ? setSelectedAppIds(new Set()) : setSelectedAppIds(new Set(applications.map(a => a.id)));
    const toggleOne   = (id) => { const n = new Set(selectedAppIds); n.has(id) ? n.delete(id) : n.add(id); setSelectedAppIds(n); };

    const activeJobCount = jobs.rows.filter(j => j.status === 'open').length;

    return (
        <ConsoleLayout
            title="Jobs Management"
            subtitle="Publish roles, manage companies, and process applicants with bulk workflows."
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tab) => {
                setActiveTab(tab);
                if (tab === 'placements') loadPlacements();
            }}
        >
            {notice && <div className="toast">{notice}</div>}

            {/* ── Jobs ──────────────────────────────────────────────── */}
            {activeTab === 'jobs' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                            <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Active Roles</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-headline font-extrabold text-primary">{activeJobCount}</span>
                                <span className="material-symbols-outlined text-primary/40 text-4xl icon-filled">work</span>
                            </div>
                        </div>
                        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                            <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Companies</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-headline font-extrabold text-on-surface">{companies.rows.length}</span>
                                <span className="material-symbols-outlined text-secondary/40 text-4xl icon-filled">business</span>
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-5 shadow-sm text-white col-span-2 sm:col-span-1">
                            <div className="flex items-center justify-between mb-3">
                                <span className="material-symbols-outlined text-blue-400 text-2xl">trending_up</span>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conversion</p>
                                    <h4 className="text-2xl font-black font-headline">24.8%</h4>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[72%]" />
                            </div>
                        </div>
                    </div>

                    <div className="card-panel">
                        <div className="card-panel-header">
                            <div>
                                <h2 className="font-headline text-xl font-bold text-on-surface">Active Job Postings</h2>
                                <p className="text-sm text-secondary mt-0.5">Search, edit, close, or inspect applicants.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base pointer-events-none">search</span>
                                    <input
                                        className="bg-surface-container-highest border-none rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 w-52"
                                        placeholder="Search jobs…"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                    />
                                </div>
                                <ActionButton onClick={() => setEditingJob(emptyJob)}>
                                    <span className="material-symbols-outlined text-base">add</span> New Job
                                </ActionButton>
                            </div>
                        </div>
                        <ConsoleTable
                            rows={filteredJobs}
                            columns={[
                                { key: 'title',        label: 'Role' },
                                { key: 'company_name', label: 'Company' },
                                { key: 'drive_date',   label: 'Drive date' },
                                { key: 'status',       label: 'Status', render: r => <StatusPill value={r.status} /> },
                                { key: 'actions',      label: 'Actions', render: r => (
                                    <div className="row-actions">
                                        <button onClick={() => loadApplications(r)}>Applicants</button>
                                        <button onClick={() => setEditingJob({ ...r, companyId: r.company_id })}>Edit</button>
                                        <button onClick={() => deleteRecord('jobs', r.id, r.title)}>Delete</button>
                                    </div>
                                )},
                            ]}
                        />
                    </div>
                </div>
            )}

            {/* ── Companies ─────────────────────────────────────────── */}
            {activeTab === 'companies' && (
                <div className="card-panel">
                    <div className="card-panel-header">
                        <div>
                            <h2 className="font-headline text-xl font-bold text-on-surface">Companies</h2>
                            <p className="text-sm text-secondary mt-0.5">Maintain company records used by job postings.</p>
                        </div>
                        <ActionButton onClick={() => setEditingCompany(emptyCompany)}>
                            <span className="material-symbols-outlined text-base">add</span> New Company
                        </ActionButton>
                    </div>
                    <ConsoleTable
                        rows={companies.rows}
                        columns={[
                            { key: 'name',          label: 'Company' },
                            { key: 'contact_email', label: 'Contact' },
                            { key: 'website',       label: 'Website' },
                            { key: 'actions',       label: 'Actions', render: r => (
                                <div className="row-actions">
                                    <button onClick={() => setEditingCompany({ ...r, contactEmail: r.contact_email, contactPhone: r.contact_phone })}>Edit</button>
                                    <button onClick={() => deleteRecord('companies', r.id, r.name)}>Delete</button>
                                </div>
                            )},
                        ]}
                    />
                </div>
            )}

            {/* ── Applications with Bulk Actions ────────────────────── */}
            {activeTab === 'applications' && (
                <div className="card-panel">
                    <div className="card-panel-header">
                        <div>
                            <h2 className="font-headline text-xl font-bold text-on-surface">Applications</h2>
                            <p className="text-sm text-secondary mt-0.5">
                                {selectedJob ? `Reviewing applicants for: ${selectedJob.title} @ ${selectedJob.company_name}` : 'Select a job to view applicants.'}
                            </p>
                        </div>
                        {applications.length > 0 && (
                            <div className="flex items-center gap-2">
                                {selectedAppIds.size > 0 && (
                                    <>
                                        <select
                                            value={bulkStatus}
                                            onChange={e => setBulkStatus(e.target.value)}
                                            className="bg-surface-container-highest border-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="shortlisted">Shortlist</option>
                                            <option value="accepted">Accept (Place)</option>
                                            <option value="rejected">Reject</option>
                                        </select>
                                        <button onClick={doBulkStatus} className="btn btn-primary btn-sm">
                                            <span className="material-symbols-outlined text-base">done_all</span>
                                            Apply to {selectedAppIds.size}
                                        </button>
                                    </>
                                )}
                                <span className="text-sm text-secondary font-medium">{applications.length} total</span>
                            </div>
                        )}
                    </div>

                    {applications.length ? (
                        <div className="overflow-x-auto">
                            <table className="console-table">
                                <thead>
                                    <tr>
                                        <th className="w-12">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleAll}
                                                className="w-4 h-4 rounded accent-primary cursor-pointer"
                                            />
                                        </th>
                                        <th>Student</th>
                                        <th>Branch</th>
                                        <th>CGPA</th>
                                        <th>Skills</th>
                                        <th>Status</th>
                                        <th>Decision</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map(a => (
                                        <tr
                                            key={a.id}
                                            className={`cursor-pointer ${selectedAppIds.has(a.id) ? 'bg-blue-50' : ''}`}
                                            onClick={() => toggleOne(a.id)}
                                        >
                                            <td onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAppIds.has(a.id)}
                                                    onChange={() => toggleOne(a.id)}
                                                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                                                />
                                            </td>
                                            <td className="font-semibold text-on-surface">{a.student_name}</td>
                                            <td>{a.branch}</td>
                                            <td><span className={`font-bold ${a.cgpa >= 7 ? 'text-emerald-600' : 'text-secondary'}`}>{a.cgpa}</span></td>
                                            <td className="text-xs text-secondary max-w-[140px] truncate">{a.skills || '—'}</td>
                                            <td onClick={e => e.stopPropagation()}><StatusPill value={a.status} /></td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <div className="row-actions">
                                                    {['shortlisted', 'accepted', 'rejected'].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => updateStatus(a, s)}
                                                            className={a.status === s ? 'opacity-40 !cursor-default' : ''}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="console-empty">
                            <h3>No applications</h3>
                            <p>Open a job and click Applicants to review submissions.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Placements (read-only view for recruiter) ─────────── */}
            {activeTab === 'placements' && (
                <div className="space-y-6">
                    <div className="card-panel">
                        <div className="card-panel-header">
                            <div>
                                <h2 className="font-headline text-xl font-bold text-on-surface">Confirmed Placements</h2>
                                <p className="text-sm text-secondary mt-0.5">Students who have been accepted for your roles.</p>
                            </div>
                            <button onClick={loadPlacements} className="btn btn-ghost btn-sm">
                                <span className="material-symbols-outlined text-base">refresh</span>
                            </button>
                        </div>
                        {placements.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="console-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Branch</th>
                                            <th>CGPA</th>
                                            <th>Role</th>
                                            <th>Package</th>
                                            <th>Placed On</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {placements.map(p => (
                                            <tr key={p.application_id}>
                                                <td className="font-semibold text-on-surface">{p.student_name}</td>
                                                <td>{p.branch}</td>
                                                <td>{p.cgpa}</td>
                                                <td>{p.job_title}</td>
                                                <td className="font-bold text-primary">{fmtLPA(p.salary_min, p.salary_max)}</td>
                                                <td className="text-secondary">
                                                    {p.placed_at ? new Date(p.placed_at).toLocaleDateString() : new Date(p.applied_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="console-empty">
                                <h3>No confirmed placements yet</h3>
                                <p>Accept applicants via the Applications tab to confirm placements.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Tracker ───────────────────────────────────────────── */}
            {activeTab === 'tracker' && (
                <div className="card-panel">
                    <div className="card-panel-header">
                        <div>
                            <h2 className="font-headline text-xl font-bold text-on-surface">Placement Tracker</h2>
                            <p className="text-sm text-secondary mt-0.5">EDPEEE drive data for reference.</p>
                        </div>
                    </div>
                    <ConsoleTable
                        rows={tracker.rows}
                        columns={[
                            { key: 'drive_date',    label: 'Date' },
                            { key: 'company_name',  label: 'Company' },
                            { key: 'profile',       label: 'Profile' },
                            { key: 'offer_type',    label: 'Offer' },
                            { key: 'cgpa_criteria', label: 'Criteria' },
                        ]}
                    />
                </div>
            )}

            {activeTab === 'settings' && <SettingsWorkspace />}

            {/* ── Drawers ───────────────────────────────────────────── */}
            {editingCompany && (
                <RecordEditor title={editingCompany.id ? 'Edit company' : 'Create company'} onClose={() => setEditingCompany(null)} onSubmit={saveCompany}>
                    <Field label="Name"><input required value={editingCompany.name || ''} onChange={e => setEditingCompany({ ...editingCompany, name: e.target.value })} /></Field>
                    <Field label="Description"><textarea value={editingCompany.description || ''} onChange={e => setEditingCompany({ ...editingCompany, description: e.target.value })} /></Field>
                    <Field label="Website"><input value={editingCompany.website || ''} onChange={e => setEditingCompany({ ...editingCompany, website: e.target.value })} /></Field>
                    <Field label="Contact email"><input value={editingCompany.contactEmail || ''} onChange={e => setEditingCompany({ ...editingCompany, contactEmail: e.target.value })} /></Field>
                    <Field label="Contact phone"><input value={editingCompany.contactPhone || ''} onChange={e => setEditingCompany({ ...editingCompany, contactPhone: e.target.value })} /></Field>
                    {!editingCompany.id && (
                        <>
                            <h3 className="section-subtitle">Create first job (optional)</h3>
                            <Field label="Job title"><input value={newCompanyJob.title} onChange={e => setNewCompanyJob({ ...newCompanyJob, title: e.target.value })} /></Field>
                            <Field label="Location"><input value={newCompanyJob.location} onChange={e => setNewCompanyJob({ ...newCompanyJob, location: e.target.value })} /></Field>
                            <Field label="Salary min"><input type="number" value={newCompanyJob.salaryMin} onChange={e => setNewCompanyJob({ ...newCompanyJob, salaryMin: e.target.value })} /></Field>
                            <Field label="Salary max"><input type="number" value={newCompanyJob.salaryMax} onChange={e => setNewCompanyJob({ ...newCompanyJob, salaryMax: e.target.value })} /></Field>
                        </>
                    )}
                </RecordEditor>
            )}

            {editingJob && (
                <RecordEditor title={editingJob.id ? 'Edit job' : 'Create job'} onClose={() => setEditingJob(null)} onSubmit={saveJob}>
                    <Field label="Title"><input required value={editingJob.title || ''} onChange={e => setEditingJob({ ...editingJob, title: e.target.value })} /></Field>
                    <Field label="Company">
                        <select required={!createJobWithCompany} disabled={createJobWithCompany} value={editingJob.companyId || editingJob.company_id || ''} onChange={e => setEditingJob({ ...editingJob, companyId: e.target.value })}>
                            <option value="">Select company</option>
                            {companyOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </Field>
                    {!editingJob.id && (
                        <label className="switch-row">
                            <input type="checkbox" checked={createJobWithCompany} onChange={e => setCreateJobWithCompany(e.target.checked)} />
                            <span>Create a new company with this job</span>
                        </label>
                    )}
                    {!editingJob.id && createJobWithCompany && (
                        <>
                            <h3 className="section-subtitle">New company details</h3>
                            <Field label="Company name"><input required value={newJobCompany.name} onChange={e => setNewJobCompany({ ...newJobCompany, name: e.target.value })} /></Field>
                            <Field label="Contact email"><input value={newJobCompany.contactEmail} onChange={e => setNewJobCompany({ ...newJobCompany, contactEmail: e.target.value })} /></Field>
                        </>
                    )}
                    <Field label="Description"><textarea required value={editingJob.description || ''} onChange={e => setEditingJob({ ...editingJob, description: e.target.value })} /></Field>
                    <Field label="Eligible Branches"><input placeholder="CSE, IT, ECE" value={editingJob.eligible_branches || ''} onChange={e => setEditingJob({ ...editingJob, eligible_branches: e.target.value })} /></Field>
                    <Field label="Eligibility Criteria"><input placeholder="CGPA 6.0 and above" value={editingJob.eligibility_criteria || ''} onChange={e => setEditingJob({ ...editingJob, eligibility_criteria: e.target.value })} /></Field>
                    <Field label="Location"><input value={editingJob.location || ''} onChange={e => setEditingJob({ ...editingJob, location: e.target.value })} /></Field>
                    <Field label="Status">
                        <select value={editingJob.status || 'open'} onChange={e => setEditingJob({ ...editingJob, status: e.target.value })}>
                            <option value="open">open</option>
                            <option value="closed">closed</option>
                        </select>
                    </Field>
                </RecordEditor>
            )}
        </ConsoleLayout>
    );
};

const RecordEditor = ({ title, children, onClose, onSubmit }) => (
    <div className="drawer-backdrop">
        <form className="record-drawer" onSubmit={onSubmit}>
            <div className="drawer-heading">
                <h2>{title}</h2>
                <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-center text-secondary hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
            <div className="drawer-fields">{children}</div>
            <div className="drawer-actions">
                <ActionButton type="button" variant="ghost" onClick={onClose}>Cancel</ActionButton>
                <ActionButton type="submit">Save changes</ActionButton>
            </div>
        </form>
    </div>
);

export default RecruiterDashboard;
