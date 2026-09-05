import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  const authedApi = useCallback(() => {
    const token = localStorage.getItem('admin_token');
    return axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });
  }, []);

  const loadBookings = useCallback(async () => {
    const api = authedApi();
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) router.push('/admin/login');
    }
  }, [authedApi, router]);

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      router.push('/admin/login');
      return;
    }
    loadBookings();
  }, [loadBookings, router]);

  const changeStatus = async (id, status) => {
    if (!confirm(`Set this booking to "${status}"?`)) return;
    const api = authedApi();
    await api.patch(`/admin/bookings/${id}/status`, { status });
    setMessage(`Booking #${id} set to ${status}.`);
    loadBookings();
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>All Bookings</h1>
        <Link href="/admin/dashboard">← Back to Dashboard</Link>
      </header>

      {message && <p style={styles.message}>{message}</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Tourist</th>
            <th style={styles.th}>Listing</th>
            <th style={styles.th}>Business</th>
            <th style={styles.th}>Dates</th>
            <th style={styles.th}>Total</th>
            <th style={styles.th}>Payment</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td style={styles.td}>{b.id}</td>
              <td style={styles.td}>{b.user_name}<br /><span style={styles.small}>{b.user_email}</span></td>
              <td style={styles.td}>{b.listing_title} <span style={styles.small}>({b.listing_type})</span></td>
              <td style={styles.td}>{b.business_name}</td>
              <td style={styles.td}>
                {new Date(b.start_date).toLocaleDateString()} → {new Date(b.end_date).toLocaleDateString()}
              </td>
              <td style={styles.td}>Rs. {b.total_price}</td>
              <td style={styles.td}><StatusBadge status={b.payment_status} /></td>
              <td style={styles.td}><StatusBadge status={b.status} /></td>
              <td style={styles.td}>
                <div style={styles.actions}>
                  {b.status !== 'cancelled' && <button style={styles.cancelBtn} onClick={() => changeStatus(b.id, 'cancelled')}>Cancel</button>}
                  {b.status !== 'completed' && <button style={styles.completeBtn} onClick={() => changeStatus(b.id, 'completed')}>Complete</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 && <p style={{ color: '#888', marginTop: 12 }}>No bookings yet.</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { paid: '#0b6', unpaid: '#e6a817', confirmed: '#0b6', pending: '#e6a817', cancelled: '#c0392b', completed: '#555', refunded: '#888' };
  return <span style={{ color: colors[status] || '#333', fontWeight: 'bold', fontSize: '0.8rem' }}>{status}</span>;
}

const styles = {
  page: { fontFamily: 'sans-serif', background: '#f5f7f6', minHeight: '100vh', padding: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  headerTitle: { margin: 0, fontSize: '1.6rem' },
  message: { background: '#e8f8f0', color: '#0b6', padding: '8px 12px', borderRadius: 8, marginBottom: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f0f0f0', fontSize: '0.8rem' },
  td: { padding: '10px 12px', borderTop: '1px solid #eee', fontSize: '0.85rem' },
  small: { fontSize: '0.75rem', color: '#888' },
  actions: { display: 'flex', gap: 6 },
  cancelBtn: { padding: '4px 10px', borderRadius: 6, border: 'none', background: '#c0392b', color: '#fff', cursor: 'pointer', fontSize: '0.78rem' },
  completeBtn: { padding: '4px 10px', borderRadius: 6, border: 'none', background: '#0b6', color: '#fff', cursor: 'pointer', fontSize: '0.78rem' },
};
