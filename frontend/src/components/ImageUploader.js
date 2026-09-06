import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// A small file-picker that uploads straight to Cloudinary (via our backend) and
// hands the resulting hosted URL back to the parent form through onUploaded.
// tokenKey is which localStorage token to send — 'business_token' or 'admin_token'.
export default function ImageUploader({ tokenKey, value, onUploaded, label = 'Photo' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

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
      onUploaded(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try a smaller image or try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="field-label">{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
        {value && (
          <img
            src={value}
            alt="Preview"
            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #E1E8E0' }}
          />
        )}
        <label className="btn btn-ghost" style={{ cursor: 'pointer', margin: 0 }}>
          {uploading ? 'Uploading…' : value ? 'Change photo' : 'Choose photo'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      {error && <p className="form-error" style={{ marginTop: 6 }}>{error}</p>}
    </div>
  );
}
