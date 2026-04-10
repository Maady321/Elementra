import { 
  HiOutlineGlobeAlt, 
  HiOutlineDeviceMobile, 
  HiOutlineChatAlt2, 
  HiOutlineLightningBolt, 
  HiOutlinePhotograph, 
  HiOutlineMail, 
  HiOutlineCube,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineDotsHorizontal,
  HiOutlineShoppingCart,
  HiOutlineCalendar,
  HiOutlineUserGroup
} from 'react-icons/hi';
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';
import './ProjectPreview2D.css';

export default function ProjectMockup({ theme, pages, features, niche, accentColor }) {
  const themes = {
    Modern: {
      primary: accentColor || '#6366f1',
      secondary: '#a855f7',
      bg: 'linear-gradient(180deg, #0f172a 0%, #17171e 100%)',
      card: 'rgba(255, 255, 255, 0.04)',
      text: '#f8fafc',
      glow: 'rgba(99, 102, 241, 0.2)',
      font: "'Inter', sans-serif"
    },
    Minimal: {
      primary: accentColor || '#334155',
      secondary: '#64748b',
      bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      card: '#ffffff',
      text: '#1e293b',
      glow: 'rgba(0, 0, 0, 0.05)',
      font: "'Inter', sans-serif"
    },
    'Bold & Dynamic': {
      primary: accentColor || '#f97316',
      secondary: '#ef4444',
      bg: '#111827',
      card: '#1f2937',
      text: '#ffffff',
      glow: 'rgba(249, 115, 22, 0.2)',
      font: "'Outfit', sans-serif"
    },
    'Elegant & Organic': {
      primary: accentColor || '#10b981',
      secondary: '#065f46',
      bg: '#fef3c7',
      card: '#ffffff',
      text: '#064e3b',
      glow: 'rgba(16, 185, 129, 0.1)',
      font: "'Playfair Display', serif"
    }
  };

  const activeTheme = themes[theme] || themes.Modern;
  const isDark = activeTheme.bg.includes('#1') || activeTheme.bg.includes('#0') || activeTheme.bg.includes('dark');

  const getNicheContent = () => {
    switch(niche) {
      case 'gym':
        return {
          title: "Push Your Limits ⚡",
          subtitle: "Transform your body and mind with our expert-led fitness programs and state-of-the-art equipment.",
          cta: "Join Now",
          sections: [
            { icon: <HiOutlineCalendar />, title: "Class Schedules" },
            { icon: <HiOutlineUserGroup />, title: "Expert Trainers" },
            { icon: <HiOutlineLightningBolt />, title: "Personal Prep" }
          ]
        };
      case 'restaurant':
        return {
          title: "Taste the Elegance 🍽️",
          subtitle: "Savor carefully crafted dishes made with fresh, locally sourced ingredients in a cozy atmosphere.",
          cta: "Book Table",
          sections: [
            { icon: <HiOutlineDocumentText />, title: "Digital Menu" },
            { icon: <HiOutlineCalendar />, title: "Reservations" },
            { icon: <HiOutlineGlobeAlt />, title: "Our Story" }
          ]
        };
      case 'shop':
        return {
          title: "Curated Style 🛍️",
          subtitle: "Discover our latest collection of premium products designed for the modern lifestyle.",
          cta: "Shop All",
          sections: [
            { icon: <HiOutlineShoppingCart />, title: "New Arrivals" },
            { icon: <HiOutlineStar />, title: "Best Sellers" },
            { icon: <HiOutlineLightningBolt />, title: "Fast Delivery" }
          ]
        };
      default:
        return {
          title: "The Future of Brands 🚀",
          subtitle: "Crafting premium digital experiences for forward-thinking businesses and local entrepreneurs.",
          cta: "Start Project",
          sections: [
            { icon: <HiOutlineLightningBolt />, title: "Fast Loading" },
            { icon: <HiOutlineCube />, title: "Scalable Tech" },
            { icon: <HiOutlinePhotograph />, title: "Modern Design" }
          ]
        };
    }
  };

  const content = getNicheContent();
  const pageList = [
    { name: 'Home', title: content.title, desc: content.subtitle, icon: <HiOutlineLightningBolt /> },
    { name: 'Services', title: 'Our Expertise 💎', desc: 'Holistic solutions tailored for your specific business needs.', icon: <HiOutlineCube /> },
    { name: 'Contact', title: 'Let\'s Connect ✉️', desc: 'Ready to take the next step? Get in touch with us today.', icon: <HiOutlineMail /> },
  ].slice(0, pages);

  return (
    <div className="preview-wrap">
      <div className="preview-header-info">
        <div className="badge-ai-status">
          <span className="pulse-dot"></span> Generative Preview Active
        </div>
        <h2 className="preview-main-title">Instant Frontend Demo</h2>
        <p>Experience how your business looks in the {theme} architecture.</p>
      </div>

      <div className="pages-display-grid">
        {pageList.map((page, idx) => (
          <div key={idx} className="page-instance animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="page-label" style={{ color: activeTheme.primary }}>{page.name} Node</div>
            
            <div className="browser-mockup" style={{ 
              background: activeTheme.bg,
              fontFamily: activeTheme.font 
            }}>
              {/* AUTHENTIC BROWSER TOOLBAR */}
              <div className="browser-toolbar" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
                <div className="toolbar-controls">
                  <div className="dots-wrap">
                    <span className="dot dot-r"></span>
                    <span className="dot dot-y"></span>
                    <span className="dot dot-g"></span>
                  </div>
                </div>
                <div className="address-bar" style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                  color: activeTheme.text 
                }}>
                   <HiOutlineGlobeAlt className="url-icon" />
                   <span>https://{page.name.toLowerCase()}.demo.elementra.io</span>
                </div>
                <div className="toolbar-end">
                    <HiOutlineDotsHorizontal />
                </div>
              </div>

              {/* LIVE VIEWPORT */}
              <div className="website-viewport" style={{ color: activeTheme.text }}>
                <nav className="web-nav-premium">
                   <div className="web-logo" style={{ color: activeTheme.primary }}>● BRAND</div>
                   <div className="web-links-p">
                      <div className="p-link" style={{ background: activeTheme.primary }}></div>
                      <div className="p-link"></div>
                      <div className="p-link"></div>
                   </div>
                </nav>

                <div className="web-content-real">
                    <div className="hero-badge-mini" style={{ background: `${activeTheme.primary}15`, color: activeTheme.primary }}>
                      New for April 2026
                    </div>
                    <h1 className="real-title">{page.title}</h1>
                    <p className="real-text" style={{ opacity: 0.8 }}>{page.desc}</p>
                    
                    <button className="real-btn" style={{ 
                      background: activeTheme.primary, 
                      boxShadow: `0 4px 15px ${activeTheme.glow}`,
                      color: isDark ? '#fff' : '#fff'
                    }}>
                      {content.cta}
                    </button>

                    <div className="web-layout-block">
                        {page.name === 'Home' && (
                          <div className="niche-features-grid">
                            {content.sections.map((s, i) => (
                              <div key={i} className="niche-feat-card" style={{ background: activeTheme.card }}>
                                <div className="feat-icon" style={{ color: activeTheme.primary }}>{s.icon}</div>
                                <h4>{s.title}</h4>
                              </div>
                            ))}
                          </div>
                        )}
                        {page.name !== 'Home' && (
                           <div className="web-placeholder-stack">
                               <div className="p-bar" style={{ width: '80%', background: activeTheme.card }}></div>
                               <div className="p-bar" style={{ width: '60%', background: activeTheme.card }}></div>
                               <div className="p-bar" style={{ width: '90%', background: activeTheme.card }}></div>
                           </div>
                        )}
                    </div>
                </div>

                {/* ADVANCED FEATURES HUD */}
                <div className="features-hud">
                   <div className="hud-pill"><FaWhatsapp /> Chat</div>
                   <div className="hud-socials">
                      <FaInstagram />
                      <FaFacebook />
                   </div>
                </div>
              </div>
              
              <div className="browser-gloss"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HiOutlineDocumentText() {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

function HiOutlineStar() {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}
