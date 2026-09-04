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

module.exports = router;
