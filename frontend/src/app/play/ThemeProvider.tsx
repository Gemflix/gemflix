"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  borderRadius: string;
  logoUrl?: string;
}

interface ThemeContextProps {
  theme: ThemeConfig;
  setTheme: (config: ThemeConfig) => void;
  resetTheme: () => void;
  isLocalOverride: boolean;
}

const defaultTheme: ThemeConfig = {
  primaryColor: "#f97316",
  backgroundColor: "#0f1115",
  borderRadius: "0.5rem",
};

const ThemeContext = createContext<ThemeContextProps>({
  theme: defaultTheme,
  setTheme: () => {},
  resetTheme: () => {},
  isLocalOverride: false,
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ 
  children, 
  globalTheme 
}: { 
  children: React.ReactNode, 
  globalTheme: ThemeConfig 
}) {
  const [theme, setThemeState] = useState<ThemeConfig>(globalTheme);
  const [isLocalOverride, setIsLocalOverride] = useState(false);

  // Cargar preferencia local al montar
  useEffect(() => {
    try {
      const local = localStorage.getItem("gemflix_user_theme");
      if (local) {
        setThemeState(JSON.parse(local));
        setIsLocalOverride(true);
      }
    } catch (e) {
      console.error("Error loading local theme", e);
    }
  }, []);

  // Si el tema global (admin) cambia y no hay override local, actualizar
  useEffect(() => {
    if (!isLocalOverride) {
      setThemeState(globalTheme);
    }
  }, [globalTheme, isLocalOverride]);

  // Setear tema y guardarlo localmente
  const setTheme = (config: ThemeConfig) => {
    setThemeState(config);
    setIsLocalOverride(true);
    try {
      localStorage.setItem("gemflix_user_theme", JSON.stringify(config));
    } catch (e) {}
  };

  // Restaurar el tema global del administrador
  const resetTheme = () => {
    setThemeState(globalTheme);
    setIsLocalOverride(false);
    try {
      localStorage.removeItem("gemflix_user_theme");
    } catch (e) {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme, isLocalOverride }}>
      {/* Inyección de CSS global para el Theme */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --accent: ${theme.primaryColor};
          --background: ${theme.backgroundColor};
          /* Si tailwind config usa un custom radius, podemos agregarlo */
          --border-radius: ${theme.borderRadius};
        }
        
        body {
          background-color: var(--background);
        }

        /* Utilidades para los bordes */
        .theme-rounded {
          border-radius: var(--border-radius) !important;
        }
      `}} />
      {children}
    </ThemeContext.Provider>
  );
}
