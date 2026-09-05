import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [message, setMessage] = useState('');

  // Builds an authenticated axios call using the saved admin token
  const authedApi = useCallback(() => {
    const token = localStorage.getItem('admin_token');
    return axios.create({
      baseURL: API_URL,
      headers: { Authorization: `Bearer ${token}` },
    });
  }, []);

  const loadAll = useCallback(async () => {
    const api = authedApi();
    try {
      const [statsRes, bizRes, listingRes, payoutRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/businesses/pending'),
        api.get('/admin/listings/pending'),
        api.get('/admin/payouts/pending'),
      ]);
      setStats(statsRes.data);
      setPendingBusinesses(bizRes.data);
      setPendingListings(listingRes.data);
      setPendingPayouts(payoutRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/admin/login');
      }
    }
  }, [authedApi, router]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const info = localStorage.getItem('admin_info');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    if (info) setAdminInfo(JSON.parse(info));
    loadAll();
  }, [loadAll, router]);

  const handleBusinessAction = async (id, status) => {
    const api = authedApi();
    await api.patch(`/admin/businesses/${id}/status`, { status });
    setMessage(`Business ${status}.`);
    loadAll();
  };

  const handleListingAction = async (id, status) => {
    const api = authedApi();
    await api.patch(`/admin/listings/${id}/status`, { status });
    setMessage(`Listing ${status}.`);
    loadAll();
  };

  const handlePayoutPaid = async (id) => {
    const api = authedApi();
    await api.patch(`/admin/payouts/${id}/paid`);
    setMessage('Payout marked as paid.');
    loadAll();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    router.push('/admin/login');
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Admin Dashboard</h1>
        <div>
          {adminInfo && <span style={{ marginRight: 16 }}>Hi, {adminInfo.name}</span>}
          <button style={styles.logoutButton} onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <nav style={styles.quickLinks}>
        <Link href="/admin/locations" style={styles.quickLink}>📍 Manage Locations</Link>
        <Link href="/admin/users" style={styles.quickLink}>👥 Users & Businesses</Link>
        <Link href="/admin/bookings" style={styles.quickLink}>📖 All Bookings</Link>
        <Link href="/admin/settings" style={styles.quickLink}>⚙️ Settings</Link>
      </nav>

      {message && <p style={styles.message}>{message}</p>}

      {/* Stats */}
      {stats && (
        <div style={styles.statsGrid}>
          <StatCard label="Users" value={stats.total_users} />
          <StatCard label="Businesses" value={stats.total_businesses} />
          <StatCard label="Live Listings" value={stats.live_listings} />
          <StatCard label="Bookings" value={stats.total_bookings} />
          <StatCard label="Commission Earned" value={`Rs. ${stats.total_commission_earned}`} />
        </div>
      )}

      {/* Pending Businesses */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Pending Business Approvals ({pendingBusinesses.length})</h2>
        {pendingBusinesses.length === 0 && <p style={styles.empty}>Nothing waiting for approval.</p>}
        {pendingBusinesses.map((biz) => (
          <div key={biz.id} style={styles.row}>
            <div>
              <strong>{biz.business_name}</strong> ({biz.business_type}) — {biz.owner_name}
              <div style={styles.meta}>{biz.email} · {biz.phone}</div>
            </div>
            <div style={styles.actions}>
              <button style={styles.approveBtn} onClick={() => handleBusinessAction(biz.id, 'approved')}>Approve</button>
              <button style={styles.rejectBtn} onClick={() => handleBusinessAction(biz.id, 'rejected')}>Reject</button>
            </div>
          </div>
        ))}
      </section>

      {/* Pending Listings */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Pending Listing Approvals ({pendingListings.length})</h2>
        {pendingListings.length === 0 && <p style={styles.empty}>Nothing waiting for approval.</p>}
        {pendingListings.map((listing) => (
          <div key={listing.id} style={styles.row}>
            <div>
              <strong>{listing.title}</strong> ({listing.listing_type}) — by {listing.business_name}
              <div style={styles.meta}>Rs. {listing.price_per_day} / day</div>
            </div>
            <div style={styles.actions}>
              <button style={styles.approveBtn} onClick={() => handleListingAction(listing.id, 'approved')}>Approve</button>
              <button style={styles.rejectBtn} onClick={() => handleListingAction(listing.id, 'rejected')}>Reject</button>
            </div>
          </div>
        ))}
      </section>

      {/* Pending Payouts */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Pending Payouts to Businesses ({pendingPayouts.length})</h2>
        {pendingPayouts.length === 0 && <p style={styles.empty}>No payouts waiting.</p>}
        {pendingPayouts.map((payout) => (
          <div key={payout.id} style={styles.row}>
            <div>
              <strong>{payout.business_name}</strong> — Rs. {payout.amount}
              <div style={styles.meta}>{payout.bank_name} · {payout.bank_account_number}</div>
            </div>
            <div style={styles.actions}>
              <button style={styles.approveBtn} onClick={() => handlePayoutPaid(payout.id)}>Mark as Paid</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'sans-serif', background: '#f5f7f6', minHeight: '100vh', padding: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  headerTitle: { margin: 0, fontSize: '1.6rem' },
  quickLinks: { display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' },
  quickLink: { padding: '8px 14px', borderRadius: 8, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textDecoration: 'none', color: '#333', fontSize: '0.9rem' },
  logoutButton: { padding: '6px 14px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' },
  message: { background: '#e8f8f0', color: '#0b6', padding: '8px 12px', borderRadius: 8, marginBottom: '1rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: '2rem' },
  statCard: { background: '#fff', borderRadius: 10, padding: '1rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  statValue: { fontSize: '1.4rem', fontWeight: 'bold' },
  statLabel: { fontSize: '0.8rem', color: '#666', marginTop: 4 },
  section: { background: '#fff', borderRadius: 10, padding: '1.2rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { margin: '0 0 1rem', fontSize: '1.1rem' },
  empty: { color: '#888', fontSize: '0.9rem' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
  meta: { fontSize: '0.8rem', color: '#777', marginTop: 2 },
  actions: { display: 'flex', gap: 8 },
  approveBtn: { padding: '6px 14px', borderRadius: 6, border: 'none', background: '#0b6', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' },
  rejectBtn: { padding: '6px 14px', borderRadius: 6, border: 'none', background: '#c0392b', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' },
};
