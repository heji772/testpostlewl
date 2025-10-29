import React from 'react';
import PropTypes from 'prop-types';

function EducationModal({ onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-shell" role="dialog" aria-modal="true" aria-labelledby="education-modal-title">
        <h2 id="education-modal-title">Kako prepoznati phishing kupon?</h2>
        <p>
          Budite oprezni kada vidite ponude koje traže osjetljive podatke ili obećavaju nerealne popuste.
          Slijedite ove korake kako biste ostali sigurni:
        </p>
        <ul className="education-list">
          <li>
            <strong>1.</strong>
            <span>Provjerite URL izvora i uvjerite se da je riječ o službenoj domeni brenda.</span>
          </li>
          <li>
            <strong>2.</strong>
            <span>Ne dijelite osobne podatke (broj kartice, OIB) na nepoznatim stranicama.</span>
          </li>
          <li>
            <strong>3.</strong>
            <span>Potražite gramatičke pogreške i generičke pozdrave koji često odaju phishing.</span>
          </li>
        </ul>
        <div className="modal-actions">
          <button type="button" className="primary" onClick={onClose}>
            Razumijem
          </button>
        </div>
      </div>
    </div>
  );
}

EducationModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default EducationModal;
