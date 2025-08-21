import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { Construction } from '@mui/icons-material';

interface AddressPredictionFormProps {
  onPredictionComplete?: (result: any) => void;
}

const AddressPredictionForm: React.FC<AddressPredictionFormProps> = () => {
  return (
    <Paper elevation={3} sx={{ p: 6, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
      <Construction sx={{ fontSize: 80, color: 'warning.main', mb: 3 }} />
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
        Address Input Coming Soon!
      </Typography>
      <Typography variant="h6" color="text.secondary">
        This feature is currently in development. Use the Manual Coordinates tab for now.
      </Typography>
    </Paper>
  );
};

export default AddressPredictionForm;
