import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  IconButton,
  Button,
  useTheme,
  Fade,
  CircularProgress,
  Divider,
  Tooltip,
  LinearProgress,
  Avatar,
  Badge,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Error as ErrorIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  ShowChart as ShowChartIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import Papa from 'papaparse';

import { getDashboardStats, getPredictionsTimeline, getActiveAlerts } from '../api';
import { PredictionLog, LoadingState, DashboardStats } from '../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface AdminDashboardProps {
  onLogout: () => void;
}

interface ChartData {
  timestamp: string;
  prediction: number;
  confidence: number;
  error: number;
  formattedTime: string;
}

interface AlertData {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  severity: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = React.memo(({ onLogout }) => {
  const theme = useTheme();
  
  const [data, setData] = useState<PredictionLog[]>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
  });

  // Fetch data from new database API with scroll preservation
  const fetchData = useCallback(async () => {
    // Preserve scroll position during updates
    const scrollY = window.scrollY;
    
    // Only show loading on first load, not on updates
    if (data.length === 0) {
      setLoadingState('loading');
    }
    setError('');

    try {
      // Fetch data from the new database API endpoints
      const [timelineData, dashboardStats, alertsData] = await Promise.all([
        getPredictionsTimeline(24, 50),
        getDashboardStats(24),
        getActiveAlerts(10)
      ]);
      
      // Convert timeline data to the format expected by the dashboard
      const validData = timelineData.map((item: any) => ({
        timestamp: item.timestamp,
        prediction: item.predicted_price?.toString() || '',
        confidence: item.confidence?.toString() || '',
        error: item.error?.toString() || '',
        actual_price: item.actual_price?.toString() || ''
      })) as PredictionLog[];
      
      setData(validData);
      setLastUpdate(new Date());
      setLoadingState('success');
      
      // Store additional stats for use in other parts of the component
      (window as any).dashboardStats = dashboardStats;
      (window as any).activeAlerts = alertsData;
      
      // Simulate performance metrics (replace with real API data)
      setPerformanceMetrics({
        responseTime: Math.random() * 100 + 50,
        throughput: Math.random() * 1000 + 500,
        errorRate: Math.random() * 5,
      });
      
      // Process alerts
      if (alertsData && Array.isArray(alertsData)) {
        const processedAlerts = alertsData.map((alert: any, index: number) => ({
          id: `alert-${index}`,
          type: alert.severity > 7 ? 'error' : alert.severity > 4 ? 'warning' : 'info',
          message: alert.message || `Alert ${index + 1}`,
          timestamp: alert.timestamp || new Date().toISOString(),
          severity: alert.severity || Math.random() * 10,
        }));
        setAlerts(processedAlerts);
      }
      
      // Restore scroll position after update
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
      
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to fetch prediction data');
      setLoadingState('error');
    }
  }, [data.length]);

