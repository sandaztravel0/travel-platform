import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function UserLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [justRegistered, setJustRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (router.query.registered) setJustRegistered(true);
  }, [router.query]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/user/login`, form);
      // Save the login token so the user stays logged in
      localStorage.setItem('user_token', res.data.token);
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Log in to manage your bookings and trips.</p>

        {justRegistered && <p style={styles.success}>Account created! Please log in.</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} name="email" type="email" placeholder="Email" required onChange={handleChange} />
          <input style={styles.input} name="password" type="password" placeholder="Password" required onChange={handleChange} />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don&apos;t have an account? <Link href="/register">Sign up</Link>
        </p>
        <p style={styles.footerText}>
          Business owner? <Link href="/business/login">Business login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7f6', fontFamily: 'sans-serif', padding: '1rem' },
  card: { background: '#fff', padding: '2rem', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: '100%', maxWidth: 420 },
  title: { margin: '0 0 4px', fontSize: '1.5rem' },
  subtitle: { color: '#666', marginBottom: '1.2rem', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.95rem' },
  button: { marginTop: 8, padding: '10px', borderRadius: 8, border: 'none', background: '#0b6', color: '#fff', fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#c0392b', fontSize: '0.85rem', margin: 0 },
  success: { color: '#0b6', fontSize: '0.85rem', marginBottom: 8 },
  footerText: { marginTop: 12, fontSize: '0.85rem', color: '#555', textAlign: 'center' },
};
