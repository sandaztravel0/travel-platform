import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CATEGORY_LABEL = {
  historical: 'Historical', 'hill-country': 'Hill Country', beach: 'Beach', wildlife: 'Wildlife', city: 'City',
};

// Turns a YouTube watch/share URL into an embeddable URL. Returns null for anything
// that isn't recognisably YouTube, so we can fall back to a plain link instead.
function toYoutubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed${u.pathname}`;
    if (u.hostname.includes('youtube.com')) {
      if (u.searchParams.get('v')) return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
      if (u.pathname.startsWith('/embed/')) return url;
    }
  } catch {
    return null;
  }
  return null;
}

export default function DestinationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [destination, setDestination] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_URL}/locations/${id}`).then((res) => setDestination(res.data)).catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    const stored = localStorage.getItem('favorite_destinations');
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const next = prev.includes(destination.id) ? prev.filter((f) => f !== destination.id) : [...prev, destination.id];
      localStorage.setItem('favorite_destinations', JSON.stringify(next));
      return next;
    });
  };

  if (notFound) {
    return (
      <div className="container">
        <p className="form-error" style={{ marginTop: 24 }}>This destination couldn&apos;t be found.</p>
        <Link href="/explore">← Back to Explore</Link>
      </div>
    );
  }

  if (!destination) {
    return <div className="container"><p style={{ paddingTop: 24 }}>Loading…</p></div>;
  }

  const images = destination.images?.length ? destination.images : ['https://via.placeholder.com/900x500?text=Isle+Road'];
  const todoList = (destination.things_to_do || '').split('\n').map((line) => line.trim()).filter(Boolean);
  const embedUrl = toYoutubeEmbed(destination.video_url);

  return (
    <div className="container">
      <nav className="topnav">
        <Link href="/" className="wordmark">Isle Road</Link>
        <div className="nav-links">
          <Link href="/explore">Explore</Link>
          <Link href="/login">Log in</Link>
          <Link href="/register" className="btn btn-primary">Sign up</Link>
        </div>
      </nav>

      <div style={{ marginBottom: 16 }}>
        <Link href="/explore" style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>← Back to Explore</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 36, paddingBottom: 60 }}>
        <div>
          <div style={{ position: 'relative' }}>
            <img
              src={images[activeImage]}
              alt={destination.name}
              style={{ width: '100%', height: 380, objectFit: 'cover', borderRadius: 14 }}
            />
            {destination.best_time && <span className="best-time-badge" style={{ fontSize: '0.78rem' }}>{destination.best_time}</span>}
            <button className="favorite-btn" onClick={toggleFavorite} aria-label="Save to favorites">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.includes(destination.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
            </button>
          </div>

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setActiveImage(i)}
                  style={{
                    width: 84, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                    border: i === activeImage ? '2px solid var(--gold)' : '2px solid transparent',
                  }}
                />
              ))}
            </div>
          )}

          <span className="explore-card-tag" style={{ display: 'block', marginTop: 22 }}>
            {destination.district}{destination.district && CATEGORY_LABEL[destination.category] ? ' · ' : ''}{CATEGORY_LABEL[destination.category] || ''}
          </span>
          <h1 style={{ marginTop: 6, fontSize: '2rem' }}>{destination.name}</h1>

          {destination.description && (
            <p style={{ marginTop: 16, color: 'var(--ink-muted)', lineHeight: 1.65, fontSize: '1.02rem' }}>
              {destination.description}
            </p>
          )}

          {embedUrl && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 12 }}>Watch</h3>
              <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 14, overflow: 'hidden' }}>
                <iframe
                  src={embedUrl}
                  title={`${destination.name} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-sm)', alignSelf: 'start' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 4 }}>What to do here</h3>
          {todoList.length > 0 ? (
            <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todoList.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.92rem', color: 'var(--ink)' }}>
                  <span style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>·</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: 8 }}>No activities listed yet.</p>
          )}

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: 10 }}>
              Planning a trip here? Browse vehicles, drivers, and stays nearby.
            </p>
            <Link href={`/?location=${destination.id}`} className="btn btn-dark btn-block">
              Browse listings near {destination.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
