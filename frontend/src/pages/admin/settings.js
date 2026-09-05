import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminSettings() {
  const router = useRouter();
  const [commission, setCommission] = useState('');
  const [message, setMessage] = useState('');

  const authedApi = useCallback(() => {
    const token = localStorage.getItem('admin_token');
    return axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });
  }, []);

  const loadSettings = useCallback(async () => {
    const api = authedApi();
    try {
      const res = await api.get('/admin/settings');
      setCommission(res.data.commission_percent);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) router.push('/admin/login');
    }
  }, [authedApi, router]);

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      router.push('/admin/login');
      return;
    }
    loadSettings();
  }, [loadSettings, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    const api = authedApi();
    await api.patch('/admin/settings/commission', { commission_percent: commission });
    setMessage('Commission rate updated. This applies to new bookings from now on.');
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Platform Settings</h1>
        <Link href="/admin/dashboard">← Back to Dashboard</Link>
      </header>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Commission Rate</h2>
        <p style={styles.desc}>
          This is the percentage of each booking your platform keeps. The rest is paid out to the business.
        </p>
        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
            />
            <span style={styles.percentSign}>%</span>
          </div>
          <button style={styles.saveBtn} type="submit">Save</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'sans-serif', background: '#f5f7f6', minHeight: '100vh', padding: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  headerTitle: { margin: 0, fontSize: '1.6rem' },
  message: { background: '#e8f8f0', color: '#0b6', padding: '8px 12px', borderRadius: 8, marginBottom: '1rem' },
  card: { background: '#fff', borderRadius: 10, padding: '1.5rem', maxWidth: 420, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle: { margin: '0 0 6px', fontSize: '1.1rem' },
  desc: { color: '#666', fontSize: '0.85rem', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  inputRow: { display: 'flex', alignItems: 'center', gap: 8 },
  input: { flex: 1, padding: '9px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' },
  percentSign: { fontSize: '1rem', color: '#555' },
  saveBtn: { padding: '9px', borderRadius: 8, border: 'none', background: '#0b6', color: '#fff', cursor: 'pointer' },
};
