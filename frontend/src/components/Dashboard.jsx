import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { getPredictions } from '../api';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register required chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch predictions.csv and parse it using PapaParse
  const fetchData = async () => {
    try {
      const rawCSV = await getPredictions();
      Papa.parse(rawCSV, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const filtered = results.data.filter(row => row.timestamp);
          setData(filtered);
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Failed to load CSV:', err);
      setError('Could not load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Reusable chart generator
  const getChartData = (labelKey, color) => ({
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: labelKey,
        data: data.map(d => parseFloat(d[labelKey])),
        borderColor: color,
        backgroundColor: 'transparent',
        tension: 0.3,
      }
    ]
  });

  // Conditional rendering
  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (data.length === 0) return <p>No data available yet.</p>;

  return (
    <div>
      <h2>Prediction Over Time</h2>
      <Line data={getChartData('prediction', 'blue')} />

      <h2>Confidence Over Time</h2>
      <Line data={getChartData('confidence', 'green')} />

      <h2>Error Over Time</h2>
      <Line data={getChartData('error', 'red')} />
    </div>
  );
};

export default Dashboard;
