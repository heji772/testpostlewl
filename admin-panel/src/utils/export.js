const sanitize = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '""');
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
};

export const exportToCsv = (filename, rows, columns) => {
  if (!rows || !rows.length) {
    return;
  }
  const columnKeys = columns?.map((col) => col.key) || Object.keys(rows[0]);
  const header = (columns || columnKeys).map((col) => {
    const label = typeof col === 'string' ? col : col.label || col.key;
    return '"' + sanitize(label) + '"';
  });

  const csvRows = rows.map((row) => {
    return columnKeys
      .map((key) => '"' + sanitize(row[key]) + '"')
      .join(',');
  });

  const csvContent = [header.join(','), ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToExcel = (filename, rows, columns) => {
  if (!rows || !rows.length) {
    return;
  }
  const columnKeys = columns?.map((col) => col.key) || Object.keys(rows[0]);
  const headerCells = (columns || columnKeys)
    .map((col) => {
      const label = typeof col === 'string' ? col : col.label || col.key;
      return `<th>${sanitize(label)}</th>`;
    })
    .join('');

  const bodyRows = rows
    .map((row) => {
      const cells = columnKeys
        .map((key) => `<td>${sanitize(row[key])}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const html = `\n    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">\n      <head>\n        <meta charset="utf-8" />\n      </head>\n      <body>\n        <table>\n          <thead><tr>${headerCells}</tr></thead>\n          <tbody>${bodyRows}</tbody>\n        </table>\n      </body>\n    </html>\n  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename.endsWith('.xls') ? filename : `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
