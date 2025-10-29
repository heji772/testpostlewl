import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Chart from '../components/Chart';
import Table from '../components/Table';
import { fetchVictims } from '../utils/api';
import { exportToCsv, exportToExcel } from '../utils/export';

const pageTitle = {
  fontSize: '1.6rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '12px'
};

const description = {
  fontSize: '0.95rem',
  color: '#64748b',
  marginBottom: '28px'
};

const filtersRow = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
  marginBottom: '24px'
};

const filterControl = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  color: '#475569'
};

const inputStyle = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  fontSize: '0.95rem'
};

const buttonRow = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
};

const primaryButton = {
  padding: '12px 20px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  color: '#ffffff',
  fontWeight: 600,
  cursor: 'pointer'
};

const secondaryButton = {
  padding: '12px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(14,165,233,0.35)',
  background: 'transparent',
  color: '#0f172a',
  fontWeight: 600,
  cursor: 'pointer'
};

const errorStyle = {
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#b91c1c',
  padding: '14px 18px',
  borderRadius: '12px',
  marginBottom: '18px'
};

const Victims = () => {
  const [filters, setFilters] = useState({
    search: '',
    from: '',
    to: '',
    coupon: '',
    status: ''
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [victimData, setVictimData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadVictims = useCallback(async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchVictims(activeFilters);
      setVictimData(data?.victims || data?.results || []);
    } catch (err) {
      console.error('Failed to fetch victims', err);
      setError(err.response?.data?.error || 'Neuspješno dohvaćanje žrtava.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVictims(appliedFilters);
  }, [appliedFilters, loadVictims]);

  const filteredVictims = useMemo(() => {
    return victimData.filter((victim) => {
      if (!victim) {
        return false;
      }
      const searchMatch = filters.search
        ? [victim.email, victim.ip, victim.coupon, victim.location]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(filters.search.toLowerCase()))
        : true;

      const statusMatch = filters.status ? (victim.status || '').toLowerCase() === filters.status.toLowerCase() : true;
      const couponMatch = filters.coupon ? (victim.coupon || '').toLowerCase().includes(filters.coupon.toLowerCase()) : true;

      const submittedAt = victim.submittedAt || victim.createdAt || victim.timestamp;
      const submittedDate = submittedAt ? new Date(submittedAt) : null;

      const fromMatch = filters.from ? (submittedDate ? submittedDate >= new Date(filters.from) : false) : true;
      const toMatch = filters.to ? (submittedDate ? submittedDate <= new Date(filters.to) : false) : true;

      return searchMatch && statusMatch && couponMatch && fromMatch && toMatch;
    });
  }, [victimData, filters]);

  const aggregatedSeries = useMemo(() => {
    const counts = new Map();
    filteredVictims.forEach((victim) => {
      const submittedAt = victim.submittedAt || victim.createdAt || victim.timestamp;
      const dateLabel = submittedAt ? new Date(submittedAt).toISOString().slice(0, 10) : 'Nepoznato';
      counts.set(dateLabel, (counts.get(dateLabel) || 0) + 1);
    });
    const sorted = Array.from(counts.entries()).sort((a, b) => (a[0] > b[0] ? 1 : -1));
    return [
      {
        name: 'Broj žrtava',
        data: sorted.map(([label, value]) => ({ label, value }))
      }
    ];
  }, [filteredVictims]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(victimData.map((victim) => victim?.status).filter(Boolean)));
  }, [victimData]);

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'ip', label: 'IP adresa' },
    {
      key: 'submittedAt',
      label: 'Vrijeme',
      render: (value, row) => {
        const raw = value || row.createdAt || row.timestamp;
        if (!raw) return '—';
        const parsed = new Date(raw);
        if (Number.isNaN(parsed.getTime())) {
          return raw;
        }
        return parsed.toLocaleString();
      }
    },
    { key: 'coupon', label: 'Kupon' },
    { key: 'location', label: 'Lokacija' },
    { key: 'status', label: 'Status' }
  ];

  const handleApply = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    const defaultState = { search: '', from: '', to: '', coupon: '', status: '' };
    setFilters(defaultState);
    setAppliedFilters(defaultState);
  };

  const handleExport = (type) => {
    if (type === 'csv') {
      exportToCsv('victims', filteredVictims, columns);
    } else {
      exportToExcel('victims', filteredVictims, columns);
    }
  };

  return (
    <div>
      <div style={pageTitle}>Žrtve phishing kampanja</div>
      <div style={description}>
        Praćenje podataka o žrtvama u realnom vremenu, uključujući filtre po statusu, kuponu i vremenskom periodu.
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {loading && <div style={{ marginBottom: '16px', color: '#64748b' }}>Učitavanje podataka...</div>}

      <form onSubmit={handleApply} style={{ marginBottom: '12px' }}>
        <div style={filtersRow}>
          <label style={filterControl}>
            Pretraga
            <input
              type="search"
              placeholder="Email, IP ili lokacija"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={filterControl}>
            Od datuma
            <input
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={filterControl}>
            Do datuma
            <input
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={filterControl}>
            Kupon
            <input
              type="text"
              placeholder="Kod kampanje"
              value={filters.coupon}
              onChange={(event) => setFilters((prev) => ({ ...prev, coupon: event.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={filterControl}>
            Status
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              style={inputStyle}
            >
              <option value="">Svi statusi</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={buttonRow}>
          <button type="submit" style={primaryButton} disabled={loading}>
            {loading ? 'Učitavanje...' : 'Primijeni'}
          </button>
          <button type="button" style={secondaryButton} onClick={handleReset} disabled={loading}>
            Resetiraj
          </button>
          <button type="button" style={secondaryButton} onClick={() => handleExport('csv')}>
            Izvoz CSV
          </button>
          <button type="button" style={secondaryButton} onClick={() => handleExport('excel')}>
            Izvoz Excel
          </button>
        </div>
      </form>

      <Chart title="Trend novih žrtava" series={aggregatedSeries} />

      <Table columns={columns} data={filteredVictims} emptyMessage="Nema žrtava za odabrane filtere." />
    </div>
  );
};

export default Victims;
