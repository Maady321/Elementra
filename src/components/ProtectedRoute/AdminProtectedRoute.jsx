import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminProtectedRoute({ children }) {
  const [verified, setVerified] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch('/api/admin-validate');
        const data = await res.json();
        
        if (data.valid) {
          setVerified(true);
        } else {
          localStorage.removeItem('elementra_admin_user');
          setVerified(false);
        }
      } catch (err) {
        console.error('Admin validation failed:', err);
        setVerified(false);
      }
    };

    validateToken();
  }, []);

  if (verified === null) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem',
        background: '#030712', color: '#fff' 
      }}>
        <div className="admin-spinner"></div>
        <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Authenticating Session...</p>
        <style>{`
          .admin-spinner {
            width: 30px;
            height: 30px;
            border: 2px solid rgba(255,255,255,0.1);
            border-top-color: #10b981;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (verified === false) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
