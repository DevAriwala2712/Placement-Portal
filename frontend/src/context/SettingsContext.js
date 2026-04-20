import React, { createContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'placement_console_settings';

const defaultSettings = {
    theme: 'light',
    compactMode: false,
    emailNotifications: true,
    autoRefreshSeconds: 60
};

export const SettingsContext = createContext({
    settings: defaultSettings,
    updateSetting: () => {}
});

function clampRefresh(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 15) return 15;
    if (numeric > 600) return 600;
    return Math.round(numeric);
}

function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultSettings;
        const parsed = JSON.parse(raw);
        return {
            ...defaultSettings,
            ...parsed,
            autoRefreshSeconds: clampRefresh(parsed.autoRefreshSeconds ?? defaultSettings.autoRefreshSeconds)
        };
    } catch (error) {
        return defaultSettings;
    }
}

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(loadSettings);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        document.documentElement.setAttribute('data-theme', settings.theme === 'dark' ? 'dark' : 'light');
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings((current) => {
            if (key === 'autoRefreshSeconds') {
                return { ...current, autoRefreshSeconds: clampRefresh(value) };
            }
            return { ...current, [key]: value };
        });
    };

    const contextValue = useMemo(() => ({ settings, updateSetting }), [settings]);

    return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};
