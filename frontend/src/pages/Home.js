import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import CategoryPills from '../components/CategoryPills';
import CouponGrid from '../components/CouponGrid';
import PhishingModal from '../components/PhishingModal';
import ErrorModal from '../components/ErrorModal';
import EducationModal from '../components/EducationModal';
import '../styles/main.css';

const FALLBACK_COUPONS = [
  {
    id: 'safe-1',
    title: '20% popusta na sve tenisice',
    discount_text: 'Vrijedi do kraja tjedna uz kod SNEAK20',
    brand: 'UrbanStep',
    category: 'Moda',
    cta_url: 'https://urbanstep.hr/kuponi',
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    type: 'legit',
  },
  {
    id: 'phish-1',
    title: 'Osvoji iPhone 15 Pro Max besplatno',
    discount_text: 'Unesi broj kartice i preuzmi “nagradu”',
    brand: 'Nepoznat prodavač',
    category: 'Tehnologija',
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    type: 'phishing',
  },
  {
    id: 'safe-2',
    title: '30% popusta na skincare rutinu',
    discount_text: 'Kod SKINLOVE vrijedi do isteka zaliha',
    brand: 'GlowLab',
    category: 'Ljepota',
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'legit',
  },
  {
    id: 'phish-2',
    title: '90% popusta na luksuzne satove (samo danas!)',
    discount_text: 'Klikni ovdje i unesi podatke s kartice',
    brand: 'Lažni brend',
    category: 'Moda',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    type: 'phishing',
  },
];

const EVENT_TYPE_MAP = {
  phishing_coupon_opened: 'view',
  phishing_modal_closed: 'click',
  phishing_repeat_warning: 'view',
  phishing_education_shown: 'view',
  hero_cta_click: 'click',
  coupon_redeem_click: 'click',
  header_navigation: 'click',
  phishing_submission: 'submit',
};

const SESSION_STORAGE_KEY = 'phishguard:sessionId';

const generateSessionId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `pg-${Date.now().toString(36)}-${randomPart}`;
};

