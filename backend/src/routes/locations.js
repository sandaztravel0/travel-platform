const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ---------- PUBLIC: Browse active destinations (for the homepage "Destinations" section) ----------
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT loc.*,
              COALESCE(json_agg(li.image_url) FILTER (WHERE li.image_url IS NOT NULL), '[]') AS images
       FROM locations loc
       LEFT JOIN location_images li ON li.location_id = loc.id
       WHERE loc.is_active = true
       GROUP BY loc.id
       ORDER BY loc.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- PUBLIC: A single destination's details (for a future "destination page") ----------
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT loc.*,
              COALESCE(json_agg(li.image_url) FILTER (WHERE li.image_url IS NOT NULL), '[]') AS images
       FROM locations loc
       LEFT JOIN location_images li ON li.location_id = loc.id
       WHERE loc.id = $1
       GROUP BY loc.id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Destination not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
