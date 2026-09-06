import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'historical', label: 'Historical' },
  { value: 'hill-country', label: 'Hill Country' },
  { value: 'beach', label: 'Beach' },
  { value: 'wildlife', label: 'Wildlife' },
  { value: 'city', label: 'City' },
];

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

export default function Explore() {
  const [destinations, setDestinations] = useState([]);
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/locations`).then((res) => setDestinations(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('favorite_destinations');
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem('favorite_destinations', JSON.stringify(next));
      return next;
    });
  };

  const districts = useMemo(
    () => [...new Set(destinations.map((d) => d.district).filter(Boolean))].sort(),
    [destinations]
  );

  const filtered = destinations.filter((d) => {
    if (category && d.category !== category) return false;
    if (district && d.district !== district) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container">
      <nav className="topnav">
        <Link href="/" className="wordmark">Isle Road</Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/login">Log in</Link>
          <Link href="/register" className="btn btn-primary">Sign up</Link>
        </div>
      </nav>

      <div style={{ paddingTop: 8, paddingBottom: 4 }}>
        <h1 style={{ fontSize: '2rem' }}>Explore destinations</h1>
        <p style={{ color: 'var(--ink-muted)', marginTop: 8 }}>Places worth building your trip around.</p>
      </div>

      <div className="ornament-divider" />

      <div className="filter-row">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`filter-pill ${category === c.value ? 'active' : ''}`}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="explore-toolbar">
        <div className="explore-search">
          <SearchIcon />
          <input placeholder="Search destinations…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <select className="explore-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <div className="view-toggle">
          <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>Grid</button>
          <button disabled title="Map view is coming soon">Map</button>
        </div>
      </div>

      <p className="result-count">{filtered.length} destination{filtered.length !== 1 ? 's' : ''}</p>

      {filtered.length > 0 ? (
        <div className="explore-grid">
          {filtered.map((d) => (
            <div key={d.id} className="explore-card">
              <div className="explore-card-media">
                <img
                  className="explore-card-image"
                  src={d.images?.[0] || 'https://via.placeholder.com/400x260?text=Isle+Road'}
                  alt={d.name}
                />
                {d.best_time && <span className="best-time-badge">{d.best_time}</span>}
                <button
                  className="favorite-btn"
                  onClick={() => toggleFavorite(d.id)}
                  aria-label="Save to favorites"
                >
                  <HeartIcon filled={favorites.includes(d.id)} />
                </button>
              </div>
              <div className="explore-card-body">
                <span className="explore-card-tag">{d.district}{d.district && CATEGORY_LABEL[d.category] ? ' · ' : ''}{CATEGORY_LABEL[d.category] || ''}</span>
                <h3 className="explore-card-name">{d.name}</h3>
                {d.description && <p className="explore-card-desc">{d.description}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No destinations match those filters yet.</p>
      )}
    </div>
  );
}
