const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');

// Cached in memory so we don't hit the external API on every page load —
// exchange rates don't move fast enough to need a fresh fetch every time.
let cachedRate = null;
let cachedAt = 0;
const CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours

// ---------- PUBLIC: Current USD -> LKR exchange rate (for showing tourists an approx. USD price) ----------
router.get('/', asyncHandler(async (req, res) => {
  const now = Date.now();

  if (!cachedRate || now - cachedAt > CACHE_MS) {
    const response = await fetch('https://api.frankfurter.dev/v2/rate/USD/LKR');
    if (!response.ok) throw new Error('Could not reach the exchange rate provider');
    const data = await response.json();
    cachedRate = data.rate;
    cachedAt = now;
  }

  res.json({ usd_to_lkr: cachedRate, updated_at: new Date(cachedAt).toISOString() });
}));

module.exports = router;
