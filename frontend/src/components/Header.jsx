import React from 'react';
import PropTypes from 'prop-types';

const NAV_LINKS = [
  { id: 'fashion', label: 'Moda' },
  { id: 'tech', label: 'Tehnologija' },
  { id: 'beauty', label: 'Ljepota' },
];

function Header({ searchTerm, onSearch, onNavigate }) {
  return (
    <header className="app-header">
      <div className="logo" aria-label="PhishGuard Kuponi">
        <span role="img" aria-hidden="true">🎁</span>
        <span>PhishGuard Kuponi</span>
      </div>
      <input
        type="search"
        value={searchTerm}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Pretraži kupone ili brendove..."
        aria-label="Pretraži kupone"
      />
      <nav aria-label="Kategorije">
        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(event) => {
              event.preventDefault();
              onNavigate?.(link.id);
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

Header.propTypes = {
  searchTerm: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  onNavigate: PropTypes.func,
};

Header.defaultProps = {
  searchTerm: '',
  onNavigate: undefined,
};

export default Header;
