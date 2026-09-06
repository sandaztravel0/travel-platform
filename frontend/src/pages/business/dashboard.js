import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import MultiImageUploader from '../../components/MultiImageUploader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const EMPTY_FORM = {
  listing_type: 'vehicle',
  title: '',
  description: '',
  price_per_day: '',
  location_id: '',
  capacity: '',
  vehicle_type: '',
  amenities: '',
  image_urls: [],
};

export default function BusinessDashboard() {
  const router = useRouter();
  const [businessInfo, setBusinessInfo] = useState(null);
  const [locations, setLocations] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const authedApi = useCallback(() => {
    const token = localStorage.getItem('business_token');
    return axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });
  }, []);

  const loadListings = useCallback(async () => {
    const api = authedApi();
    try {
      const res = await api.get('/listings/mine/all');
      setMyListings(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) router.push('/business/login');
    }
  }, [authedApi, router]);

  useEffect(() => {
    if (!localStorage.getItem('business_token')) {
      router.push('/business/login');
      return;
    }
    const info = localStorage.getItem('business_info');
    if (info) setBusinessInfo(JSON.parse(info));

    axios.get(`${API_URL}/locations`).then((res) => setLocations(res.data)).catch(() => {});
    loadListings();
  }, [loadListings, router]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogout = () => {
    localStorage.removeItem('business_token');
    localStorage.removeItem('business_info');
    router.push('/business/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    const api = authedApi();
    const { image_urls, ...listingData } = form;

    try {
      const res = await api.post('/listings', listingData);
      if (image_urls.length > 0) {
        await api.post(`/listings/${res.data.listing.id}/images`, { image_urls });
      }
      setMessage('Listing submitted! It will go live once an admin approves it.');
      setForm(EMPTY_FORM);
      loadListings();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong. Please check the form and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <nav className="topnav">
        <span className="wordmark">Isle Road</span>
        <div className="nav-links">
          {businessInfo && (
            <span className="nav-welcome">
              {businessInfo.business_name} · <StatusBadge status={businessInfo.status} />
            </span>
          )}
          <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
        </div>
      </nav>

      {businessInfo?.status !== 'approved' && (
        <p className="form-success" style={{ background: '#FBEAD6', color: '#C1622D' }}>
          Your business account is <strong>{businessInfo?.status}</strong>. You can still add listings below —
          they&apos;ll go live once both your account and the listing are approved.
        </p>
      )}

      {message && <p className={message.includes('Something') ? 'form-error' : 'form-success'}>{message}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 32, alignItems: 'start', paddingTop: 24 }}>
        <form onSubmit={handleSubmit} className="form-stack" style={{ background: '#fff', padding: 24, borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginBottom: 4 }}>Add a listing</h2>

          <span className="field-label">What are you listing?</span>
          <select className="input" name="listing_type" value={form.listing_type} onChange={handleChange}>
            <option value="vehicle">Vehicle rental</option>
            <option value="driver">Driver for hire</option>
            <option value="stay">Stay / accommodation</option>
          </select>

          <input className="input" name="title" placeholder="Title (e.g. Toyota Prius - Automatic)" required value={form.title} onChange={handleChange} />
          <textarea className="input" style={{ minHeight: 70 }} name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <input className="input" name="price_per_day" type="number" min="0" placeholder="Price per day (Rs.)" required value={form.price_per_day} onChange={handleChange} />

          <span className="field-label">Nearest destination (optional)</span>
          <select className="input" name="location_id" value={form.location_id} onChange={handleChange}>
            <option value="">Select a destination</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>

          {form.listing_type === 'vehicle' && (
            <>
              <input className="input" name="vehicle_type" placeholder="Vehicle type (car / van / tuk-tuk / bike)" value={form.vehicle_type} onChange={handleChange} />
              <input className="input" name="capacity" type="number" min="1" placeholder="Seats" value={form.capacity} onChange={handleChange} />
            </>
          )}

          {form.listing_type === 'stay' && (
            <>
              <input className="input" name="capacity" type="number" min="1" placeholder="Max guests" value={form.capacity} onChange={handleChange} />
              <textarea className="input" style={{ minHeight: 50 }} name="amenities" placeholder="Amenities (e.g. AC, WiFi, Pool)" value={form.amenities} onChange={handleChange} />
            </>
          )}

          <MultiImageUploader
            tokenKey="business_token"
            images={form.image_urls}
            onAdd={(url) => setForm((f) => ({ ...f, image_urls: [...f.image_urls, url] }))}
            onRemove={(i) => setForm((f) => ({ ...f, image_urls: f.image_urls.filter((_, idx) => idx !== i) }))}
            max={3}
            label="Photos"
          />

          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit for approval'}
          </button>
        </form>

        <div>
          <h2 style={{ marginBottom: 16 }}>My listings ({myListings.length})</h2>
          <div className="listing-grid">
            {myListings.map((item) => (
              <div key={item.id} className="listing-card">
                <img
                  className="listing-image"
                  src={item.images?.[0] || 'https://via.placeholder.com/300x180?text=Isle+Road'}
                  alt={item.title}
                />
                <div className="listing-body">
                  <StatusBadge status={item.status} />
                  <h3 className="listing-title" style={{ marginTop: 8 }}>{item.title}</h3>
                  <p className="listing-price">Rs. {item.price_per_day} <span>/ day</span></p>
                </div>
              </div>
            ))}
          </div>
          {myListings.length === 0 && <p className="empty-state">You haven&apos;t added any listings yet — use the form to add your first one.</p>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    approved: { background: '#E2ECE7', color: '#0B3D2E' },
    pending: { background: '#FCF0DA', color: '#D9911F' },
    rejected: { background: '#FDEEEA', color: '#A83E22' },
    suspended: { background: '#EFEFEF', color: '#666' },
    inactive: { background: '#EFEFEF', color: '#666' },
  };
  const style = styles[status] || styles.pending;
  return (
    <span style={{ ...style, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
      {status}
    </span>
  );
}
