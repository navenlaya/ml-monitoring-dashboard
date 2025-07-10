import React, { useState } from 'react';
import { sendPrediction } from '../api'; // Sends input to backend for prediction

const InputForm = ({ onNewPrediction }) => {
  const [formData, setFormData] = useState({
    MedInc: '',
    HouseAge: '',
    AveRooms: '',
    AveBedrms: '',
    Population: '',
    AveOccup: '',
    Latitude: '',
    Longitude: '',
    actual_prices: '', // Optional true value, used for error calculation
  });

  const [result, setResult] = useState(null); // Stores prediction result
  const [loading, setLoading] = useState(false); // Indicates request in progress
  const [error, setError] = useState(null); // Holds error message if any

  // Handle input changes and update state
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value), // Ensure numbers are sent
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await sendPrediction(formData);
      setResult(response.data); // Store prediction result
      onNewPrediction(response.data); // Notify parent to reload dashboard
    } catch (err) {
      console.error('Prediction failed:', err);
      setError('Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(formData).map((key) => (
        <div key={key} style={{ marginBottom: '10px' }}>
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

      <button type="submit" disabled={loading}>
        {loading ? 'Predicting...' : 'Predict'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
      )}

      {result && (
        <div className="result" style={{ marginTop: '15px', padding: '10px', border: '1px solid #ccc' }}>
          <h4>Prediction Result:</h4>
          <p><strong>Predicted Price:</strong> {result.predicted_price}</p>
          <p><strong>Confidence:</strong> {result.confidence}</p>
          <p><strong>Error:</strong> {result.error}</p>
        </div>
      )}
    </form>
  );
};

export default InputForm;
