import React, { useState } from 'react';
import PropTypes from 'prop-types';

function PhishingModal({ coupon, onClose, onSubmit, loading }) {
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ email, notes });
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-shell" role="dialog" aria-modal="true" aria-labelledby="phishing-modal-title">
        <h2 id="phishing-modal-title">Sumnjiva ponuda: {coupon.title}</h2>
        <p>
          Uočili smo da ova ponuda ima obilježja phishing napada. Ako si već unio osobne podatke,
          podijeli detalje kako bismo mogli bolje zaštititi zajednicu.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="phishing-email">Kontakt e-mail (opcionalno)</label>
          <input
            id="phishing-email"
            type="email"
            placeholder="ime@domena.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label htmlFor="phishing-notes">Što te navelo na ponudu?</label>
          <textarea
            id="phishing-notes"
            placeholder="Opisi što se dogodilo..."
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Zatvori
            </button>
            <button type="submit" className="primary" disabled={loading}>
              {loading ? 'Slanje...' : 'Prijavi pokušaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

PhishingModal.propTypes = {
  coupon: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

PhishingModal.defaultProps = {
  loading: false,
};

export default PhishingModal;
