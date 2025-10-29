import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchSecuritySettings, generateBackupCodes, updateSecuritySettings } from '../utils/api';

const containerStyle = {
  display: 'grid',
  gap: '24px'
};

const cardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)'
};

const titleStyle = {
  fontSize: '1.6rem',
  fontWeight: 700,
  color: '#0f172a'
};

const subtitleStyle = {
  fontSize: '0.95rem',
  color: '#64748b',
  marginBottom: '20px'
};

const sectionTitle = {
  fontSize: '1.1rem',
  fontWeight: 600,
  marginBottom: '12px',
  color: '#0f172a'
};

const toggleRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '18px',
  borderRadius: '14px',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  marginBottom: '12px'
};

const toggleLabel = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const toggleDescription = {
  color: '#64748b',
  fontSize: '0.9rem'
};

const toggleInput = {
  width: '48px',
  height: '24px'
};

const formRow = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px'
};

const inputStyle = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  fontSize: '0.95rem'
};

const buttonPrimary = {
  padding: '12px 20px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  color: '#ffffff',
  fontWeight: 600,
  cursor: 'pointer'
};

const buttonSecondary = {
  padding: '12px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(14,165,233,0.35)',
  background: 'transparent',
  color: '#0f172a',
  fontWeight: 600,
  cursor: 'pointer'
};

const statusMessage = {
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '0.95rem'
};

const successStyle = {
  ...statusMessage,
  background: 'rgba(34, 197, 94, 0.12)',
  border: '1px solid rgba(34, 197, 94, 0.35)',
  color: '#15803d'
};

const errorStyle = {
  ...statusMessage,
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.35)',
  color: '#b91c1c'
};

const codeList = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '12px',
  marginTop: '12px'
};

const codeItem = {
  background: 'rgba(15, 23, 42, 0.9)',
  color: '#f8fafc',
  padding: '14px',
  borderRadius: '12px',
  textAlign: 'center',
  letterSpacing: '0.16em',
  fontWeight: 600
};

const Settings = () => {
  const { logout } = useAuth();
  const [settings, setSettings] = useState({
    anonymizeData: true,
    autoDeleteDays: 30,
    autoDeleteEnabled: false,
    rateLimit: 120,
    enableRateLimit: false,
    backupCodes: []
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchSettingsData = async () => {
      setLoading(true);
      try {
        const data = await fetchSecuritySettings();
        setSettings((prev) => ({
          ...prev,
          ...data
        }));
      } catch (err) {
        console.error('Failed to load settings', err);
        setStatus({ type: 'error', message: err.response?.data?.error || 'Neuspjelo dohvaćanje postavki.' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsData();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await updateSecuritySettings(settings);
      setStatus({ type: 'success', message: 'Postavke uspješno spremljene.' });
    } catch (err) {
      console.error('Failed to save settings', err);
      setStatus({ type: 'error', message: err.response?.data?.error || 'Spremanje nije uspjelo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const data = await generateBackupCodes();
      setSettings((prev) => ({ ...prev, backupCodes: data?.codes || [] }));
      setStatus({ type: 'success', message: 'Generirani su novi backup kodovi.' });
    } catch (err) {
      console.error('Failed to generate backup codes', err);
      setStatus({ type: 'error', message: err.response?.data?.error || 'Generiranje kodova nije uspjelo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={containerStyle}>
      <div>
        <div style={titleStyle}>Sigurnosne postavke</div>
        <div style={subtitleStyle}>Konfiguriraj pravila privatnosti, rotaciju podataka i višefaktorsku autentikaciju.</div>
      </div>

      {status.message && (
        <div style={status.type === 'success' ? successStyle : errorStyle}>{status.message}</div>
      )}

      <section style={cardStyle}>
        <div style={sectionTitle}>Privatnost i anonimizacija</div>
        <div style={toggleRow}>
          <div style={toggleLabel}>
            <span>Anonimiziraj osjetljive zapise</span>
            <span style={toggleDescription}>Zamijeni email adrese i IP podatke hash vrijednostima nakon obrade.</span>
          </div>
          <input
            type="checkbox"
            checked={Boolean(settings.anonymizeData)}
            onChange={() => handleToggle('anonymizeData')}
            style={toggleInput}
          />
        </div>
        <div style={toggleRow}>
          <div style={toggleLabel}>
            <span>Automatsko brisanje</span>
            <span style={toggleDescription}>Automatski ukloni žrtve nakon definiranog broja dana.</span>
          </div>
          <input
            type="checkbox"
            checked={Boolean(settings.autoDeleteEnabled)}
            onChange={() => handleToggle('autoDeleteEnabled')}
            style={toggleInput}
          />
        </div>
        <div style={formRow}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            Broj dana do brisanja
            <input
              type="number"
              min={1}
              value={settings.autoDeleteDays || ''}
              onChange={(event) => handleChange('autoDeleteDays', Number(event.target.value))}
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            Rate limit (zahtjeva/min)
            <input
              type="number"
              min={10}
              value={settings.rateLimit || ''}
              onChange={(event) => handleChange('rateLimit', Number(event.target.value))}
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            Aktiviraj rate limiting
            <input
              type="checkbox"
              checked={Boolean(settings.enableRateLimit)}
              onChange={() => handleToggle('enableRateLimit')}
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button type="button" style={buttonPrimary} onClick={handleSave} disabled={loading}>
            {loading ? 'Spremanje...' : 'Spremi postavke'}
          </button>
          <button type="button" style={buttonSecondary} onClick={handleLogout}>
            Odjava
          </button>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={sectionTitle}>Dvofaktorska autentikacija</div>
        <p style={{ color: '#64748b', marginBottom: '16px' }}>
          Izgeneriraj backup kodove koje korisnici mogu iskoristiti u slučaju gubitka TOTP uređaja.
        </p>
        <button type="button" style={buttonPrimary} onClick={handleGenerateBackupCodes} disabled={loading}>
          {loading ? 'Generiranje...' : 'Generiraj backup kodove'}
        </button>
        {!!settings.backupCodes?.length && (
          <div style={codeList}>
            {settings.backupCodes.map((code) => (
              <div key={code} style={codeItem}>
                {code}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Settings;
