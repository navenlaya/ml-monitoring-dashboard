import React, { useState } from 'react';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import './App.css';

const App = () => {
  // State used to trigger Dashboard re-render after new prediction
  const [reload, setReload] = useState(false);

  return (
    <div style={{ display: 'flex' }}>
      {/* Left Panel: Input Form */}
      <div style={{ width: '30%', padding: '20px' }}>
        <h2>Enter Data</h2>
        {/* Trigger Dashboard reload by toggling the 'reload' state */}
        <InputForm onNewPrediction={() => setReload(!reload)} />
      </div>

      {/* Right Panel: Real-Time Dashboard */}
      <div style={{ width: '70%', padding: '20px' }}>
        {/* Use 'key' to force Dashboard re-render when reload changes */}
        <Dashboard key={reload} />
      </div>
    </div>
  );
};

export default App;
