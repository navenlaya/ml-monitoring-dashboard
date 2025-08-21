import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
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
  Paper,
  Chip,
  Divider,
  LinearProgress,
  Tabs,
  Tab,
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
  KeyboardArrowDown as ArrowDownIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

import { sendPrediction } from '../api';
import { PredictionRequest, PredictionResponse, ApiError, LoadingState, FormErrors } from '../types';
import AddressPredictionForm from './AddressPredictionForm';

interface FieldMeta {
  label: string;
  tip: string;
  icon: React.ReactNode;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
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
  const [completedFields, setCompletedFields] = useState<Set<keyof PredictionRequest>>(new Set());
  const [showProgress, setShowProgress] = useState(false);
  const [activeTab, setActiveTab] = useState(1); // Start with Manual Coordinates tab

  // Scroll to property form section
  const scrollToForm = useCallback(() => {
    propertyFormRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, []);

  // Handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPrediction(null);
    setError(null);
  };

  // Track completed fields
  useEffect(() => {
    const completed = new Set<keyof PredictionRequest>();
    Object.entries(formData).forEach(([key, value]) => {
      if (value > 0 || (key === 'MedInc' && value >= 0)) {
        completed.add(key as keyof PredictionRequest);
      }
    });
    setCompletedFields(completed);
    setShowProgress(completed.size > 0);
  }, [formData]);

