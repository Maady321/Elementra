import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineGlobeAlt, HiOutlineDeviceMobile, HiOutlineChatAlt2, HiOutlineLightningBolt, HiOutlineCheck, HiOutlineStar, HiOutlineArrowRight } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import Hero3D from '../../components/Hero3D/Hero3D';
import logoImg from '../../assets/logo.png';
import './Home.css';

function useIntersectionObserver() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function Home() {
  const pageRef = useIntersectionObserver();

  const pricingPlans = [
    {
      name: 'Basic',
      price: '₹1,499',
      description: 'Perfect for getting started online',
      features: [
        '1 Page Website',
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
        '3–4 Page Website',
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

  return (
    <div className="home" ref={pageRef}>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1"></div>
          <div className="hero__orb hero__orb--2"></div>
          <div className="hero__orb hero__orb--3"></div>
          <div className="hero__grid"></div>
        </div>

        <div className="hero__3d">
          <Hero3D />
        </div>

        <div className="hero__content container">
          <div className="hero__main">
            <div className="hero__badge reveal">
              <span className="badge badge-primary">🔥 Limited Offer — First 5 Clients Get 10% OFF</span>
            </div>
            
            <h1 className="hero__title reveal">
              Get Your Business <br />
              <span className="hero__title-gradient">Online in 3 Days</span> 🚀
            </h1>
            
            <p className="hero__subtitle reveal">
              Affordable, modern websites starting from just <strong>₹1,499</strong>. <br />
              Stand out from competitors and attract more customers.
            </p>
            
            <div className="hero__actions reveal">
              <Link to="/login" className="btn btn-primary btn-lg">
                Get Free Demo
              </Link>
              <a 
                href="https://wa.me/919999999999?text=Hi! I want a website for my business" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-whatsapp btn-lg"
              >
                Contact on WhatsApp
              </a>
            </div>
          </div>


          <div className="hero__stats reveal">
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
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="section problem-section">
        <div className="container">
          <h2 className="section-title reveal">Why You Need a Website</h2>
          <p className="section-subtitle reveal">
            In today's digital world, not having a website means losing customers to competitors who do.
          </p>

          <div className="problem__grid">
            <div className="problem__card card reveal">
              <div className="problem__icon problem__icon--danger">❌</div>
              <h3 className="problem__title">No Website = Losing Customers</h3>
              <p className="problem__text">
                90% of customers search online before visiting a business. Without a website, you're invisible to them.
              </p>
            </div>

            <div className="problem__card card reveal">
              <div className="problem__icon problem__icon--warning">⚠️</div>
              <h3 className="problem__title">Your Competitors Are Online</h3>
              <p className="problem__text">
                While you wait, your competitors are already attracting your potential customers through their websites.
              </p>
            </div>

            <div className="problem__card card reveal">
              <div className="problem__icon problem__icon--info">📱</div>
              <h3 className="problem__title">Mobile Users Are Growing</h3>
              <p className="problem__text">
                Over 70% of searches happen on mobile. A mobile-friendly website is no longer optional — it's essential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="section solution-section">
        <div className="container">
          <h2 className="section-title reveal">What We Deliver</h2>
          <p className="section-subtitle reveal">
            Modern, fast, and conversion-focused websites tailored for your local business.
          </p>

          <div className="solution__grid">
            <div className="solution__card reveal">
              <div className="solution__icon-wrap">
                <HiOutlineLightningBolt size={28} />
              </div>
              <h3>Lightning Fast</h3>
              <p>Websites that load in under 2 seconds, keeping visitors engaged.</p>
            </div>

            <div className="solution__card reveal">
              <div className="solution__icon-wrap">
                <HiOutlineDeviceMobile size={28} />
              </div>
              <h3>Mobile-First Design</h3>
              <p>Looks stunning on every device — phones, tablets, and desktops.</p>
            </div>

            <div className="solution__card reveal">
              <div className="solution__icon-wrap">
                <HiOutlineChatAlt2 size={28} />
              </div>
              <h3>WhatsApp Integration</h3>
              <p>Customers can reach you directly with one tap via WhatsApp.</p>
            </div>

            <div className="solution__card reveal">
              <div className="solution__icon-wrap">
                <HiOutlineGlobeAlt size={28} />
              </div>
              <h3>SEO Optimized</h3>
              <p>Get found on Google with built-in search engine optimization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="section pricing-section" id="pricing">
        <div className="container">
          <h2 className="section-title reveal">Simple, Transparent Pricing</h2>
          <p className="section-subtitle reveal">
            Choose the plan that fits your business. No hidden charges, no surprises.
          </p>

          <div className="pricing__offer reveal">
            <span>🔥 First 5 customers get <strong>10% OFF</strong> — Limited Time!</span>
          </div>

          <div className="pricing__grid">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`pricing__card card reveal ${plan.popular ? 'pricing__card--popular' : ''}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {plan.popular && (
                  <div className="pricing__popular-badge">
                    <HiOutlineStar /> Most Popular
                  </div>
                )}

                <h3 className="pricing__name">{plan.name}</h3>
                <p className="pricing__description">{plan.description}</p>

                <div className="pricing__price">
                  <span className="pricing__amount">{plan.price}</span>
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

                <a
                  href={`https://wa.me/919999999999?text=Hi! I'm interested in the ${plan.name} plan (${plan.price})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                >
                  Get Started <HiOutlineArrowRight />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section className="section portfolio-section" id="portfolio">
        <div className="container">
          <h2 className="section-title reveal">Our Work Speaks</h2>
          <p className="section-subtitle reveal">
            Check out some of the stunning websites we've built for businesses like yours.
          </p>

          <div className="portfolio__grid">
            {portfolioItems.map((item, index) => (
              <div
                key={item.title}
                className="portfolio__card reveal"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="portfolio__image-wrap">
                  <img src={item.image} alt={item.title} className="portfolio__image" />
                  <div className="portfolio__overlay">
                    <span className="badge badge-primary">{item.category}</span>
                  </div>
                </div>
                <div className="portfolio__info">
                  <h3 className="portfolio__title">{item.title}</h3>
                  <p className="portfolio__desc">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section cta-section" id="contact">
        <div className="container">
          <div className="cta__card reveal">
            <div className="cta__bg">
              <div className="cta__orb cta__orb--1"></div>
              <div className="cta__orb cta__orb--2"></div>
            </div>

            <h2 className="cta__title">Start Your Website Today</h2>
            <p className="cta__text">
              Get a professional website for your business. Fast delivery, modern design, and affordable pricing.
            </p>

            <div className="cta__actions">
              <a
                href="https://wa.me/919999999999?text=Hi! I want to start building my website"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <FaWhatsapp size={20} /> Chat on WhatsApp
              </a>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Get Free Demo <HiOutlineArrowRight />
              </Link>
            </div>
          </div>
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
              <a href="/#pricing">Pricing</a>
              <a href="/#portfolio">Portfolio</a>
              <Link to="/login">Client Login</Link>
              <a
                href="https://wa.me/919999999999"
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
