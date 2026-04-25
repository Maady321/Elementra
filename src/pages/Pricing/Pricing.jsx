import { Link } from 'react-router-dom';
import { HiOutlineCheck, HiOutlineStar, HiOutlineArrowRight } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';
import PerspectiveSection from '../../components/Effects/PerspectiveSection';
import '../Home/Home.css';
import './Pricing.css';

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

const faqs = [
  {
    q: 'How long does it take to build my website?',
    a: 'Most websites are delivered within 3–5 business days depending on the plan and complexity.'
  },
  {
    q: 'Do I need to provide content?',
    a: "We can work with whatever you have! Just share your business details, logo, and photos — we'll handle the rest."
  },
  {
    q: 'Is hosting included?',
    a: 'We help you set up affordable hosting. We also offer free domain assistance to get you started.'
  },
  {
    q: 'Can I upgrade my plan later?',
    a: "Absolutely! You can upgrade anytime and we'll only charge the difference."
  },
];

export default function Pricing() {
  return (
    <div className="pricing-page">
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="page-hero__bg">
          <div className="page-hero__orb page-hero__orb--1"></div>
          <div className="page-hero__orb page-hero__orb--2"></div>
          <div className="page-hero__grid"></div>
        </div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="page-hero__content"
          >
            <span className="badge badge-primary">💎 Transparent Pricing</span>
            <h1 className="page-hero__title">
              Plans That Fit <span className="text-gradient">Every Budget</span>
            </h1>
            <p className="page-hero__subtitle">
              No hidden fees. No surprises. Just premium websites at honest prices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <PerspectiveSection>
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section pricing-section"
        >
          <div className="container">
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

      {/* FAQ SECTION */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="section faq-section"
      >
        <div className="container">
          <motion.h2 variants={itemVariants} className="section-title haptic-float">
            Frequently Asked Questions
          </motion.h2>
          <motion.p variants={itemVariants} className="section-subtitle">
            Got questions? We&apos;ve got answers.
          </motion.p>

          <div className="faq__grid">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={itemVariants} className="faq__item">
                <SpotlightCard>
                  <div className="faq__card card">
                    <h3 className="faq__question">{faq.q}</h3>
                    <p className="faq__answer">{faq.a}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="cta__card"
          >
            <h2 className="cta__title">Ready to Get Started?</h2>
            <p className="cta__text">
              Choose your plan and let&apos;s build something amazing together.
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
                <Link to="/contact" className="btn btn-secondary btn-lg">
                  Contact Us <HiOutlineArrowRight />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
