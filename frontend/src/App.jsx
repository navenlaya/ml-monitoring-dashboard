import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserPrediction from './components/UserPrediction';
import ProtectedAdmin from './components/ProtectedAdmin';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ML Monitoring Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Routes>
            <Route path="/" element={<UserPrediction />} />
            <Route path="/admin" element={<ProtectedAdmin />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
