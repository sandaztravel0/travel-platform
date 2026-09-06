import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BADGE_CLASS = { vehicle: 'badge-vehicle', driver: 'badge-driver', stay: 'badge-stay' };
const BADGE_LABEL = { vehicle: 'Vehicle', driver: 'Driver', stay: 'Stay' };

// Builds a hidden form and submits it — this is how PayHere's hosted checkout expects
// to receive the payment fields (a real page redirect, not an API call).
function redirectToPayHere(fields) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = fields.checkout_url;

  Object.entries(fields).forEach(([key, value]) => {
    if (key === 'checkout_url') return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value ?? '';
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export default function ListingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_URL}/listings/${id}`).then((res) => setListing(res.data)).catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    const stored = localStorage.getItem('user_info');
    if (stored) setUserInfo(JSON.parse(stored));
  }, []);

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
    : 0;
  const estimatedTotal = listing && days ? days * Number(listing.price_per_day) : 0;

  const handleBook = async () => {
    setError('');

    if (!localStorage.getItem('user_token')) {
      router.push('/login');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please choose your start and end dates.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after the start date.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('user_token');
      const api = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });

      const bookingRes = await api.post('/bookings', { listing_id: id, start_date: startDate, end_date: endDate });
      const bookingId = bookingRes.data.booking.id;

      const payRes = await api.post(`/payments/initiate/${bookingId}`);
      redirectToPayHere(payRes.data);
      // Note: the page navigates away here, so `loading` intentionally stays true.
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <div className="container">
        <p className="form-error" style={{ marginTop: 24 }}>This listing couldn&apos;t be found.</p>
        <Link href="/">← Back to browsing</Link>
      </div>
    );
  }

  if (!listing) {
    return <div className="container"><p style={{ paddingTop: 24 }}>Loading…</p></div>;
  }

  return (
    <div className="container">
      <nav className="topnav">
        <Link href="/" className="wordmark">Isle Road</Link>
        <div className="nav-links">
          {userInfo ? (
            <span className="nav-welcome">Hi, {userInfo.full_name}</span>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </nav>

      <div style={{ marginBottom: 16 }}>
        <Link href="/" style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>← Back to browsing</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 36, paddingBottom: 60 }}>
        <div>
          <img
            src={listing.images?.[0] || 'https://via.placeholder.com/700x400?text=Isle+Road'}
            alt={listing.title}
            style={{ width: '100%', height: 360, objectFit: 'cover', borderRadius: 14 }}
          />

          {listing.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {listing.images.slice(1).map((img, i) => (
                <img key={i} src={img} alt="" style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8 }} />
              ))}
            </div>
          )}

          <span className={`listing-badge ${BADGE_CLASS[listing.listing_type] || ''}`} style={{ marginTop: 20 }}>
            {BADGE_LABEL[listing.listing_type] || listing.listing_type}
          </span>
          <h1 style={{ marginTop: 8, fontSize: '1.8rem' }}>{listing.title}</h1>
          {listing.location_name && <p className="listing-location">{listing.location_name}</p>}

          {listing.description && (
            <p style={{ marginTop: 18, color: 'var(--ink-muted)', lineHeight: 1.6 }}>{listing.description}</p>
          )}

          <div style={{ marginTop: 18, display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
            {listing.capacity && (
              <span><strong style={{ color: 'var(--ink)' }}>{listing.capacity}</strong> {listing.listing_type === 'stay' ? 'guests max' : 'seats'}</span>
            )}
            {listing.vehicle_type && <span><strong style={{ color: 'var(--ink)' }}>Type:</strong> {listing.vehicle_type}</span>}
            {listing.amenities && <span><strong style={{ color: 'var(--ink)' }}>Amenities:</strong> {listing.amenities}</span>}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-sm)', alignSelf: 'start' }}>
          <p className="listing-price" style={{ fontSize: '1.4rem' }}>
            Rs. {listing.price_per_day} <span>/ day</span>
          </p>

          <div className="form-stack" style={{ marginTop: 16 }}>
            <span className="field-label">Start date</span>
            <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

            <span className="field-label">End date</span>
            <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

            {days > 0 && (
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
                {days} day{days > 1 ? 's' : ''} · Estimated total <strong style={{ color: 'var(--ink)' }}>Rs. {estimatedTotal}</strong>
              </p>
            )}

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary btn-block" onClick={handleBook} disabled={loading}>
              {loading ? 'Redirecting to payment…' : 'Book & pay'}
            </button>

            {!userInfo && (
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', textAlign: 'center' }}>
                You&apos;ll be asked to log in before paying.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
