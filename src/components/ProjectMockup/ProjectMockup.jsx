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
  HiOutlineDotsHorizontal
} from 'react-icons/hi';
import './ProjectPreview2D.css';

export default function ProjectMockup({ theme, pages, features }) {
  const themes = {
    Modern: {
      primary: '#6366f1',
      secondary: '#a855f7',
      bg: 'linear-gradient(180deg, #0f172a 0%, #17171e 100%)',
      card: 'rgba(255, 255, 255, 0.04)',
      text: '#f8fafc',
      glow: 'rgba(99, 102, 241, 0.2)'
    },
    Minimal: {
      primary: '#334155',
      secondary: '#64748b',
      bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      card: '#ffffff',
      text: '#1e293b',
      glow: 'rgba(0, 0, 0, 0.05)'
    },
    Light: {
      primary: '#4f46e5', // Indigo
      secondary: '#8b5cf6', // Violet
      bg: '#ffffff',
      card: '#f8fafc',
      text: '#0f172a',
      glow: 'rgba(79, 70, 229, 0.05)',
      border: 'rgba(0,0,0,0.06)'
    },
    Lavender: {
      primary: '#8b5cf6', // Violet
      secondary: '#c084fc', // Purple
      bg: '#f5f3ff', // Soft Lavender BG
      card: '#ffffff',
      text: '#4c1d95', // Deep Purple text
      glow: 'rgba(139, 92, 246, 0.1)',
      border: 'rgba(139, 92, 246, 0.1)'
    },
    Dark: {
      primary: '#ff8c00',
      secondary: '#ef4444',
      bg: 'linear-gradient(180deg, #020617 0%, #000 100%)',
      card: 'rgba(255, 255, 255, 0.02)',
      text: '#fafaf9',
      glow: 'rgba(255, 140, 0, 0.15)'
    }
  };

  const activeTheme = themes[theme] || themes.Modern;
  const isMinimal = theme === 'Minimal';

  const pageList = [
    { name: 'Home', title: 'The Future of Brands 🚀', desc: 'Crafting premium digital experiences for forward-thinking businesses.', icon: <HiOutlineLightningBolt /> },
    { name: 'Services', title: 'What We Deliver 💎', desc: 'Holistic solutions from custom development to brand identity design.', icon: <HiOutlineCube /> },
    { name: 'Portfolio', title: 'Featured Work 📸', desc: 'A gallery of high-performing websites built for local businesses.', icon: <HiOutlinePhotograph /> },
    { name: 'Contact', title: 'Get in Touch ✉️', desc: 'Start your journey today. We respond within 24 hours.', icon: <HiOutlineMail /> },
    { name: 'About', title: 'Our Mission 🌎', desc: 'Empowering local entrepreneurship with cutting-edge tech.', icon: <HiOutlineGlobeAlt /> },
    { name: 'Blog', title: 'Insights ✍️', desc: 'Latest updates from the world of web design and brand marketing.', icon: <HiOutlineDeviceMobile /> },
  ].slice(0, pages);

  return (
    <div className="preview-wrap">
      <div className="preview-header-info">
        <h3>Brand Roadmap: {pages} Node Strategy</h3>
        <p>Real-time visual visualization of your {theme.toLowerCase()} identity ecosystem.</p>
      </div>

      <div className="pages-display-grid">
        {pageList.map((page, idx) => (
          <div key={idx} className="page-instance animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="page-label" style={{ color: activeTheme.primary }}>{page.name} Node</div>
            
            <div className="browser-mockup shadow-hover" style={{ background: activeTheme.bg }}>
              {/* AUTHENTIC BROWSER TOOLBAR */}
              <div className="browser-toolbar" style={{ borderBottom: `1px solid ${isMinimal ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}` }}>
                <div className="toolbar-controls">
                  <div className="dots-wrap">
                    <span className="dot dot-r"></span>
                    <span className="dot dot-y"></span>
                    <span className="dot dot-g"></span>
                  </div>
                  <div className="nav-arrows" style={{ color: activeTheme.primary, opacity: 0.5 }}>
                    <HiChevronLeft /><HiChevronRight />
                  </div>
                </div>
                <div className="address-bar" style={{ backgroundColor: isMinimal ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', color: activeTheme.text }}>
                   <HiOutlineGlobeAlt className="url-icon" />
                   <span>https://{page.name.toLowerCase()}.elementra.io</span>
                </div>
                <div className="toolbar-end" style={{ opacity: 0.4 }}>
                    <HiOutlineDotsHorizontal />
                </div>
              </div>

              {/* LIVE VIEWPORT */}
              <div className="website-viewport" style={{ color: activeTheme.text }}>
                <nav className="web-nav-premium">
                   <div className="web-logo" style={{ color: activeTheme.primary }}>● ELEMENTRA</div>
                   <div className="web-links-p">
                      <div className="p-link" style={{ background: activeTheme.primary }}></div>
                      <div className="p-link"></div>
                      <div className="p-link"></div>
                   </div>
                </nav>

                <div className="web-content-real">
                    <h1 className="real-title">{page.title}</h1>
                    <p className="real-text">{page.desc}</p>
                    
                    <button className="real-btn" style={{ background: activeTheme.primary, boxShadow: `0 4px 15px ${activeTheme.glow}` }}>
                      Start Project
                    </button>

                    <div className="web-layout-block">
                        {page.name === 'Home' && (
                          <div className="home-visual-stack">
                             <div className="stack-card" style={{ background: activeTheme.card }}></div>
                             <div className="stack-card highlight" style={{ background: activeTheme.primary, opacity: 0.1 }}></div>
                          </div>
                        )}
                        {page.name === 'Services' && (
                           <div className="services-row">
                              {[1,2,3].map(s => <div key={s} className="s-icon-box" style={{ background: activeTheme.card }}>{page.icon}</div>)}
                           </div>
                        )}
                        {page.name === 'Portfolio' && (
                           <div className="portfolio-gallery">
                               <div className="p-img" style={{ background: activeTheme.card }}></div>
                               <div className="p-img" style={{ background: activeTheme.card }}></div>
                           </div>
                        )}
                    </div>
                </div>

                {/* ADVANCED FEATURES HUD */}
                <div className="features-hud">
                   {features.whatsapp && <div className="hud-pill"><FaWhatsapp /> Support</div>}
                   {features.booking && <div className="hud-pill"><HiOutlineCube /> Booking</div>}
                </div>
              </div>
              
              {/* REFLECTION GLOSS */}
              <div className="browser-gloss"></div>
            </div>
            
            <div className="page-shadow" style={{ background: activeTheme.glow }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaWhatsapp() {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.4 27.2 106.2 27.2h.1c122.3 0 222-99.6 222-222 0-59.3-23-115.1-65.1-157.1zM223.9 445.9c-33.1 0-65.7-8.9-94.1-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137.4c-5.5-2.8-32.6-16.1-37.7-18-5.1-1.9-8.8-2.8-12.4 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.1-3.2-5.5-.3-8.5 2.4-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.3 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.4-29.8-17-41.1-4.5-10.9-9.1-9.4-12.4-9.6-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.3-2.3-4.9-3.7-10.4-6.5z"></path>
    </svg>
  );
}
