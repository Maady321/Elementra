import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineArrowRight, HiOutlineShieldCheck } from 'react-icons/hi';
import { supabase } from '../../lib/supabase';
import logoImg from '../../assets/logo.png';
import './AdminLogin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: isValid, error: rpcError } = await supabase.rpc('verify_admin', { 
        p_username: username, 
        p_password: password 
      });

      if (rpcError) throw rpcError;

      if (isValid) {
        localStorage.setItem('elmentra_admin', JSON.stringify({
          username: username,
          role: 'admin',
          loginTime: new Date().toISOString(),
        }));
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin credentials. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while verifying the credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = () => {
    setUsername('admin@elmentra');
    setPassword('ADm!N@e1enTra@2026');
  };

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
              <img src={logoImg} alt="Elmentra" className="admin-login__logo-img" />
            </Link>
            <h1 className="admin-login__title">Admin Panel</h1>
            <p className="admin-login__subtitle">Secure access for administrators only</p>
          </div>

          {error && (
            <div className="admin-login__alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login__form">
            <div className="form-group">
              <label className="form-label">Admin Username</label>
              <div className="admin-login__input-wrap">
                <HiOutlineUser className="admin-login__input-icon" />
                <input
                  type="text"
                  className="form-input admin-login__input"
                  placeholder="admin_elmentra"
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

          <div className="admin-login__divider"><span>quick access</span></div>

          <button
            type="button"
            onClick={handleFillCredentials}
            className="btn btn-secondary admin-login__demo-btn"
          >
            <HiOutlineShieldCheck /> Auto-fill Admin Credentials
          </button>

          <div className="admin-login__footer">
            <Link to="/login">← Back to Client Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
