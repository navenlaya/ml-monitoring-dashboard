import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  currentTheme: 'light' | 'dark' | 'auto';
  themeName: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto';
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const isDarkMode = useMemo(() => {
    if (currentTheme === 'auto') {
      return systemTheme === 'dark';
    }
    return currentTheme === 'dark';
  }, [currentTheme, systemTheme]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setTheme = (theme: 'light' | 'dark' | 'auto') => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };

  const themeName = useMemo(() => {
    if (currentTheme === 'auto') {
      return `Auto (${systemTheme})`;
    }
    return currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
  }, [currentTheme, systemTheme]);

  // Create enhanced Material-UI theme
  const theme = useMemo(() => {
    const baseTheme = createTheme({
      palette: {
        mode: isDarkMode ? 'dark' : 'light',
        primary: {
          main: isDarkMode ? '#90caf9' : '#1976d2',
          light: isDarkMode ? '#e3f2fd' : '#42a5f5',
          dark: isDarkMode ? '#42a5f5' : '#1565c0',
          contrastText: isDarkMode ? '#000' : '#fff',
        },
        secondary: {
          main: isDarkMode ? '#f48fb1' : '#9c27b0',
          light: isDarkMode ? '#fce4ec' : '#ba68c8',
          dark: isDarkMode ? '#c2185b' : '#7b1fa2',
          contrastText: isDarkMode ? '#000' : '#fff',
        },
        success: {
          main: isDarkMode ? '#81c784' : '#2e7d32',
          light: isDarkMode ? '#e8f5e8' : '#4caf50',
          dark: isDarkMode ? '#388e3c' : '#1b5e20',
        },
        error: {
          main: isDarkMode ? '#e57373' : '#d32f2f',
          light: isDarkMode ? '#ffebee' : '#ef5350',
          dark: isDarkMode ? '#c62828' : '#c62828',
        },
        warning: {
          main: isDarkMode ? '#ffb74d' : '#ed6c02',
          light: isDarkMode ? '#fff3e0' : '#ff9800',
          dark: isDarkMode ? '#f57c00' : '#e65100',
        },
        info: {
          main: isDarkMode ? '#64b5f6' : '#0288d1',
          light: isDarkMode ? '#e3f2fd' : '#29b6f6',
          dark: isDarkMode ? '#1976d2' : '#01579b',
        },
        background: {
          default: isDarkMode ? '#0a0a0a' : '#fafafa',
          paper: isDarkMode ? '#1a1a1a' : '#ffffff',
        },
        text: {
          primary: isDarkMode ? '#ffffff' : '#1a1a1a',
          secondary: isDarkMode ? '#b0b0b0' : '#666666',
        },
        divider: isDarkMode ? '#333333' : '#e0e0e0',
        action: {
          hover: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          selected: isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
          disabled: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
        },
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 800,
          letterSpacing: '-0.02em',
        },
        h2: {
          fontWeight: 700,
          letterSpacing: '-0.01em',
        },
        h3: {
          fontWeight: 700,
          letterSpacing: '-0.01em',
        },
        h4: {
          fontWeight: 600,
        },
        h5: {
          fontWeight: 600,
        },
        h6: {
          fontWeight: 600,
        },
        button: {
          fontWeight: 600,
          textTransform: 'none',
        },
        body1: {
          lineHeight: 1.6,
        },
        body2: {
          lineHeight: 1.6,
        },
      },
      shape: {
        borderRadius: 12,
      },
      shadows: [
        'none',
        isDarkMode 
          ? '0px 2px 8px rgba(0, 0, 0, 0.4)'
          : '0px 2px 8px rgba(0, 0, 0, 0.1)',
        isDarkMode 
          ? '0px 4px 16px rgba(0, 0, 0, 0.5)'
          : '0px 4px 16px rgba(0, 0, 0, 0.15)',
        isDarkMode 
          ? '0px 8px 24px rgba(0, 0, 0, 0.6)'
          : '0px 8px 24px rgba(0, 0, 0, 0.2)',
        isDarkMode 
          ? '0px 16px 32px rgba(0, 0, 0, 0.7)'
          : '0px 16px 32px rgba(0, 0, 0, 0.25)',
        isDarkMode 
          ? '0px 24px 48px rgba(0, 0, 0, 0.8)'
          : '0px 24px 48px rgba(0, 0, 0, 0.3)',
        ...Array(19).fill('none'),
      ],
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: '8px 24px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: isDarkMode 
                  ? '0 8px 25px rgba(144, 202, 249, 0.3)'
                  : '0 8px 25px rgba(25, 118, 210, 0.3)',
              },
            },
            contained: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: isDarkMode 
                  ? '0 8px 25px rgba(144, 202, 249, 0.3)'
                  : '0 8px 25px rgba(25, 118, 210, 0.3)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: isDarkMode 
                  ? '0 12px 40px rgba(0, 0, 0, 0.8)'
                  : '0 12px 40px rgba(0, 0, 0, 0.15)',
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
                '&:hover fieldset': {
                  borderColor: isDarkMode ? '#90caf9' : '#1976d2',
                  borderWidth: 2,
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDarkMode ? '#90caf9' : '#1976d2',
                  borderWidth: 2,
                },
              },
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
              },
            },
          },
        },
        MuiLinearProgress: {
          styleOverrides: {
            root: {
              borderRadius: 4,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            indicator: {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
            },
          },
        },
      },
    });

    return baseTheme;
  }, [isDarkMode]);

  const contextValue: ThemeContextType = {
    isDarkMode,
    toggleTheme,
    setTheme,
    currentTheme,
    themeName,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 