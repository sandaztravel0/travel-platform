import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Handles picking and uploading any number of photos (or up to `max` if given).
// The parent decides what happens with each finished upload via onAdd —
// either queue it locally (new record not saved yet) or persist it immediately
// (editing a record that already exists).
export default function MultiImageUploader({ tokenKey, images = [], onAdd, onRemove, max, label = 'Photos' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const atMax = typeof max === 'number' && images.length >= max;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const token = localStorage.getItem(tokenKey);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onAdd(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try a smaller image or try again.');
    } finally {
      setUploading(false);
      e.target.value = ''; // lets the same filename be picked again later
    }
  };

  return (
    <div>
      <span className="field-label">{label}{typeof max === 'number' ? ` (up to ${max})` : ''}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
        {images.map((url, i) => (
          <div key={`${url}-${i}`} style={{ position: 'relative' }}>
            <img
              src={url}
              alt=""
              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #E1E8E0' }}
            />
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Remove photo"
                style={{
                  position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                  border: 'none', background: '#C0392B', color: '#fff', cursor: 'pointer', fontSize: 12,
                  lineHeight: '20px', padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {!atMax && (
          <label className="btn btn-ghost" style={{ cursor: 'pointer', margin: 0, height: 64, display: 'flex', alignItems: 'center' }}>
            {uploading ? 'Uploading…' : '+ Add photo'}
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
          </label>
        )}
      </div>
      {error && <p className="form-error" style={{ marginTop: 6 }}>{error}</p>}
    </div>
  );
}
