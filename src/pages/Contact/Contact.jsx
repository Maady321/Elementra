import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';
import SpotlightCard from '../../components/SpotlightCard/SpotlightCard';
import { supabase } from '../../lib/supabase';
import { Helmet } from 'react-helmet-async';
import './Contact.css';

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  },
  viewport: { once: true, margin: "-50px" }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save to Supabase leads table as backup
      await supabase.from('leads').insert([{
        name: formData.name,
        email: formData.email,
        business_type: formData.message,
        status: 'new'
      }]);
      
      const msg = `Hi! I'm ${formData.name}.%0A%0A${formData.message}%0A%0AEmail: ${formData.email}%0APhone: ${formData.phone}`;
      window.open(`https://wa.me/919746520910?text=${msg}`, '_blank');
      
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Submission error:', err);
      // Still open WhatsApp even if DB save fails
      const msg = `Hi! I'm ${formData.name}.%0A%0A${formData.message}%0A%0AEmail: ${formData.email}%0APhone: ${formData.phone}`;
      window.open(`https://wa.me/919746520910?text=${msg}`, '_blank');
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <Helmet>
        <title>Contact Us — Elementra</title>
        <meta name="description" content="Reach out to Elementra for professional web development inquiries. We respond within 24 hours." />
      </Helmet>

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
            <span className="badge badge-primary">📬 Get in Touch</span>
            <h1 className="page-hero__title">
              Let's Build Something <span className="text-gradient">Amazing</span>
            </h1>
            <p className="page-hero__subtitle">
              Have a project in mind? Reach out and let's turn your vision into reality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="section contact-section"
      >
        <div className="container">
          <div className="contact__grid">
            {/* FORM */}
            <motion.div variants={itemVariants} className="contact__form-wrap">
              <SpotlightCard>
                <div className="contact__form-card card">
                  <h2 className="contact__form-title">Send a Message</h2>
                  <p className="contact__form-subtitle">Fill out the form and we'll get back to you within 24 hours.</p>
                  
                  {submitSuccess && (
                    <div style={{ 
                      padding: '1rem', borderRadius: '8px', 
                      background: 'rgba(74, 222, 128, 0.1)', 
                      border: '1px solid #4ade80', color: '#4ade80',
                      marginBottom: '1.5rem', textAlign: 'center',
                      fontSize: '0.875rem'
                    }}>
                      ✅ Message received! We'll be in touch soon. Check WhatsApp if it opened.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="contact__form">
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-name">Full Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="contact__form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-email">Email</label>
                        <input
                          id="contact-email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-phone">Phone</label>
                        <input
                          id="contact-phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-message">Message</label>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="form-input contact__textarea"
                        placeholder="Tell us about your project..."
                        rows="5"
                        required
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="btn btn-primary btn-lg contact__submit-btn"
                      disabled={isSubmitting}
                    >
                      <FaWhatsapp size={18} /> {isSubmitting ? 'Sending...' : 'Send via WhatsApp'}
                    </motion.button>
                  </form>
                </div>
              </SpotlightCard>
            </motion.div>

            {/* INFO SIDEBAR */}
            <motion.div variants={itemVariants} className="contact__info">
              <SpotlightCard>
                <div className="contact__info-card card">
                  <h3 className="contact__info-title">Contact Info</h3>
                  
                  <div className="contact__info-items">
                    <div className="contact__info-item">
                      <div className="contact__info-icon">
                        <HiOutlineMail size={20} />
                      </div>
                      <div>
                        <span className="contact__info-label">Email</span>
                        <span className="contact__info-value">hello@elementra.dev</span>
                      </div>
                    </div>
                    <div className="contact__info-item">
                      <div className="contact__info-icon">
                        <HiOutlinePhone size={20} />
                      </div>
                      <div>
                        <span className="contact__info-label">Phone</span>
                        <span className="contact__info-value">+91 97465 20910</span>
                      </div>
                    </div>
                    <div className="contact__info-item">
                      <div className="contact__info-icon">
                        <HiOutlineLocationMarker size={20} />
                      </div>
                      <div>
                        <span className="contact__info-label">Location</span>
                        <span className="contact__info-value">India (Remote)</span>
                      </div>
                    </div>
                    <div className="contact__info-item">
                      <div className="contact__info-icon">
                        <HiOutlineClock size={20} />
                      </div>
                      <div>
                        <span className="contact__info-label">Response Time</span>
                        <span className="contact__info-value">Within 24 hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="contact__divider"></div>

                  <h3 className="contact__info-title">Follow Us</h3>
                  <div className="contact__socials">
                    <a
                      href="https://wa.me/919746520910"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact__social-link contact__social-link--whatsapp"
                    >
                      <FaWhatsapp size={20} />
                    </a>
                    <a
                      href="#"
                      className="contact__social-link contact__social-link--instagram"
                    >
                      <FaInstagram size={20} />
                    </a>
                    <a
                      href="#"
                      className="contact__social-link contact__social-link--linkedin"
                    >
                      <FaLinkedin size={20} />
                    </a>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
