import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <span>© {new Date().getFullYear()} Isle Road</span>
        <Link href="/policies">Cancellation & booking policy</Link>
      </div>
    </footer>
  );
}
