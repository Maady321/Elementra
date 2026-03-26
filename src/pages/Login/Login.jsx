import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowRight } from 'react-icons/hi';
import logoImg from '../../assets/logo.png';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccess('Account created! Please check your email to verify.');
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">
      <div className="login__bg">
        <div className="login__orb login__orb--1"></div>
        <div className="login__orb login__orb--2"></div>
        <div className="login__grid"></div>
      </div>

      <div className="login__container">
        <div className="login__card">
          <div className="login__header">
            <Link to="/" className="login__logo-wrap">
              <img src={logoImg} alt="Elmentra" className="login__logo-img" />
            </Link>
            <h1 className="login__title">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="login__subtitle">
              {isSignUp
                ? 'Sign up to access your project dashboard'
                : 'Sign in to view your project progress'}
            </p>
          </div>

          {error && (
            <div className="login__alert login__alert--error">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="login__alert login__alert--success">
              <span>✅</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login__form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="login__input-wrap">
                <HiOutlineMail className="login__input-icon" />
                <input
                  type="email"
                  className="form-input login__input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="login__input-wrap">
                <HiOutlineLockClosed className="login__input-icon" />
                <input
                  type="password"
                  className="form-input login__input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg login__submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login__spinner"></span>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <HiOutlineArrowRight />
                </>
              )}
            </button>
          </form>


          <div className="login__toggle">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}>
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}>
                  Sign Up
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
