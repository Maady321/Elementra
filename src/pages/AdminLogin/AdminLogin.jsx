import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineArrowRight, HiOutlineExclamation } from 'react-icons/hi';
import toast from 'react-hot-toast';

import logoImg from '../../assets/logo.png';
import './AdminLogin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessKey = searchParams.get('key');
  const isAuthorizedURL = accessKey === import.meta.env.VITE_ADMIN_ACCESS_KEY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('elementra_admin_user', data.username);
        toast.success('Admin authenticated successfully');
        navigate('/admin/dashboard');
      } else {
        toast.error(data.error || 'Invalid admin credentials. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while verifying the credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorizedURL) {
    return (
      <div className="admin-login admin-login--denied">
        <div className="admin-login__card" style={{textAlign: 'center', maxWidth: '400px'}}>
          <HiOutlineExclamation size={48} color="#ef4444" style={{marginBottom: '1rem'}} />
          <h2 className="admin-login__title">404 Not Found</h2>
          <p className="admin-login__subtitle">The page you're looking for was moved or doesn't exist.</p>
          <Link to="/" className="btn btn-primary" style={{marginTop: '1.5rem', display: 'inline-block'}}>Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login">
      <div className="admin-login__bg">
        <div className="admin-login__orb admin-login__orb--1"></div>
        <div className="admin-login__orb admin-login__orb--2"></div>
        <div className="admin-login__grid"></div>
      </div>

      <div className="admin-login__container">
        <div className="admin-login__card">
          <div className="admin-login__header">
            <Link to="/" className="admin-login__logo-wrap">
              <img src={logoImg} alt="Elementra" className="admin-login__logo-img" />
            </Link>
            <h1 className="admin-login__title">Admin Panel</h1>
            <p className="admin-login__subtitle">Secure access for administrators only</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login__form">
            <div className="form-group">
              <label className="form-label">Admin Username</label>
              <div className="admin-login__input-wrap">
                <HiOutlineUser className="admin-login__input-icon" />
                <input
                  type="text"
                  className="form-input admin-login__input"
                  placeholder="admin_elementra"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="admin-login__input-wrap">
                <HiOutlineLockClosed className="admin-login__input-icon" />
                <input
                  type="password"
                  className="form-input admin-login__input"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg admin-login__submit"
              disabled={loading}
            >
              {loading ? (
                <span className="admin-login__spinner"></span>
              ) : (
                <>
                  Access Admin Panel <HiOutlineArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="admin-login__footer">
            <Link to="/login">← Back to Client Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
