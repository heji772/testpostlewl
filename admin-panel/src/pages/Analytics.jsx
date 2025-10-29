import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Chart from '../components/Chart';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import { fetchAnalyticsOverview } from '../utils/api';
import { exportToCsv, exportToExcel } from '../utils/export';

const titleStyle = {
  fontSize: '1.6rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '12px'
};

const descriptionStyle = {
  fontSize: '0.95rem',
  color: '#64748b',
  marginBottom: '24px'
};

const filtersRow = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '24px'
};

const filterLabel = {
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

const cardsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '28px'
};

const errorStyle = {
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#b91c1c',
  padding: '14px 18px',
  borderRadius: '12px',
  marginBottom: '18px'
};

const Analytics = () => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    granularity: 'day'
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAnalyticsOverview(activeFilters);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics overview', err);
      setError(err.response?.data?.error || 'Neuspjelo dohvaćanje analitike.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(appliedFilters);
  }, [appliedFilters, loadAnalytics]);

  const normalized = useMemo(() => {
    const totals = {
      views: analytics?.totals?.views ?? analytics?.totalViews ?? 0,
      clicks: analytics?.totals?.clicks ?? analytics?.totalClicks ?? 0,
      submits: analytics?.totals?.submits ?? analytics?.totalSubmits ?? 0
    };

    const conversionRate = totals.views ? ((totals.submits / totals.views) * 100).toFixed(2) : '0.00';

    const trendSeries = analytics?.trend || analytics?.series || [];
    const geo = analytics?.geo || analytics?.countries || [];

    return {
      totals,
      conversionRate,
      trendSeries,
      geo
    };
  }, [analytics]);

  const chartSeries = useMemo(() => {
    return [
      {
        name: 'Pregledi',
        data: normalized.trendSeries.map((point) => ({
          label: point.date || point.label,
          value: point.views ?? point.impressions ?? 0
        }))
      },
      {
        name: 'Klikovi',
        data: normalized.trendSeries.map((point) => ({
          label: point.date || point.label,
          value: point.clicks ?? 0
        }))
      },
      {
        name: 'Submisi',
        data: normalized.trendSeries.map((point) => ({
          label: point.date || point.label,
          value: point.submits ?? point.conversions ?? 0
        }))
      }
    ];
  }, [normalized.trendSeries]);

  const geoColumns = [
    { key: 'country', label: 'Država' },
    { key: 'views', label: 'Pregledi' },
    { key: 'clicks', label: 'Klikovi' },
    { key: 'submits', label: 'Submisi' },
    {
      key: 'conversionRate',
      label: 'Konverzija',
      render: (value, row) => {
        if (value !== undefined) {
          return `${(Number(value) * 100).toFixed(1)}%`;
        }
        if (!row.views) return '0%';
        return `${((row.submits || 0) / row.views * 100).toFixed(1)}%`;
      }
    }
  ];

  const handleApply = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    const defaultState = { from: '', to: '', granularity: 'day' };
    setFilters(defaultState);
    setAppliedFilters(defaultState);
  };

  const handleExportGeo = (type) => {
    if (type === 'csv') {
      exportToCsv('analytics-geo', normalized.geo, geoColumns);
    } else {
      exportToExcel('analytics-geo', normalized.geo, geoColumns);
    }
  };

  return (
    <div>
      <div style={titleStyle}>Napredna analitika</div>
      <div style={descriptionStyle}>
        Dubinsko praćenje performansi phishing kampanja po vremenu, kanalima i zemljopisnim lokacijama.
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {loading && <div style={{ marginBottom: '16px', color: '#64748b' }}>Učitavanje podataka...</div>}

      <form onSubmit={handleApply} style={filtersRow}>
        <label style={filterLabel}>
          Od datuma
          <input
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
            style={inputStyle}
          />
        </label>
        <label style={filterLabel}>
          Do datuma
          <input
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
            style={inputStyle}
          />
        </label>
        <label style={filterLabel}>
          Granularnost
          <select
            value={filters.granularity}
            onChange={(event) => setFilters((prev) => ({ ...prev, granularity: event.target.value }))}
            style={inputStyle}
          >
            <option value="hour">Po satima</option>
            <option value="day">Po danima</option>
            <option value="week">Po tjednima</option>
            <option value="month">Po mjesecima</option>
          </select>
        </label>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <button type="submit" style={primaryButton} disabled={loading}>
            {loading ? 'Učitavanje...' : 'Primijeni'}
          </button>
          <button type="button" style={secondaryButton} onClick={handleReset} disabled={loading}>
            Resetiraj
          </button>
        </div>
      </form>

      <div style={cardsGrid}>
        <StatCard title="Ukupno pregleda" value={normalized.totals.views} />
        <StatCard title="Ukupno klikova" value={normalized.totals.clicks} />
        <StatCard title="Ukupno submitova" value={normalized.totals.submits} />
        <StatCard title="Stopa konverzije" value={`${normalized.conversionRate}%`} />
      </div>

      <Chart title="Trend konverzija" series={chartSeries} />

      <section style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Distribucija po državama</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" style={secondaryButton} onClick={() => handleExportGeo('csv')}>
              CSV izvoz
            </button>
            <button type="button" style={secondaryButton} onClick={() => handleExportGeo('excel')}>
              Excel izvoz
            </button>
          </div>
        </div>
        <Table columns={geoColumns} data={normalized.geo} emptyMessage="Nema podataka o geografiji." />
      </section>
    </div>
  );
};

export default Analytics;
