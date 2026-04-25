import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem',
      background: 'var(--color-bg)', color: 'var(--color-text)',
      textAlign: 'center', padding: '2rem'
    }}>
      <Helmet>
        <title>404 - Page Not Found | Elementra</title>
      </Helmet>
      <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--color-primary)' }}>404</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Page Not Found</h1>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
        The page you're looking for doesn't exist or was moved to a different coordinate.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Back to Home
      </Link>
    </div>
  );
}
