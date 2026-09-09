import Link from 'next/link';

export default function Policies() {
  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <nav className="topnav">
        <Link href="/" className="wordmark">Isle Road</Link>
        <div className="nav-links">
          <Link href="/explore">Explore</Link>
          <Link href="/login">Log in</Link>
        </div>
      </nav>

      <h1 style={{ fontSize: '1.9rem', marginTop: 8 }}>Booking policies</h1>
      <p style={{ color: 'var(--ink-muted)', marginTop: 8, maxWidth: '60ch' }}>
        The short version: cancel with notice and you get your money back. Here are the details.
      </p>

      <div className="ornament-divider" />

      <section style={{ marginBottom: 36, maxWidth: '68ch' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Cancellations & refunds</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--ink)', lineHeight: 1.9, fontSize: '0.95rem' }}>
          <li>Cancel more than 48 hours before your booking starts: <strong>full refund</strong>.</li>
          <li>Cancel within 48 hours of your booking start: <strong>50% refund</strong>.</li>
          <li>Didn&apos;t show up and didn&apos;t cancel: no refund.</li>
          <li>If a business cancels on you for any reason, you get a <strong>full refund</strong>.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 36, maxWidth: '68ch' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Booking & payment</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--ink)', lineHeight: 1.9, fontSize: '0.95rem' }}>
          <li>Payments are processed securely through PayHere.</li>
          <li>Your booking is confirmed as soon as payment succeeds.</li>
          <li>Prices are shown in Sri Lankan Rupees (LKR), with an approximate USD conversion for reference.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 36, maxWidth: '68ch' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Trust & safety</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--ink)', lineHeight: 1.9, fontSize: '0.95rem' }}>
          <li>Every business and every listing is reviewed by our team before it appears on the site.</li>
          <li>Businesses are re-checked if a listing raises a concern.</li>
        </ul>
      </section>

      <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
        Questions about a specific booking? Reach out from your account page and we&apos;ll help sort it out.
      </p>
    </div>
  );
}
