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
    <div className="auth-page">
      <div className="auth-side">
        <span className="wordmark" style={{ color: '#fff', marginBottom: 24 }}>Isle Road</span>
        <h2>Welcome back to the island.</h2>
        <p>Log in to manage your bookings and pick up your trip where you left off.</p>
      </div>
      <div className="auth-main">
        <div className="auth-card">
          <h1>Log in</h1>
          <p className="auth-subtitle">Manage your bookings and trips.</p>

          {justRegistered && <p className="form-success">Account created — please log in.</p>}

          <form onSubmit={handleSubmit} className="form-stack">
            <input className="input" name="email" type="email" placeholder="Email" required onChange={handleChange} />
            <input className="input" name="password" type="password" placeholder="Password" required onChange={handleChange} />

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="form-footer">
            Don&apos;t have an account? <Link href="/register">Sign up</Link><br />
            Business owner? <Link href="/business/login">Business login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
