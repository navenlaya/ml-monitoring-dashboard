import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Fade,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

import AdminDashboard from './AdminDashboard';
import { LoadingState } from '../types';

interface LoginForm {
  password: string;
}

const ProtectedAdmin: React.FC = () => {
  const theme = useTheme();
  
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [formData, setFormData] = useState<LoginForm>({ password: '' });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  }, [error]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }

    setLoadingState('loading');
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple password check (in production, this should be handled by backend)
    if (formData.password === 'admin123') {
      setAuthenticated(true);
      setLoadingState('success');
    } else {
      setError('Invalid password. Try "admin123" for demo purposes.');
      setLoadingState('error');
    }
  }, [formData.password]);

  const handleLogout = useCallback(() => {
    setAuthenticated(false);
    setFormData({ password: '' });
    setShowPassword(false);
    setError('');
    setLoadingState('idle');
  }, []);

  if (authenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        px: { xs: 3, md: 6 },
        py: { xs: 6, md: 10 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in timeout={500}>
        <Box
          sx={{
            p: { xs: 4, sm: 6 },
            maxWidth: 500,
            width: '100%',
          }}
        >
          <Card elevation={0} sx={{ backgroundColor: 'transparent' }}>
            <CardHeader
              avatar={
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '50%',
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                      : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AdminIcon 
                    sx={{ 
                      fontSize: 32,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#1976d2',
                    }} 
                  />
                </Box>
              }
              title={
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(45deg, #90caf9, #64b5f6)'
                      : 'linear-gradient(45deg, #1976d2, #1565c0)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Admin Access
                </Typography>
              }
              subheader={
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Enter your credentials to access the admin dashboard
                </Typography>
              }
              sx={{ textAlign: 'center', pb: 2 }}
            />

            <CardContent sx={{ pt: 0 }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3, borderRadius: 2 }}
                  icon={<SecurityIcon />}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleLogin}>
                <TextField
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Admin Password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  size="medium"
                  autoComplete="current-password"
                  disabled={loadingState === 'loading'}
                  error={!!error}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                          disabled={loadingState === 'loading'}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="medium"
                  disabled={loadingState === 'loading' || !formData.password.trim()}
                  startIcon={
                    loadingState === 'loading' ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <AdminIcon />
                    )
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0, #0d47a1)',
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                    },
                  }}
                >
                  {loadingState === 'loading' ? 'Authenticating...' : 'Access Dashboard'}
                </Button>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Demo password: <code style={{ 
                    background: theme.palette.action.hover,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                  }}>admin123</code>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </Box>
  );
};

export default ProtectedAdmin; 