import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import useApiResource from './useApiResource';
import { ActionButton, ConsoleLayout, ConsoleTable, Field, StatusPill } from './ConsoleLayout';
import SettingsWorkspace from './SettingsWorkspace';

const tabs = [
    { id: 'overview',    label: 'Dashboard',       icon: 'dashboard' },
    { id: 'placements',  label: 'Placements',       icon: 'emoji_events' },
    { id: 'assign',      label: 'Assign Students',  icon: 'group_add' },
    { id: 'jobs',        label: 'Jobs',             icon: 'work' },
    { id: 'companies',   label: 'Companies',        icon: 'business' },
    { id: 'students',    label: 'Students',         icon: 'school' },
    { id: 'tracker',     label: 'EDPEEE Tracker',   icon: 'track_changes' },
    { id: 'settings',    label: 'Settings',         icon: 'settings' },
];

const initialStudent  = { email: '', password: 'password', name: '', branch: '', cgpa: '', skills: '', phone: '', address: '' };
const initialCompany  = { name: '', description: '', website: '', contactEmail: '', contactPhone: '' };
const initialJob      = { title: '', description: '', requirements: '', companyId: '', location: '', salaryMin: '', salaryMax: '', status: 'open' };
const initialLinkedJob = { title: '', description: '', requirements: '', location: '', salaryMin: '', salaryMax: '' };

