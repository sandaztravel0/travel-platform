const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// ---------- Generate the PayHere payment hash + details for the frontend checkout form ----------
// Frontend uses this data to open the PayHere payment popup/page
router.post('/initiate/:bookingId', verifyToken, async (req, res) => {
  try {
    const bookingResult = await pool.query(
      `SELECT b.*, u.full_name, u.email, u.phone, u.country, l.title FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN listings l ON b.listing_id = l.id
       WHERE b.id=$1`,
      [req.params.bookingId]
    );
    const booking = bookingResult.rows[0];
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const orderId = `BOOKING-${booking.id}-${Date.now()}`;
    const amount = Number(booking.total_price).toFixed(2);
    const currency = 'LKR';

    // PayHere requires a hash = MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret))
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hash = crypto
      .createHash('md5')
      .update(merchantId + orderId + amount + currency + secretHash)
      .digest('hex')
      .toUpperCase();

    // Save the order id on the booking so we can match it when PayHere notifies us
    await pool.query('UPDATE bookings SET payhere_order_id=$1 WHERE id=$2', [orderId, booking.id]);

    res.json({
      checkout_url: process.env.PAYHERE_MODE === 'live'
        ? 'https://www.payhere.lk/pay/checkout'
        : 'https://sandbox.payhere.lk/pay/checkout',
      merchant_id: merchantId,
      order_id: orderId,
      items: booking.title,
      amount,
      currency,
      hash,
      first_name: booking.full_name?.split(' ')[0] || 'Guest',
      last_name: booking.full_name?.split(' ').slice(1).join(' ') || '',
      email: booking.email,
      phone: booking.phone,
      address: 'N/A',
      city: 'Colombo',
      country: booking.country || 'Sri Lanka',
      // These URLs must be publicly accessible once deployed:
      return_url: `${process.env.APP_URL}/payment/success`,
      cancel_url: `${process.env.APP_URL}/payment/cancel`,
      notify_url: `${process.env.APP_URL}/api/payments/notify`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- PayHere calls this automatically after a payment (server-to-server webhook) ----------
// This is the ONLY place that should be trusted to mark a booking as "paid"
router.post('/notify', async (req, res) => {
  try {
    const {
      merchant_id, order_id, payhere_amount, payhere_currency,
      status_code, md5sig, payment_id,
    } = req.body;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const localSig = crypto
      .createHash('md5')
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + secretHash)
      .digest('hex')
      .toUpperCase();

    // Verify this request genuinely came from PayHere (not spoofed)
    if (localSig !== md5sig) return res.status(400).send('Invalid signature');

    if (status_code === '2') {
      // 2 = success
      const bookingResult = await pool.query('SELECT * FROM bookings WHERE payhere_order_id=$1', [order_id]);
      const booking = bookingResult.rows[0];
      if (!booking) return res.status(404).send('Booking not found');

      await pool.query(
        "UPDATE bookings SET payment_status='paid', status='confirmed' WHERE id=$1",
        [booking.id]
      );
      await pool.query(
        'INSERT INTO payments (booking_id, amount, payhere_payment_id, status) VALUES ($1,$2,$3,$4)',
        [booking.id, payhere_amount, payment_id, 'success']
      );
      // Queue a payout for the business (admin releases this later, minus commission)
      const listing = await pool.query('SELECT business_id FROM listings WHERE id=$1', [booking.listing_id]);
      await pool.query(
        'INSERT INTO payouts (business_id, booking_id, amount) VALUES ($1,$2,$3)',
        [listing.rows[0].business_id, booking.id, booking.payout_amount]
      );
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing notification');
  }
});

module.exports = router;
