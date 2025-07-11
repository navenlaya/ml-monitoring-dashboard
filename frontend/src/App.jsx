// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserPrediction from './components/UserPrediction';
import ProtectedAdmin from './components/ProtectedAdmin';

/**
 * Main routing setup:
 * - "/" renders the public user prediction form
 * - "/admin" renders a password-protected dashboard for developers
 */
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<UserPrediction />} />
      <Route path="/admin" element={<ProtectedAdmin />} />
    </Routes>
  );
};

export default App;
