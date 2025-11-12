/**
 * Theme Context for Recipe Book App
 * Provides theme management with React Context
 */

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform, StatusBar } from "react-native";
import {
  AppTheme,
  Theme,
  darkTheme,
  lightTheme,
  loadTheme,
  saveTheme,
} from "../constants/enhanced-theme";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  appTheme: AppTheme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isDark, setIsDark] = useState(false);
  const [appTheme, setAppTheme] = useState<AppTheme>(lightTheme);

  // Load saved theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      const savedTheme = await loadTheme();
      applyTheme(savedTheme);
    };

    initializeTheme();
  }, []);

  // Apply theme changes
  const applyTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    const dark = newTheme === "dark";
    setIsDark(dark);
    setAppTheme(dark ? darkTheme : lightTheme);

    // Update status bar style
    StatusBar.setBarStyle(dark ? "light-content" : "dark-content");
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(
        dark ? darkTheme.colors.background : lightTheme.colors.background
      );
    }
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
  };

  // Set specific theme
  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
    // Save to storage
    saveTheme(newTheme).catch(console.warn);
  };

  const contextValue: ThemeContextType = {
    theme,
    isDark,
    appTheme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Hook for theme colors
export const useColors = () => {
  const { appTheme } = useTheme();
  return appTheme.colors;
};

// Hook for theme spacing
export const useSpacing = () => {
  const { appTheme } = useTheme();
  return appTheme.spacing;
};

// Hook for theme border radius
export const useBorderRadius = () => {
  const { appTheme } = useTheme();
  return appTheme.borderRadius;
};

// Hook for theme shadows
export const useShadows = () => {
  const { appTheme } = useTheme();
  return appTheme.shadows;
};

// Hook for theme fonts
export const useFonts = () => {
  const { appTheme } = useTheme();
  return appTheme.fonts;
};

export default ThemeProvider;
