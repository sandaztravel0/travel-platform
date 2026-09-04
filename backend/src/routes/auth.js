const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ---------- TOURIST (USER) REGISTER ----------
router.post('/user/register', async (req, res) => {
  try {
    const { full_name, email, phone, password, country } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, country)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email`,
      [full_name, email, phone, hash, country]
    );

    res.status(201).json({ message: 'Account created', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

// ---------- TOURIST (USER) LOGIN ----------
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, full_name: user.full_name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- BUSINESS REGISTER (vehicle owner / driver / stay owner) ----------
router.post('/business/register', async (req, res) => {
  try {
    const { owner_name, business_name, email, phone, password, business_type } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO businesses (owner_name, business_name, email, phone, password_hash, business_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, business_name, status`,
      [owner_name, business_name, email, phone, hash, business_type]
    );

    res.status(201).json({
      message: 'Business account created. Waiting for admin approval before you can go live.',
      business: result.rows[0],
    });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

// ---------- BUSINESS LOGIN ----------
router.post('/business/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM businesses WHERE email = $1', [email]);
    const biz = result.rows[0];

    if (!biz || !(await bcrypt.compare(password, biz.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: biz.id, role: 'business' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, business: { id: biz.id, business_name: biz.business_name, status: biz.status } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- ADMIN LOGIN ----------
// Note: Admin accounts should be created manually (via a seed script), not public registration
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = result.rows[0];

    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, admin: { id: admin.id, name: admin.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
