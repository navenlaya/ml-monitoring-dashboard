import React, { useState } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import BedIcon from '@mui/icons-material/Bed';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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

  // User-friendly labels and tooltips for each field
  const fieldMeta = {
    MedInc: { label: 'Median Income', tip: 'Median income in block group (in $10,000s)' },
    HouseAge: { label: 'House Age', tip: 'Median house age in years' },
    AveRooms: { label: 'Average Rooms', tip: 'Average number of rooms per household' },
    AveBedrms: { label: 'Average Bedrooms', tip: 'Average number of bedrooms per household' },
    Population: { label: 'Population', tip: 'Population of the block group' },
    AveOccup: { label: 'Average Occupancy', tip: 'Average number of household members' },
    Latitude: { label: 'Latitude', tip: 'Latitude coordinate' },
    Longitude: { label: 'Longitude', tip: 'Longitude coordinate' },
  };

  // Input adornments for each field
  const fieldAdornments = {
    MedInc: { startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small" /></InputAdornment> },
    HouseAge: { endAdornment: <InputAdornment position="end">yrs</InputAdornment> },
    AveRooms: { startAdornment: <InputAdornment position="start"><HomeIcon fontSize="small" /></InputAdornment> },
    AveBedrms: { startAdornment: <InputAdornment position="start"><BedIcon fontSize="small" /></InputAdornment> },
    Population: { startAdornment: <InputAdornment position="start"><PeopleIcon fontSize="small" /></InputAdornment> },
    AveOccup: { endAdornment: <InputAdornment position="end">/hh</InputAdornment> },
    Latitude: { startAdornment: <InputAdornment position="start"><PublicIcon fontSize="small" /></InputAdornment> },
    Longitude: { startAdornment: <InputAdornment position="start"><LocationOnIcon fontSize="small" /></InputAdornment> },
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, width: '100%', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h4" gutterBottom>California Home Price Prediction</Typography>
      <Typography variant="body1" gutterBottom>Enter property details to get a price estimate:</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {Object.keys(formData).map((key) => (
            <Grid item xs={12} sm={6} key={key}>
              <Tooltip title={fieldMeta[key]?.tip || ''} arrow placement="top">
                <TextField
                  label={fieldMeta[key]?.label || key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  InputProps={fieldAdornments[key]}
                />
              </Tooltip>
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
