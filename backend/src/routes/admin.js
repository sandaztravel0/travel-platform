const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// All routes below require a logged-in admin
router.use(verifyToken, requireRole('admin'));

// ---------- View pending businesses (KYC approval) ----------
router.get('/businesses/pending', async (req, res) => {
  const result = await pool.query("SELECT * FROM businesses WHERE status='pending' ORDER BY created_at");
  res.json(result.rows);
});

// ---------- Approve / Reject a business ----------
router.patch('/businesses/:id/status', async (req, res) => {
  const { status } = req.body; // 'approved' | 'rejected' | 'suspended'
  const result = await pool.query(
    'UPDATE businesses SET status=$1 WHERE id=$2 RETURNING id, business_name, status',
    [status, req.params.id]
  );
  res.json(result.rows[0]);
});

// ---------- View pending listings ----------
router.get('/listings/pending', async (req, res) => {
  const result = await pool.query(
    `SELECT l.*, b.business_name FROM listings l
     JOIN businesses b ON l.business_id = b.id
     WHERE l.status='pending' ORDER BY l.created_at`
  );
  res.json(result.rows);
});

// ---------- Approve / Reject a listing (this is what makes it go LIVE on the site) ----------
router.patch('/listings/:id/status', async (req, res) => {
  const { status } = req.body; // 'approved' | 'rejected'
  const result = await pool.query(
    'UPDATE listings SET status=$1 WHERE id=$2 RETURNING *',
    [status, req.params.id]
  );
  res.json(result.rows[0]);
});

// ---------- Add a new location (e.g. Sigiriya, Ella) ----------
router.post('/locations', async (req, res) => {
  const { name, district, description, latitude, longitude, category } = req.body;
  const result = await pool.query(
    `INSERT INTO locations (name, district, description, latitude, longitude, category)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, district, description, latitude, longitude, category]
  );
  res.status(201).json(result.rows[0]);
});

// ---------- Add images to a location ----------
router.post('/locations/:id/images', async (req, res) => {
  const { image_urls } = req.body;
  const inserts = image_urls.map((url) =>
    pool.query('INSERT INTO location_images (location_id, image_url) VALUES ($1,$2)', [req.params.id, url])
  );
  await Promise.all(inserts);
  res.json({ message: 'Images added to location' });
});

// ---------- Dashboard summary stats ----------
router.get('/stats', async (req, res) => {
  const [users, businesses, listings, bookings, revenue] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM users'),
    pool.query('SELECT COUNT(*) FROM businesses'),
    pool.query("SELECT COUNT(*) FROM listings WHERE status='approved'"),
    pool.query('SELECT COUNT(*) FROM bookings'),
    pool.query("SELECT COALESCE(SUM(commission_amount),0) AS total FROM bookings WHERE payment_status='paid'"),
  ]);

  res.json({
    total_users: Number(users.rows[0].count),
    total_businesses: Number(businesses.rows[0].count),
    live_listings: Number(listings.rows[0].count),
    total_bookings: Number(bookings.rows[0].count),
    total_commission_earned: Number(revenue.rows[0].total),
  });
});

// ---------- Pending payouts to businesses ----------
router.get('/payouts/pending', async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, b.business_name, b.bank_account_number, b.bank_name
     FROM payouts p JOIN businesses b ON p.business_id = b.id
     WHERE p.status='pending' ORDER BY p.id`
  );
  res.json(result.rows);
});

// ---------- Mark a payout as paid (after admin manually transfers via bank) ----------
router.patch('/payouts/:id/paid', async (req, res) => {
  const result = await pool.query(
    "UPDATE payouts SET status='paid', paid_at=NOW() WHERE id=$1 RETURNING *",
    [req.params.id]
  );
  res.json(result.rows[0]);
});

// ---------- View ALL locations (for admin management/editing) ----------
router.get('/locations', async (req, res) => {
  const result = await pool.query(
    `SELECT loc.*,
            COALESCE(json_agg(li.image_url) FILTER (WHERE li.image_url IS NOT NULL), '[]') AS images
     FROM locations loc
     LEFT JOIN location_images li ON li.location_id = loc.id
     GROUP BY loc.id
     ORDER BY loc.created_at DESC`
  );
  res.json(result.rows);
});

// ---------- Edit a location ----------
router.patch('/locations/:id', async (req, res) => {
  const { name, district, description, latitude, longitude, category, is_active } = req.body;
  const result = await pool.query(
    `UPDATE locations SET
       name = COALESCE($1, name),
       district = COALESCE($2, district),
       description = COALESCE($3, description),
       latitude = COALESCE($4, latitude),
       longitude = COALESCE($5, longitude),
       category = COALESCE($6, category),
       is_active = COALESCE($7, is_active)
     WHERE id=$8 RETURNING *`,
    [name, district, description, latitude, longitude, category, is_active, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Location not found' });
  res.json(result.rows[0]);
});

// ---------- Delete a location ----------
router.delete('/locations/:id', async (req, res) => {
  await pool.query('DELETE FROM locations WHERE id=$1', [req.params.id]);
  res.json({ message: 'Location deleted' });
});

// ---------- View all tourist users ----------
router.get('/users', async (req, res) => {
  const result = await pool.query(
    'SELECT id, full_name, email, phone, country, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(result.rows);
});

// ---------- View ALL businesses (any status) ----------
router.get('/businesses', async (req, res) => {
  const result = await pool.query(
    'SELECT id, owner_name, business_name, email, phone, business_type, status, created_at FROM businesses ORDER BY created_at DESC'
  );
  res.json(result.rows);
});

// ---------- View all bookings (with tourist + listing info) ----------
router.get('/bookings', async (req, res) => {
  const result = await pool.query(
    `SELECT b.*, u.full_name AS user_name, u.email AS user_email,
            l.title AS listing_title, l.listing_type, biz.business_name
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     JOIN listings l ON b.listing_id = l.id
     JOIN businesses biz ON l.business_id = biz.id
     ORDER BY b.created_at DESC
     LIMIT 200`
  );
  res.json(result.rows);
});

// ---------- Cancel a booking (admin override, e.g. for disputes) ----------
router.patch('/bookings/:id/status', async (req, res) => {
  const { status } = req.body; // 'confirmed' | 'cancelled' | 'completed'
  const result = await pool.query(
    'UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *',
    [status, req.params.id]
  );
  res.json(result.rows[0]);
});

// ---------- Get current platform settings (e.g. commission %) ----------
router.get('/settings', async (req, res) => {
  const result = await pool.query('SELECT key, value FROM settings');
  const settings = {};
  result.rows.forEach((row) => { settings[row.key] = row.value; });
  // Fall back to the .env value if nothing is set in the database yet
  if (!settings.commission_percent) {
    settings.commission_percent = process.env.COMMISSION_PERCENT || '15';
  }
  res.json(settings);
});

// ---------- Update the commission percentage (applies to all NEW bookings from now on) ----------
router.patch('/settings/commission', async (req, res) => {
  const { commission_percent } = req.body;
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('commission_percent', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1`,
    [String(commission_percent)]
  );
  res.json({ message: 'Commission updated', commission_percent });
});

module.exports = router;
