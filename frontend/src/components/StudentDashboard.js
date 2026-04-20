import React, { useMemo, useState, useCallback, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import useApiResource from './useApiResource';
import { ConsoleLayout, ConsoleTable, StatusPill } from './ConsoleLayout';
import SettingsWorkspace from './SettingsWorkspace';
import { AuthContext } from '../context/AuthContext';

const tabs = [
    { id: 'jobs',         label: 'Available Jobs',   icon: 'work' },
    { id: 'applications', label: 'My Applications',  icon: 'assignment_turned_in' },
    { id: 'tracker',      label: 'Tracker',           icon: 'track_changes' },
    { id: 'settings',     label: 'Settings',          icon: 'settings' },
];

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab]       = useState('jobs');
    const [applications, setApplications] = useState([]);
    const [notice, setNotice]             = useState('');
    const [query, setQuery]               = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const jobs    = useApiResource('jobs',             { limit: 75 });
    const tracker = useApiResource('placement-drives', { limit: 50 });

    const loadApplications = useCallback(async () => {
        const res = await axios.get(`${API_BASE_URL}/applications/student`);
        setApplications(res.data.applications || []);
    }, []);

    React.useEffect(() => { loadApplications(); }, [loadApplications]);

    const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 2200); };
    const appliedJobIds = useMemo(() => new Set(applications.map(a => a.job_id)), [applications]);

    // Eligibility helper: check if student branch matches job's eligible_branches
    const isEligible = useCallback((job) => {
        if (!user) return null;
        const studentBranch = (user.branch || '').toUpperCase().trim();
        const studentCgpa   = parseFloat(user.cgpa || 0);

        let branchMatch = true;
        if (job.eligible_branches) {
            const branches = job.eligible_branches.split(/[,\/]/).map(b => b.trim().toUpperCase());
            branchMatch = branches.length === 0 || branches.some(b => b === studentBranch || b.includes(studentBranch) || studentBranch.includes(b));
        }

        let cgpaMatch = true;
        if (job.eligibility_criteria) {
            const m = job.eligibility_criteria.match(/(\d+\.?\d*)\s*(?:cgpa|cg|gpa)/i);
            if (m) cgpaMatch = studentCgpa >= parseFloat(m[1]);
        }

        if (branchMatch && cgpaMatch) return 'eligible';
        if (!branchMatch && !cgpaMatch) return 'ineligible';
        return 'partial'; // one matches
    }, [user]);

    const allBranches = useMemo(() =>
        [...new Set(jobs.rows.map(j => j.eligible_branches).filter(Boolean).flatMap(b => b.split(/[,\/]/).map(x => x.trim())))].sort(),
    [jobs.rows]);

    const filteredJobs = useMemo(() => {
        const q = query.toLowerCase();
        let list = jobs.rows;
        if (branchFilter) list = list.filter(j => j.eligible_branches?.includes(branchFilter));
        if (q) list = list.filter(j => [j.title, j.company_name, j.eligible_branches, j.eligibility_criteria].join(' ').toLowerCase().includes(q));
        return list;
    }, [jobs.rows, query, branchFilter]);

    const applyForJob = async (job) => {
        const fd = new FormData();
        fd.append('jobId', job.id);
        await axios.post(`${API_BASE_URL}/applications`, fd);
        await loadApplications();
        flash(`Applied for ${job.title} at ${job.company_name}`);
    };

    const interviewingCount = applications.filter(a => a.status === 'shortlisted').length;
    const offeredCount      = applications.filter(a => a.status === 'accepted').length;
    const placedCompanies   = applications.filter(a => a.status === 'accepted').map(a => a.company_name).join(', ');

    const eligibilityBadge = (job) => {
        const status = isEligible(job);
        if (!status) return null;
        if (status === 'eligible')   return <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Eligible</span>;
        if (status === 'ineligible') return <span className="inline-flex items-center gap-1 text-[10px] font-black text-error bg-error-container/30 px-2 py-0.5 rounded-full">✗ Not Eligible</span>;
        return <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">~ Partial</span>;
    };

    return (
        <ConsoleLayout
            title="Opportunity Hub"
            subtitle="Explore placement opportunities, apply, and track your application pipeline."
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {notice && <div className="toast">{notice}</div>}

            {/* ── Available Jobs ──────────────────────────────────────── */}
            {activeTab === 'jobs' && (
                <div className="space-y-6">
                    {/* Placement Status Banner — shown if placed */}
                    {offeredCount > 0 && (
                        <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center gap-5 shadow-xl shadow-emerald-500/20">
                            <span className="material-symbols-outlined text-5xl icon-filled text-white/80">celebration</span>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-white/70 mb-0.5">Congratulations 🎉</p>
                                <p className="font-headline font-black text-2xl">
                                    {offeredCount > 1 ? `${offeredCount} Offers Received!` : `Placed at ${placedCompanies}`}
                                </p>
                                <p className="text-white/80 text-sm">Your offer letter will be shared through official channels.</p>
                            </div>
                        </div>
                    )}

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Applied',       value: applications.length,  icon: 'description',       color: 'text-primary',      bg: '' },
                            { label: 'Shortlisted',   value: interviewingCount,    icon: 'video_chat',        color: 'text-amber-600',    bg: '' },
                            { label: 'Offers',        value: offeredCount,         icon: 'verified',          color: 'text-emerald-600',  bg: '' },
                            { label: 'Open Roles',    value: filteredJobs.length,  icon: 'work',              color: 'text-secondary',    bg: '' },
                        ].map(({ label, value, icon, color }) => (
                            <div key={label} className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
                                <p className={`text-xs font-bold ${color} uppercase tracking-wider mb-1`}>{label}</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-3xl font-headline font-extrabold text-on-surface">{String(value).padStart(2, '0')}</span>
                                    <span className={`material-symbols-outlined ${color} text-3xl opacity-40 icon-filled`}>{icon}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Jobs table */}
                    <div className="card-panel">
                        <div className="card-panel-header">
                            <div>
                                <h2 className="font-headline text-xl font-bold text-on-surface">Available Jobs</h2>
                                <p className="text-sm text-secondary mt-0.5">Jobs where {user?.branch || 'your branch'} students may be eligible.</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <select
                                    value={branchFilter}
                                    onChange={e => setBranchFilter(e.target.value)}
                                    className="bg-surface-container-highest border-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">All Branches</option>
                                    {allBranches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base pointer-events-none">search</span>
                                    <input
                                        className="bg-surface-container-highest border-none rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 w-52"
                                        placeholder="Search role, company…"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="console-table">
                                <thead>
                                    <tr>
                                        <th>Role</th>
                                        <th>Company</th>
                                        <th>Drive Date</th>
                                        <th>Branches</th>
                                        <th>Criteria</th>
                                        <th>Eligibility</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJobs.length ? filteredJobs.map(job => (
                                        <tr key={job.id}>
                                            <td className="font-semibold text-on-surface">{job.title}</td>
                                            <td>{job.company_name}</td>
                                            <td className="text-secondary">{job.drive_date || '—'}</td>
                                            <td className="text-secondary text-xs max-w-[120px] truncate">{job.eligible_branches || 'All'}</td>
                                            <td className="text-secondary text-xs max-w-[120px] truncate">{job.eligibility_criteria || '—'}</td>
                                            <td>{eligibilityBadge(job)}</td>
                                            <td>
                                                {appliedJobIds.has(job.id)
                                                    ? <StatusPill value="applied" />
                                                    : (
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => applyForJob(job)}
                                                        >
                                                            Apply
                                                        </button>
                                                    )
                                                }
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7">
                                                <div className="console-empty">
                                                    <h3>No jobs match your filters</h3>
                                                    <p>Try clearing the branch filter or search term.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Profile CTA */}
                    <div className="rounded-3xl p-8 bg-primary-gradient text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-headline font-bold mb-2">Enhance your profile</h3>
                            <p className="text-blue-100 mb-5 max-w-md text-sm">
                                Students with a complete profile have a 40% higher placement rate. Update your skills and resume link now.
                            </p>
                            <button onClick={() => setActiveTab('settings')} className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl transition-all">
                                Update Profile
                            </button>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[180px] text-white/10 rotate-12 icon-filled pointer-events-none">rocket_launch</span>
                    </div>
                </div>
            )}

            {/* ── My Applications ─────────────────────────────────────── */}
            {activeTab === 'applications' && (
                <div className="space-y-6">
                    {/* Pipeline Steps */}
                    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
                        <h3 className="font-headline font-bold text-on-surface mb-4">Your Application Pipeline</h3>
                        <div className="flex items-center gap-0">
                            {[
                                { label: 'Applied',     count: applications.length,  color: 'bg-primary',    icon: 'send' },
                                { label: 'Shortlisted', count: interviewingCount,    color: 'bg-amber-500',  icon: 'star' },
                                { label: 'Offered',     count: offeredCount,         color: 'bg-emerald-500', icon: 'verified' },
                            ].map(({ label, count, color, icon }, i) => (
                                <React.Fragment key={label}>
                                    <div className="flex-1 flex flex-col items-center gap-2">
                                        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center shadow-md`}>
                                            <span className="material-symbols-outlined text-white icon-filled">{icon}</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-headline font-black text-on-surface">{count}</p>
                                            <p className="text-xs font-bold text-secondary">{label}</p>
                                        </div>
                                    </div>
                                    {i < 2 && <div className="w-8 h-0.5 bg-outline-variant/30 flex-shrink-0" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="card-panel">
                        <div className="card-panel-header">
                            <div>
                                <h2 className="font-headline text-xl font-bold text-on-surface">My Applications</h2>
                                <p className="text-sm text-secondary mt-0.5">Track the status of roles you applied for.</p>
                            </div>
                            <button onClick={loadApplications} className="btn btn-ghost btn-sm">
                                <span className="material-symbols-outlined text-base">refresh</span> Refresh
                            </button>
                        </div>
                        <ConsoleTable
                            rows={applications}
                            emptyTitle="No applications yet"
                            emptyBody="Apply for a job to start tracking it here."
                            columns={[
                                { key: 'title',        label: 'Role' },
                                { key: 'company_name', label: 'Company' },
                                { key: 'status',       label: 'Status',     render: r => <StatusPill value={r.status} /> },
                                { key: 'applied_at',   label: 'Applied at', render: r => new Date(r.applied_at).toLocaleDateString() },
                            ]}
                        />
                    </div>
                </div>
            )}

            {/* ── Tracker ─────────────────────────────────────────────── */}
            {activeTab === 'tracker' && (
                <div className="card-panel">
                    <div className="card-panel-header">
                        <div>
                            <h2 className="font-headline text-xl font-bold text-on-surface">Placement Tracker</h2>
                            <p className="text-sm text-secondary mt-0.5">Reference data from EDPEEE.pdf — past drives at your institution.</p>
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
        </ConsoleLayout>
    );
};

export default StudentDashboard;
