import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Papa from 'papaparse';
import { getPredictions } from '../api';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [data, setData] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  // Fetch and parse predictions.csv
  const fetchData = async () => {
    const rawCSV = await getPredictions();
    Papa.parse(rawCSV, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data.filter(row => row.timestamp));
      },
    });
  };

  // Fetch initially and refresh every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Utility: generate chart data for a column
  const getChartData = (label, key, color = 'blue') => ({
    labels: data.map(row => row.timestamp),
    datasets: [{
      label,
      data: data.map(row => parseFloat(row[key])),
      borderColor: color,
      fill: false,
    }],
  });

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: 'background.default', p: { xs: 1, sm: 3 }, boxSizing: 'border-box' }}>
      <Typography variant="h4" gutterBottom align="center">Admin Dashboard (Live)</Typography>
      <Paper sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Predictions" />
          <Tab label="Confidence" />
          <Tab label="Error" />
        </Tabs>
      </Paper>
      {data.length > 0 ? (
        <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', height: { xs: 350, md: 500 }, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, p: 2 }}>
          {selectedTab === 0 && (
            <>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>Predictions Over Time</Typography>
              <Line data={getChartData("Prediction", "prediction", "blue")} options={{ maintainAspectRatio: false }} height={null} />
            </>
          )}
          {selectedTab === 1 && (
            <>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>Confidence Over Time</Typography>
              <Line data={getChartData("Confidence", "confidence", "green")} options={{ maintainAspectRatio: false }} height={null} />
            </>
          )}
          {selectedTab === 2 && (
            <>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>Prediction Error Over Time</Typography>
              <Line data={getChartData("Error", "error", "red")} options={{ maintainAspectRatio: false }} height={null} />
            </>
          )}
        </Box>
      ) : (
        <Typography align="center">Loading chart data...</Typography>
      )}
    </Box>
  );
};

export default AdminDashboard;
