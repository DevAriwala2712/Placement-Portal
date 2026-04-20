import React, { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

const SettingsWorkspace = () => {
    const { settings, updateSetting } = useContext(SettingsContext);

    return (
        <div className="max-w-3xl space-y-6">
            {/* Page header */}
            <div className="mb-2">
                <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-1">Academic Architect</h2>
                <p className="text-secondary">Manage your system preferences and account credentials.</p>
            </div>

            {/* ── Appearance ─────────────────────────────────────────── */}
            <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
                <div className="flex items-start gap-4 mb-7">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-primary">
                        <span className="material-symbols-outlined">palette</span>
                    </div>
                    <div>
                        <h3 className="font-headline text-lg font-bold text-on-surface">Appearance</h3>
                        <p className="text-sm text-secondary">Customize how the placement console looks on your device.</p>
                    </div>
                </div>

                {/* Theme Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => updateSetting('theme', 'light')}
                        className={`relative text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.01] ${settings.theme !== 'dark' ? 'border-primary bg-white' : 'border-transparent bg-surface-container-low hover:border-outline-variant/50'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-bold text-on-surface">Light Mode</span>
                            <span className={`material-symbols-outlined ${settings.theme !== 'dark' ? 'icon-filled text-primary' : 'text-outline'}`}>
                                {settings.theme !== 'dark' ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                        </div>
                        <div className="space-y-2 opacity-50">
                            <div className="h-2 w-3/4 bg-slate-200 rounded" />
                            <div className="h-2 w-1/2 bg-slate-200 rounded" />
                            <div className="h-7 w-full bg-slate-100 rounded-lg" />
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateSetting('theme', 'dark')}
                        className={`relative text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.01] bg-slate-950 ${settings.theme === 'dark' ? 'border-primary' : 'border-transparent hover:border-slate-700'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-bold text-white">Dark Mode</span>
                            <span className={`material-symbols-outlined ${settings.theme === 'dark' ? 'icon-filled text-primary' : 'text-slate-600'}`}>
                                {settings.theme === 'dark' ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                        </div>
                        <div className="space-y-2 opacity-40">
                            <div className="h-2 w-3/4 bg-slate-700 rounded" />
                            <div className="h-2 w-1/2 bg-slate-700 rounded" />
                            <div className="h-7 w-full bg-slate-800 rounded-lg" />
                        </div>
                    </button>
                </div>

                {/* Compact Mode Toggle */}
                <div className="flex items-center justify-between py-4 border-t border-outline-variant/20">
                    <div>
                        <span className="font-semibold text-on-surface">Compact Mode</span>
                        <p className="text-xs text-secondary mt-0.5">Reduce padding to show more placement data at once.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={Boolean(settings.compactMode)}
                            onChange={(e) => updateSetting('compactMode', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                </div>
            </section>

            {/* ── Productivity ────────────────────────────────────────── */}
            <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
                <div className="flex items-start gap-4 mb-7">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-primary">
                        <span className="material-symbols-outlined">bolt</span>
                    </div>
                    <div>
                        <h3 className="font-headline text-lg font-bold text-on-surface">Productivity</h3>
                        <p className="text-sm text-secondary">Control automation and notification behaviors.</p>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Auto Refresh */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="font-semibold text-on-surface">Auto Refresh</span>
                            <p className="text-xs text-secondary mt-0.5">Keep the student placement list up to date automatically.</p>
                        </div>
                        <select
                            className="bg-surface-container-highest border-none rounded-xl text-sm px-4 py-2 min-w-[160px] focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                            value={settings.autoRefreshSeconds}
                            onChange={(e) => updateSetting('autoRefreshSeconds', Number(e.target.value))}
                        >
                            <option value={15}>15 seconds</option>
                            <option value={30}>30 seconds</option>
                            <option value={60}>60 seconds</option>
                            <option value={300}>5 minutes</option>
                            <option value={600}>Disabled (600s)</option>
                        </select>
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between py-4 border-t border-outline-variant/20">
                        <div>
                            <span className="font-semibold text-on-surface">Email Notifications</span>
                            <p className="text-xs text-secondary mt-0.5">Receive weekly placement summaries via email.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={Boolean(settings.emailNotifications)}
                                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                    </div>
                </div>
            </section>

            {/* ── Account ─────────────────────────────────────────────── */}
            <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
                <div className="flex items-start gap-4 mb-7">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-primary">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                        <h3 className="font-headline text-lg font-bold text-on-surface">Account</h3>
                        <p className="text-sm text-secondary">Update your personal information and security settings.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-secondary px-1">Display Name</label>
                        <input
                            type="text"
                            defaultValue="Placement Admin"
                            className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-secondary px-1">Email Address</label>
                        <input
                            type="email"
                            defaultValue="admin@placement-console.edu"
                            className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface"
                        />
                    </div>
                </div>

                <div className="mt-7 pt-5 border-t border-outline-variant/20 flex items-center justify-between">
                    <button type="button" className="text-primary font-semibold text-sm hover:underline underline-offset-4 flex items-center gap-1.5 transition-colors">
                        <span className="material-symbols-outlined text-base">lock</span>
                        Change Password
                    </button>
                    <button type="button" className="btn btn-primary">
                        <span className="material-symbols-outlined text-base">save</span>
                        Save Changes
                    </button>
                </div>
            </section>

            {/* Info card */}
            <section className="bg-surface-container-highest rounded-2xl p-6">
                <h4 className="font-headline font-bold text-on-surface mb-3 text-sm">About this workspace</h4>
                <ul className="space-y-2 text-sm text-secondary">
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-secondary mt-0.5">info</span>
                        Theme updates instantly and is stored in your browser.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-secondary mt-0.5">info</span>
                        Auto refresh value is clamped between 15s and 600s.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-secondary mt-0.5">info</span>
                        Compact mode applies tighter spacing across all dashboards.
                    </li>
                </ul>
            </section>
        </div>
    );
};

export default SettingsWorkspace;
