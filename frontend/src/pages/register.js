import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function UserRegister() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', country: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/user/register`, form);
      // Registration successful — send them to login
      router.push('/login?registered=1');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create your traveler account</h1>
        <p style={styles.subtitle}>Sign up to book vehicles, drivers, and stays across Sri Lanka.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} name="full_name" placeholder="Full name" required onChange={handleChange} />
          <input style={styles.input} name="email" type="email" placeholder="Email" required onChange={handleChange} />
          <input style={styles.input} name="phone" placeholder="Phone number" onChange={handleChange} />
          <input style={styles.input} name="country" placeholder="Country" onChange={handleChange} />
          <input style={styles.input} name="password" type="password" placeholder="Password" required minLength={6} onChange={handleChange} />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
        <p style={styles.footerText}>
          Own a vehicle, work as a driver, or run a stay?{' '}
          <Link href="/business/register">Register as a business</Link>
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
  footerText: { marginTop: 12, fontSize: '0.85rem', color: '#555', textAlign: 'center' },
};
