import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const TIMER_INTERVAL = 1000;

const resolveExpiration = (coupon) => {
  if (!coupon) return null;
  const expiration = coupon.expiresAt || coupon.expires_at || coupon.expiration_date;
  if (!expiration) return null;
  const date = typeof expiration === 'string' ? new Date(expiration) : new Date(Number(expiration));
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatTimeLeft = (diff) => {
  if (diff <= 0) return 'Isteklo';
  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

function CouponCard({ coupon, onRedeem }) {
  const isPhishing = useMemo(() => {
    if (!coupon) return false;
    if (typeof coupon.isPhishing === 'boolean') return coupon.isPhishing;
    if (typeof coupon.is_phishing === 'boolean') return coupon.is_phishing;
    return coupon.type === 'phishing';
  }, [coupon]);

  const expirationDate = useMemo(() => resolveExpiration(coupon), [coupon]);
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!expirationDate) return null;
    return expirationDate.getTime() - Date.now();
  });

  useEffect(() => {
    if (!expirationDate) {
      setTimeLeft(null);
      return undefined;
    }

    const tick = () => {
      setTimeLeft(expirationDate.getTime() - Date.now());
    };

    tick();
    const interval = setInterval(tick, TIMER_INTERVAL);
    return () => clearInterval(interval);
  }, [expirationDate]);

  const badgeClass = isPhishing ? 'badge phishing' : 'badge real';
  const badgeLabel = isPhishing ? 'Phishing sumnja' : 'Provjereno';
  const ctaLabel = isPhishing
    ? 'Provjeri sigurnost'
    : coupon.ctaLabel || coupon.cta_text || 'Iskoristi kupon';

  return (
    <article className={`coupon-card${isPhishing ? ' phishing' : ''}`}>
      <span className={badgeClass}>{badgeLabel}</span>
      <header>
        <h3>{coupon.title}</h3>
        {(coupon.discount_text || coupon.description) && <p>{coupon.discount_text || coupon.description}</p>}
      </header>
      <div className="coupon-meta">
        {coupon.brand && <span>Brend: {coupon.brand}</span>}
        {coupon.category && <span>Kategorija: {coupon.category}</span>}
        {timeLeft !== null && (
          <span className="coupon-timer" aria-live="polite">
            ⏳ {timeLeft <= 0 ? 'Isteklo' : `${formatTimeLeft(timeLeft)} preostalo`}
          </span>
        )}
      </div>
      <div className="coupon-actions">
        <button
          type="button"
          className={`cta-button ${isPhishing ? 'outline' : 'primary'}`}
          onClick={() => onRedeem(coupon)}
        >
          {ctaLabel}
        </button>
        {isPhishing && (
          <p className="security-hint">⚠️ Ova ponuda izgleda predobro da bi bila istinita. Provjerimo je zajedno.</p>
        )}
      </div>
    </article>
  );
}

CouponCard.propTypes = {
  coupon: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string.isRequired,
    discount_text: PropTypes.string,
    brand: PropTypes.string,
    category: PropTypes.string,
    isPhishing: PropTypes.bool,
    is_phishing: PropTypes.bool,
    type: PropTypes.string,
    expiresAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    expires_at: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    expiration_date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    ctaLabel: PropTypes.string,
  }).isRequired,
  onRedeem: PropTypes.func.isRequired,
};

export default CouponCard;
