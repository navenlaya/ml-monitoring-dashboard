import React, { useState } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

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
    Longitude: ''
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
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, width: '100%', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h4" gutterBottom>California Home Price Prediction</Typography>
      <Typography variant="body1" gutterBottom>Enter property details to get a price estimate:</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {Object.keys(formData).map((key) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                label={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                type="number"
                fullWidth
                required
                variant="outlined"
                size="small"
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>
              Predict Price
            </Button>
          </Grid>
        </Grid>
      </Box>
      {/* Display the result or error. Takes from */}
      {prediction && (
        <Paper elevation={2} sx={{ mt: 4, p: 2, background: '#f0f7fa' }}>
          <Typography variant="h6" gutterBottom>Prediction Results</Typography>
          <Typography><strong>Estimated Price:</strong> ${prediction.predicted_price?.toFixed(2)}</Typography>
        </Paper>
      )}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
    </Paper>
  );
};

export default UserPrediction;
