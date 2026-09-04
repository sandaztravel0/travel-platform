const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ---------- BUSINESS: Create a new listing (vehicle / driver / stay) ----------
// Goes live only after admin approval (status starts as 'pending')
router.post('/', verifyToken, requireRole('business'), async (req, res) => {
  try {
    const {
      listing_type, title, description, price_per_day,
      location_id, capacity, vehicle_type, amenities,
      latitude, longitude,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO listings
        (business_id, listing_type, title, description, price_per_day, location_id, capacity, vehicle_type, amenities, latitude, longitude)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [req.user.id, listing_type, title, description, price_per_day, location_id, capacity, vehicle_type, amenities, latitude, longitude]
    );

    res.status(201).json({
      message: 'Listing submitted. It will appear on the site once an admin approves it.',
      listing: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- BUSINESS: Add images to a listing (after uploading to Cloudinary on frontend) ----------
router.post('/:id/images', verifyToken, requireRole('business'), async (req, res) => {
  try {
    const { image_urls } = req.body; // array of uploaded image URLs
    const listingId = req.params.id;

    // Make sure this listing actually belongs to the logged-in business
    const check = await pool.query('SELECT * FROM listings WHERE id=$1 AND business_id=$2', [listingId, req.user.id]);
    if (check.rows.length === 0) return res.status(403).json({ error: 'Not your listing' });

    const inserts = image_urls.map((url) =>
      pool.query('INSERT INTO listing_images (listing_id, image_url) VALUES ($1,$2)', [listingId, url])
    );
    await Promise.all(inserts);

    res.json({ message: 'Images added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- PUBLIC: Browse approved listings (with filters) ----------
router.get('/', async (req, res) => {
  try {
    const { listing_type, location_id, min_price, max_price } = req.query;

    let query = `SELECT l.*, loc.name AS location_name,
                        COALESCE(json_agg(li.image_url) FILTER (WHERE li.image_url IS NOT NULL), '[]') AS images
                 FROM listings l
                 LEFT JOIN locations loc ON l.location_id = loc.id
                 LEFT JOIN listing_images li ON li.listing_id = l.id
                 WHERE l.status = 'approved'`;
    const params = [];

    if (listing_type) { params.push(listing_type); query += ` AND l.listing_type = $${params.length}`; }
    if (location_id) { params.push(location_id); query += ` AND l.location_id = $${params.length}`; }
    if (min_price) { params.push(min_price); query += ` AND l.price_per_day >= $${params.length}`; }
    if (max_price) { params.push(max_price); query += ` AND l.price_per_day <= $${params.length}`; }

    query += ' GROUP BY l.id, loc.name ORDER BY l.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- PUBLIC: Get a single listing's details ----------
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, loc.name AS location_name,
              COALESCE(json_agg(li.image_url) FILTER (WHERE li.image_url IS NOT NULL), '[]') AS images
       FROM listings l
       LEFT JOIN locations loc ON l.location_id = loc.id
       LEFT JOIN listing_images li ON li.listing_id = l.id
       WHERE l.id = $1
       GROUP BY l.id, loc.name`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- BUSINESS: See my own listings (any status) ----------
router.get('/mine/all', verifyToken, requireRole('business'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM listings WHERE business_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
