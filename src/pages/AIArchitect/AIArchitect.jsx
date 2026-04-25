import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineSparkles, 
  HiOutlineArrowLeft, 
  HiOutlineCheck, 
  HiOutlineCube, 
  HiOutlineColorSwatch, 
  HiOutlineDocumentText, 
  HiOutlineCurrencyRupee,
  HiOutlineCode,
  HiOutlineClipboardCopy,
  HiOutlineExternalLink,
  HiOutlineEye,
  HiOutlineDeviceTablet,
  HiOutlineDeviceMobile,
  HiOutlineDesktopComputer
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import ProjectMockup from '../../components/ProjectMockup/ProjectMockup';
import { analyzeProjectWithAI } from '../../services/aiService';
import './AIArchitect.css';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AIArchitect() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle, analyzing, results, error
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [previewSize, setPreviewSize] = useState('desktop');
  const scrollRef = useRef(null);
  const iframeRef = useRef(null);

  const analyzeProject = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setStatus('analyzing');
    setErrorMsg('');
    
    try {
      const aiResult = await analyzeProjectWithAI(description);
      
      if (aiResult) {
        setResult(aiResult);
        setStatus('results');
      } else {
        throw new Error("AI Service returned no results. This is usually due to insufficient API quota or an invalid key.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const generateDummyCode = () => {
    if (!result) return '';
    return result.dummyHtml || `<!DOCTYPE html><html><body><h1>No Preview Available</h1></body></html>`;
  };

  useEffect(() => {
    if (status === 'results' && result?.dummyHtml && iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.srcdoc = result.dummyHtml;
    }
  }, [status, result]);

  return (
    <div className="ai-arch">
      <div className="ai-arch__bg">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="ai-arch__orb ai-arch__orb--1"
        ></motion.div>
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="ai-arch__orb ai-arch__orb--2"
        ></motion.div>
      </div>

      <div className="container ai-arch__container">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ai-arch__header"
        >
          <Link to="/" className="ai-arch__back">
            <HiOutlineArrowLeft /> Back to Home
          </Link>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ai-arch__title"
          >
            <HiOutlineSparkles className="ai-arch__sparkle" />
            Project Architect 2.0
          </motion.h1>
          <p className="ai-arch__subtitle">
            Experience the future of web design. Enter your needs, and watch your <span className="text-gradient">Real Frontend</span> build itself in seconds.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.section 
              key="input"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="ai-arch__input-section card"
            >
              <form onSubmit={analyzeProject}>
                <textarea
                  className="ai-arch__textarea"
                  placeholder="Tell us everything. 'I want a modern gym website with dark mode, high-quality images of trainers, a membership pricing table, and a contact form.'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="btn btn-primary btn-lg ai-arch__submit"
                  disabled={!description.trim()}
                >
                  Build My Real Website
                </motion.button>
              </form>
            </motion.section>
          )}

          {status === 'analyzing' && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ai-arch__loading"
            >
              <div className="ai-arch__brain">
                <motion.div 
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="ai-arch__pulse"
                ></motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <HiOutlineCube size={48} />
                </motion.div>
              </div>
              <motion.div 
                variants={stagger}
                initial="initial"
                animate="animate"
                className="ai-arch__loading-steps"
              >
                <motion.div variants={fadeUp} className="step">Interpreting business DNA...</motion.div>
                <motion.div variants={fadeUp} transition={{ delay: 1 }} className="step">Generating advanced components...</motion.div>
                <motion.div variants={fadeUp} transition={{ delay: 2 }} className="step">Injecting high-fidelity assets...</motion.div>
              </motion.div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="ai-arch__error card"
            >
              <div className="error-icon"><HiOutlineCube size={48} /></div>
              <h3>Synthesis Interrupted</h3>
              <div className="error-message">
                {errorMsg}
              </div>
              <p className="error-hint">
                <strong>Technical Note:</strong> Both the Gemini and OpenAI keys provided showed "Insufficient Quota" in our tests. Please verify your billing at platform.openai.com.
              </p>
              <button className="btn btn-secondary" onClick={() => setStatus('idle')}>Update Key & Try Again</button>
            </motion.div>
          )}

          {status === 'results' && result && (
            <motion.div 
              key="results"
              variants={stagger}
              initial="initial"
              animate="animate"
              className="ai-arch__results"
            >
              
              {/* REAL INTERACTIVE PREVIEW */}
              <motion.div variants={fadeUp} className="ai-arch__real-preview card">
                <div className="preview-toolbar">
                  <div className="toolbar-left">
                     <div className="status-badge"><span className="pulse"></span> LIVE PREVIEW</div>
                  </div>
                  <div className="toolbar-center">
                    <button className={`size-btn ${previewSize === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewSize('mobile')}><HiOutlineDeviceMobile /></button>
                    <button className={`size-btn ${previewSize === 'tablet' ? 'active' : ''}`} onClick={() => setPreviewSize('tablet')}><HiOutlineDeviceTablet /></button>
                    <button className={`size-btn ${previewSize === 'desktop' ? 'active' : ''}`} onClick={() => setPreviewSize('desktop')}><HiOutlineDesktopComputer /></button>
                  </div>
                  <div className="toolbar-right">
                     <button className="btn-sm-outline" onClick={() => {
                       const win = window.open('', '_blank');
                       win.document.write(generateDummyCode());
                     }}>
                       <HiOutlineExternalLink /> Open Full Screen
                     </button>
                  </div>
                </div>
                <div className={`iframe-container ${previewSize}`}>
                  <iframe 
                    ref={iframeRef} 
                    title="Real Website Preview" 
                    className="preview-iframe"
                    srcDoc={generateDummyCode()}
                  ></iframe>
                </div>
              </motion.div>

              <div className="ai-arch__grid">
                <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="ai-arch__res-card card">
                  <div className="icon-wrap"><HiOutlineDocumentText /></div>
                  <h3>Technical Blueprint</h3>
                  <div className="stat">
                    <span className="val">{result.pages} Pages</span>
                    <span className="label">Full Stack Architecture</span>
                  </div>
                  <div className="res-list">
                    {result.features?.map(f => (
                      <div key={f} className="res-item"><HiOutlineCheck /> {f}</div>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="ai-arch__res-card card">
                  <div className="icon-wrap"><HiOutlineColorSwatch /></div>
                  <h3>Visual Design System</h3>
                  <div className="stat">
                    <span className="val">{result.theme}</span>
                    <span className="label">Production Theme</span>
                  </div>
                  <div className="color-row">
                    {result.colors?.map(c => (
                      <div key={c} className="color-pip" style={{ background: c }} title={c}></div>
                    ))}
                  </div>
                  <div className="cta-group-mini">
                    <button className="btn btn-outline-sm" onClick={() => setShowCode(!showCode)}>
                      <HiOutlineCode /> {showCode ? 'Hide Code' : 'View Source Blueprint'}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="ai-arch__res-card card ai-arch__res-card--highlight">
                  <div className="icon-wrap"><HiOutlineCurrencyRupee /></div>
                  <h3>Production Quote</h3>
                  <div className="stat">
                     <span className="val">₹{result.price?.toLocaleString()}</span>
                     <span className="label">Total Development & Setup</span>
                  </div>
                  <div className="cta-group">
                    <motion.a 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={`https://wa.me/919746520910?text=Hi! I love the ${result.title} preview! I'm ready to move to production for ₹${result.price}.`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-whatsapp"
                    >
                      <FaWhatsapp /> Deploy Now
                    </motion.a>
                  </div>
                </motion.div>
              </div>

              <AnimatePresence>
                {showCode && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ai-arch__code-view card"
                  >
                    <div className="code-header">
                      <h4>Source Blueprint Code</h4>
                      <button className="btn btn-sm" onClick={() => {
                        navigator.clipboard.writeText(generateDummyCode());
                        alert('Source copied!');
                      }}>
                        <HiOutlineClipboardCopy /> Copy
                      </button>
                    </div>
                    <pre className="code-content">
                      <code>{generateDummyCode()}</code>
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={fadeUp} className="ai-arch__actions-footer">
                <button className="btn btn-secondary" onClick={() => setStatus('idle')}>
                   Create Another Project
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
