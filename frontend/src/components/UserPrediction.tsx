import React, { useState, useCallback, useRef } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Tooltip,
  Button,
  Grid,
  Box,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Collapse,
  IconButton,
  Fade,
  useTheme,
  Container,
  Divider,
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Bed as BedIcon,
  Public as PublicIcon,
  LocationOn as LocationOnIcon,
  RestartAlt as RestartAltIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  Psychology as PsychologyIcon,
  Update as UpdateIcon,
  Speed as SpeedIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';

import { sendPrediction } from '../api';
import { PredictionRequest, PredictionResponse, ApiError, LoadingState, FormErrors } from '../types';

interface FieldMeta {
  label: string;
  tip: string;
  icon: React.ReactNode;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

const UserPrediction: React.FC = () => {
  const theme = useTheme();
  const propertyFormRef = useRef<HTMLDivElement>(null);
  
  // Form state
  const [formData, setFormData] = useState<PredictionRequest>({
    MedInc: 0,
    HouseAge: 0,
    AveRooms: 0,
    AveBedrms: 0,
    Population: 0,
    AveOccup: 0,
    Latitude: 0,
    Longitude: 0,
  });

  // UI state
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Scroll to property form section
  const scrollToForm = useCallback(() => {
    propertyFormRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, []);

  // Field metadata with enhanced information
  const fieldMeta: Record<keyof PredictionRequest, FieldMeta> = {
    MedInc: { 
      label: 'Median Income', 
      tip: 'Median income in block group (in $10,000s)', 
      icon: <AttachMoneyIcon fontSize="small" />,
      min: 0,
      max: 20,
      step: 0.1,
    },
    HouseAge: { 
      label: 'House Age', 
      tip: 'Median house age in years', 
      icon: <HomeIcon fontSize="small" />,
      unit: 'years',
      min: 0,
      max: 100,
      step: 1,
    },
    AveRooms: { 
      label: 'Average Rooms', 
      tip: 'Average number of rooms per household', 
      icon: <HomeIcon fontSize="small" />,
      min: 0,
      max: 20,
      step: 0.1,
    },
    AveBedrms: { 
      label: 'Average Bedrooms', 
      tip: 'Average number of bedrooms per household', 
      icon: <BedIcon fontSize="small" />,
      min: 0,
      max: 10,
      step: 0.1,
    },
    Population: { 
      label: 'Population', 
      tip: 'Population of the block group', 
      icon: <PeopleIcon fontSize="small" />,
      min: 1,
      max: 50000,
      step: 1,
    },
    AveOccup: { 
      label: 'Average Occupancy', 
      tip: 'Average number of household members', 
      icon: <PeopleIcon fontSize="small" />,
      unit: 'people/household',
      min: 0,
      max: 20,
      step: 0.1,
    },
    Latitude: { 
      label: 'Latitude', 
      tip: 'Latitude coordinate (California: 32-42)', 
      icon: <PublicIcon fontSize="small" />,
      min: 32,
      max: 42,
      step: 0.0001,
    },
    Longitude: { 
      label: 'Longitude', 
      tip: 'Longitude coordinate (California: -125 to -114)', 
      icon: <LocationOnIcon fontSize="small" />,
      min: -125,
      max: -114,
      step: 0.0001,
    },
  };

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      const field = key as keyof PredictionRequest;
      const meta = fieldMeta[field];
      
      if (value === 0 && field !== 'MedInc') {
        errors[field] = 'This field is required';
      } else if (meta.min !== undefined && value < meta.min) {
        errors[field] = `Value must be at least ${meta.min}`;
      } else if (meta.max !== undefined && value > meta.max) {
        errors[field] = `Value must be at most ${meta.max}`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, fieldMeta]);

  // Handle form input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue,
    }));
    
    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [formErrors]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoadingState('loading');
    setError(null);

    try {
      const result = await sendPrediction(formData);
      setPrediction(result);
      setLoadingState('success');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setPrediction(null);
      setLoadingState('error');
    }
  }, [formData, validateForm]);

  // Reset form
  const handleReset = useCallback(() => {
    setFormData({
      MedInc: 0,
      HouseAge: 0,
      AveRooms: 0,
      AveBedrms: 0,
      Population: 0,
      AveOccup: 0,
      Latitude: 0,
      Longitude: 0,
    });
    setPrediction(null);
    setError(null);
    setFormErrors({});
    setLoadingState('idle');
  }, []);

  // Close error alert
  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      {/* Hero/Landing Section */}
      <Box sx={{ 
        py: { xs: 6, md: 10 }, 
        px: { xs: 3, md: 6 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <Box sx={{ textAlign: 'center', maxWidth: 900, width: '100%' }}>
          <Typography 
            variant="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              color: theme.palette.text.primary,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              mb: 3,
            }}
          >
            Predict Your Home's Market Value
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              mb: 5,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Get an instant, AI-powered property valuation using advanced market analysis 
            and real-time data. Our sophisticated algorithms provide accurate estimates 
            in seconds, not days.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={scrollToForm}
            endIcon={<ArrowDownIcon />}
            sx={{
              py: 2,
              px: 6,
              fontSize: '1.2rem',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              background: theme.palette.primary.main,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Get Price Estimate
          </Button>
        </Box>
      </Box>

      {/* Property Information Section */}
      <Box 
        ref={propertyFormRef}
        sx={{ 
          py: { xs: 4, md: 6 },
          px: { xs: 3, md: 6 },
          minHeight: '100vh',
        }}
      >
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            Property Information
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ fontSize: '1.1rem' }}
          >
            Enter your property details below to receive an accurate market valuation estimate.
          </Typography>
        </Box>

        <Grid container spacing={8} sx={{ maxWidth: 'none', width: '100%' }}>
            {/* Property Details Form */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  p: { xs: 4, md: 6 }, 
                  height: 'fit-content',
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 3,
                  boxShadow: theme.shadows[2],
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <HomeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Property Details
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Provide accurate information for the best estimate
                </Typography>

                {/* Error Alert */}
                <Collapse in={!!error}>
                  <Alert 
                    severity="error" 
                    sx={{ mb: 3, borderRadius: 2 }}
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={handleCloseError}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  >
                    {error?.message}
                  </Alert>
                </Collapse>

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {Object.entries(fieldMeta).map(([key, meta]) => {
                      const fieldKey = key as keyof PredictionRequest;
                      return (
                        <Grid item xs={12} key={key}>
                          <Tooltip title={meta.tip} arrow placement="top">
                            <TextField
                              label={meta.label}
                              name={key}
                              value={formData[fieldKey] || ''}
                              onChange={handleChange}
                              type="number"
                              fullWidth
                              required
                              variant="outlined"
                              size="medium"
                              error={!!formErrors[fieldKey]}
                              helperText={formErrors[fieldKey]}
                              inputProps={{
                                min: meta.min,
                                max: meta.max,
                                step: meta.step,
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    {meta.icon}
                                  </InputAdornment>
                                ),
                                endAdornment: meta.unit && (
                                  <InputAdornment position="end">
                                    <Typography variant="caption" color="text.secondary">
                                      {meta.unit}
                                    </Typography>
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover fieldset': {
                                    borderColor: theme.palette.primary.main,
                                  },
                                },
                              }}
                            />
                          </Tooltip>
                        </Grid>
                      );
                    })}

                    {/* Action Buttons */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          size="large"
                          disabled={loadingState === 'loading'}
                          startIcon={loadingState === 'loading' ? <CircularProgress size={20} /> : <TrendingUpIcon />}
                          sx={{ 
                            py: 2,
                            borderRadius: 2,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                          }}
                        >
                          {loadingState === 'loading' ? 'Analyzing...' : 'Get Price Estimate'}
                        </Button>
                        
                        <Button 
                          onClick={handleReset} 
                          variant="outlined" 
                          size="large"
                          startIcon={<RestartAltIcon />}
                          sx={{ 
                            py: 1.5,
                            borderRadius: 2,
                          }}
                        >
                          Reset
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Prediction Result */}
                <Fade in={!!prediction} timeout={500}>
                  <Box sx={{ mt: 4 }}>
                    {prediction && (
                      <Card 
                        elevation={4} 
                        sx={{ 
                          borderRadius: 3,
                          border: `2px solid ${theme.palette.success.main}`,
                          background: theme.palette.mode === 'dark' 
                            ? 'rgba(76, 175, 80, 0.1)' 
                            : 'rgba(76, 175, 80, 0.05)',
                        }}
                      >
                        <CardHeader 
                          title="🎉 Your Property Valuation" 
                          sx={{ 
                            textAlign: 'center', 
                            '& .MuiCardHeader-title': {
                              fontWeight: 600,
                              fontSize: '1.25rem',
                              color: theme.palette.success.dark,
                            },
                          }} 
                        />
                        <CardContent sx={{ textAlign: 'center', pb: 3 }}>
                          <Typography 
                            variant="h3" 
                            gutterBottom 
                            sx={{ 
                              fontWeight: 800, 
                              color: theme.palette.success.main,
                              fontSize: '3rem',
                            }}
                          >
                            ${prediction.predicted_price?.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            color="text.secondary"
                            sx={{ fontWeight: 500, mb: 1 }}
                          >
                            Estimated Market Value
                          </Typography>
                          {prediction.confidence && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'text.secondary',
                                fontSize: '1rem',
                              }}
                            >
                              Confidence: {(prediction.confidence * 100).toFixed(1)}%
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                </Fade>
              </Box>
            </Grid>


          </Grid>
        </Box>
      </Box>
  );
};

export default UserPrediction; 