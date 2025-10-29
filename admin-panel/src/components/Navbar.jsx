import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sidebarStyle = {
  width: '240px',
  background: '#111b2b',
  color: '#f8fafc',
  display: 'flex',
  flexDirection: 'column',
  padding: '32px 24px'
};

const brandStyle = {
  fontSize: '1.4rem',
  fontWeight: 700,
  marginBottom: '40px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const navLinkStyle = ({ isActive }) => ({
  color: isActive ? '#0ea5e9' : '#cbd5f5',
  textDecoration: 'none',
  padding: '12px 16px',
  borderRadius: '12px',
  marginBottom: '8px',
  fontWeight: isActive ? 600 : 500,
  backgroundColor: isActive ? 'rgba(14, 165, 233, 0.12)' : 'transparent',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  transition: 'background 0.2s ease'
});

const footerStyle = {
  marginTop: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const buttonStyle = {
  background: 'rgba(248,250,252,0.1)',
  color: '#f8fafc',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  padding: '10px 16px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 600
};

const userStyle = {
  fontSize: '0.85rem',
  color: 'rgba(226,232,240,0.75)'
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside style={sidebarStyle}>
      <div style={brandStyle}>
        <span role="img" aria-label="shield">
          🛡️
        </span>
        PhishGuard
      </div>
      <nav style={{ flex: 1 }}>
        <NavLink to="/dashboard" style={navLinkStyle} end>
          📊 Dashboard
        </NavLink>
        <NavLink to="/victims" style={navLinkStyle}>
          🧑‍💻 Victims
        </NavLink>
        <NavLink to="/coupons" style={navLinkStyle}>
          🎟️ Coupons
        </NavLink>
        <NavLink to="/analytics" style={navLinkStyle}>
          📈 Analytics
        </NavLink>
        <NavLink to="/settings" style={navLinkStyle}>
          ⚙️ Settings
        </NavLink>
      </nav>
      <div style={footerStyle}>
        {user && (
          <div>
            <div style={{ fontWeight: 600 }}>{user.name || user.username || 'Admin'}</div>
            <div style={userStyle}>{user.role || 'Administrator'}</div>
          </div>
        )}
        <button type="button" style={buttonStyle} onClick={handleLogout}>
          Odjava
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