  // Initial fetch and set up interval with smooth updates
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Slower updates (10s) for smoother experience
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  }, []);

  // Process data for charts
  const chartData: ChartData[] = useMemo(() => {
    return data.map((row) => ({
      timestamp: row.timestamp,
      prediction: parseFloat(row.prediction) || 0,
      confidence: parseFloat(row.confidence) || 0,
      error: parseFloat(row.error) || 0,
      formattedTime: new Date(row.timestamp).toLocaleTimeString(),
    }));
  }, [data]);

  // Calculate dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    // Use backend-provided stats if available, otherwise calculate from frontend data
    const backendStats = (window as any).dashboardStats;
    
    if (backendStats) {
      // Use backend statistics for accurate data
      const uptimeHours = backendStats.uptime_hours || 0;
      const uptimeSeconds = Math.floor(uptimeHours * 3600);
      const uptimeFormatted = uptimeHours >= 1 
        ? `${Math.floor(uptimeHours)}h ${Math.floor((uptimeHours % 1) * 60)}m`
        : uptimeSeconds > 0 
          ? `${uptimeSeconds}s`
          : 'Just started';
      
      return {
        totalPredictions: backendStats.total_predictions || 0,
        averageConfidence: backendStats.average_confidence || 0,
        averageError: backendStats.average_error || 0,
        uptime: uptimeFormatted,
      };
    }

    // Fallback to frontend calculation if backend stats not available
    if (data.length === 0) {
      return {
        totalPredictions: 0,
        averageConfidence: 0,
        averageError: 0,
        uptime: '0s',
      };
    }

    const predictions = chartData.map(d => d.prediction).filter(p => p > 0);
    const confidences = chartData.map(d => d.confidence).filter(c => c > 0);
    const errors = chartData.map(d => d.error).filter(e => e >= 0);

    return {
      totalPredictions: predictions.length,
      averageConfidence: confidences.length > 0 
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : 0,
      averageError: errors.length > 0 
        ? errors.reduce((a, b) => a + b, 0) / errors.length
        : 0,
      uptime: '0s', // Fallback
    };
  }, [data, chartData]);

  // Generate chart data for Chart.js with smooth transitions
  const getChartData = useCallback((dataKey: keyof Omit<ChartData, 'timestamp' | 'formattedTime'>, label: string, color: string) => ({
    labels: chartData.map(row => row.formattedTime),
    datasets: [{
      label,
      data: chartData.map(row => row[dataKey]),
      borderColor: color,
      backgroundColor: color + '20',
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointHoverBorderWidth: 3,
    }],
  }), [chartData]);

  // Performance metrics chart data
  const performanceChartData = useMemo(() => ({
    labels: ['Response Time', 'Throughput', 'Error Rate'],
    datasets: [{
      label: 'Current Performance',
      data: [
        performanceMetrics.responseTime,
        performanceMetrics.throughput / 100,
        performanceMetrics.errorRate * 20,
      ],
      backgroundColor: [
        theme.palette.primary.main,
        theme.palette.success.main,
        theme.palette.error.main,
      ],
      borderColor: [
        theme.palette.primary.dark,
        theme.palette.success.dark,
        theme.palette.error.dark,
      ],
      borderWidth: 2,
      borderRadius: 8,
    }],
  }), [performanceMetrics, theme.palette]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
          lineWidth: 0.5,
        },
        ticks: {
          callback: function(value: any) {
            if (typeof value === 'number') {
              return value.toLocaleString();
            }
            return value;
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 8,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        beginAtZero: true,
      },
    },
  };

  if (loadingState === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1400,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
      className="fade-in-up"
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
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
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <AnalyticsIcon sx={{ fontSize: 'inherit' }} />
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
            <Chip
              size="small"
              label="Live"
              color="success"
              sx={{ ml: 2 }}
              icon={<div className="status-indicator status-online" />}
            />
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={fetchData}
              disabled={loadingState !== 'idle' && loadingState !== 'success'}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  transform: 'rotate(180deg)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            sx={{ borderRadius: 2 }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError('')}
            >
              <ErrorIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-hover" sx={{ borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.primary.light}20)`,
                filter: 'blur(20px)',
              }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    width: 56,
                    height: 56,
                  }}
                >
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalPredictions.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Predictions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-hover" sx={{ borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${theme.palette.success.main}20, ${theme.palette.success.light}20)`,
                filter: 'blur(20px)',
              }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: theme.palette.success.main,
                    color: theme.palette.success.contrastText,
                    width: 56,
                    height: 56,
                  }}
                >
                  <SpeedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {(stats.averageConfidence * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Confidence
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-hover" sx={{ borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${theme.palette.error.main}20, ${theme.palette.error.light}20)`,
                filter: 'blur(20px)',
              }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    width: 56,
                    height: 56,
                  }}
                >
                  <ErrorIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.averageError.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Error
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="card-hover" sx={{ borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${theme.palette.info.main}20, ${theme.palette.info.light}20)`,
                filter: 'blur(20px)',
              }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: theme.palette.info.main,
                    color: theme.palette.info.contrastText,
                    width: 56,
                    height: 56,
                  }}
                >
                  <TimelineIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.uptime}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uptime
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card className="card-hover" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Performance Metrics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Response Time</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {performanceMetrics.responseTime.toFixed(1)}ms
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((performanceMetrics.responseTime / 200) * 100, 100)} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Throughput</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {performanceMetrics.throughput.toFixed(0)} req/min
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((performanceMetrics.throughput / 2000) * 100, 100)} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="success"
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Error Rate</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {performanceMetrics.errorRate.toFixed(2)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((performanceMetrics.errorRate / 10) * 100, 100)} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="error"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="card-hover" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Performance Overview
              </Typography>
              <Box sx={{ height: 200 }}>
                <Bar data={performanceChartData} options={barChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Active Alerts
          </Typography>
          <Grid container spacing={2}>
            {alerts.slice(0, 6).map((alert) => (
              <Grid item xs={12} sm={6} md={4} key={alert.id}>
                <Card 
                  className="card-hover" 
                  sx={{ 
                    borderRadius: 2,
                    border: `1px solid ${
                      alert.type === 'error' ? theme.palette.error.main :
                      alert.type === 'warning' ? theme.palette.warning.main :
                      theme.palette.info.main
                    }`,
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {alert.type === 'error' && <ErrorIcon color="error" fontSize="small" />}
                      {alert.type === 'warning' && <WarningIcon color="warning" fontSize="small" />}
                      {alert.type === 'info' && <InfoIcon color="info" fontSize="small" />}
                      <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        {alert.type}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${alert.severity.toFixed(1)}`}
                        color={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(alert.timestamp).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Chart Tabs */}
      {chartData.length > 0 ? (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              },
            }}
          >
            <Tab label="Predictions Over Time" icon={<ShowChartIcon />} />
            <Tab label="Model Confidence" icon={<AssessmentIcon />} />
            <Tab label="Prediction Errors" icon={<TrendingDownIcon />} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <Fade in key={selectedTab} timeout={300}>
              <Box sx={{ height: 400 }}>
                {selectedTab === 0 && (
                  <Line 
                    data={getChartData('prediction', 'Prediction ($)', theme.palette.primary.main)} 
                    options={chartOptions} 
                  />
                )}

                {selectedTab === 1 && (
                  <Line 
                    data={getChartData('confidence', 'Confidence', theme.palette.success.main)} 
                    options={chartOptions} 
                  />
                )}

                {selectedTab === 2 && (
                  <Line 
                    data={getChartData('error', 'Error', theme.palette.error.main)} 
                    options={chartOptions} 
                  />
                )}
              </Box>
            </Fade>
          </Box>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            border: `2px dashed ${theme.palette.divider}`,
          }}
        >
          <AnalyticsIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start making predictions to see dashboard analytics
          </Typography>
          <Button variant="outlined" onClick={fetchData} startIcon={<RefreshIcon />}>
            Refresh Data
          </Button>
        </Paper>
      )}
    </Box>
  );
});

AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard; 