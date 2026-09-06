import Link from 'next/link';

export default function PaymentCancel() {
  return (
    <div className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <h1 style={{ fontSize: '1.8rem' }}>Payment cancelled</h1>
        <p style={{ color: 'var(--ink-muted)', marginTop: 12, lineHeight: 1.6 }}>
          No worries — your booking wasn&apos;t charged. You can try again whenever you&apos;re ready.
        </p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
