import React from 'react';
import PropTypes from 'prop-types';

function HeroBanner({ title, subtitle, highlight, ctaLabel, onCta }) {
  return (
    <section className="hero-banner">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {highlight && <p><strong>{highlight}</strong></p>}
      {ctaLabel && (
        <button type="button" className="cta-button outline" onClick={onCta}>
          {ctaLabel}
        </button>
      )}
    </section>
  );
}

HeroBanner.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  highlight: PropTypes.string,
  ctaLabel: PropTypes.string,
  onCta: PropTypes.func,
};

HeroBanner.defaultProps = {
  highlight: '',
  ctaLabel: '',
  onCta: undefined,
};

export default HeroBanner;
