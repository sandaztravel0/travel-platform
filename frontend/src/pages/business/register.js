import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function BusinessRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    owner_name: '', business_name: '', email: '', phone: '', password: '', business_type: 'vehicle',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/business/register`, form);
      router.push('/business/login?registered=1');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register your business</h1>
        <p style={styles.subtitle}>List your vehicles, driver services, or stays. An admin will review and approve your listing before it goes live.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} name="owner_name" placeholder="Your full name" required onChange={handleChange} />
          <input style={styles.input} name="business_name" placeholder="Business name" required onChange={handleChange} />
          <input style={styles.input} name="email" type="email" placeholder="Email" required onChange={handleChange} />
          <input style={styles.input} name="phone" placeholder="Phone number" required onChange={handleChange} />

          <label style={styles.label}>What do you offer?</label>
          <select style={styles.input} name="business_type" onChange={handleChange} value={form.business_type}>
            <option value="vehicle">Vehicle rental</option>
            <option value="driver">Driver for hire</option>
            <option value="stay">Stay / accommodation</option>
          </select>

          <input style={styles.input} name="password" type="password" placeholder="Password" required minLength={6} onChange={handleChange} />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Register Business'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already registered? <Link href="/business/login">Log in</Link>
        </p>
        <p style={styles.footerText}>
          Just visiting Sri Lanka? <Link href="/register">Sign up as a traveler</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7f6', fontFamily: 'sans-serif', padding: '1rem' },
  card: { background: '#fff', padding: '2rem', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: '100%', maxWidth: 440 },
  title: { margin: '0 0 4px', fontSize: '1.5rem' },
  subtitle: { color: '#666', marginBottom: '1.2rem', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: '0.85rem', color: '#444', marginTop: 4 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.95rem' },
  button: { marginTop: 8, padding: '10px', borderRadius: 8, border: 'none', background: '#0b6', color: '#fff', fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#c0392b', fontSize: '0.85rem', margin: 0 },
  footerText: { marginTop: 12, fontSize: '0.85rem', color: '#555', textAlign: 'center' },
};
