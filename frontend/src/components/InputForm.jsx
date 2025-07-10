import React, { useState } from 'react';
// Import the function to send prediction data to the backend
import { sendPrediction } from '../api';

// InputForm component accepts a callback prop (onNewPrediction)
const InputForm = ({ onNewPrediction }) => {
  // Initialize form data state for all input fields
  const [formData, setFormData] = useState({
    MedInc: '',
    HouseAge: '',
    AveRooms: '',
    AveBedrms: '',
    Population: '',
    AveOccup: '',
    Latitude: '',
    Longitude: '',
    actual_prices: '', // Could be optional depending on use case
  });

  // Handle input change: update formData state as user types
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value), // Convert input to float
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submit behavior (page reload)
    const response = await sendPrediction(formData); // Send data to backend
    onNewPrediction(response.data); // Pass prediction result to parent component (optional)
  };

  // Render the form
  return (
    <form onSubmit={handleSubmit}>
      {/* Generate input fields dynamically from formData keys */}
      {Object.keys(formData).map((key) => (
        <div key={key}>
          <label>{key}</label>
          <input
            name={key}
            type="number"
            step="any" // Allows decimal input
            onChange={handleChange}
            required
          />
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};

export default InputForm;