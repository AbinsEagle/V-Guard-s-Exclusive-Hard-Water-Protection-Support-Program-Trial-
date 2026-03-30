import React, { createContext, useContext, useState } from 'react';
import { InstallationData, EMPTY_INSTALLATION } from '../types';

interface InstallationContextValue {
  data: InstallationData;
  update: (fields: Partial<InstallationData>) => void;
  reset: () => void;
}

const InstallationContext = createContext<InstallationContextValue | null>(null);

export function InstallationProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<InstallationData>(EMPTY_INSTALLATION);

  const update = (fields: Partial<InstallationData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const reset = () => setData(EMPTY_INSTALLATION);

  return (
    <InstallationContext.Provider value={{ data, update, reset }}>
      {children}
    </InstallationContext.Provider>
  );
}

export function useInstallation(): InstallationContextValue {
  const ctx = useContext(InstallationContext);
  if (!ctx) throw new Error('useInstallation must be used inside InstallationProvider');
  return ctx;
}