  // Field metadata with enhanced information
  const fieldMeta: Record<keyof PredictionRequest, FieldMeta> = {
    MedInc: { 
      label: 'Median Income', 
      tip: 'Median income in block group (in $10,000s)', 
      icon: <AttachMoneyIcon fontSize="small" />,
      min: 0,
      max: 20,
      step: 0.1,
      placeholder: '8.5 (for $85,000)',
    },
    HouseAge: { 
      label: 'House Age', 
      tip: 'Median house age in years', 
      icon: <HomeIcon fontSize="small" />,
      unit: 'years',
      min: 0,
      max: 100,
      step: 1,
      placeholder: '25',
    },
    AveRooms: { 
      label: 'Average Rooms', 
      tip: 'Average number of rooms per household', 
      icon: <HomeIcon fontSize="small" />,
      min: 0,
      max: 20,
      step: 0.1,
      placeholder: '5.2',
    },
    AveBedrms: { 
      label: 'Average Bedrooms', 
      tip: 'Average number of bedrooms per household', 
      icon: <BedIcon fontSize="small" />,
      min: 0,
      max: 10,
      step: 0.1,
      placeholder: '3.1',
    },
    Population: { 
      label: 'Population', 
      tip: 'Population of the block group', 
      icon: <PeopleIcon fontSize="small" />,
      min: 1,
      max: 50000,
      step: 1,
      placeholder: '1500',
    },
    AveOccup: { 
      label: 'Average Occupancy', 
      tip: 'Average number of household members', 
      icon: <PeopleIcon fontSize="small" />,
      unit: 'people/household',
      min: 0,
      max: 20,
      step: 0.1,
      placeholder: '2.8',
    },
    Latitude: { 
      label: 'Latitude', 
      tip: 'Latitude coordinate (California: 32-42)', 
      icon: <PublicIcon fontSize="small" />,
      min: 32,
      max: 42,
      step: 0.0001,
      placeholder: '37.7749',
    },
    Longitude: { 
      label: 'Longitude', 
      tip: 'Longitude coordinate (California: -125 to -114)', 
      icon: <LocationOnIcon fontSize="small" />,
      min: -125,
      max: -114,
      step: 0.0001,
      placeholder: '-122.4194',
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
      
      // Scroll to result
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 500);
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
    setCompletedFields(new Set());
    setShowProgress(false);
  }, []);

  // Close error alert
  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  const progressPercentage = (completedFields.size / Object.keys(fieldMeta).length) * 100;

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
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '5%',
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${theme.palette.success.main}20, ${theme.palette.info.main}20)`,
            filter: 'blur(30px)',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />

        <Box sx={{ textAlign: 'center', maxWidth: 900, width: '100%', position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            gutterBottom 
            className="fade-in-up"
            sx={{ 
              fontWeight: 800,
              color: theme.palette.text.primary,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #90caf9, #64b5f6)'
                : 'linear-gradient(45deg, #1976d2, #1565c0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Predict Your Home's Market Value
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            className="slide-in-left"
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
            className="btn-glow slide-in-right"
            sx={{
              py: 2,
              px: 6,
              fontSize: '1.2rem',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
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
            className="fade-in-up"
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
            sx={{ fontSize: '1.1rem', mb: 3 }}
          >
            Enter your property details below to receive an accurate market valuation estimate.
          </Typography>

          {/* Progress indicator */}
          {showProgress && (
            <Fade in={showProgress} timeout={500}>
              <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Form Completion
                  </Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={600}>
                    {Math.round(progressPercentage)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {completedFields.size} of {Object.keys(fieldMeta).length} fields completed
                </Typography>
              </Box>
            </Fade>
          )}

          {/* Tabs for different input methods */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4, mt: 4 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="prediction input methods"
              centered
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontSize: '1rem',
                  fontWeight: 500,
                }
              }}
            >
              <Tab 
                label="Address Input" 
                icon={<LocationOnIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Manual Coordinates" 
                icon={<TrendingUpIcon />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 ? (
          // Address-based form
          <AddressPredictionForm 
            onPredictionComplete={(result) => {
              // Convert to PredictionResponse format for consistency
              setPrediction({
                predicted_price: result.predicted_price,
                confidence: result.confidence,
                model_version: result.model_version,
                response_time_ms: result.response_time_ms
              });
              setError(null);
            }}
          />
        ) : (
          // Manual coordinates form
          <Grid container spacing={8} sx={{ maxWidth: 'none', width: '100%' }}>
            {/* Property Details Form */}
            <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 4, md: 6 }, 
                height: 'fit-content',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.05)' : 'rgba(25, 118, 210, 0.02)'} 100%)`,
                borderRadius: 6,
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
              className="card-hover"
            >
              {/* Enhanced decorative elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
                  filter: 'blur(25px)',
                  animation: 'pulse 4s ease-in-out infinite',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  left: -20,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main}10, ${theme.palette.primary.main}10)`,
                  filter: 'blur(20px)',
                  animation: 'pulse 4s ease-in-out infinite 2s',
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: theme.palette.primary.contrastText,
                    mr: 3,
                    boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                  }}
                >
                  <HomeIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Property Details
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                    Provide accurate information for the best estimate
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {Object.entries(fieldMeta).map(([key, meta], index) => {
                    const fieldKey = key as keyof PredictionRequest;
                    const isCompleted = completedFields.has(fieldKey);
                    
                    return (
                      <Box key={key}>
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
                            placeholder={meta.placeholder}
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
                              endAdornment: (
                                <InputAdornment position="end">
                                  {isCompleted && (
                                    <CheckCircleIcon 
                                      color="success" 
                                      fontSize="small" 
                                      sx={{ mr: 1 }}
                                    />
                                  )}
                                  {meta.unit && (
                                    <Typography variant="caption" color="text.secondary">
                                      {meta.unit}
                                    </Typography>
                                  )}
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                transition: 'all 0.3s ease',
                                background: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.03)' 
                                  : 'rgba(0, 0, 0, 0.02)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                  background: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.06)' 
                                    : 'rgba(0, 0, 0, 0.04)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 4px 20px ${theme.palette.primary.main}20`,
                                },
                                '&:hover fieldset': {
                                  borderColor: theme.palette.primary.main,
                                  borderWidth: 2,
                                },
                                '&.Mui-focused': {
                                  background: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.08)' 
                                    : 'rgba(0, 0, 0, 0.06)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: `0 2px 15px ${theme.palette.primary.main}30`,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.primary.main,
                                  borderWidth: 2,
                                },
                              },
                              '& .MuiInputLabel-root': {
                                fontWeight: 500,
                                color: theme.palette.text.secondary,
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                              },
                              animationDelay: `${index * 100}ms`,
                            }}
                            className="fade-in-up"
                          />
                        </Tooltip>
                      </Box>
                    );
                  })}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        size="large"
                        disabled={loadingState === 'loading'}
                        startIcon={loadingState === 'loading' ? <CircularProgress size={20} /> : <TrendingUpIcon />}
                        className="btn-glow"
                        sx={{ 
                          py: 2.5,
                          px: 4,
                          borderRadius: 3,
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
                          },
                          transition: 'all 0.3s ease',
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
                          borderColor: theme.palette.divider,
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: theme.palette.primary.main + '10',
                          },
                        }}
                      >
                        Reset Form
                      </Button>
                  </Box>
                </Box>
              </Box>

              {/* Prediction Result */}
              <Fade in={!!prediction} timeout={500}>
                <Box sx={{ mt: 4 }}>
                  {prediction && (
                    <Card 
                      elevation={0}
                      sx={{ 
                        borderRadius: 3,
                        border: `2px solid ${theme.palette.success.main}`,
                        background: theme.palette.mode === 'dark' 
                          ? 'rgba(76, 175, 80, 0.1)' 
                          : 'rgba(76, 175, 80, 0.05)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      className="card-hover"
                    >
                      {/* Success decoration */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -50,
                          right: -50,
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: `linear-gradient(45deg, ${theme.palette.success.main}20, ${theme.palette.success.light}20)`,
                          filter: 'blur(30px)',
                        }}
                      />

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
                            fontSize: { xs: '2rem', md: '3rem' },
                            mb: 2,
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
                          sx={{ fontWeight: 500, mb: 2 }}
                        >
                          Estimated Market Value
                        </Typography>
                        {prediction.confidence && (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <SpeedIcon color="success" fontSize="small" />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'text.secondary',
                                fontSize: '1rem',
                              }}
                            >
                              Confidence: {(prediction.confidence * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </Box>
              </Fade>
            </Paper>
          </Grid>
        </Grid>
        )}
      </Box>
    </Box>
  );
};

export default UserPrediction; 