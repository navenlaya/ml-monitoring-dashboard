import React from 'react';
import { Box, Typography, CircularProgress, Fade } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  variant = 'spinner',
  fullScreen = false,
}) => {
  const { isDarkMode } = useTheme();

  const sizeMap = {
    small: 24,
    medium: 48,
    large: 80,
  };

  const spinnerSize = sizeMap[size];

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isDarkMode ? '#90caf9' : '#1976d2',
                  animation: `pulse 1.4s ease-in-out infinite both`,
                  animationDelay: `${index * 0.16}s`,
                }}
              />
            ))}
          </Box>
        );

      case 'pulse':
        return (
          <Box
            sx={{
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: '50%',
              background: `conic-gradient(from 0deg, transparent, ${isDarkMode ? '#90caf9' : '#1976d2'}, transparent)`,
              animation: 'spin 1s linear infinite',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 4,
                borderRadius: '50%',
                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
              },
            }}
          />
        );

      default:
        return (
          <CircularProgress
            size={spinnerSize}
            thickness={4}
            sx={{
              color: isDarkMode ? '#90caf9' : '#1976d2',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
        );
    }
  };

  const content = (
    <Fade in={true} timeout={500}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 3,
          textAlign: 'center',
        }}
      >
        {renderSpinner()}
        {message && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              maxWidth: 300,
              lineHeight: 1.5,
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Fade>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
        width: '100%',
      }}
    >
      {content}
    </Box>
  );
};

export default LoadingSpinner;
