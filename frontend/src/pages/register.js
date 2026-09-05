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
      router.push('/login?registered=1');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <span className="wordmark" style={{ color: '#fff', marginBottom: 24 }}>Isle Road</span>
        <h2>Your trip, held together in one place.</h2>
        <p>Save your bookings, message drivers and hosts, and plan the route between them.</p>
      </div>
      <div className="auth-main">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="auth-subtitle">Sign up to book vehicles, drivers, and stays across Sri Lanka.</p>

          <form onSubmit={handleSubmit} className="form-stack">
            <input className="input" name="full_name" placeholder="Full name" required onChange={handleChange} />
            <input className="input" name="email" type="email" placeholder="Email" required onChange={handleChange} />
            <input className="input" name="phone" placeholder="Phone number" onChange={handleChange} />
            <input className="input" name="country" placeholder="Country" onChange={handleChange} />
            <input className="input" name="password" type="password" placeholder="Password" required minLength={6} onChange={handleChange} />

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="form-footer">
            Already have an account? <Link href="/login">Log in</Link><br />
            Own a vehicle, drive, or run a stay? <Link href="/business/register">Register as a business</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
