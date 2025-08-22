import React, { useState, useEffect } from 'react';
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
  Fade,
  Slide,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  AdminPanelSettings,
  Menu as MenuIcon,
  Close as CloseIcon,
  Analytics as AnalyticsIcon,
  HomeWork as HomeWorkIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
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
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdminRoute = location.pathname === '/admin';
  const isHomeRoute = location.pathname === '/';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const navigationItems = [
    {
      path: '/',
      label: 'Predictions',
      icon: <HomeWorkIcon />,
      description: 'Get property valuations',
      active: isHomeRoute,
    },
    {
      path: '/admin',
      label: 'Admin',
      icon: <AnalyticsIcon />,
      description: 'Dashboard analytics',
      active: isAdminRoute,
    },
  ];

  const drawer = (
    <Box sx={{ width: 280, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar
          sx={{
            backgroundColor: muiTheme.palette.primary.main,
            color: muiTheme.palette.primary.contrastText,
            width: 48,
            height: 48,
          }}
        >
          <DashboardIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ML Dashboard
          </Typography>
          <Typography variant="caption" color="text.secondary">
            by Naven
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={item.active}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: muiTheme.palette.primary.main + '20',
                  '&:hover': {
                    backgroundColor: muiTheme.palette.primary.main + '30',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: item.active ? muiTheme.palette.primary.main : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                secondary={item.description}
                primaryTypographyProps={{
                  fontWeight: item.active ? 600 : 400,
                  color: item.active ? muiTheme.palette.primary.main : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © 2025 House Price Predictor and Monitoring Dashboard
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Built with React + TypeScript + Material-UI
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  width: 40,
                  height: 40,
                  mr: 1,
                }}
              >
                <DashboardIcon />
              </Avatar>
              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: '#fff',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                House Price Predictor and Monitoring Dashboard
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                by Naven
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <>
                {navigationItems.map((item) => (
                  <Tooltip key={item.path} title={item.description} arrow>
                    <Button
                      color="inherit"
                      startIcon={item.icon}
                      onClick={() => handleNavigation(item.path)}
                      variant={item.active ? 'outlined' : 'text'}
                      sx={{ 
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {item.label}
                    </Button>
                  </Tooltip>
                ))}
              </>
            )}

            <Tooltip title="Notifications" arrow>
              <IconButton 
                color="inherit"
                sx={{
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`} arrow>
              <IconButton 
                color="inherit" 
                onClick={toggleTheme}
                sx={{
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            backgroundColor: muiTheme.palette.background.paper,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

// Main App component
const AppContent: React.FC = () => {
  const muiTheme = useMuiTheme();
  const location = useLocation();

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
        <Slide direction="up" in={true} timeout={800}>
          <Box 
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: { xs: 2, sm: 3, md: 4 },
            }}
            className="fade-in-up"
          >
            <Routes>
              <Route path="/" element={<UserPrediction />} />
              <Route path="/admin" element={<ProtectedAdmin />} />
            </Routes>
          </Box>
        </Slide>
      </Container>

      {/* Enhanced Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 3, 
          mt: 'auto',
          backgroundColor: muiTheme.palette.background.paper,
          borderTop: `1px solid ${muiTheme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Footer decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}10, ${muiTheme.palette.secondary.main}10)`,
            filter: 'blur(30px)',
          }}
        />
        
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 2,
          }}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  background: muiTheme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #90caf9, #64b5f6)'
                    : 'linear-gradient(45deg, #1976d2, #1565c0)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                House Price Predictor and Monitoring Dashboard
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ fontSize: '0.875rem' }}
              >
                Advanced AI-powered property valuation and monitoring system
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-end' },
              gap: 1,
            }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label="React 19" 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip 
                  label="TypeScript" 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip 
                  label="Material-UI" 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                align="center"
                sx={{ fontSize: '0.75rem' }}
              >
                © 2025 House Price Predictor and Monitoring Dashboard. Built with modern web technologies.
              </Typography>
            </Box>
          </Box>
        </Container>
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