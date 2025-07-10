// Import React and necessary hooks
import React, { useEffect, useState } from 'react';
// Import Line chart from react-chartjs-2
import { Line } from 'react-chartjs-2';
// Import CSV file fetcher function
import { getPredictions } from '../api';
// Import PapaParse for parsing CSV
import Papa from 'papaparse';

const Dashboard = () => {
  // State to store parsed CSV data
  const [data, setData] = useState([]);

  // Fetch and parse the CSV file
  const fetchData = async () => {
    const rawCSV = await getPredictions(); // Get CSV text from public/logs
    Papa.parse(rawCSV, {
      header: true, // Use the first row as headers
      complete: (results) => {
        // Filter out rows with missing timestamp values
        setData(results.data.filter(row => row.timestamp));
      }
    });
  };

  // Run fetchData on mount and set an interval to refetch every 5 seconds
  useEffect(() => {
    fetchData(); // Initial load
    const interval = setInterval(fetchData, 5000); // Re-fetch every 5s
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Generate chart data for a given key (e.g., prediction, confidence, error)
  const getChartData = (key) => ({
    labels: data.map(d => d.timestamp), // Use timestamps as x-axis labels
    datasets: [
      {
        label: key, // e.g., 'prediction'
        data: data.map(d => parseFloat(d[key])), // Convert values to float
        fill: false,
        borderColor: 'blue', // Chart line color
      },
    ],
  });

  // Render multiple line charts for prediction, confidence, and error
  return (
    <>
      <h2>Prediction Over Time</h2>
      <Line data={getChartData('prediction')} />

      <h2>Confidence Over Time</h2>
      <Line data={getChartData('confidence')} />

      <h2>Error Over Time</h2>
      <Line data={getChartData('error')} />
    </>
  );
};

export default Dashboard;
