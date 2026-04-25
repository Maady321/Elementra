import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import logoImg from '../../assets/logo.png';
import Magnetic from '../Magnetic/Magnetic';
import './Navbar.css';

export default function Navbar() {
  // ... rest of the component
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container container">
        <Link to="/" className="navbar__logo">
          <img src={logoImg} alt="Elementra Logo" className="navbar__logo-img" />
          <div className="navbar__brand-text">
            <span className="navbar__brand-name">ELEMENTRA</span>
            <span className="navbar__brand-tagline">Balance • Strength • Creation</span>
          </div>
        </Link>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          <Magnetic>
            <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}>
              Home
            </Link>
          </Magnetic>
          <Magnetic>
            <Link to="/pricing" className={`navbar__link ${location.pathname === '/pricing' ? 'navbar__link--active' : ''}`}>Pricing</Link>
          </Magnetic>
          <Magnetic>
            <Link to="/portfolio" className={`navbar__link ${location.pathname === '/portfolio' ? 'navbar__link--active' : ''}`}>Portfolio</Link>
          </Magnetic>
          <Magnetic>
            <Link to="/contact" className={`navbar__link ${location.pathname === '/contact' ? 'navbar__link--active' : ''}`}>Contact</Link>
          </Magnetic>

          {user ? (
            <>
              <Magnetic>
                <Link to="/dashboard" className={`navbar__link ${location.pathname === '/dashboard' ? 'navbar__link--active' : ''}`}>
                  Dashboard
                </Link>
              </Magnetic>
              <Magnetic>
                <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </Magnetic>
            </>
          ) : (
            <Magnetic>
              <Link to="/login" className="btn btn-primary btn-sm">
                Client Login
              </Link>
            </Magnetic>
          )}
        </div>

        <button
          className="navbar__toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
}
