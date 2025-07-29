import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  CssBaseline,
  IconButton,
  Tooltip,
  Button,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  AdminPanelSettings,
} from '@mui/icons-material';

import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import UserPrediction from './components/UserPrediction';
import ProtectedAdmin from './components/ProtectedAdmin';
import './App.css';

// Navigation component
const Navigation: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const isAdminRoute = location.pathname === '/admin';

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        borderBottom: `1px solid ${muiTheme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon sx={{ mr: 1 }} />
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            component="div" 
            sx={{ 
              fontWeight: 700,
              color: '#fff',
            }}
          >
            ML Monitoring Dashboard
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isMobile && (
            <>
              <Button
                color="inherit"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                variant={!isAdminRoute ? 'outlined' : 'text'}
                sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Predictions
              </Button>
              <Button
                color="inherit"
                startIcon={<AdminPanelSettings />}
                onClick={() => navigate('/admin')}
                variant={isAdminRoute ? 'outlined' : 'text'}
                sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Admin
              </Button>
            </>
          )}

          <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
            <IconButton 
              color="inherit" 
              onClick={toggleTheme}
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// Main App component
const AppContent: React.FC = () => {
  const muiTheme = useMuiTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      <CssBaseline />
      <Navigation />
      
      <Container 
        component="main" 
        maxWidth={false}
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 1, sm: 2, md: 3 },
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <Box 
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 2, sm: 3, md: 4 },
          }}
          className="fade-in"
        >
          <Routes>
            <Route path="/" element={<UserPrediction />} />
            <Route path="/admin" element={<ProtectedAdmin />} />
          </Routes>
        </Box>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 2, 
          px: 3, 
          mt: 'auto',
          backgroundColor: muiTheme.palette.background.paper,
          borderTop: `1px solid ${muiTheme.palette.divider}`,
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
          sx={{ fontSize: '0.875rem' }}
        >
          © 2024 ML Monitoring Dashboard. Built with React + TypeScript + Material-UI
        </Typography>
      </Box>
    </Box>
  );
};

// Root App component with ThemeProvider
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App; 