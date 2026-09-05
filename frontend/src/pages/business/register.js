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
    <div className="auth-page">
      <div className="auth-side">
        <span className="wordmark" style={{ color: '#fff', marginBottom: 24 }}>Isle Road</span>
        <h2>Reach travelers already planning their trip.</h2>
        <p>List your vehicles, driving services, or stay. Our team reviews every listing before it goes live.</p>
      </div>
      <div className="auth-main">
        <div className="auth-card">
          <h1>Register your business</h1>
          <p className="auth-subtitle">List vehicles, driver services, or stays — reviewed before going live.</p>

          <form onSubmit={handleSubmit} className="form-stack">
            <input className="input" name="owner_name" placeholder="Your full name" required onChange={handleChange} />
            <input className="input" name="business_name" placeholder="Business name" required onChange={handleChange} />
            <input className="input" name="email" type="email" placeholder="Email" required onChange={handleChange} />
            <input className="input" name="phone" placeholder="Phone number" required onChange={handleChange} />

            <span className="field-label">What do you offer?</span>
            <select className="input" name="business_type" onChange={handleChange} value={form.business_type}>
              <option value="vehicle">Vehicle rental</option>
              <option value="driver">Driver for hire</option>
              <option value="stay">Stay / accommodation</option>
            </select>

            <input className="input" name="password" type="password" placeholder="Password" required minLength={6} onChange={handleChange} />

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Register business'}
            </button>
          </form>

          <p className="form-footer">
            Already registered? <Link href="/business/login">Log in</Link><br />
            Just visiting? <Link href="/register">Sign up as a traveler</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
