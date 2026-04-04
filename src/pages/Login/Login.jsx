import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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

  const handleSignIn = async (e) => {
    e.preventDefault();
    submitAuth(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    submitAuth(true);
  };

  const submitAuth = async (isSignUpAction) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUpAction) {
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
    <div className="skeuo-page">
      {/* Background elements to mimic the dark purple/blue highly animated styling */}
      <div className="bg-canvas">
        <div className="bg-orb bg-orb-purple"></div>
        <div className="bg-orb bg-orb-blue"></div>
        
        {/* Animated 3D floor perspective grid overlay */}
        <div className="bg-grid-perspective">
          <div className="bg-animated-grid"></div>
        </div>

        {/* Scrolling diagonal waves overlay */}
        <div className="bg-waves"></div>
      </div>

      <div className={`skeuo-card-master ${isSignUp ? 'is-signup' : ''}`}>
        {/* LEFT SIDE: BRANDING */}
        <div className="skeuo-card-area-left">
          <div className="brand-logo">
            <Link to="/">
              <img src={logoImg} alt="Elmentra" />
            </Link>
          </div>
          
          <div className="brand-text-area">
            <h1>Elementra<br/>Workspace</h1>
            <p>
              Welcome to the ultimate project management dashboard.
              Stay connected with your team, monitor task progress, and
              achieve your milestones. Manage your workflow efficiently.
            </p>
          </div>

          <div className="brand-footer">
            www.elmentra.com
          </div>
        </div>

        {/* CENTER DIVIDER LINE */}
        <div className="skeuo-card-divider"></div>

        {/* RIGHT SIDE: AUTHENTICATION */}
        <div className="skeuo-card-area-right">
          <h2 key={isSignUp ? 'title-up' : 'title-in'} className="auth-title">{isSignUp ? 'Register' : 'Login'}</h2>
          
          {(error || success) && (
            <div className={`auth-alert ${error ? 'error' : 'success'}`}>
              {error || success}
            </div>
          )}

          <form key={isSignUp ? 'signup' : 'login'} onSubmit={isSignUp ? handleSignUp : handleSignIn} className="auth-form-body">
            <input
              type="email"
              className="pill-input"
              placeholder="Username / Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <input
              type="password"
              className="pill-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <button type="submit" className="pill-submit" disabled={loading}>
              {loading ? 'Processing...' : (isSignUp ? 'Create' : 'Login')}
            </button>
          </form>
          
          <div className="auth-switch-link">
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}>
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