const fmtLPA = (min, max) => {
    const toL = (v) => v ? `₹${(Number(v) / 100000).toFixed(1)}L` : null;
    const a = toL(min); const b = toL(max);
    if (a && b) return `${a} – ${b}`;
    return a || b || '—';
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Analytics Overview                                                  */
/* ─────────────────────────────────────────────────────────────────── */
const AnalyticsOverview = ({ onNavigate }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/placements/analytics`)
            .then(r => { setData(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const placementRate = data ? parseFloat(data.placement_rate) : 0;

    return (
        <div className="space-y-8">
            {/* Top KPI tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                    { label: 'Total Students',   value: data?.total_students   || 0, icon: 'school',       accent: 'bg-blue-500',   sub: '' },
                    { label: 'Placed',           value: data?.placed_students  || 0, icon: 'verified',     accent: 'bg-emerald-500', sub: `${placementRate}% rate` },
                    { label: 'Open Jobs',        value: data?.open_jobs        || 0, icon: 'work',         accent: 'bg-amber-500',  sub: '' },
                    { label: 'Shortlisted',      value: data?.shortlisted      || 0, icon: 'pending',      accent: 'bg-indigo-500', sub: '' },
                ].map(({ label, value, icon, accent, sub }) => (
                    <div key={label} className="metric-tile bg-white">
                        <div className={`absolute top-4 right-4 w-10 h-10 rounded-xl ${accent} flex items-center justify-center shadow-md`}>
                            <span className="material-symbols-outlined text-white icon-filled">{icon}</span>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1">{label}</p>
                        <p className="text-4xl font-headline font-black text-on-surface mt-1">{Number(value).toLocaleString()}</p>
                        {sub && <p className="text-xs font-bold text-emerald-600 mt-1">{sub}</p>}
                    </div>
                ))}
            </div>

            {/* Placement Rate Gauge + Branch Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rate Gauge */}
                <div className="bg-surface-container-lowest rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm border border-outline-variant/10">
                    <svg viewBox="0 0 120 80" className="w-40">
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
                        <text x="60" y="68" textAnchor="middle" className="font-headline" fontSize="20" fontWeight="900" fill="#191c1e">
                            {placementRate}%
                        </text>
                    </svg>
                    <p className="font-headline font-black text-lg text-on-surface mt-2">Placement Rate</p>
                    <p className="text-sm text-secondary mt-1">{data?.placed_students || 0} of {data?.total_students || 0} students placed</p>
                </div>

                {/* Branch Breakdown */}
                <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-headline text-lg font-black text-on-surface">Branch-wise Placement</h3>
                        <button onClick={() => onNavigate('placements')} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                            View Board <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                    <div className="space-y-3">
                        {(data?.branch_stats || []).map(({ branch, total, placed }) => {
                            const pct = total > 0 ? Math.round((placed / total) * 100) : 0;
                            return (
                                <div key={branch}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-bold text-on-surface">{branch}</span>
                                        <span className="text-secondary font-medium">{placed}/{total} • <span className="text-primary font-bold">{pct}%</span></span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-primary-gradient transition-all duration-700"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {(!data?.branch_stats?.length) && (
                            <p className="text-sm text-secondary py-4 text-center">No branch data yet — start assigning students to jobs.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Salary Stats + Top Companies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Salary */}
                <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10">
                    <h3 className="font-headline text-lg font-black text-on-surface mb-5">Package Analytics</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Avg Package',     value: data?.salary?.average,  prefix: '₹', suffix: '/mo' },
                            { label: 'Highest Package', value: data?.salary?.highest, prefix: '₹', suffix: '/mo' },
                            { label: 'Lowest Package',  value: data?.salary?.lowest,  prefix: '₹', suffix: '/mo' },
                        ].map(({ label, value, prefix, suffix }) => (
                            <div key={label} className="bg-surface-container rounded-2xl p-4 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">{label}</p>
                                <p className="font-headline text-2xl font-black text-on-surface">
                                    {value ? `${prefix}${Number(value).toLocaleString()}` : '—'}
                                </p>
                                {value > 0 && <p className="text-xs text-secondary">{suffix}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Companies */}
                <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10">
                    <h3 className="font-headline text-lg font-black text-on-surface mb-5">Top Recruiters</h3>
                    <div className="space-y-3">
                        {(data?.top_companies || []).map(({ name, placements }, i) => (
                            <div key={name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                                        {i + 1}
                                    </div>
                                    <span className="font-semibold text-on-surface text-sm">{name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 bg-primary rounded-full" style={{ width: `${placements * 12}px`, maxWidth: '80px' }} />
                                    <span className="text-xs font-black text-primary">{placements}</span>
                                </div>
                            </div>
                        ))}
                        {(!data?.top_companies?.length) && (
                            <p className="text-sm text-secondary py-4 text-center">No placements recorded yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => onNavigate('assign')} className="flex items-center gap-4 p-5 bg-primary text-white rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 group">
                    <span className="material-symbols-outlined text-3xl icon-filled text-white/80">group_add</span>
                    <div className="text-left">
                        <p className="font-headline font-black text-lg">Bulk Assign</p>
                        <p className="text-white/70 text-xs">Place multiple students at once</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <button onClick={() => onNavigate('placements')} className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl hover:shadow-md active:scale-[0.98] transition-all border border-outline-variant/20 group">
                    <span className="material-symbols-outlined text-3xl icon-filled text-emerald-500">emoji_events</span>
                    <div className="text-left">
                        <p className="font-headline font-black text-lg text-on-surface">Placement Board</p>
                        <p className="text-secondary text-xs">View who's placed where</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-secondary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <button onClick={() => onNavigate('students')} className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl hover:shadow-md active:scale-[0.98] transition-all border border-outline-variant/20 group">
                    <span className="material-symbols-outlined text-3xl icon-filled text-amber-500">pending</span>
                    <div className="text-left">
                        <p className="font-headline font-black text-lg text-on-surface">Unplaced Students</p>
                        <p className="text-secondary text-xs">{data?.total_students - data?.placed_students || 0} students need placement</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-secondary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Placement Board Tab                                                 */
/* ─────────────────────────────────────────────────────────────────── */
const PlacementBoard = ({ companies }) => {
    const [placements, setPlacements] = useState([]);
    const [unplaced, setUnplaced] = useState([]);
    const [loading, setLoading] = useState(true);
    const [branchFilter, setBranchFilter] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [view, setView] = useState('placed'); // 'placed' | 'unplaced'

    const load = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (branchFilter) params.set('branch', branchFilter);
        if (companyFilter) params.set('companyId', companyFilter);
        const [p, u] = await Promise.all([
            axios.get(`${API_BASE_URL}/placements?${params}`),
            axios.get(`${API_BASE_URL}/placements/unplaced`),
        ]);
        setPlacements(p.data.placements || []);
        setUnplaced(u.data.students || []);
        setLoading(false);
    }, [branchFilter, companyFilter]);

    useEffect(() => { load(); }, [load]);

    const allBranches = useMemo(() =>
        [...new Set(placements.map(p => p.branch).concat(unplaced.map(s => s.branch)))].filter(Boolean).sort(),
    [placements, unplaced]);

    return (
        <div className="space-y-6">
            {/* Summary Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                    <p className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-1">Placed</p>
                    <p className="text-3xl font-headline font-black text-emerald-700">{placements.length}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                    <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-1">Unplaced</p>
                    <p className="text-3xl font-headline font-black text-amber-700">{unplaced.length}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                    <p className="text-xs font-black text-primary uppercase tracking-wider mb-1">Rate</p>
                    <p className="text-3xl font-headline font-black text-primary">
                        {placements.length + unplaced.length > 0
                            ? `${((placements.length / (placements.length + unplaced.length)) * 100).toFixed(1)}%`
                            : '—'}
                    </p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-5">
                    <p className="text-xs font-black text-secondary uppercase tracking-wider mb-1">Avg Package</p>
                    <p className="text-xl font-headline font-black text-on-surface">
                        {placements.length > 0
                            ? fmtLPA(
                                placements.reduce((s, p) => s + Number(p.salary_min || 0), 0) / placements.length,
                                placements.reduce((s, p) => s + Number(p.salary_max || 0), 0) / placements.length
                            )
                            : '—'}
                    </p>
                </div>
            </div>

            {/* Filters + Tabs */}
            <div className="card-panel">
                <div className="card-panel-header">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setView('placed')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'placed' ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-secondary hover:text-on-surface'}`}
                        >
                            <span className="material-symbols-outlined text-base align-middle mr-1">verified</span>
                            Placed ({placements.length})
                        </button>
                        <button
                            onClick={() => setView('unplaced')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'unplaced' ? 'bg-amber-500 text-white shadow-md' : 'bg-surface-container text-secondary hover:text-on-surface'}`}
                        >
                            <span className="material-symbols-outlined text-base align-middle mr-1">person_search</span>
                            Unplaced ({unplaced.length})
                        </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <select
                            value={branchFilter}
                            onChange={e => setBranchFilter(e.target.value)}
                            className="bg-surface-container-highest border-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">All Branches</option>
                            {allBranches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <select
                            value={companyFilter}
                            onChange={e => setCompanyFilter(e.target.value)}
                            className="bg-surface-container-highest border-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">All Companies</option>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button onClick={load} className="btn btn-ghost btn-sm">
                            <span className="material-symbols-outlined text-base">refresh</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : view === 'placed' ? (
                    <div className="overflow-x-auto">
                        <table className="console-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Branch</th>
                                    <th>CGPA</th>
                                    <th>Company</th>
                                    <th>Role</th>
                                    <th>Package</th>
                                    <th>Placed On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {placements.length ? placements.map(p => (
                                    <tr key={p.application_id}>
                                        <td className="font-semibold text-on-surface">{p.student_name}</td>
                                        <td>{p.branch}</td>
                                        <td>
                                            <span className="inline-flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                {p.cgpa}
                                            </span>
                                        </td>
                                        <td className="font-semibold">{p.company_name}</td>
                                        <td>{p.job_title}</td>
                                        <td className="font-bold text-primary">{fmtLPA(p.salary_min, p.salary_max)}</td>
                                        <td className="text-secondary">
                                            {p.placed_at ? new Date(p.placed_at).toLocaleDateString() : new Date(p.applied_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7">
                                            <div className="console-empty">
                                                <span className="material-symbols-outlined text-4xl text-outline mb-2 block">emoji_events</span>
                                                <h3>No placements yet</h3>
                                                <p>Use the Assign Students tab to bulk-place students into roles.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="console-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Branch</th>
                                    <th>CGPA</th>
                                    <th>Skills</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unplaced.filter(s => !branchFilter || s.branch === branchFilter).length ? (
                                    unplaced.filter(s => !branchFilter || s.branch === branchFilter).map(s => (
                                        <tr key={s.id}>
                                            <td className="font-semibold text-on-surface">{s.name}</td>
                                            <td>{s.branch}</td>
                                            <td>{s.cgpa}</td>
                                            <td className="text-secondary max-w-[200px] truncate">{s.skills || '—'}</td>
                                            <td>{s.phone || '—'}</td>
                                            <td><span className="status-pill bg-amber-50 text-amber-700">Unplaced</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="console-empty">
                                                <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2 block icon-filled">celebration</span>
                                                <h3>All students placed!</h3>
                                                <p>Every student has at least one accepted offer.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Bulk Assign Tab                                                      */
/* ─────────────────────────────────────────────────────────────────── */
const BulkAssign = ({ jobs, onFlash }) => {
    const [selectedJobId, setSelectedJobId] = useState('');
    const [eligibilityData, setEligibilityData] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [assignStatus, setAssignStatus] = useState('shortlisted');
    const [loadingEligible, setLoadingEligible] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [filterMode, setFilterMode] = useState('all'); // 'all' | 'eligible' | 'not-applied'

    const loadEligible = useCallback(async (jobId) => {
        if (!jobId) return;
        setLoadingEligible(true);
        setSelectedIds(new Set());
        const r = await axios.get(`${API_BASE_URL}/placements/eligible/${jobId}`);
        setEligibilityData(r.data);
        setLoadingEligible(false);
    }, []);

    const handleJobChange = (e) => {
        setSelectedJobId(e.target.value);
        setEligibilityData(null);
        if (e.target.value) loadEligible(e.target.value);
    };

    const displayStudents = useMemo(() => {
        if (!eligibilityData?.students) return [];
        let list = eligibilityData.students;
        if (filterMode === 'not-applied') list = list.filter(s => !s.already_applied);
        return list;
    }, [eligibilityData, filterMode]);

    const allSelected = displayStudents.length > 0 && displayStudents.every(s => selectedIds.has(s.id));
    const toggleAll = () => {
        if (allSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(displayStudents.map(s => s.id)));
    };
    const toggleOne = (id) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    const doAssign = async () => {
        setAssigning(true);
        setShowConfirm(false);
        const r = await axios.post(`${API_BASE_URL}/placements/bulk-assign`, {
            studentIds: [...selectedIds],
            jobId: parseInt(selectedJobId),
            status: assignStatus,
        });
        onFlash(r.data.message);
        setSelectedIds(new Set());
        await loadEligible(selectedJobId);
        setAssigning(false);
    };

    const selectedJob = jobs.find(j => j.id === parseInt(selectedJobId));

    return (
        <div className="space-y-6">
            {/* Step 1: Select Job */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">1</div>
                    <h3 className="font-headline font-black text-on-surface text-lg">Select a Job</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">work</span>
                        <select
                            value={selectedJobId}
                            onChange={handleJobChange}
                            className="w-full bg-surface-container-highest border-none rounded-xl pl-11 pr-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">— Choose an open job —</option>
                            {jobs.filter(j => j.status === 'open').map(j => (
                                <option key={j.id} value={j.id}>{j.title} @ {j.company_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">flag</span>
                        <select
                            value={assignStatus}
                            onChange={e => setAssignStatus(e.target.value)}
                            className="w-full bg-surface-container-highest border-none rounded-xl pl-11 pr-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="applied">Mark as: Applied</option>
                            <option value="shortlisted">Mark as: Shortlisted</option>
                            <option value="accepted">Mark as: Placed (Accepted)</option>
                        </select>
                    </div>
                </div>

                {selectedJob && eligibilityData && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-2 text-primary font-bold">
                            <span className="material-symbols-outlined text-base">business</span>
                            {selectedJob.company_name}
                        </span>
                        {eligibilityData.eligibility?.branches?.length > 0 && (
                            <span className="flex items-center gap-2 text-secondary font-semibold">
                                <span className="material-symbols-outlined text-base">school</span>
                                Branches: {eligibilityData.eligibility.branches.join(', ')}
                            </span>
                        )}
                        {eligibilityData.eligibility?.minCgpa > 0 && (
                            <span className="flex items-center gap-2 text-secondary font-semibold">
                                <span className="material-symbols-outlined text-base">grade</span>
                                Min CGPA: {eligibilityData.eligibility.minCgpa}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Step 2: Select Students */}
            {selectedJobId && (
                <div className="card-panel">
                    <div className="card-panel-header">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">2</div>
                            <div>
                                <h3 className="font-headline font-black text-on-surface text-lg">Select Students</h3>
                                {eligibilityData && (
                                    <p className="text-sm text-secondary">{displayStudents.length} students match criteria</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1 bg-surface-container rounded-xl p-1">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'not-applied', label: 'Not Applied' },
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setFilterMode(key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterMode === key ? 'bg-white text-on-surface shadow-sm' : 'text-secondary'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {selectedIds.size > 0 && (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    disabled={assigning}
                                    className="btn btn-primary"
                                >
                                    <span className="material-symbols-outlined text-base">group_add</span>
                                    {assigning ? 'Assigning…' : `Assign ${selectedIds.size} Student${selectedIds.size > 1 ? 's' : ''}`}
                                </button>
                            )}
                        </div>
                    </div>

                    {loadingEligible ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
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
                                        <th>Existing Offers</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayStudents.length ? displayStudents.map(s => (
                                        <tr
                                            key={s.id}
                                            className={`cursor-pointer select-none ${selectedIds.has(s.id) ? 'bg-blue-50' : ''}`}
                                            onClick={() => toggleOne(s.id)}
                                        >
                                            <td onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(s.id)}
                                                    onChange={() => toggleOne(s.id)}
                                                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                                                />
                                            </td>
                                            <td>
                                                <div>
                                                    <p className="font-semibold text-on-surface">{s.name}</p>
                                                    <p className="text-xs text-secondary">{s.email}</p>
                                                </div>
                                            </td>
                                            <td>{s.branch}</td>
                                            <td>
                                                <span className={`font-bold ${s.cgpa >= (eligibilityData?.eligibility?.minCgpa || 0) ? 'text-emerald-600' : 'text-error'}`}>
                                                    {s.cgpa}
                                                </span>
                                            </td>
                                            <td className="text-secondary max-w-[160px] truncate text-xs">{s.skills || '—'}</td>
                                            <td>
                                                {s.existing_offers > 0
                                                    ? <span className="status-pill bg-emerald-50 text-emerald-700">{s.existing_offers} Offer{s.existing_offers > 1 ? 's' : ''}</span>
                                                    : <span className="text-secondary text-xs">None</span>}
                                            </td>
                                            <td>
                                                {s.already_applied
                                                    ? <StatusPill value={s.application_status} />
                                                    : <span className="text-secondary text-xs">Not applied</span>}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7">
                                                <div className="console-empty">
                                                    <h3>No eligible students found</h3>
                                                    <p>Try selecting a different job or adjusting the filter.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                            <span className="material-symbols-outlined text-primary text-3xl icon-filled">group_add</span>
                        </div>
                        <h3 className="font-headline text-2xl font-black text-on-surface text-center mb-2">Confirm Assignment</h3>
                        <p className="text-secondary text-center text-sm mb-6">
                            Assign <strong className="text-on-surface">{selectedIds.size} student{selectedIds.size > 1 ? 's' : ''}</strong> to{' '}
                            <strong className="text-on-surface">{selectedJob?.title}</strong> at{' '}
                            <strong className="text-on-surface">{selectedJob?.company_name}</strong>{' '}
                            as <strong className="text-primary">{assignStatus}</strong>?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(false)} className="btn btn-ghost flex-1">Cancel</button>
                            <button onClick={doAssign} className="btn btn-primary flex-1">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Students Tab with Placement Status                                   */
/* ─────────────────────────────────────────────────────────────────── */
const StudentsWithStatus = ({ onEdit, onDelete, onCreate }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [filterPlaced, setFilterPlaced] = useState('all'); // 'all' | 'placed' | 'unplaced'

    const load = useCallback(async () => {
        setLoading(true);
        const r = await axios.get(`${API_BASE_URL}/placements/students-with-status?limit=200`);
        setStudents(r.data.students || []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = useMemo(() => {
        let list = students;
        if (filterPlaced === 'placed') list = list.filter(s => s.offer_count > 0);
        if (filterPlaced === 'unplaced') list = list.filter(s => s.offer_count === 0);
        const q = query.toLowerCase();
        if (q) list = list.filter(s => [s.name, s.branch, s.skills].join(' ').toLowerCase().includes(q));
        return list;
    }, [students, filterPlaced, query]);

    return (
        <div className="card-panel">
            <div className="card-panel-header">
                <div>
                    <h2 className="font-headline text-xl font-bold text-on-surface">Students</h2>
                    <p className="text-sm text-secondary mt-0.5">Manage student records and view placement status.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex gap-1 bg-surface-container rounded-xl p-1">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'placed', label: '✓ Placed' },
                            { key: 'unplaced', label: '○ Unplaced' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilterPlaced(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterPlaced === key ? 'bg-white text-on-surface shadow-sm' : 'text-secondary'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base pointer-events-none">search</span>
                        <input
                            className="bg-surface-container-highest border-none rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 w-48"
                            placeholder="Search…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>
                    <ActionButton onClick={onCreate}>
                        <span className="material-symbols-outlined text-base">add</span> New Student
                    </ActionButton>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="console-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Branch</th>
                                <th>CGPA</th>
                                <th>Applications</th>
                                <th>Placement Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length ? filtered.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div>
                                            <p className="font-semibold text-on-surface">{s.name}</p>
                                            <p className="text-xs text-secondary">{s.email}</p>
                                        </div>
                                    </td>
                                    <td>{s.branch}</td>
                                    <td>
                                        <span className={`font-bold ${s.cgpa >= 7 ? 'text-emerald-600' : s.cgpa >= 6 ? 'text-amber-600' : 'text-error'}`}>{s.cgpa}</span>
                                    </td>
                                    <td>
                                        <span className="text-secondary text-sm">{s.total_applications || 0} total, {s.shortlisted_count || 0} shortlisted</span>
                                    </td>
                                    <td>
                                        {s.offer_count > 0 ? (
                                            <div>
                                                <span className="status-pill status-accepted">{s.offer_count > 1 ? `${s.offer_count} Offers` : 'Placed'}</span>
                                                <p className="text-xs text-secondary mt-0.5 max-w-[180px] truncate">{s.placed_at_companies}</p>
                                            </div>
                                        ) : (
                                            <span className="status-pill bg-amber-50 text-amber-700">Unplaced</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <button onClick={() => onEdit(s)}>Edit</button>
                                            <button onClick={() => onDelete(s)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6">
                                        <div className="console-empty"><h3>No students found</h3></div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Main AdminDashboard                                                  */
/* ─────────────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [notice, setNotice]       = useState('');
    const [editingStudent, setEditingStudent] = useState(null);
    const [editingCompany, setEditingCompany] = useState(null);
    const [editingJob,     setEditingJob]     = useState(null);
    const [newCompanyJob,  setNewCompanyJob]  = useState(initialLinkedJob);
    const [createJobWithCompany, setCreateJobWithCompany] = useState(false);
    const [newJobCompany,  setNewJobCompany]  = useState(initialCompany);
    const [trackerQuery,   setTrackerQuery]   = useState('');

    const companies = useApiResource('companies', { limit: 100 });
    const jobs      = useApiResource('jobs',      { limit: 50  });
    const tracker   = useApiResource('placement-drives', { limit: 50 });

    const flash = useCallback((msg) => {
        setNotice(msg);
        setTimeout(() => setNotice(''), 2400);
    }, []);

    const refreshAll = useCallback(() => {
        companies.fetchRows();
        jobs.fetchRows();
        tracker.fetchRows();
    }, [companies, jobs, tracker]);

    const saveStudent = async (e) => {
        e.preventDefault();
        if (editingStudent.id) { await axios.put(`${API_BASE_URL}/students/${editingStudent.id}`, editingStudent); flash('Student updated'); }
        else { await axios.post(`${API_BASE_URL}/students`, editingStudent); flash('Student created'); }
        setEditingStudent(null); refreshAll();
    };

    const saveCompany = async (e) => {
        e.preventDefault();
        if (editingCompany.id) { await axios.put(`${API_BASE_URL}/companies/${editingCompany.id}`, editingCompany); flash('Company updated'); }
        else {
            await axios.post(`${API_BASE_URL}/companies`, { ...editingCompany, createDefaultJob: newCompanyJob.title ? newCompanyJob : null });
            flash('Company created');
        }
        setNewCompanyJob(initialLinkedJob); setEditingCompany(null); refreshAll();
    };

    const saveJob = async (e) => {
        e.preventDefault();
        const payload = { ...editingJob, companyId: editingJob.companyId || editingJob.company_id };
        if (!editingJob.id && createJobWithCompany) payload.createCompany = newJobCompany;
        if (editingJob.id) { await axios.put(`${API_BASE_URL}/jobs/${editingJob.id}`, payload); flash('Job updated'); }
        else { await axios.post(`${API_BASE_URL}/jobs`, payload); flash('Job created'); }
        setCreateJobWithCompany(false); setNewJobCompany(initialCompany); setEditingJob(null); refreshAll();
    };

    const remove = async (resource, id, label) => {
        if (!window.confirm(`Delete ${label}?`)) return;
        await axios.delete(`${API_BASE_URL}/${resource}/${id}`);
        flash(`${label} deleted`); refreshAll();
    };

    const filteredTracker = useMemo(() => {
        const q = trackerQuery.toLowerCase();
        if (!q) return tracker.rows;
        return tracker.rows.filter(r =>
            [r.company_name, r.profile, r.offer_type, r.eligible_branches].join(' ').toLowerCase().includes(q)
        );
    }, [trackerQuery, tracker.rows]);

    return (
        <ConsoleLayout
            title="Placement Dashboard"
            subtitle="Comprehensive placement management — assign, track, and analyse student placements."
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {notice && <div className="toast">{notice}</div>}

            {activeTab === 'overview'   && <AnalyticsOverview onNavigate={setActiveTab} />}
            {activeTab === 'placements' && <PlacementBoard companies={companies.rows} />}
            {activeTab === 'assign'     && <BulkAssign jobs={jobs.rows} onFlash={flash} />}

            {activeTab === 'jobs' && (
                <div className="card-panel">
                    <div className="card-panel-header">
                        <div>
                            <h2 className="font-headline text-xl font-bold text-on-surface">Jobs</h2>
                            <p className="text-sm text-secondary mt-0.5">Create, update, close, or delete job records.</p>
                        </div>
                        <ActionButton onClick={() => setEditingJob(initialJob)}>
                            <span className="material-symbols-outlined text-base">add</span> New Job
                        </ActionButton>
                    </div>
                    <ConsoleTable
                        rows={jobs.rows}
                        emptyTitle="No jobs yet"
                        emptyBody="Create a job to get started."
                        columns={[
                            { key: 'title',        label: 'Role' },
                            { key: 'company_name', label: 'Company' },
                            { key: 'drive_date',   label: 'Drive date' },
                            { key: 'status',       label: 'Status', render: (r) => <StatusPill value={r.status} /> },
                            { key: 'actions',      label: 'Actions', render: (r) => (
                                <div className="row-actions">
                                    <button onClick={() => setActiveTab('assign') || setTimeout(() => {}, 0)}>Assign</button>
                                    <button onClick={() => setEditingJob({ ...r, companyId: r.company_id })}>Edit</button>
                                    <button onClick={() => remove('jobs', r.id, r.title)}>Delete</button>
                                </div>
                            )},
                        ]}
                    />
                </div>
            )}

            {activeTab === 'companies' && (
                <div className="card-panel">
                    <div className="card-panel-header">
                        <div>
                            <h2 className="font-headline text-xl font-bold text-on-surface">Companies</h2>
                            <p className="text-sm text-secondary mt-0.5">Maintain recruiter and company details.</p>
                        </div>
                        <ActionButton onClick={() => setEditingCompany(initialCompany)}>
                            <span className="material-symbols-outlined text-base">add</span> New Company
                        </ActionButton>
                    </div>
                    <ConsoleTable
                        rows={companies.rows}
                        columns={[
                            { key: 'name',          label: 'Company' },
                            { key: 'contact_email', label: 'Email' },
                            { key: 'website',       label: 'Website' },
                            { key: 'actions',       label: 'Actions', render: (r) => (
                                <div className="row-actions">
                                    <button onClick={() => setEditingCompany({ ...r, contactEmail: r.contact_email, contactPhone: r.contact_phone })}>Edit</button>
                                    <button onClick={() => remove('companies', r.id, r.name)}>Delete</button>
                                </div>
                            )},
                        ]}
                    />
                </div>
            )}

            {activeTab === 'students' && (
                <StudentsWithStatus
                    onEdit={setEditingStudent}
                    onDelete={(s) => remove('students', s.id, s.name)}
                    onCreate={() => setEditingStudent(initialStudent)}
                />
            )}

            {activeTab === 'tracker' && (
                <div className="card-panel">
                    <div className="card-panel-header">
                        <div>
                            <h2 className="font-headline text-xl font-bold text-on-surface">EDPEEE Tracker</h2>
                            <p className="text-sm text-secondary mt-0.5">Imported placement-drive evidence from the PDF.</p>
                        </div>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base pointer-events-none">search</span>
                            <input
                                className="bg-surface-container-highest border-none rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 w-64"
                                placeholder="Search company, role, branch"
                                value={trackerQuery}
                                onChange={e => setTrackerQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <ConsoleTable
                        rows={filteredTracker}
                        columns={[
                            { key: 'drive_date',       label: 'Date' },
                            { key: 'company_name',     label: 'Company' },
                            { key: 'profile',          label: 'Profile' },
                            { key: 'offer_type',       label: 'Offer' },
                            { key: 'eligible_branches', label: 'Branches' },
                            { key: 'cgpa_criteria',    label: 'Criteria' },
                        ]}
                    />
                </div>
            )}

            {activeTab === 'settings' && <SettingsWorkspace />}

            {/* ── Drawers ──────────────────────────────────────── */}
            {editingStudent && (
                <RecordEditor title={editingStudent.id ? 'Edit student' : 'Create student'} onClose={() => setEditingStudent(null)} onSubmit={saveStudent}>
                    {!editingStudent.id && <Field label="Email"><input required value={editingStudent.email} onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })} /></Field>}
                    {!editingStudent.id && <Field label="Password"><input value={editingStudent.password} onChange={e => setEditingStudent({ ...editingStudent, password: e.target.value })} /></Field>}
                    <Field label="Name"><input required value={editingStudent.name || ''} onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })} /></Field>
                    <Field label="Branch"><input required value={editingStudent.branch || ''} onChange={e => setEditingStudent({ ...editingStudent, branch: e.target.value })} /></Field>
                    <Field label="CGPA"><input type="number" step="0.01" value={editingStudent.cgpa || ''} onChange={e => setEditingStudent({ ...editingStudent, cgpa: e.target.value })} /></Field>
                    <Field label="Skills"><textarea value={editingStudent.skills || ''} onChange={e => setEditingStudent({ ...editingStudent, skills: e.target.value })} /></Field>
                    <Field label="Phone"><input value={editingStudent.phone || ''} onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })} /></Field>
                    <Field label="Address"><textarea value={editingStudent.address || ''} onChange={e => setEditingStudent({ ...editingStudent, address: e.target.value })} /></Field>
                </RecordEditor>
            )}

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
                            <Field label="Job description"><textarea value={newCompanyJob.description} onChange={e => setNewCompanyJob({ ...newCompanyJob, description: e.target.value })} /></Field>
                            <Field label="Requirements"><textarea value={newCompanyJob.requirements} onChange={e => setNewCompanyJob({ ...newCompanyJob, requirements: e.target.value })} /></Field>
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
                            {companies.rows.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                            <Field label="Website"><input value={newJobCompany.website} onChange={e => setNewJobCompany({ ...newJobCompany, website: e.target.value })} /></Field>
                            <Field label="Contact email"><input value={newJobCompany.contactEmail} onChange={e => setNewJobCompany({ ...newJobCompany, contactEmail: e.target.value })} /></Field>
                        </>
                    )}
                    <Field label="Description"><textarea required value={editingJob.description || ''} onChange={e => setEditingJob({ ...editingJob, description: e.target.value })} /></Field>
                    <Field label="Requirements"><textarea value={editingJob.requirements || ''} onChange={e => setEditingJob({ ...editingJob, requirements: e.target.value })} /></Field>
                    <Field label="Eligible Branches (comma-separated)"><input value={editingJob.eligible_branches || ''} onChange={e => setEditingJob({ ...editingJob, eligible_branches: e.target.value })} placeholder="CSE, IT, ECE" /></Field>
                    <Field label="Eligibility Criteria"><input value={editingJob.eligibility_criteria || ''} onChange={e => setEditingJob({ ...editingJob, eligibility_criteria: e.target.value })} placeholder="CGPA 6.0 and above" /></Field>
                    <Field label="Location"><input value={editingJob.location || ''} onChange={e => setEditingJob({ ...editingJob, location: e.target.value })} /></Field>
                    <Field label="Status">
                        <select value={editingJob.status || 'open'} onChange={e => setEditingJob({ ...editingJob, status: e.target.value })}>
                            <option value="open">open</option>
                            <option value="closed">closed</option>
                        </select>
                    </Field>
                    <Field label="Salary min (₹)"><input type="number" value={editingJob.salaryMin || editingJob.salary_min || ''} onChange={e => setEditingJob({ ...editingJob, salaryMin: e.target.value })} /></Field>
                    <Field label="Salary max (₹)"><input type="number" value={editingJob.salaryMax || editingJob.salary_max || ''} onChange={e => setEditingJob({ ...editingJob, salaryMax: e.target.value })} /></Field>
                </RecordEditor>
            )}

            {/* FAB */}
            <button
                className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary-gradient text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
                onClick={() => setActiveTab('assign')}
                title="Bulk assign students"
            >
                <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform duration-200">group_add</span>
            </button>
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

export default AdminDashboard;
