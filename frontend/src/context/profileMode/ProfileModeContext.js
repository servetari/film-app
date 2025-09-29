import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ProfileModeContext = createContext({ mode: 'adult', setMode: () => {} });

export const ProfileModeProvider = ({ children }) => {
  const [mode, setModeState] = useState(() => {
    return localStorage.getItem('profileMode') || 'adult';
  });

  useEffect(() => {
    if (mode === 'kids' || mode === 'adult') {
      localStorage.setItem('profileMode', mode);
    }
  }, [mode]);

  const setMode = (value) => {
    const next = value === 'kids' ? 'kids' : 'adult';
    setModeState(next);
  };

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <ProfileModeContext.Provider value={value}>{children}</ProfileModeContext.Provider>;
};

export const useProfileMode = () => useContext(ProfileModeContext);

