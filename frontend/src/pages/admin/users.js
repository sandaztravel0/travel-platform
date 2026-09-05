import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminUsers() {
  const router = useRouter();
  const [tab, setTab] = useState('businesses'); // 'businesses' | 'users'
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [message, setMessage] = useState('');

  const authedApi = useCallback(() => {
    const token = localStorage.getItem('admin_token');
    return axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });
  }, []);

  const loadAll = useCallback(async () => {
    const api = authedApi();
    try {
      const [usersRes, bizRes] = await Promise.all([api.get('/admin/users'), api.get('/admin/businesses')]);
      setUsers(usersRes.data);
      setBusinesses(bizRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) router.push('/admin/login');
    }
  }, [authedApi, router]);

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      router.push('/admin/login');
      return;
    }
    loadAll();
  }, [loadAll, router]);

  const changeBusinessStatus = async (id, status) => {
    const api = authedApi();
    await api.patch(`/admin/businesses/${id}/status`, { status });
    setMessage(`Business set to ${status}.`);
    loadAll();
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Users & Businesses</h1>
        <Link href="/admin/dashboard">← Back to Dashboard</Link>
      </header>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.tabs}>
        <button style={tab === 'businesses' ? styles.tabActive : styles.tab} onClick={() => setTab('businesses')}>
          Businesses ({businesses.length})
        </button>
        <button style={tab === 'users' ? styles.tabActive : styles.tab} onClick={() => setTab('users')}>
          Tourists ({users.length})
        </button>
      </div>

      {tab === 'businesses' && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Business</th>
              <th style={styles.th}>Owner</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id}>
                <td style={styles.td}>{b.business_name}</td>
                <td style={styles.td}>{b.owner_name}</td>
                <td style={styles.td}>{b.business_type}</td>
                <td style={styles.td}>{b.email}</td>
                <td style={styles.td}><StatusBadge status={b.status} /></td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    {b.status !== 'approved' && <button style={styles.approveBtn} onClick={() => changeBusinessStatus(b.id, 'approved')}>Approve</button>}
                    {b.status !== 'suspended' && <button style={styles.suspendBtn} onClick={() => changeBusinessStatus(b.id, 'suspended')}>Suspend</button>}
                    {b.status !== 'rejected' && <button style={styles.rejectBtn} onClick={() => changeBusinessStatus(b.id, 'rejected')}>Reject</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'users' && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Country</th>
              <th style={styles.th}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={styles.td}>{u.full_name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.phone}</td>
                <td style={styles.td}>{u.country}</td>
                <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { approved: '#0b6', pending: '#e6a817', rejected: '#c0392b', suspended: '#888' };
  return <span style={{ color: colors[status] || '#333', fontWeight: 'bold', fontSize: '0.85rem' }}>{status}</span>;
}

const styles = {
  page: { fontFamily: 'sans-serif', background: '#f5f7f6', minHeight: '100vh', padding: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  headerTitle: { margin: 0, fontSize: '1.6rem' },
  message: { background: '#e8f8f0', color: '#0b6', padding: '8px 12px', borderRadius: 8, marginBottom: '1rem' },
  tabs: { display: 'flex', gap: 8, marginBottom: '1rem' },
  tab: { padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  tabActive: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0b6', color: '#fff', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f0f0f0', fontSize: '0.85rem' },
  td: { padding: '10px 12px', borderTop: '1px solid #eee', fontSize: '0.9rem' },
  actions: { display: 'flex', gap: 6 },
  approveBtn: { padding: '4px 10px', borderRadius: 6, border: 'none', background: '#0b6', color: '#fff', cursor: 'pointer', fontSize: '0.78rem' },
  suspendBtn: { padding: '4px 10px', borderRadius: 6, border: 'none', background: '#e6a817', color: '#fff', cursor: 'pointer', fontSize: '0.78rem' },
  rejectBtn: { padding: '4px 10px', borderRadius: 6, border: 'none', background: '#c0392b', color: '#fff', cursor: 'pointer', fontSize: '0.78rem' },
};
