import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import PerspectiveSection from '../../components/Effects/PerspectiveSection';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';
import '../Home/Home.css';
import './Portfolio.css';

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  },
  viewport: { once: true, margin: "-50px" }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

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

const stats = [
  { number: '50+', label: 'Projects Delivered' },
  { number: '100%', label: 'Client Satisfaction' },
  { number: '3 Days', label: 'Average Delivery' },
  { number: '10+', label: 'Industries Served' },
];

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

export default function Portfolio() {
  return (
    <div className="portfolio-page">
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
            <span className="badge badge-primary">🎨 Our Work</span>
            <h1 className="page-hero__title">
              Stunning Websites, <span className="text-gradient">Happy Clients</span>
            </h1>
            <p className="page-hero__subtitle">
              See what we&apos;ve built for businesses like yours. Every project is crafted with passion and precision.
            </p>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="portfolio-stats">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="portfolio-stats__grid"
          >
            {stats.map((stat, i) => (
              <div key={i} className="portfolio-stats__item">
                <span className="portfolio-stats__number">{stat.number}</span>
                <span className="portfolio-stats__label">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PORTFOLIO GRID */}
      <PerspectiveSection>
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="section portfolio-section"
        >
          <div className="container">
            <motion.h2 variants={itemVariants} className="section-title haptic-float">
              Featured Projects
            </motion.h2>
            <motion.p variants={itemVariants} className="section-subtitle">
              Each project is a unique story of turning ideas into reality.
            </motion.p>

            <div className="portfolio__grid">
              {portfolioItems.map((item) => (
                <PortfolioCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </motion.section>
      </PerspectiveSection>

      {/* PROCESS SECTION */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="section process-section"
      >
        <div className="container">
          <motion.h2 variants={itemVariants} className="section-title haptic-float">
            Our Process
          </motion.h2>
          <motion.p variants={itemVariants} className="section-subtitle">
            From idea to launch in just 3 simple steps.
          </motion.p>

          <div className="process__grid">
            {[
              { step: '01', title: 'Discuss', desc: 'We understand your business, goals, and audience to plan the perfect website.' },
              { step: '02', title: 'Design & Build', desc: 'Our team crafts a stunning, mobile-first website tailored to your brand.' },
              { step: '03', title: 'Launch', desc: 'We deploy your website, set up your domain, and make you live in days.' },
            ].map((item, i) => (
              <motion.div key={i} variants={itemVariants}>
                <SpotlightCard>
                  <div className="process__card card">
                    <span className="process__step">{item.step}</span>
                    <h3 className="process__title">{item.title}</h3>
                    <p className="process__desc">{item.desc}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
