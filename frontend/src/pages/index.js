import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import HeroArt from '../components/HeroArt';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'vehicle', label: 'Vehicles' },
  { value: 'driver', label: 'Drivers' },
  { value: 'stay', label: 'Stays' },
];

const BADGE_CLASS = { vehicle: 'badge-vehicle', driver: 'badge-driver', stay: 'badge-stay' };
const BADGE_LABEL = { vehicle: 'Vehicle', driver: 'Driver', stay: 'Stay' };

export default function Home() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [filter, setFilter] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/listings`, { params: filter ? { listing_type: filter } : {} })
      .then((res) => setListings(res.data))
      .catch((err) => console.error(err));
  }, [filter]);

  useEffect(() => {
    axios
      .get(`${API_URL}/locations`)
      .then((res) => setDestinations(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    const storedBusiness = localStorage.getItem('business_info');
    if (storedUser) setUserInfo(JSON.parse(storedUser));
    if (storedBusiness) setBusinessInfo(JSON.parse(storedBusiness));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('business_token');
    localStorage.removeItem('business_info');
    setUserInfo(null);
    setBusinessInfo(null);
    router.reload();
  };

  return (
    <div className="container">
      <nav className="topnav">
        <span className="wordmark">Isle Road</span>
        <div className="nav-links">
          {userInfo ? (
            <>
              <span className="nav-welcome">Hi, {userInfo.full_name}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : businessInfo ? (
            <>
              <span className="nav-welcome">{businessInfo.business_name} · {businessInfo.status}</span>
              <Link href="/business/dashboard">My listings</Link>
              <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link href="/business/register">List your business</Link>
              <Link href="/login">Log in</Link>
              <Link href="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <div>
          <h1>Sri Lanka, without the guesswork.</h1>
          <p>
            Book reviewed vehicles, drivers, and stays across the island —
            then plan the roads between them, all in one place.
          </p>
        </div>
        <HeroArt />
      </section>

      <div className="trust-strip">
        <span><strong>Reviewed by hand</strong> — every listing checked before it goes live</span>
        <span><strong>Pay safely</strong> — bookings go through PayHere</span>
        <span><strong>Real support</strong> — help on the ground if plans change</span>
      </div>

      {destinations.length > 0 && (
        <>
          <div className="section-heading">
            <h2>Destinations</h2>
          </div>
          <div className="destination-scroll">
            {destinations.map((loc) => (
              <div key={loc.id} className="destination-card">
                <img
                  className="destination-image"
                  src={loc.images?.[0] || 'https://via.placeholder.com/180x130?text=Isle+Road'}
                  alt={loc.name}
                />
                <p className="destination-name">{loc.name}</p>
                <p className="destination-district">{loc.district}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-heading">
        <h2>Available now</h2>
      </div>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-pill ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {listings.length > 0 ? (
        <div className="listing-grid">
          {listings.map((item) => (
            <Link key={item.id} href={`/listing/${item.id}`} className="listing-card">
              <img
                className="listing-image"
                src={item.images?.[0] || 'https://via.placeholder.com/300x180?text=Isle+Road'}
                alt={item.title}
              />
              <div className="listing-body">
                <span className={`listing-badge ${BADGE_CLASS[item.listing_type] || ''}`}>
                  {BADGE_LABEL[item.listing_type] || item.listing_type}
                </span>
                <h3 className="listing-title">{item.title}</h3>
                <p className="listing-location">{item.location_name}</p>
                <p className="listing-price">Rs. {item.price_per_day} <span>/ day</span></p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="empty-state">No listings in this category yet — try another, or check back soon.</p>
      )}
    </div>
  );
}
