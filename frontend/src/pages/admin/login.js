import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/admin/login`, form);
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_info', JSON.stringify(res.data.admin));
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Admin Login</h1>
        <p style={styles.subtitle}>Manage locations, approvals, and payouts.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} name="email" type="email" placeholder="Email" required onChange={handleChange} />
          <input style={styles.input} name="password" type="password" placeholder="Password" required onChange={handleChange} />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', fontFamily: 'sans-serif', padding: '1rem' },
  card: { background: '#fff', padding: '2rem', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.2)', width: '100%', maxWidth: 380 },
  title: { margin: '0 0 4px', fontSize: '1.5rem' },
  subtitle: { color: '#666', marginBottom: '1.2rem', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.95rem' },
  button: { marginTop: 8, padding: '10px', borderRadius: 8, border: 'none', background: '#1a1a2e', color: '#fff', fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#c0392b', fontSize: '0.85rem', margin: 0 },
};
