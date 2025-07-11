import React, { useState } from 'react';
import axios from 'axios';

/**
 * This component renders a form that allows users to input housing data
 * and get a predicted price from the ML model hosted on the backend.
 */
const UserPrediction = () => {
  // State to store form input values
  const [formData, setFormData] = useState({
    MedInc: '',
    HouseAge: '',
    AveRooms: '',
    AveBedrms: '',
    Population: '',
    AveOccup: '',
    Latitude: '',
    Longitude: '',
    actual_prices: ''
  });

  // State to hold prediction result and any model error metrics
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission and send data to the backend API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/predict', formData);
      setPrediction(response.data);
      setError(null);
    } catch (err) {
      console.error('Prediction failed:', err);
      setError('Prediction failed. Please try again.');
      setPrediction(null);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: 'auto' }}>
      <h2>🏠 California Home Price Prediction</h2>
      <p>Enter property details to get a price estimate:</p>

      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div key={key} style={{ marginBottom: '10px' }}>
            <label>
              {key}:
              <input
                type="number"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                step="any"
                required
                style={{ marginLeft: '10px', width: '100%' }}
              />
            </label>
          </div>
        ))}
        <button type="submit">Predict Price</button>
      </form>

      {/* Display the result or error */}
      {prediction && (
        <div style={{ marginTop: '20px' }}>
          <h3>📈 Prediction Results</h3>
          <p><strong>Estimated Price:</strong> ${prediction.predicted_price?.toFixed(2)}</p>
          <p><strong>Confidence:</strong> {prediction.confidence}</p>
          <p><strong>Actual Price:</strong> ${prediction.actual_prices}</p>
          <p><strong>Prediction Error:</strong> {prediction.error}</p>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
    </div>
  );
};

export default UserPrediction;
