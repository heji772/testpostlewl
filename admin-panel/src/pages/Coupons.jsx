import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Chart from '../components/Chart';
import Table from '../components/Table';
import { fetchCoupons } from '../utils/api';
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
  marginBottom: '28px'
};

const filtersGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
  marginBottom: '16px'
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

const buttonsRow = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '24px'
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

const Coupons = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    from: '',
    to: '',
    tag: ''
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCoupons = useCallback(async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCoupons(activeFilters);
      setCoupons(data?.coupons || data?.results || []);
    } catch (err) {
      console.error('Failed to fetch coupons', err);
      setError(err.response?.data?.error || 'Neuspjelo dohvaćanje kupona.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons(appliedFilters);
  }, [appliedFilters, loadCoupons]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      if (!coupon) return false;
      const searchMatch = filters.search
        ? [coupon.code, coupon.title, coupon.description, coupon.tag]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(filters.search.toLowerCase()))
        : true;
      const statusMatch = filters.status ? (coupon.status || '').toLowerCase() === filters.status.toLowerCase() : true;
      const tagMatch = filters.tag ? (coupon.tag || '').toLowerCase().includes(filters.tag.toLowerCase()) : true;

      const createdAt = coupon.createdAt || coupon.startAt || coupon.timestamp;
      const createdDate = createdAt ? new Date(createdAt) : null;
      const fromMatch = filters.from ? (createdDate ? createdDate >= new Date(filters.from) : false) : true;
      const toMatch = filters.to ? (createdDate ? createdDate <= new Date(filters.to) : false) : true;

      return searchMatch && statusMatch && tagMatch && fromMatch && toMatch;
    });
  }, [coupons, filters]);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(coupons.map((coupon) => coupon?.status).filter(Boolean)));
  }, [coupons]);

  const chartSeries = useMemo(() => {
    const sorted = [...filteredCoupons].sort((a, b) => {
      const valueA = a.submits ?? a.conversions ?? 0;
      const valueB = b.submits ?? b.conversions ?? 0;
      return valueB - valueA;
    });
    const topTen = sorted.slice(0, 10);
    return [
      {
        name: 'Klikovi',
        data: topTen.map((coupon) => ({ label: coupon.code || coupon.title, value: coupon.clicks ?? 0 }))
      },
      {
        name: 'Submisi',
        data: topTen.map((coupon) => ({ label: coupon.code || coupon.title, value: coupon.submits ?? coupon.conversions ?? 0 }))
      }
    ];
  }, [filteredCoupons]);

  const columns = [
    { key: 'code', label: 'Kupon' },
    { key: 'title', label: 'Naziv' },
    { key: 'tag', label: 'Oznaka' },
    {
      key: 'createdAt',
      label: 'Kreirano',
      render: (value, row) => {
        const raw = value || row.startAt || row.timestamp;
        if (!raw) return '—';
        const parsed = new Date(raw);
        return Number.isNaN(parsed.getTime()) ? raw : parsed.toLocaleString();
      }
    },
    { key: 'views', label: 'Pregledi' },
    { key: 'clicks', label: 'Klikovi' },
    { key: 'submits', label: 'Submisi' },
    { key: 'status', label: 'Status' }
  ];

  const handleApply = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    const defaultState = { search: '', status: '', from: '', to: '', tag: '' };
    setFilters(defaultState);
    setAppliedFilters(defaultState);
  };

  const handleExport = (type) => {
    if (type === 'csv') {
      exportToCsv('coupons', filteredCoupons, columns);
    } else {
      exportToExcel('coupons', filteredCoupons, columns);
    }
  };

  return (
    <div>
      <div style={titleStyle}>Kuponi i kampanje</div>
      <div style={descriptionStyle}>
        Upravljanje phishing kuponima s pregledom performansi i filtriranjem po statusu, tagovima i vremenu.
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {loading && <div style={{ marginBottom: '16px', color: '#64748b' }}>Učitavanje podataka...</div>}

      <form onSubmit={handleApply}>
        <div style={filtersGrid}>
          <label style={filterLabel}>
            Pretraga
            <input
              type="search"
              placeholder="Kod, naziv ili opis"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={filterLabel}>
            Status
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              style={inputStyle}
            >
              <option value="">Svi statusi</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
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
            Oznaka
            <input
              type="text"
              placeholder="npr. black-friday"
              value={filters.tag}
              onChange={(event) => setFilters((prev) => ({ ...prev, tag: event.target.value }))}
              style={inputStyle}
            />
          </label>
        </div>
        <div style={buttonsRow}>
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

      <Chart title="Top 10 kupona" series={chartSeries} />

      <Table columns={columns} data={filteredCoupons} emptyMessage="Nema kupona za odabrane filtere." />
    </div>
  );
};

export default Coupons;
