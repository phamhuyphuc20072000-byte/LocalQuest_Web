import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  const toggleSound = () => {
    setIsSoundEnabled((prev) => !prev);
  };

  const toggleHighContrast = () => {
    setIsHighContrast((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        isSoundEnabled,
        toggleSound,
        isHighContrast,
        toggleHighContrast
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
