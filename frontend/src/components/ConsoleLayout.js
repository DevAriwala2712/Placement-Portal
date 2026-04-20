import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';

export const classNames = (...values) => values.filter(Boolean).join(' ');

/* ─── Empty State ────────────────────────────────────────────────────── */
export const EmptyState = ({ title, body }) => (
    <div className="console-empty">
        <div className="w-12 h-12 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-secondary">inbox</span>
        </div>
        <h3>{title}</h3>
        <p>{body}</p>
    </div>
);

/* ─── Status Pill ────────────────────────────────────────────────────── */
export const StatusPill = ({ value }) => {
    const text = value || 'unknown';
    return <span className={`status-pill status-${String(text).toLowerCase()}`}>{text}</span>;
};

/* ─── Form Field ─────────────────────────────────────────────────────── */
export const Field = ({ label, children }) => (
    <label className="field">
        <span>{label}</span>
        {children}
    </label>
);

/* ─── Action Button ──────────────────────────────────────────────────── */
export const ActionButton = ({ children, variant = 'primary', ...props }) => (
    <button
        {...props}
        className={classNames(
            'btn',
            variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'btn-ghost',
            props.className
        )}
    >
        {children}
    </button>
);

/* ─── Console Data Table ─────────────────────────────────────────────── */
export const ConsoleTable = ({ columns, rows, emptyTitle, emptyBody, rowKey = 'id' }) => {
    if (!rows.length) {
        return <EmptyState title={emptyTitle || 'No records'} body={emptyBody || 'Records will appear here once available.'} />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="console-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key}>{column.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row[rowKey]}>
                            {columns.map((column) => (
                                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/* ─── Sidebar Nav Item ───────────────────────────────────────────────── */
const NavItem = ({ tab, active, onClick }) => (
    <button
        type="button"
        onClick={() => onClick(tab.id)}
        className={classNames('nav-link', active && 'active')}
    >
        <span className={classNames('material-symbols-outlined', active && 'icon-filled')}>{tab.icon}</span>
        <span>{tab.label}</span>
    </button>
);

/* ─── Main Console Layout ────────────────────────────────────────────── */
export const ConsoleLayout = ({ title, subtitle, tabs, activeTab, onTabChange, children, aside }) => {
    const { user, logout } = useContext(AuthContext);
    const { settings } = useContext(SettingsContext);

    const mainTabs = tabs.filter(t => t.id !== 'settings');
    const settingsTab = tabs.find(t => t.id === 'settings');

    const roleLabel = {
        admin: 'Super Administrator',
        student: 'Student Portal',
        recruiter: 'Recruiter Workspace',
    }[user?.role] || user?.role;

    return (
        <div className={classNames(settings.compactMode && 'compact-mode')}>
            {/* ── Sidebar ────────────────────────────────────────────── */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-brand-mark">
                        <span className="material-symbols-outlined icon-filled">school</span>
                    </div>
                    <div>
                        <h1 className="font-headline text-base font-black tracking-tight text-primary leading-tight">Placement</h1>
                        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-secondary">Academic Architect</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {mainTabs.map((tab) => (
                        <NavItem key={tab.id} tab={tab} active={activeTab === tab.id} onClick={onTabChange} />
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {settingsTab && (
                        <NavItem tab={settingsTab} active={activeTab === 'settings'} onClick={onTabChange} />
                    )}
                    <button
                        type="button"
                        onClick={logout}
                        className="nav-link text-error hover:bg-error-container/30 hover:text-on-error-container"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            {/* ── Top App Bar ─────────────────────────────────────────── */}
            <header className="topbar">
                <div className="flex items-center gap-3">
                    <h2 className="font-headline text-base font-extrabold text-on-surface uppercase tracking-widest">{title}</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-6 w-px bg-outline-variant/30" />
                    <div className="flex items-center gap-3 pl-1">
                        <div className="w-9 h-9 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold text-sm">
                            {(user?.email || user?.role || '?')[0].toUpperCase()}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-bold text-on-surface leading-tight">{user?.email?.split('@')[0] || user?.role}</p>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">{roleLabel}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main Canvas ─────────────────────────────────────────── */}
            <main className="main-canvas">
                <div className="p-8">
                    {/* Page header */}
                    <div className="mb-8">
                        <span className="text-primary font-bold tracking-widest text-xs uppercase font-headline">{roleLabel}</span>
                        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mt-0.5">{title}</h1>
                        {subtitle && <p className="text-secondary mt-1 font-medium">{subtitle}</p>}
                    </div>
                    {children}
                </div>
            </main>

            {aside}
        </div>
    );
};
