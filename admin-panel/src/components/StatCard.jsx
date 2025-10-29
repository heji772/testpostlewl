import React from 'react';

const cardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '20px 24px',
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
  minWidth: '200px'
};

const labelStyle = {
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  color: '#64748b',
  letterSpacing: '0.08em'
};

const valueStyle = {
  fontSize: '2rem',
  fontWeight: 700,
  color: '#0f172a',
  margin: '8px 0 4px'
};

const trendStyle = {
  fontSize: '0.9rem',
  color: '#22c55e'
};

const StatCard = ({ title, value, trend }) => {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{title}</div>
      <div style={valueStyle}>{value ?? 0}</div>
      {trend && <div style={trendStyle}>{trend}</div>}
    </div>
  );
};

export default StatCard;
