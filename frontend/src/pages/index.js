import { useEffect, useState } from 'react';
import axios from 'axios';

// This is a STARTER example page showing how the frontend talks to the backend.
// It fetches approved listings (vehicles / drivers / stays) and shows them as cards.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios
      .get(`${API_URL}/listings`, { params: filter ? { listing_type: filter } : {} })
      .then((res) => setListings(res.data))
      .catch((err) => console.error(err));
  }, [filter]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Explore Sri Lanka</h1>
      <p>Find vehicles, drivers, and stays for your trip.</p>

      <div style={{ marginBottom: '1rem' }}>
        {['', 'vehicle', 'driver', 'stay'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              marginRight: 8,
              padding: '6px 14px',
              background: filter === type ? '#0b6' : '#eee',
              color: filter === type ? '#fff' : '#333',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {type === '' ? 'All' : type}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {listings.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: 10, overflow: 'hidden' }}>
            <img
              src={item.images?.[0] || 'https://via.placeholder.com/300x180?text=No+Image'}
              alt={item.title}
              style={{ width: '100%', height: 160, objectFit: 'cover' }}
            />
            <div style={{ padding: '0.8rem' }}>
              <h3 style={{ margin: '0 0 4px' }}>{item.title}</h3>
              <p style={{ margin: 0, color: '#666' }}>{item.location_name}</p>
              <p style={{ fontWeight: 'bold', marginTop: 6 }}>Rs. {item.price_per_day} / day</p>
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && <p>No listings found yet — add some via the business dashboard and approve them from admin.</p>}
    </div>
  );
}
