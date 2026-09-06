import Link from 'next/link';

export default function PaymentSuccess() {
  return (
    <div className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <h1 style={{ fontSize: '1.8rem' }}>Booking confirmed 🎉</h1>
        <p style={{ color: 'var(--ink-muted)', marginTop: 12, lineHeight: 1.6 }}>
          Your payment went through and your booking is confirmed. The business will be in touch with the details.
        </p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
