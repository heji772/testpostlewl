import React from 'react';
import PropTypes from 'prop-types';

function ErrorModal({ title, message, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-shell" role="alertdialog" aria-modal="true" aria-labelledby="error-modal-title">
        <h2 id="error-modal-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="primary" onClick={onClose}>
            Razumijem
          </button>
        </div>
      </div>
    </div>
  );
}

ErrorModal.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

ErrorModal.defaultProps = {
  title: 'Već evidentirano',
};

export default ErrorModal;
