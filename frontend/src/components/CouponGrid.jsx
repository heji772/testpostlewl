import React from 'react';
import PropTypes from 'prop-types';
import CouponCard from './CouponCard';

function CouponGrid({ coupons, onRedeem }) {
  if (!coupons.length) {
    return <div className="empty-state">Trenutno nema kupona koji odgovaraju filteru.</div>;
  }

  return (
    <div className="coupon-grid">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id || coupon.title} coupon={coupon} onRedeem={onRedeem} />
      ))}
    </div>
  );
}

CouponGrid.propTypes = {
  coupons: PropTypes.arrayOf(PropTypes.object),
  onRedeem: PropTypes.func.isRequired,
};

CouponGrid.defaultProps = {
  coupons: [],
};

export default CouponGrid;
