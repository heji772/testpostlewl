import React, { useMemo } from 'react';

const containerStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
  marginBottom: '24px'
};

const titleStyle = {
  fontSize: '1.1rem',
  fontWeight: 600,
  marginBottom: '12px',
  color: '#0f172a'
};

const legendStyle = {
  display: 'flex',
  gap: '16px',
  marginTop: '12px',
  flexWrap: 'wrap'
};

const buildPoints = (data, width, height, maxValue) => {
  if (!data.length) {
    return '';
  }
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  return data
    .map((point, index) => {
      const x = stepX * index;
      const normalized = maxValue === 0 ? 0 : point.value / maxValue;
      const y = height - normalized * height;
      return `${x},${y}`;
    })
    .join(' ');
};

const Chart = ({ title, series, height = 260 }) => {
  const prepared = useMemo(() => {
    const sanitizedSeries = (series || []).map((item, idx) => ({
      name: item.name || `Series ${idx + 1}`,
      color: item.color || ['#0ea5e9', '#6366f1', '#f97316', '#22c55e'][idx % 4],
      gradientId: `chart-gradient-${idx}`,
      data: (item.data || []).map((point) => ({
        label: point.label,
        value: typeof point.value === 'number' ? point.value : Number(point.value) || 0
      }))
    }));

    const labels = sanitizedSeries[0]?.data.map((point) => point.label) || [];
    const maxValue = Math.max(
      0,
      ...sanitizedSeries.flatMap((item) => item.data.map((point) => point.value))
    );

    return { labels, series: sanitizedSeries, maxValue };
  }, [series]);

  const width = 640;
  const chartHeight = height;
  const { labels, series: preparedSeries, maxValue } = prepared;

  return (
    <div style={containerStyle}>
      {title && <div style={titleStyle}>{title}</div>}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${width} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {preparedSeries.map((serie) => (
              <linearGradient key={serie.gradientId} id={serie.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={serie.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={serie.color} stopOpacity="0.05" />
              </linearGradient>
            ))}
          </defs>
          <g>
            {labels.map((label, index) => (
              <g key={label}>
                <line
                  x1={(width / Math.max(labels.length - 1, 1)) * index}
                  y1={0}
                  x2={(width / Math.max(labels.length - 1, 1)) * index}
                  y2={chartHeight}
                  stroke="rgba(148,163,184,0.25)"
                  strokeDasharray="4"
                />
                <text
                  x={(width / Math.max(labels.length - 1, 1)) * index}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                >
                  {label}
                </text>
              </g>
            ))}
          </g>
          <g>
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
              <g key={fraction}>
                <line
                  x1={0}
                  y1={chartHeight * (1 - fraction)}
                  x2={width}
                  y2={chartHeight * (1 - fraction)}
                  stroke="rgba(148,163,184,0.2)"
                />
                <text
                  x={8}
                  y={chartHeight * (1 - fraction) - 6}
                  fontSize="12"
                  fill="#94a3b8"
                >
                  {Math.round(maxValue * fraction)}
                </text>
              </g>
            ))}
          </g>
          {preparedSeries.map((serie) => (
            <g key={serie.name}>
              <polyline
                fill="none"
                stroke={serie.color}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={buildPoints(serie.data, width, chartHeight - 32, maxValue)}
                transform="translate(0,16)"
              />
              {serie.data.length > 1 && (
                <polygon
                  fill={`url(#${serie.gradientId})`}
                  points={`${buildPoints(serie.data, width, chartHeight - 32, maxValue)} ${width},${chartHeight - 16} 0,${chartHeight - 16}`}
                  transform="translate(0,16)"
                />
              )}
              {serie.data.map((point, idx) => {
                const stepX = serie.data.length > 1 ? width / (serie.data.length - 1) : 0;
                const x = stepX * idx;
                const normalized = maxValue === 0 ? 0 : point.value / maxValue;
                const y = (chartHeight - 32) - normalized * (chartHeight - 32) + 16;
                return (
                  <circle key={`${serie.name}-${idx}`} cx={x} cy={y} r={4} fill="#fff" stroke={serie.color} strokeWidth="2" />
                );
              })}
            </g>
          ))}
        </svg>
      </div>
      <div style={legendStyle}>
        {preparedSeries.map((serie) => (
          <span key={serie.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '4px',
                backgroundColor: serie.color
              }}
            />
            {serie.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Chart;
