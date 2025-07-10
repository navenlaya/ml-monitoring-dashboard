// Import React and hooks
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse'; // CSV parser
import './App.css';

function App() {
  // Initial state for form inputs
  const [formData, setFormData] = useState({
    MedInc: '',
    HouseAge: '',
    AveRooms: '',
    AveBedrms: '',
    Population: '',
    AveOccup: '',
    Latitude: '',
    Longitude: '',
    actual_prices: '' // Include this for logging error in backend
  });

  // State for prediction response
  const [prediction, setPrediction] = useState(null);

  // Parsed CSV log data
  const [dashboardData, setDashboardData] = useState([]);

  // Fetch and parse CSV logs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/logs/predictions.csv');
        Papa.parse(res.data, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setDashboardData(results.data);
          }
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow empty values; backend will reject malformed input anyway
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value)
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/predict', formData);
      setPrediction(res.data);
    } catch (err) {
      console.error('Prediction error:', err);
    }
  };

  return (
    <div className="container">
      {/* Left Sidebar - Form */}
      <aside className="sidebar">
        <h2>Input Features</h2>
        <form onSubmit={handleSubmit}>
          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label>{key}:</label>
              <input
                type="number"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
          ))}
          <button type="submit">Predict</button>
        </form>

        {prediction && (
          <div className="result">
            <h3>Prediction</h3>
            <p>Predicted Price: {prediction.predicted_price}</p>
            <p>Confidence: {prediction.confidence}</p>
          </div>
        )}
      </aside>

      {/* Main Dashboard Section */}
      <main className="dashboard">
        <h2>Monitoring Dashboard</h2>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Prediction</th>
              <th>Actual</th>
              <th>Confidence</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.slice(-10).reverse().map((row, idx) => (
              <tr key={idx}>
                <td>{row.timestamp}</td>
                <td>{row.prediction}</td>
                <td>{row.actual_prices}</td>
                <td>{row.confidence}</td>
                <td>{row.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default App;
