import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineGlobeAlt, HiOutlineDeviceMobile, HiOutlineChatAlt2, HiOutlineLightningBolt, HiOutlineCheck, HiOutlineStar, HiOutlineArrowRight, HiOutlineSparkles } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import Hero3D from '../../components/Hero3D/Hero3D';
import logoImg from '../../assets/logo.png';
import Magnetic from '../../components/Magnetic/Magnetic';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';
import PerspectiveSection from '../../components/Effects/PerspectiveSection';
import './Home.css';

function FloatingParticles() {
  const particles = Array.from({ length: 20 });
  return (
    <div className="particles-container">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="particle"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 
          }}
          animate={{ 
            y: [null, "-20%"],
            opacity: [null, 0]
          }}
          transition={{ 
            duration: Math.random() * 10 + 20, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
        />
      ))}
    </div>
  );
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  },
  viewport: { once: true, margin: "-50px" }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div 
      className="scroll-progress-bar" 
      style={{ scaleX, originX: 0 }} 
    />
  );
}

function PortfolioCard({ item }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), { stiffness: 150, damping: 20 });
  const internalX = useTransform(x, [-100, 100], [-15, 15]);
  const internalY = useTransform(y, [-100, 100], [-15, 15]);
  
  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }
  
  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      variants={itemVariants}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ 
        rotateX, 
        rotateY, 
        perspective: 1200,
        transformStyle: "preserve-3d" 
      }}
      className="portfolio__card"
    >
      <div className="portfolio__card-inner" style={{ transformStyle: "preserve-3d" }}>
        {/* LIGHT LAYER */}
        <motion.div 
          style={{ 
            x: internalX, 
            y: internalY,
            transform: "translateZ(80px)",
            opacity: 0.4
          }}
          className="portfolio__glow-layer"
        />

        <div className="portfolio__image-wrap" style={{ transform: "translateZ(40px)" }}>
          <img src={item.image} alt={item.title} className="portfolio__image" />
          <motion.div 
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="portfolio__overlay"
          >
            <span className="badge badge-primary">{item.category}</span>
          </motion.div>
        </div>

        <div className="portfolio__info" style={{ transform: "translateZ(60px)" }}>
          <h3 className="portfolio__title skeuo-text-etched">{item.title}</h3>
          <p className="portfolio__desc">{item.description}</p>
        </div>

        {/* DEPTH SHADOW LAYER */}
        <motion.div 
          style={{ 
            x: useTransform(internalX, v => -v), 
            y: useTransform(internalY, v => -v),
            transform: "translateZ(-20px)",
            opacity: 0.2
          }}
          className="portfolio__shadow-layer"
        />
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { scrollY } = useScroll();
  // ... rest of the pricingPlans and portfolioItems
  
  // Parallax transforms for Hero
  const heroTextY = useTransform(scrollY, [0, 500], [0, 200]);
  const hero3DY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  
  // Horizontal scroll ticker transform
  const tickerX = useTransform(scrollY, [0, 2000], [0, -500]);

  const pricingPlans = [
    {
      name: 'Basic',
      price: '₹1,499',
      description: 'Perfect for getting started online',
      features: [
        '3 Pages Website',
        'Mobile Responsive',
        'WhatsApp Button',
        'Fast Loading Speed',
        'Free Domain Help',
      ],
      popular: false,
    },
    {
      name: 'Standard',
      price: '₹3,499',
      description: 'Great for growing businesses',
      features: [
        '4–6 Pages Website',
        'Contact Form',
        'Basic SEO Setup',
        'WhatsApp Integration',
        'Social Media Links',
        'Google Maps Integration',
      ],
      popular: true,
    },
    {
      name: 'Premium',
      price: '₹5,999',
      description: 'Full-featured business solution',
      features: [
        'Admin Panel',
        'Booking System',
        'Advanced SEO',
        'Payment Integration',
        'Custom Features',
        'Priority Support',
        'Client Dashboard Access',
      ],
      popular: false,
    },
  ];

  const portfolioItems = [
    {
      title: 'FitZone Gym',
      category: 'Fitness & Gym',
      image: '/gym-website.png',
      description: 'A high-energy gym website with class schedules and membership plans.',
    },
    {
      title: 'Green Valley Dairy',
      category: 'Agriculture',
      image: '/dairy-farm-website.png',
      description: 'Fresh dairy farm website with product listings and delivery info.',
    },
    {
      title: 'Glow Studio Salon',
      category: 'Beauty & Wellness',
      image: '/salon-website.png',
      description: 'Elegant salon website with online booking and service gallery.',
    },
  ];

  // Mouse parallax for Hero Subtitle
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const heroSubtitleX = useSpring(useTransform(mouseX, [-500, 500], [-20, 20]), { stiffness: 50, damping: 20 });
  const heroSubtitleY = useSpring(useTransform(mouseY, [-500, 500], [-20, 20]), { stiffness: 50, damping: 20 });

  function handleHeroMouseMove(e) {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX - innerWidth / 2);
    mouseY.set(clientY - innerHeight / 2);
  }

  return (
    <div className="home" onMouseMove={handleHeroMouseMove}>
      <ScrollProgressBar />
      
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero__bg">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 90, 0]
            }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="hero__orb hero__orb--1"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
              rotate: [90, 0, 90]
            }} 
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="hero__orb hero__orb--2"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }} 
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="hero__orb hero__orb--3"
          ></motion.div>
          <div className="hero__grid"></div>
          <FloatingParticles />
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotate: 360 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="glass-sphere"
            style={{ width: '300px', height: '300px', top: '10%', left: '10%' }}
          />
          <motion.div 
            animate={{ 
              x: [0, -80, 0],
              y: [0, 100, 0],
              rotate: -360 
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="glass-sphere"
            style={{ width: '450px', height: '450px', bottom: '15%', right: '5%' }}
          />

          <div className="circuit-vein" style={{ width: '2px', height: '30vh', top: '10%', left: '20%' }}></div>
          <div className="circuit-vein" style={{ width: '2px', height: '50vh', top: '30%', right: '15%' }}></div>
          <div className="circuit-vein" style={{ width: '30vw', height: '2px', bottom: '20%', left: '10%' }}></div>
        </div>

        <motion.div className="hero__3d" style={{ y: hero3DY, opacity: heroOpacity }}>
          <Hero3D />
        </motion.div>

        <div className="hero__content container">
          <motion.div className="hero__main" style={{ y: heroTextY, opacity: heroOpacity }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hero__badge"
            >
              <span className="badge badge-primary">🔥 Limited Offer — First 5 Clients Get 10% OFF</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hero__title"
            >
              <div className="hero__title-line">
                <Magnetic distance={50} strength={0.3}><span>Get</span></Magnetic>
                <Magnetic distance={50} strength={0.3}><span>Your</span></Magnetic>
                <Magnetic distance={50} strength={0.3}><span>Business</span></Magnetic>
              </div>
              <div className="hero__title-line">
                <Magnetic distance={80} strength={0.5}><span className="hero__title-gradient">Online</span></Magnetic>
                <Magnetic distance={50} strength={0.3}><span>in</span></Magnetic>
                <Magnetic distance={50} strength={0.3}><span>3 Days</span></Magnetic>
                <Magnetic distance={50} strength={0.3}><span>🚀</span></Magnetic>
              </div>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{ x: heroSubtitleX, y: heroSubtitleY }}
              className="hero__subtitle"
            >
              Affordable, modern websites starting from just <strong>₹1,499</strong>. <br />
              Stand out from competitors and attract more customers.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="hero__actions"
            >
              <Magnetic>
                <Link to="/ai-architect" className="btn btn-primary btn-lg">
                  <HiOutlineSparkles className="btn-icon" /> AI Project Architect
                </Link>
              </Magnetic>
              
              <Magnetic>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Get Free Demo
                </Link>
              </Magnetic>

              <Magnetic>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://wa.me/919746520910?text=Hi! I want a website for my business" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-whatsapp btn-lg"
                >
                  Contact on WhatsApp
                </motion.a>
              </Magnetic>
            </motion.div>
          </motion.div>


          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="hero__stats"
            style={{ y: heroTextY }}
          >
            <div className="hero__stat">
              <span className="hero__stat-number">50+</span>
              <span className="hero__stat-label">Websites Built</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-number">100%</span>
              <span className="hero__stat-label">Client Satisfaction</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-number">3 Days</span>
              <span className="hero__stat-label">Avg. Delivery</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HORIZONTAL TICKER */}
      <div className="scroll-ticker-wrap">
        <motion.div className="scroll-ticker" style={{ x: tickerX }}>
          <span>MODERN DESIGNS • FAST DELIVERY • SEO OPTIMIZED • MOBILE FIRST • WHATSAPP INTEGRATION • </span>
          <span>MODERN DESIGNS • FAST DELIVERY • SEO OPTIMIZED • MOBILE FIRST • WHATSAPP INTEGRATION • </span>
        </motion.div>
      </div>

      {/* PROBLEM SECTION */}
      <PerspectiveSection>
        <motion.section 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="section problem-section"
        >
          <div className="container">
            <motion.h2 variants={itemVariants} className="section-title haptic-float">Why You Need a Website</motion.h2>
            <motion.p variants={itemVariants} className="section-subtitle">
              In today's digital world, not having a website means losing customers to competitors who do.
            </motion.p>

            <div className="problem__grid">
              <motion.div 
                variants={itemVariants} 
                whileHover={{ y: -10, rotateZ: 1 }} 
                className="problem__card-outer"
              >
                <SpotlightCard>
                  <div className="problem__card card">
                    <div className="problem__icon problem__icon--danger">❌</div>
                    <h3 className="problem__title">No Website = Losing Customers</h3>
                    <p className="problem__text">
                      90% of customers search online before visiting a business. Without a website, you're invisible to them.
                    </p>
                  </div>
                </SpotlightCard>
              </motion.div>

              <motion.div 
                variants={itemVariants} 
                whileHover={{ y: -10, rotateZ: -1 }} 
                className="problem__card-outer"
              >
                <SpotlightCard>
                  <div className="problem__card card">
                    <div className="problem__icon problem__icon--warning">⚠️</div>
                    <h3 className="problem__title">Your Competitors Are Online</h3>
                    <p className="problem__text">
                      While you wait, your competitors are already attracting your potential customers through their websites.
                    </p>
                  </div>
                </SpotlightCard>
              </motion.div>

              <motion.div 
                variants={itemVariants} 
                whileHover={{ y: -10, rotateZ: 1 }} 
                className="problem__card-outer"
              >
                <SpotlightCard>
                  <div className="problem__card card">
                    <div className="problem__icon problem__icon--info">📱</div>
                    <h3 className="problem__title">Mobile Users Are Growing</h3>
                    <p className="problem__text">
                      Over 70% of searches happen on mobile. A mobile-friendly website is no longer optional — it's essential.
                    </p>
                  </div>
                </SpotlightCard>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </PerspectiveSection>

      {/* SOLUTION SECTION */}
      <PerspectiveSection>
        <motion.section 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="section solution-section"
        >
          <div className="container">
            <motion.h2 variants={itemVariants} className="section-title haptic-float">What We Deliver</motion.h2>
            <motion.p variants={itemVariants} className="section-subtitle">
              Modern, fast, and conversion-focused websites tailored for your local business.
            </motion.p>

            <div className="solution__grid">
              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="solution__card">
                <div className="solution__icon-wrap">
                  <HiOutlineLightningBolt size={28} />
                </div>
                <h3>Lightning Fast</h3>
                <p>Websites that load in under 2 seconds, keeping visitors engaged.</p>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="solution__card">
                <div className="solution__icon-wrap">
                  <HiOutlineDeviceMobile size={28} />
                </div>
                <h3>Mobile-First Design</h3>
                <p>Looks stunning on every device — phones, tablets, and desktops.</p>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="solution__card">
                <div className="solution__icon-wrap">
                  <HiOutlineChatAlt2 size={28} />
                </div>
                <h3>WhatsApp Integration</h3>
                <p>Customers can reach you directly with one tap via WhatsApp.</p>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="solution__card">
                <div className="solution__icon-wrap">
                  <HiOutlineGlobeAlt size={28} />
                </div>
                <h3>SEO Optimized</h3>
                <p>Get found on Google with built-in search engine optimization.</p>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </PerspectiveSection>

      {/* PRICING SECTION */}
      <PerspectiveSection>
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section pricing-section" 
          id="pricing"
        >
          <div className="container">
            <motion.h2 {...fadeInUp} className="section-title haptic-float">Simple, Transparent Pricing</motion.h2>
            <motion.p {...fadeInUp} className="section-subtitle">
              Choose the plan that fits your business. No hidden charges, no surprises.
            </motion.p>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="pricing__offer"
            >
              <span>🔥 First 5 customers get <strong>10% OFF</strong> — Limited Time!</span>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="pricing__grid"
            >
              {pricingPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={itemVariants}
                  whileHover={{ y: -15, transition: { duration: 0.3 } }}
                  className={`pricing__card-outer ${plan.popular ? 'is-popular' : ''}`}
                  style={{ zIndex: plan.popular ? 2 : 1 }}
                >
                  <SpotlightCard>
                    <div className={`pricing__card card ${plan.popular ? 'pricing__card--popular' : ''}`}>
                      {plan.popular && (
                        <div className="pricing__popular-badge">
                          <HiOutlineStar /> Most Popular
                        </div>
                      )}

                      <h3 className="pricing__name skeuo-text-etched">{plan.name}</h3>
                      <p className="pricing__description">{plan.description}</p>

                      <div className="pricing__price">
                        <span className="pricing__amount skeuo-text-etched">{plan.price}</span>
                        <span className="pricing__period">one-time</span>
                      </div>

                      <ul className="pricing__features">
                        {plan.features.map((feature) => (
                          <li key={feature} className="pricing__feature">
                            <HiOutlineCheck className="pricing__feature-icon" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={`https://wa.me/919746520910?text=Hi! I'm interested in the ${plan.name} plan (${plan.price})`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        Get Started <HiOutlineArrowRight />
                      </motion.a>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      </PerspectiveSection>

      {/* PORTFOLIO SECTION */}
      <PerspectiveSection>
        <motion.section 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="section portfolio-section" 
          id="portfolio"
        >
          <div className="container">
            <motion.h2 variants={itemVariants} className="section-title haptic-float">Our Work Speaks</motion.h2>
            <motion.p variants={itemVariants} className="section-subtitle">
              Check out some of the stunning websites we've built for businesses like yours.
            </motion.p>

            <div className="portfolio__grid">
              {portfolioItems.map((item) => (
                <PortfolioCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </motion.section>
      </PerspectiveSection>

      {/* CTA SECTION */}
      <section className="section cta-section" id="contact">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="cta__card"
          >
            <div className="cta__bg">
              <motion.div 
                animate={{ 
                  x: [0, 50, 0],
                  y: [0, 30, 0]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="cta__orb cta__orb--1"
              ></motion.div>
              <motion.div 
                animate={{ 
                  x: [0, -50, 0],
                  y: [0, -30, 0]
                }}
                transition={{ duration: 12, repeat: Infinity }}
                className="cta__orb cta__orb--2"
              ></motion.div>
            </div>

            <h2 className="cta__title">Start Your Website Today</h2>
            <p className="cta__text">
              Get a professional website for your business. Fast delivery, modern design, and affordable pricing.
            </p>

            <div className="cta__actions">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://wa.me/919746520910?text=Hi! I want to start building my website"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <FaWhatsapp size={20} /> Chat on WhatsApp
              </motion.a>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Get Free Demo <HiOutlineArrowRight />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer__content">
            <div className="footer__brand">
              <img src={logoImg} alt="Elementra" className="footer__logo-img" />
              <p className="footer__tagline">Building premium websites for local businesses.</p>
            </div>

            <div className="footer__links">
              <Link to="/pricing">Pricing</Link>
              <Link to="/portfolio">Portfolio</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/login">Client Login</Link>
              <a
                href="https://wa.me/919746520910"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="footer__bottom">
            <p>© 2026 Elementra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
