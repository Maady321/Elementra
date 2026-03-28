import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  HiOutlineSparkles, 
  HiOutlineArrowLeft, 
  HiOutlineCheck, 
  HiOutlineCube, 
  HiOutlineColorSwatch, 
  HiOutlineDocumentText, 
  HiOutlineCurrencyRupee 
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import './AIArchitect.css';

export default function AIArchitect() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle, analyzing, results
  const [result, setResult] = useState(null);
  const scrollRef = useRef(null);

  const analyzeProject = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setStatus('analyzing');
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Keyword based "AI" logic
    const desc = description.toLowerCase();
    let pages = 3;
    let features = ['Responsive Design', 'WhatsApp Integration', 'SEO Basics'];
    let theme = 'Modern';
    let colors = ['#6366f1', '#a855f7', '#ec4899']; // Default Sunset Nebula
    let price = 3499;

    if (desc.includes('gym') || desc.includes('fitness')) {
      pages = 5;
      features.push('Class Schedule', 'Membership Tiers', 'Trainer Profiles');
      theme = 'Bold & Dynamic';
      colors = ['#f97316', '#ef4444', '#1f2937'];
      price = 5999;
    } else if (desc.includes('restaurant') || desc.includes('food') || desc.includes('cafe')) {
      pages = 4;
      features.push('Digital Menu', 'Reservation Form', 'Google Maps');
      theme = 'Elegant & Organic';
      colors = ['#10b981', '#065f46', '#fef3c7'];
      price = 4999;
    } else if (desc.includes('shop') || desc.includes('store') || desc.includes('ecommerce')) {
      pages = 6;
      features.push('Product Catalog', 'Shopping Cart', 'Payment Gateway');
      theme = 'Clean & Minimal';
      colors = ['#2563eb', '#3b82f6', '#f8fafc'];
      price = 8999;
    } else if (desc.includes('portfolio') || desc.includes('artist') || desc.includes('photographer')) {
      pages = 3;
      features.push('Image Gallery', 'Client Reviews', 'Instagram Feed');
      theme = 'Minimal & Professional';
      colors = ['#18181b', '#3f3f46', '#a1a1aa'];
      price = 3499;
    }

    setResult({
      pages,
      features,
      theme,
      colors,
      price,
      title: description.length > 30 ? description.substring(0, 30) + '...' : description
    });
    setStatus('results');
  };

  useEffect(() => {
    if (status === 'results') {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status]);

  return (
    <div className="ai-arch">
      <div className="ai-arch__bg">
        <div className="ai-arch__orb ai-arch__orb--1"></div>
        <div className="ai-arch__orb ai-arch__orb--2"></div>
      </div>

      <div className="container ai-arch__container">
        <header className="ai-arch__header">
          <Link to="/" className="ai-arch__back">
            <HiOutlineArrowLeft /> Back to Home
          </Link>
          <h1 className="ai-arch__title">
            <HiOutlineSparkles className="ai-arch__sparkle" />
            AI Project Architect
          </h1>
          <p className="ai-arch__subtitle">
            Describe your business in one paragraph, and our AI will design your digital roadmap.
          </p>
        </header>

        <section className="ai-arch__input-section card">
          <form onSubmit={analyzeProject}>
            <textarea
              className="ai-arch__textarea"
              placeholder="Example: I want to build a website for my new Crossfit Gym in Bangalore. It should show our class schedules, trainer profiles, and have a way for people to join memberships."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={status === 'analyzing'}
            ></textarea>
            
            <button 
              type="submit" 
              className={`btn btn-primary btn-lg ai-arch__submit ${status === 'analyzing' ? 'loading' : ''}`}
              disabled={status === 'analyzing' || !description.trim()}
            >
              {status === 'analyzing' ? 'Analyzing Ecosystem...' : 'Generate My Roadmap'}
            </button>
          </form>
        </section>

        {status === 'analyzing' && (
          <div className="ai-arch__loading">
            <div className="ai-arch__brain">
              <div className="ai-arch__pulse"></div>
              <HiOutlineCube size={48} />
            </div>
            <div className="ai-arch__loading-steps">
              <div className="step">Analyzing business requirements...</div>
              <div className="step">Visualizing brand identity...</div>
              <div className="step">Calculating technical scope...</div>
            </div>
          </div>
        )}

        {status === 'results' && result && (
          <div className="ai-arch__results animate-fade-up" ref={scrollRef}>
            <div className="ai-arch__grid">
              {/* Scope Card */}
              <div className="ai-arch__res-card card">
                <div className="icon-wrap"><HiOutlineDocumentText /></div>
                <h3>Project Scope</h3>
                <div className="stat">
                  <span className="val">{result.pages}</span>
                  <span className="label">Recommended Pages</span>
                </div>
                <div className="res-list">
                  {result.features.map(f => (
                    <div key={f} className="res-item"><HiOutlineCheck /> {f}</div>
                  ))}
                </div>
              </div>

              {/* Design Card */}
              <div className="ai-arch__res-card card">
                <div className="icon-wrap"><HiOutlineColorSwatch /></div>
                <h3>Design Identity</h3>
                <div className="stat">
                  <span className="val">{result.theme}</span>
                  <span className="label">Visual Style</span>
                </div>
                <div className="color-row">
                  {result.colors.map(c => (
                    <div key={c} className="color-pip" style={{ background: c }} title={c}></div>
                  ))}
                </div>
                <p className="res-desc">
                  Based on your business type, we suggest a {result.theme.toLowerCase()} look with high-contrast elements to build trust.
                </p>
              </div>

              {/* Quote Card */}
              <div className="ai-arch__res-card card ai-arch__res-card--highlight">
                <div className="icon-wrap"><HiOutlineCurrencyRupee /></div>
                <h3>Estimated Quote</h3>
                <div className="stat">
                   <span className="val">₹{result.price.toLocaleString()}</span>
                   <span className="label">Project Total</span>
                </div>
                <div className="res-info">
                  <HiOutlineCube /> Estimated Delivery: 3–5 Days
                </div>
                <div className="cta-group">
                  <a 
                    href={`https://wa.me/919746520910?text=Hi! I used your AI Architect for my business: ${result.title}. It suggested a ${result.pages} page site for ₹${result.price}. I want to discuss this!`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-whatsapp"
                  >
                    <FaWhatsapp /> Discuss on WhatsApp
                  </a>
                  <Link to="/login" className="btn btn-secondary">
                    Register to Start Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
