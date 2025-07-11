import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';

const ProtectedAdmin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (password === 'yourpassword') {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (authenticated) {
    return <AdminDashboard />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Login</h2>
      <input
        type="password"
        placeholder="Enter admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} style={{ marginLeft: '1rem' }}>
        Login
      </button>
    </div>
  );
};

export default ProtectedAdmin;