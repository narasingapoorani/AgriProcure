import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'agri-procure-demo-state';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed.language && parsed.language !== 'English' && parsed.language !== 'Tamil') {
      parsed.language = 'English';
    }
    if (parsed.theme && parsed.theme !== 'light' && parsed.theme !== 'dark') {
      parsed.theme = 'light';
    }
    // Auto-heal only demo seed accounts where name was missing or saved as placeholder
    if (parsed.farmerUser) {
      const isDemo = parsed.farmerUser.id === 1 || parsed.farmerUser.username === 'farmer1';
      const raw = String(parsed.farmerUser.full_name || parsed.farmerUser.name || '').trim();
      if (isDemo && (!raw || /^\+?\d[\d\s-]{7,15}$/.test(raw) || raw === 'farmer1')) {
        parsed.farmerUser.name = 'Ramesh Kisan Patil';
        parsed.farmerUser.full_name = 'Ramesh Kisan Patil';
      }
    }
    if (parsed.officerUser) {
      const isDemo = parsed.officerUser.id === 2 || parsed.officerUser.username === 'officer1';
      const raw = String(parsed.officerUser.full_name || parsed.officerUser.name || '').trim();
      if (isDemo && (!raw || /^\+?\d[\d\s-]{7,15}$/.test(raw) || raw === 'officer1')) {
        parsed.officerUser.name = 'Dr. Arvind Sharma';
        parsed.officerUser.full_name = 'Dr. Arvind Sharma';
      }
    }
    return parsed;
  } catch {
    return {};
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => ({
    language: 'English',
    theme: 'light',
    farmerUser: null,
    officerUser: null,
    selectedCrop: null,
    recommendedCenter: null,
    selectedCenter: null,
    slot: null,
    officerSelectedCenter: null,
    ...loadState(),
  }));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  const toggleTheme = () =>
    setState((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));

  const logoutFarmer = () => {
    localStorage.removeItem('agri_ai_token');
    update({
      farmerUser: null,
      selectedCrop: null,
      selectedCenter: null,
      recommendedCenter: null,
      slot: null,
      feePaid: false
    });
  };

  const logoutOfficer = () => {
    localStorage.removeItem('agri_ai_token');
    update({
      officerUser: null,
      officerSelectedCenter: null
    });
  };

  return (
    <AppContext.Provider value={{ state, update, toggleTheme, logoutFarmer, logoutOfficer }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
