import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>404 - Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Could not find the requested resource.</p>
      <Link href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
        Return Home
      </Link>
    </div>
  );
}
