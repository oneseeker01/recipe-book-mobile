/**
 * Enhanced Theme System for Recipe Book App
 * Comprehensive light and dark theme with app branding colors
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// App brand colors
const BRAND_PRIMARY = "#A12D2A";
const BRAND_PRIMARY_DARK = "#8B2528";
const BRAND_SECONDARY = "#F39C12";

// Theme colors for light mode
const lightColors = {
  // Brand colors
  primary: BRAND_PRIMARY,
  primaryDark: BRAND_PRIMARY_DARK,
  secondary: BRAND_SECONDARY,

  // Background colors
  background: "#FFFFFF",
  backgroundSecondary: "#F8F9FA",
  backgroundCard: "#FFFFFF",
  backgroundInput: "#F5F5F5",
  backgroundDisabled: "#E9ECEF",

  // Text colors
  textPrimary: "#1A1A1A",
  textSecondary: "#6C757D",
  textTertiary: "#ADB5BD",
  textInverse: "#FFFFFF",
  textMuted: "#868E96",

  // Border colors
  borderPrimary: "#DEE2E6",
  borderSecondary: "#F1F3F4",
  borderFocus: BRAND_PRIMARY,

  // Status colors
  success: "#28A745",
  warning: "#FFC107",
  error: "#DC3545",
  info: "#17A2B8",

  // Icon colors
  iconPrimary: "#1A1A1A",
  iconSecondary: "#6C757D",
  iconMuted: "#ADB5BD",
  iconInverse: "#FFFFFF",

  // Special surfaces
  shadow: "rgba(0, 0, 0, 0.1)",
  overlay: "rgba(0, 0, 0, 0.5)",
  backdrop: "rgba(0, 0, 0, 0.8)",
};

// Theme colors for dark mode
const darkColors = {
  // Brand colors
  primary: BRAND_PRIMARY,
  primaryDark: BRAND_PRIMARY_DARK,
  secondary: BRAND_SECONDARY,

  // Background colors
  background: "#121212",
  backgroundSecondary: "#1E1E1E",
  backgroundCard: "#1A1A1A",
  backgroundInput: "#2A2A2A",
  backgroundDisabled: "#333333",

  // Text colors
  textPrimary: "#FFFFFF",
  textSecondary: "#E0E0E0",
  textTertiary: "#B0B0B0",
  textInverse: "#1A1A1A",
  textMuted: "#888888",

  // Border colors
  borderPrimary: "#333333",
  borderSecondary: "#444444",
  borderFocus: BRAND_PRIMARY,

  // Status colors
  success: "#28A745",
  warning: "#FFC107",
  error: "#DC3545",
  info: "#17A2B8",

  // Icon colors
  iconPrimary: "#FFFFFF",
  iconSecondary: "#E0E0E0",
  iconMuted: "#888888",
  iconInverse: "#1A1A1A",

  // Special surfaces
  shadow: "rgba(0, 0, 0, 0.3)",
  overlay: "rgba(0, 0, 0, 0.8)",
  backdrop: "rgba(0, 0, 0, 0.9)",
};

// Theme types
export type Theme = "light" | "dark";
export type ThemeColors = typeof lightColors;

// Theme interface
export interface AppTheme {
  colors: ThemeColors;
  isDark: boolean;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    small: object;
    medium: object;
    large: object;
  };
  fonts: {
    regular: string;
    medium: string;
    bold: string;
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
  };
}

// Create theme objects
const createTheme = (colors: ThemeColors, isDark: boolean): AppTheme => ({
  colors,
  isDark,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: isDark
    ? {
        small: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          elevation: 3,
        },
        medium: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        large: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        },
      }
    : {
        small: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.18,
          shadowRadius: 1.0,
          elevation: 2,
        },
        medium: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,
          elevation: 4,
        },
        large: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
      },
  fonts: {
    regular: Platform.select({
      ios: "System",
      android: "Roboto",
      default: "System",
    }),
    medium: Platform.select({
      ios: "System",
      android: "Roboto-Medium",
      default: "System",
    }),
    bold: Platform.select({
      ios: "System",
      android: "Roboto-Bold",
      default: "System",
    }),
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
  },
});

// Create light and dark themes
export const lightTheme = createTheme(lightColors, false);
export const darkTheme = createTheme(darkColors, true);

// Export color palettes
export const Colors = {
  light: lightColors,
  dark: darkColors,
};

// Theme storage utilities
const THEME_STORAGE_KEY = "@recipebook:theme";

// Save theme preference
export const saveTheme = async (theme: Theme): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Failed to save theme preference:", error);
  }
};

// Load theme preference
export const loadTheme = async (): Promise<Theme> => {
  try {
    const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    return (savedTheme as Theme) || "light";
  } catch (error) {
    console.warn("Failed to load theme preference:", error);
    return "light";
  }
};

// Get theme based on system preference
export const getInitialTheme = async (): Promise<Theme> => {
  try {
    // Check if user has a saved preference
    const savedTheme = await loadTheme();
    if (savedTheme) {
      return savedTheme;
    }

    // If no saved preference, check system preference (if available)
    // Note: This would require additional setup for system theme detection
    return "light";
  } catch (error) {
    console.warn("Failed to determine initial theme:", error);
    return "light";
  }
};

// Animation timing constants
export const AnimationTimings = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Easing functions
export const Easing = {
  easeInOut: "ease-in-out",
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
};

// Font configurations
export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