const normaliseCategory = (value) => {
  if (!value) return 'Ostalo';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const slugify = (value) =>
  normaliseCategory(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const isPhishingCoupon = (coupon) => {
  if (!coupon) return false;
  if (typeof coupon.isPhishing === 'boolean') return coupon.isPhishing;
  if (typeof coupon.is_phishing === 'boolean') return coupon.is_phishing;
  return coupon.type === 'phishing';
};

function Home() {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [phishingCoupon, setPhishingCoupon] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [showEducation, setShowEducation] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const sessionIdRef = useRef(null);
  const phishingAttempts = useRef({});

  const ensureSessionId = useCallback(() => {
    if (sessionIdRef.current) {
      return sessionIdRef.current;
    }

    if (typeof window === 'undefined') {
      const generated = generateSessionId();
      sessionIdRef.current = generated;
      return generated;
    }

    try {
      const stored = window.localStorage?.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        sessionIdRef.current = stored;
        return stored;
      }
    } catch (_error) {
      // localStorage možda nije dostupan (npr. privatni način).
    }

    const generated = generateSessionId();
    try {
      window.localStorage?.setItem(SESSION_STORAGE_KEY, generated);
    } catch (_error) {
      // Ako localStorage nije dostupan, nastavljamo samo u memoriji.
    }
    sessionIdRef.current = generated;
    return generated;
  }, []);

  useEffect(() => {
    ensureSessionId();
  }, [ensureSessionId]);

  const trackEvent = useCallback(
    (eventName, payload = {}) => {
      const eventType = EVENT_TYPE_MAP[eventName] || 'view';
      const sessionId = ensureSessionId();
      const payloadData = payload && typeof payload === 'object' ? payload : {};
      const { couponId: rawCouponId, ...restPayload } = payloadData;
      let couponId = null;

      if (typeof rawCouponId === 'number' && Number.isFinite(rawCouponId)) {
        couponId = Math.trunc(rawCouponId);
      } else if (typeof rawCouponId === 'string' && /^\d+$/.test(rawCouponId)) {
        couponId = parseInt(rawCouponId, 10);
      }

      const metadata = {
        eventName,
        ...restPayload,
      };

      if (couponId === null && rawCouponId !== undefined && rawCouponId !== null && rawCouponId !== '') {
        metadata.couponId = rawCouponId;
      }

      const body = {
        eventType,
        sessionId,
        couponId,
        metadata,
      };

      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).catch(() => {});
    },
    [ensureSessionId],
  );

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await fetch('/api/public/coupons');
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        if (Array.isArray(data?.coupons) && data.coupons.length) {
          setCoupons(data.coupons);
        } else {
          setCoupons(FALLBACK_COUPONS);
        }
      } catch (error) {
        setCoupons(FALLBACK_COUPONS);
      } finally {
        setLoading(false);
      }
    };

    loadCoupons();
  }, []);

  const categories = useMemo(() => {
    const unique = new Map();
    coupons.forEach((coupon) => {
      const label = normaliseCategory(coupon.category || coupon.sector || coupon.type || 'Ostalo');
      const id = slugify(label || 'Ostalo') || 'ostalo';
      if (!unique.has(id)) {
        unique.set(id, { id, label });
      }
    });
    return Array.from(unique.values());
  }, [coupons]);

  useEffect(() => {
    if (selectedCategory === 'all') return;
    const stillExists = categories.some((category) => category.id === selectedCategory);
    if (!stillExists) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  const filteredCoupons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return coupons.filter((coupon) => {
      const couponCategory = slugify(coupon.category || coupon.sector || coupon.type || 'Ostalo') || 'ostalo';
      const matchesCategory = selectedCategory === 'all' || couponCategory === selectedCategory;
      const matchesSearch =
        !term ||
        [coupon.title, coupon.discount_text, coupon.brand]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [coupons, searchTerm, selectedCategory]);

  const handleRedeem = useCallback(
    (coupon) => {
      if (isPhishingCoupon(coupon)) {
        setPhishingCoupon(coupon);
        trackEvent('phishing_coupon_opened', { couponId: coupon.id });
        return;
      }

      trackEvent('coupon_redeem_click', { couponId: coupon.id });
      if (coupon.cta_url && typeof window !== 'undefined') {
        window.open(coupon.cta_url, '_blank', 'noopener');
      }
    },
    [trackEvent],
  );

  const handlePhishingClose = useCallback(() => {
    if (phishingCoupon) {
      trackEvent('phishing_modal_closed', { couponId: phishingCoupon.id });
    }
    setPhishingCoupon(null);
  }, [phishingCoupon, trackEvent]);

  const handlePhishingSubmit = useCallback(
    async (formData) => {
      if (!phishingCoupon) return;
      const couponId = phishingCoupon.id;
      const sessionId = ensureSessionId();
      const payload = {
        sessionId,
        couponId,
        firstName: formData.firstName?.trim() || undefined,
        lastName: formData.lastName?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        birthDate: formData.birthDate || undefined,
        address: formData.address?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      };
      setModalLoading(true);
      try {
        await fetch('/api/public/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        // Ignoriraj mrežne greške za sada
      } finally {
        setModalLoading(false);
      }

      handlePhishingClose();

      const count = (phishingAttempts.current[couponId] || 0) + 1;
      phishingAttempts.current[couponId] = count;

      const basePayload = { couponId, attempt: count };
      trackEvent('phishing_submission', {
        ...basePayload,
        hasEmail: Boolean(payload.email),
        hasPhone: Boolean(payload.phone),
      });
      if (count > 1) {
        setErrorInfo({
          message: 'Već smo zaprimili tvoj unos za ovu sumnjivu ponudu. Pratimo stanje i javit ćemo se ako bude potrebno.',
        });
        trackEvent('phishing_repeat_warning', basePayload);
      }
      if (count >= 3) {
        setShowEducation(true);
        trackEvent('phishing_education_shown', basePayload);
      }
    },
    [handlePhishingClose, phishingCoupon, trackEvent],
  );

  const closeErrorModal = useCallback(() => setErrorInfo(null), []);
  const closeEducationModal = useCallback(() => setShowEducation(false), []);

  const handleNavigate = useCallback(
    (sectionId) => {
      trackEvent('header_navigation', { sectionId });
      const category = categories.find((item) => item.id === sectionId);
      if (category) {
        setSelectedCategory(category.id);
      }
    },
    [categories, trackEvent],
  );

  return (
    <div className="app-shell">
      <Header searchTerm={searchTerm} onSearch={setSearchTerm} onNavigate={handleNavigate} />
      <HeroBanner
        title="Najbolji kuponi i sigurnosni savjeti"
        subtitle="Uštedi na provjerenim ponudama i nauči prepoznati sumnjive popuste."
        highlight="PhishGuard te štiti od online prijevara."
        ctaLabel="Saznaj više"
        onCta={() => trackEvent('hero_cta_click')}
      />
      <CategoryPills categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
      {loading ? <div className="empty-state">Učitavanje ponuda...</div> : <CouponGrid coupons={filteredCoupons} onRedeem={handleRedeem} />}

      {phishingCoupon && (
        <PhishingModal coupon={phishingCoupon} onClose={handlePhishingClose} onSubmit={handlePhishingSubmit} loading={modalLoading} />
      )}

      {errorInfo && <ErrorModal message={errorInfo.message} onClose={closeErrorModal} />}
      {showEducation && <EducationModal onClose={closeEducationModal} />}
    </div>
  );
}

export default Home;
