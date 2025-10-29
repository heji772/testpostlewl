import React from 'react';

const overlayStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
  color: '#f8fafc',
  fontSize: '1.1rem',
  letterSpacing: '0.08em'
};

const LoadingScreen = ({ message = 'Učitavanje...' }) => {
  return (
    <div style={overlayStyle}>
      <div>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔐</div>
        {message}
      </div>
    </div>
  );
};

export default LoadingScreen;
