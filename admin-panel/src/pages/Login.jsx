import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #111b2b 0%, #1e3a8a 40%, #38bdf8 100%)'
};

const panelStyle = {
  width: '100%',
  maxWidth: '420px',
  background: 'rgba(15, 23, 42, 0.85)',
  borderRadius: '24px',
  padding: '48px 40px',
  color: '#e2e8f0',
  boxShadow: '0 25px 60px rgba(8, 47, 73, 0.45)',
  backdropFilter: 'blur(10px)'
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '14px',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  marginBottom: '18px',
  background: 'rgba(15, 23, 42, 0.65)',
  color: '#f8fafc',
  fontSize: '1rem'
};

const buttonStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '14px',
  border: 'none',
  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  color: '#f8fafc',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
  marginTop: '12px'
};

const secondaryButtonStyle = {
  ...buttonStyle,
  marginTop: '0',
  background: 'rgba(15, 23, 42, 0.7)',
  border: '1px solid rgba(14, 165, 233, 0.35)'
};

const errorStyle = {
  background: 'rgba(239, 68, 68, 0.18)',
  border: '1px solid rgba(239, 68, 68, 0.45)',
  color: '#fecaca',
  padding: '12px 16px',
  borderRadius: '12px',
  marginBottom: '18px'
};

const subtitleStyle = {
  fontSize: '0.95rem',
  color: 'rgba(226, 232, 240, 0.65)',
  marginBottom: '28px'
};

const Login = () => {
  const navigate = useNavigate();
  const { login, verifyTotp, authLoading, pendingTotpToken } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', totp: '' });
  const [step, setStep] = useState(pendingTotpToken ? 'totp' : 'credentials');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'totp' ? value.replace(/[^0-9]/g, '') : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleCredentialsSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const result = await login({ username: form.username, password: form.password });
      if (result?.requiresTotp) {
        setStep('totp');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Neuspješna prijava. Provjeri podatke.');
    }
  };

  const handleTotpSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await verifyTotp(form.totp.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Neuspješna TOTP verifikacija.');
    }
  };

  return (
    <div style={containerStyle}>
      <form style={panelStyle} onSubmit={step === 'credentials' ? handleCredentialsSubmit : handleTotpSubmit}>
        <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>PhishGuard Admin</div>
        <div style={subtitleStyle}>
          {step === 'credentials'
            ? 'Prijavi se koristeći administratorske podatke.'
            : 'Unesi 6-znamenkasti TOTP kod iz svoje autentikacijske aplikacije.'}
        </div>
        {error && <div style={errorStyle}>{error}</div>}
        {step === 'credentials' && (
          <>
            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Korisničko ime"
              style={inputStyle}
              value={form.username}
              onChange={handleChange}
              disabled={authLoading}
              required
            />
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Lozinka"
              style={inputStyle}
              value={form.password}
              onChange={handleChange}
              disabled={authLoading}
              required
            />
            <button type="submit" style={buttonStyle} disabled={authLoading}>
              {authLoading ? 'Prijava...' : 'Nastavi'}
            </button>
          </>
        )}
        {step === 'totp' && (
          <>
            <input
              type="text"
              name="totp"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="TOTP kod"
              style={inputStyle}
              value={form.totp}
              onChange={handleChange}
              disabled={authLoading}
              required
            />
            <button type="submit" style={buttonStyle} disabled={authLoading}>
              {authLoading ? 'Provjera...' : 'Potvrdi kod'}
            </button>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => {
                setForm((prev) => ({ ...prev, totp: '' }));
                setStep('credentials');
              }}
              disabled={authLoading}
            >
              ↩️ Natrag
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default Login;
