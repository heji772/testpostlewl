import React from 'react';
import Navbar from './Navbar';

const layoutStyles = {
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#f5f6fa'
};

const mainStyles = {
  flex: 1,
  padding: '32px 40px',
  overflowY: 'auto'
};

const Layout = ({ children }) => {
  return (
    <div style={layoutStyles}>
      <Navbar />
      <main style={mainStyles}>{children}</main>
    </div>
  );
};

export default Layout;
