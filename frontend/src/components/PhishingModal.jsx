import React, { useState } from 'react';
import PropTypes from 'prop-types';

function PhishingModal({ coupon, onClose, onSubmit, loading }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      firstName,
      lastName,
      email,
      phone,
      birthDate,
      address,
      notes,
    });
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
          <label htmlFor="phishing-first-name">Ime (opcionalno)</label>
          <input
            id="phishing-first-name"
            type="text"
            placeholder="npr. Ana"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <label htmlFor="phishing-last-name">Prezime (opcionalno)</label>
          <input
            id="phishing-last-name"
            type="text"
            placeholder="npr. Horvat"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
          <label htmlFor="phishing-email">Kontakt e-mail (opcionalno)</label>
          <input
            id="phishing-email"
            type="email"
            placeholder="ime@domena.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label htmlFor="phishing-phone">Broj telefona (opcionalno)</label>
          <input
            id="phishing-phone"
            type="tel"
            placeholder="npr. +385 91 123 4567"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <label htmlFor="phishing-birthdate">Datum rođenja (opcionalno)</label>
          <input
            id="phishing-birthdate"
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
          />
          <label htmlFor="phishing-address">Adresa (opcionalno)</label>
          <input
            id="phishing-address"
            type="text"
            placeholder="Ulica i kućni broj"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
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
