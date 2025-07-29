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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Error as ErrorIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Papa from 'papaparse';

import { getPredictions } from '../api';
import { PredictionLog, LoadingState, DashboardStats } from '../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const theme = useTheme();
  
  const [data, setData] = useState<PredictionLog[]>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch and parse predictions.csv
  const fetchData = useCallback(async () => {
    try {
      setError('');
      const rawCSV = await getPredictions();
      
      Papa.parse(rawCSV, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const validData = results.data
            .filter((row: any) => row.timestamp)
            .slice(-50) as PredictionLog[]; // Keep only last 50 entries
          
          setData(validData);
          setLastUpdate(new Date());
          setLoadingState('success');
        },
        error: (parseError: any) => {
          console.error('CSV parsing error:', parseError);
          setError('Failed to parse prediction data');
          setLoadingState('error');
        },
      });
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to fetch prediction data');
      setLoadingState('error');
    }
  }, []);

  // Initial fetch and set up interval
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
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
      uptime: `${Math.floor((Date.now() - new Date(data[0]?.timestamp || Date.now()).getTime()) / 1000)}s`,
    };
  }, [data, chartData]);

  // Generate chart data for Chart.js
  const getChartData = useCallback((dataKey: keyof Omit<ChartData, 'timestamp' | 'formattedTime'>, label: string, color: string) => ({
    labels: chartData.map(row => row.formattedTime),
    datasets: [{
      label,
      data: chartData.map(row => row[dataKey]),
      borderColor: color,
      backgroundColor: color + '20',
      fill: true,
      tension: 0.4,
    }],
  }), [chartData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
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
      className="fade-in"
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
            />
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={fetchData}
            disabled={loadingState !== 'idle' && loadingState !== 'success'}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <RefreshIcon />
          </IconButton>
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
          <Card className="card-hover" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  <TrendingUpIcon />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalPredictions}
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
          <Card className="card-hover" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: theme.palette.success.light,
                    color: theme.palette.success.contrastText,
                  }}
                >
                  <SpeedIcon />
                </Box>
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
          <Card className="card-hover" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: theme.palette.error.light,
                    color: theme.palette.error.contrastText,
                  }}
                >
                  <ErrorIcon />
                </Box>
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
          <Card className="card-hover" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: theme.palette.info.light,
                    color: theme.palette.info.contrastText,
                  }}
                >
                  <AnalyticsIcon />
                </Box>
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
              },
            }}
          >
            <Tab label="Predictions Over Time" />
            <Tab label="Model Confidence" />
            <Tab label="Prediction Errors" />
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
};

export default AdminDashboard; 