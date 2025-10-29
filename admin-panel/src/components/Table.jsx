import React from 'react';

const containerStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
  overflow: 'hidden'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const thStyle = {
  textAlign: 'left',
  padding: '14px 18px',
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#64748b',
  borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
  background: '#f8fafc'
};

const tdStyle = {
  padding: '16px 18px',
  borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
  fontSize: '0.95rem',
  color: '#0f172a'
};

const emptyStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#94a3b8'
};

const Table = ({ columns, data, emptyMessage = 'No data', renderActions }) => {
  return (
    <div style={containerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={thStyle}>
                {column.label}
              </th>
            ))}
            {renderActions && <th style={thStyle}>Akcije</th>}
          </tr>
        </thead>
        <tbody>
          {!data.length && (
            <tr>
              <td colSpan={(renderActions ? columns.length + 1 : columns.length)} style={emptyStyle}>
                {emptyMessage}
              </td>
            </tr>
          )}
          {data.map((row) => (
            <tr key={row.id || row._id || JSON.stringify(row)}>
              {columns.map((column) => (
                <td key={column.key} style={tdStyle}>
                  {column.render ? column.render(row[column.key], row) : row[column.key] ?? '—'}
                </td>
              ))}
              {renderActions && <td style={tdStyle}>{renderActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
