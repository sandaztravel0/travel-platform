const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ---------- USER: Create a booking (before payment) ----------
router.post('/', verifyToken, requireRole('user'), async (req, res) => {
  try {
    const { listing_id, start_date, end_date } = req.body;

    // 1. Get the listing price
    const listingResult = await pool.query('SELECT * FROM listings WHERE id=$1 AND status=$2', [listing_id, 'approved']);
    const listing = listingResult.rows[0];
    if (!listing) return res.status(404).json({ error: 'Listing not available' });

    // 2. Check for overlapping bookings (no double booking)
    const overlap = await pool.query(
      `SELECT * FROM bookings WHERE listing_id=$1 AND status IN ('pending','confirmed')
       AND NOT (end_date < $2 OR start_date > $3)`,
      [listing_id, start_date, end_date]
    );
    if (overlap.rows.length > 0) {
      return res.status(400).json({ error: 'This listing is already booked for the selected dates' });
    }

    // 3. Calculate price + commission (uses the admin-configurable rate, falls back to .env)
    const days = Math.max(1, Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)));
    const totalPrice = days * Number(listing.price_per_day);

    const settingResult = await pool.query("SELECT value FROM settings WHERE key='commission_percent'");
    const commissionPercent = Number(settingResult.rows[0]?.value || process.env.COMMISSION_PERCENT || 15);

    const commissionAmount = +(totalPrice * (commissionPercent / 100)).toFixed(2);
    const payoutAmount = +(totalPrice - commissionAmount).toFixed(2);

    // 4. Create the booking (status: pending until payment succeeds)
    const result = await pool.query(
      `INSERT INTO bookings (user_id, listing_id, start_date, end_date, total_price, commission_amount, payout_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, listing_id, start_date, end_date, totalPrice, commissionAmount, payoutAmount]
    );

    res.status(201).json({ message: 'Booking created. Proceed to payment.', booking: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- USER: My bookings ----------
router.get('/mine', verifyToken, requireRole('user'), async (req, res) => {
  const result = await pool.query(
    `SELECT b.*, l.title, l.listing_type FROM bookings b
     JOIN listings l ON b.listing_id = l.id
     WHERE b.user_id=$1 ORDER BY b.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
});

// ---------- BUSINESS: Bookings for my listings ----------
router.get('/business/mine', verifyToken, requireRole('business'), async (req, res) => {
  const result = await pool.query(
    `SELECT b.*, l.title FROM bookings b
     JOIN listings l ON b.listing_id = l.id
     WHERE l.business_id=$1 ORDER BY b.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
});

// ---------- Update live location during an active booking (driver's app calls this) ----------
router.post('/:id/location', verifyToken, requireRole('business'), async (req, res) => {
  const { latitude, longitude } = req.body;
  await pool.query(
    'INSERT INTO live_locations (booking_id, latitude, longitude) VALUES ($1,$2,$3)',
    [req.params.id, latitude, longitude]
  );
  res.json({ message: 'Location updated' });
});

// ---------- USER: Get current live location for their active booking ----------
router.get('/:id/location', verifyToken, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM live_locations WHERE booking_id=$1 ORDER BY updated_at DESC LIMIT 1',
    [req.params.id]
  );
  res.json(result.rows[0] || null);
});

module.exports = router;
