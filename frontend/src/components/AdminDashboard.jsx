import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Papa from 'papaparse';
import { getPredictions } from '../api';

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
    <div style={{ padding: '2rem' }}>
      <h2>Admin Dashboard (Live)</h2>

      {data.length > 0 ? (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h3>Predictions Over Time</h3>
            <Line data={getChartData("Prediction", "prediction", "blue")} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Confidence Over Time</h3>
            <Line data={getChartData("Confidence", "confidence", "green")} />
          </div>

          <div>
            <h3>Prediction Error Over Time</h3>
            <Line data={getChartData("Error", "error", "red")} />
          </div>
        </>
      ) : (
        <p>Loading chart data...</p>
      )}
    </div>
  );
};

export default AdminDashboard;
