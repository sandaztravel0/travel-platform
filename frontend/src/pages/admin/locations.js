import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import ImageUploader from '../../components/ImageUploader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminLocations() {
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ name: '', district: '', description: '', category: '', latitude: '', longitude: '', image_url: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const authedApi = useCallback(() => {
    const token = localStorage.getItem('admin_token');
    return axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });
  }, []);

  const loadLocations = useCallback(async () => {
    const api = authedApi();
    try {
      const res = await api.get('/admin/locations');
      setLocations(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) router.push('/admin/login');
    }
  }, [authedApi, router]);

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      router.push('/admin/login');
      return;
    }
    loadLocations();
  }, [loadLocations, router]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: '', district: '', description: '', category: '', latitude: '', longitude: '', image_url: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const api = authedApi();
    const { image_url, ...locationData } = form;

    try {
      if (editingId) {
        await api.patch(`/admin/locations/${editingId}`, locationData);
        setMessage('Location updated.');
      } else {
        const res = await api.post('/admin/locations', locationData);
        if (image_url) {
          await api.post(`/admin/locations/${res.data.id}/images`, { image_urls: [image_url] });
        }
        setMessage('Location added.');
      }
      resetForm();
      loadLocations();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong.');
    }
  };

  const handleEdit = (loc) => {
    setForm({
      name: loc.name || '', district: loc.district || '', description: loc.description || '',
      category: loc.category || '', latitude: loc.latitude || '', longitude: loc.longitude || '', image_url: '',
    });
    setEditingId(loc.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this location?')) return;
    const api = authedApi();
    await api.delete(`/admin/locations/${id}`);
    loadLocations();
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Manage Locations</h1>
        <Link href="/admin/dashboard">← Back to Dashboard</Link>
      </header>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.layout}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>{editingId ? 'Edit Location' : 'Add New Location'}</h2>
          <input style={styles.input} name="name" placeholder="Location name (e.g. Sigiriya)" value={form.name} required onChange={handleChange} />
          <input style={styles.input} name="district" placeholder="District" value={form.district} onChange={handleChange} />
          <select style={styles.input} name="category" value={form.category} onChange={handleChange}>
            <option value="">Category</option>
            <option value="beach">Beach</option>
            <option value="historical">Historical</option>
            <option value="hill-country">Hill Country</option>
            <option value="wildlife">Wildlife</option>
            <option value="city">City</option>
          </select>
          <textarea style={{ ...styles.input, minHeight: 70 }} name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={styles.input} type="number" step="any" name="latitude" placeholder="Latitude (optional, e.g. 7.9570)" value={form.latitude} onChange={handleChange} />
            <input style={styles.input} type="number" step="any" name="longitude" placeholder="Longitude (optional, e.g. 80.7603)" value={form.longitude} onChange={handleChange} />
          </div>
          {!editingId && (
            <ImageUploader
              tokenKey="admin_token"
              value={form.image_url}
              onUploaded={(url) => setForm({ ...form, image_url: url })}
              label="Location photo"
            />
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={styles.saveBtn} type="submit">{editingId ? 'Update' : 'Add Location'}</button>
            {editingId && <button style={styles.cancelBtn} type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        <div style={styles.list}>
          {locations.map((loc) => (
            <div key={loc.id} style={styles.card}>
              <img
                src={loc.images?.[0] || 'https://via.placeholder.com/300x150?text=No+Image'}
                alt={loc.name}
                style={styles.cardImage}
              />
              <div style={styles.cardBody}>
                <strong>{loc.name}</strong>
                <div style={styles.meta}>{loc.district} · {loc.category}</div>
                <div style={styles.actions}>
                  <button style={styles.editBtn} onClick={() => handleEdit(loc)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(loc.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {locations.length === 0 && <p style={{ color: '#888' }}>No locations added yet.</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'sans-serif', background: '#f5f7f6', minHeight: '100vh', padding: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  headerTitle: { margin: 0, fontSize: '1.6rem' },
  message: { background: '#e8f8f0', color: '#0b6', padding: '8px 12px', borderRadius: 8, marginBottom: '1rem' },
  layout: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' },
  form: { background: '#fff', borderRadius: 10, padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  formTitle: { margin: '0 0 4px', fontSize: '1.1rem' },
  input: { padding: '9px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  saveBtn: { flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: '#0b6', color: '#fff', cursor: 'pointer' },
  cancelBtn: { padding: '9px 14px', borderRadius: 8, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' },
  list: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 },
  card: { background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardImage: { width: '100%', height: 120, objectFit: 'cover' },
  cardBody: { padding: '0.8rem' },
  meta: { fontSize: '0.8rem', color: '#777', margin: '4px 0 8px' },
  actions: { display: 'flex', gap: 8 },
  editBtn: { padding: '4px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' },
  deleteBtn: { padding: '4px 10px', borderRadius: 6, border: 'none', background: '#c0392b', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' },
};
