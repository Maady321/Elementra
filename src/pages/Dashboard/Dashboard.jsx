import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineClipboardCheck,
  HiOutlineChatAlt,
  HiOutlinePhotograph,
  HiOutlineAdjustments,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineDesktopComputer,
  HiOutlineEye,
  HiOutlinePaperClip,
  HiOutlineMenuAlt2,
  HiOutlineLogout
} from 'react-icons/hi';
import { FaWhatsapp, FaRocket } from 'react-icons/fa';
import logoImg from '../../assets/logo.png';
import './Dashboard.css';

// Empty initial states (ready to fetch from DB)
const DEMO_DATA = {
  client: {
    name: '',
    email: '',
    project_name: '',
    plan: '',
    num_pages: 0,
    status: '',
  },
  progress: [],
  updates: [],
  comments: [],
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [clientData, setClientData] = useState(DEMO_DATA.client);
  const [progress, setProgress] = useState(DEMO_DATA.progress);
  const [updates, setUpdates] = useState(DEMO_DATA.updates);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatImage, setChatImage] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const [projectId, setProjectId] = useState(null);

  // Try loading from Supabase
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        // Load client project data
        const { data: projectData } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (projectData) {
          setProjectId(projectData.id);
          setClientData({
            name: projectData.client_name || user.email,
            email: user.email,
            project_name: projectData.project_name,
            plan: projectData.plan,
            num_pages: projectData.num_pages,
            status: projectData.status,
          });
        }

        // Load comments
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .eq('project_id', projectData?.id)
          .order('created_at', { ascending: true });

        if (commentsData?.length) {
          setChatMessages(
            commentsData.map((c) => ({
              id: c.id,
              author: c.is_client ? 'You' : 'Developer',
              text: c.text,
              imageUrl: c.image_url,
              date: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isClient: c.is_client,
            }))
          );
        }

        // Load updates
        const { data: updatesData } = await supabase
          .from('project_updates')
          .select('*')
          .eq('project_id', projectData?.id)
          .order('created_at', { ascending: false });

        if (updatesData?.length) {
          setUpdates(updatesData);
        }
      } catch (err) {
        console.log('Error loading data:', err.message);
      }
    }

    loadData();
  }, [user]);

  // Handle Real-time Subscriptions for Comments
  useEffect(() => {
    if (!projectId) return;
    
    const channel = supabase.channel(`project_${projectId}_comments`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `project_id=eq.${projectId}` }, (payload) => {
        const c = payload.new;
        setChatMessages(prev => [...prev, {
          id: c.id,
          author: c.is_client ? 'You' : 'Developer',
          text: c.text,
          imageUrl: c.image_url,
          date: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isClient: c.is_client
        }]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChatImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [customPages, setCustomPages] = useState(4);
  const [customFeatures, setCustomFeatures] = useState({
    contactForm: true,
    whatsapp: true,
    booking: false,
  });
  const [customTheme, setCustomTheme] = useState('Modern');
  const [showApproveModal, setShowApproveModal] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && !chatImage) return;

    try {
      if(!projectId) return;

      await supabase.from('comments').insert([{
        project_id: projectId,
        user_id: user.id,
        text: newComment,
        image_url: chatImage,
        is_client: true
      }]);

      setNewComment('');
      setChatImage(null);
    } catch(err) {
      console.error('Failed to add comment', err.message);
    }
  };

  const handleApprove = () => {
    setShowApproveModal(true);
  };

  const confirmApprove = () => {
    setProgress(progress.map((p) => ({ ...p, status: 'completed', date: p.date || new Date().toISOString().split('T')[0] })));
    setClientData({ ...clientData, status: 'launched' });
    setShowApproveModal(false);
  };

  const getProgressPercentage = () => {
    const completed = progress.filter((p) => p.status === 'completed').length;
    const currentStep = progress.findIndex((p) => p.status === 'current');
    return Math.round(((completed + (currentStep >= 0 ? 0.5 : 0)) / progress.length) * 100);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <HiOutlineCheckCircle className="progress__icon progress__icon--completed" />;
      case 'current':
        return <HiOutlineClock className="progress__icon progress__icon--current" />;
      default:
        return <div className="progress__icon progress__icon--pending" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <HiOutlineBriefcase /> },
    { id: 'updates', label: 'Updates', icon: <HiOutlinePhotograph /> },
    { id: 'comments', label: 'Comments', icon: <HiOutlineChatAlt /> },
    { id: 'customize', label: 'Customize', icon: <HiOutlineAdjustments /> },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard__mobile-header">
        <Link to="/" className="mobile-logo">
           <img src={logoImg} alt="logo" height="32" />
        </Link>
        <button className="mobile-logout" onClick={() => { signOut(); navigate('/'); }}>
          <HiOutlineLogout size={20} />
        </button>
      </header>

      <div className="dashboard__sidebar">
        <div className="dashboard__sidebar-header">
          <Link to="/" className="dashboard__sidebar-logo-wrap">
            <img src={logoImg} alt="Elementra" className="dashboard__sidebar-logo-img" />
          </Link>
        </div>

        <nav className="dashboard__nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`dashboard__nav-item ${activeTab === tab.id ? 'dashboard__nav-item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="dashboard__sidebar-footer">
          <div className="dashboard__user-info">
            <div className="dashboard__avatar">
              {(clientData.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="dashboard__user-details">
              <span className="dashboard__user-name">{clientData.name || user?.email}</span>
              <span className="dashboard__user-plan badge badge-primary">{clientData.plan}</span>
            </div>
          </div>
          <button
            onClick={() => { signOut(); navigate('/'); }}
            className="dashboard__logout-btn"
          >
            <HiOutlineLogout /> Logout
          </button>
        </div>
      </div>

      <nav className="dashboard__bottom-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`dashboard__bottom-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="dashboard__main">
        <header className="dashboard__header">
          <div>
            <h1 className="dashboard__page-title">
              {activeTab === 'overview' && 'Project Overview'}
              {activeTab === 'updates' && 'Project Updates'}
              {activeTab === 'comments' && 'Comments & Feedback'}
              {activeTab === 'customize' && 'Customize Your Website'}
            </h1>
            <p className="dashboard__page-subtitle">
              {clientData.project_name} — {clientData.plan} Plan
            </p>
          </div>

          <div className="dashboard__header-actions">
            <button onClick={handleApprove} className="btn btn-success btn-sm">
              <FaRocket /> Approve & Go Live
            </button>
          </div>
        </header>

        <div className="dashboard__content">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="dashboard__overview animate-fade-in">
              {/* Client Info Cards Row */}
              <div className="dashboard__info-grid">
                <div className="dashboard__info-card card">
                  <div className="dashboard__info-icon">
                    <HiOutlineUser />
                  </div>
                  <div>
                    <span className="dashboard__info-label">Client</span>
                    <span className="dashboard__info-value">{clientData.name}</span>
                  </div>
                </div>

                <div className="dashboard__info-card card">
                  <div className="dashboard__info-icon">
                    <HiOutlineBriefcase />
                  </div>
                  <div>
                    <span className="dashboard__info-label">Project</span>
                    <span className="dashboard__info-value">{clientData.project_name}</span>
                  </div>
                </div>

                <div className="dashboard__info-card card">
                  <div className="dashboard__info-icon">
                    <HiOutlineClipboardCheck />
                  </div>
                  <div>
                    <span className="dashboard__info-label">Plan</span>
                    <span className="dashboard__info-value">{clientData.plan}</span>
                  </div>
                </div>

                <div className="dashboard__info-card card">
                  <div className="dashboard__info-icon">
                    <HiOutlineDesktopComputer />
                  </div>
                  <div>
                    <span className="dashboard__info-label">Pages</span>
                    <span className="dashboard__info-value">{clientData.num_pages} Pages</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="dashboard__progress-section card">
                <div className="dashboard__progress-header">
                  <h2 className="dashboard__card-title">Project Progress</h2>
                  <span className="dashboard__progress-pct">{getProgressPercentage()}%</span>
                </div>

                <div className="dashboard__progress-bar-wrap">
                  <div
                    className="dashboard__progress-bar"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>

                <div className="dashboard__progress-steps">
                  {progress.map((step, idx) => (
                    <div
                      key={step.step}
                      className={`dashboard__step ${step.status === 'completed' ? 'dashboard__step--completed' : ''} ${step.status === 'current' ? 'dashboard__step--current' : ''}`}
                    >
                      <div className="dashboard__step-indicator">
                        {getStatusIcon(step.status)}
                        {idx < progress.length - 1 && (
                          <div className={`dashboard__step-line ${step.status === 'completed' ? 'dashboard__step-line--completed' : ''}`}></div>
                        )}
                      </div>
                      <div className="dashboard__step-info">
                        <span className="dashboard__step-name">{step.step}</span>
                        {step.date && (
                          <span className="dashboard__step-date">{step.date}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Update */}
              {updates.length > 0 && (
                <div className="dashboard__latest-update card">
                  <h2 className="dashboard__card-title">Latest Update</h2>
                  <div className="dashboard__update-preview">
                    <img src={updates[0].image} alt={updates[0].title} className="dashboard__update-image" />
                    <div className="dashboard__update-info">
                      <h3>{updates[0].title}</h3>
                      <p>{updates[0].description}</p>
                      <span className="dashboard__update-date">{updates[0].date}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UPDATES TAB */}
          {activeTab === 'updates' && (
            <div className="dashboard__updates animate-fade-in">
              <div className="dashboard__updates-grid">
                {updates.map((update) => (
                  <div key={update.id} className="dashboard__update-card card">
                    <div className="dashboard__update-img-wrap">
                      <img src={update.image} alt={update.title} />
                    </div>
                    <div className="dashboard__update-body">
                      <h3>{update.title}</h3>
                      <p>{update.description}</p>
                      <span className="dashboard__update-date">{update.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMMENTS TAB */}
          {activeTab === 'comments' && (
            <div className="dashboard__comments animate-fade-in">
              <div className="dashboard__comments-card card">
                <h2 className="dashboard__card-title">Project Discussion</h2>

                <div className="dashboard__messages" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {chatMessages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: '2rem 0' }}>Say hello!</p>
                  ) : (
                    chatMessages.map((comment) => (
                      <div
                        key={comment.id}
                        className={`dashboard__message ${comment.isClient ? 'dashboard__message--client' : 'dashboard__message--dev'}`}
                      >
                        <div className="dashboard__message-avatar">
                          {comment.isClient ? '👤' : '⚡'}
                        </div>
                        <div className="dashboard__message-content">
                          <div className="dashboard__message-header">
                            <span className="dashboard__message-author">{comment.author}</span>
                            <span className="dashboard__message-time">{comment.date}</span>
                          </div>
                          {comment.text && <p className="dashboard__message-text">{comment.text}</p>}
                          {comment.imageUrl && (
                            <img src={comment.imageUrl} alt="chat attachment" className="admin__chat-image" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {chatImage && (
                  <div className="admin__chat-image-preview-container" style={{background: 'var(--color-bg)', borderColor: 'var(--color-border)'}}>
                    <img src={chatImage} alt="preview" className="admin__chat-image-preview" />
                    <button type="button" onClick={() => setChatImage(null)} className="btn btn-secondary" style={{padding: '4px', width: 'auto'}}>
                      ✕
                    </button>
                  </div>
                )}

                <form onSubmit={handleAddComment} className="dashboard__comment-form" style={{ display: 'flex', gap: '8px' }}>
                  <label htmlFor="client-file-upload" className="admin__attach-btn" style={{flexShrink: 0}}>
                    <HiOutlinePaperClip />
                  </label>
                  <input
                    id="client-file-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type your feedback or comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary">
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* CUSTOMIZE TAB */}
          {activeTab === 'customize' && (
            <div className="dashboard__customize animate-fade-in">
              <div className="dashboard__customize-grid">
                {/* Page Count */}
                <div className="dashboard__custom-card card">
                  <h3 className="dashboard__custom-title">Number of Pages</h3>
                  <p className="dashboard__custom-desc">Select how many pages your website should have.</p>
                  <div className="dashboard__page-selector">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        className={`dashboard__page-btn ${customPages === num ? 'dashboard__page-btn--active' : ''}`}
                        onClick={() => setCustomPages(num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="dashboard__custom-card card">
                  <h3 className="dashboard__custom-title">Features</h3>
                  <p className="dashboard__custom-desc">Choose the features you need for your website.</p>
                  <div className="dashboard__features-list">
                    {[
                      { key: 'contactForm', label: 'Contact Form', icon: '📧' },
                      { key: 'whatsapp', label: 'WhatsApp Integration', icon: '💬' },
                      { key: 'booking', label: 'Booking System', icon: '📅' },
                    ].map((feature) => (
                      <label key={feature.key} className="dashboard__feature-toggle">
                        <input
                          type="checkbox"
                          checked={customFeatures[feature.key]}
                          onChange={(e) =>
                            setCustomFeatures({
                              ...customFeatures,
                              [feature.key]: e.target.checked,
                            })
                          }
                        />
                        <span className="dashboard__feature-switch"></span>
                        <span className="dashboard__feature-label">
                          <span>{feature.icon}</span> {feature.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="dashboard__custom-card card">
                  <h3 className="dashboard__custom-title">Theme Preference</h3>
                  <p className="dashboard__custom-desc">Select your preferred design style.</p>
                  <div className="dashboard__theme-grid">
                    {[
                      { name: 'Modern', color: 'linear-gradient(135deg, #667eea, #764ba2)', desc: 'Bold & vibrant' },
                      { name: 'Minimal', color: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', desc: 'Clean & simple' },
                      { name: 'Dark', color: 'linear-gradient(135deg, #0f0c29, #302b63)', desc: 'Sleek & premium' },
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        className={`dashboard__theme-btn ${customTheme === theme.name ? 'dashboard__theme-btn--active' : ''}`}
                        onClick={() => setCustomTheme(theme.name)}
                      >
                        <div
                          className="dashboard__theme-preview"
                          style={{ background: theme.color }}
                        ></div>
                        <span className="dashboard__theme-name">{theme.name}</span>
                        <span className="dashboard__theme-desc">{theme.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="dashboard__custom-card card dashboard__custom-summary">
                  <h3 className="dashboard__custom-title">Your Configuration</h3>
                  <div className="dashboard__summary-items">
                    <div className="dashboard__summary-item">
                      <span>Pages</span>
                      <strong>{customPages}</strong>
                    </div>
                    <div className="dashboard__summary-item">
                      <span>Features</span>
                      <strong>
                        {Object.entries(customFeatures)
                          .filter(([, v]) => v)
                          .map(([k]) => k === 'contactForm' ? 'Form' : k === 'whatsapp' ? 'WhatsApp' : 'Booking')
                          .join(', ') || 'None'}
                      </strong>
                    </div>
                    <div className="dashboard__summary-item">
                      <span>Theme</span>
                      <strong>{customTheme}</strong>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/919999999999?text=Hi! Here's my website customization: ${customPages} pages, Features: ${Object.entries(customFeatures).filter(([,v]) => v).map(([k]) => k).join(', ')}, Theme: ${customTheme}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                    style={{ width: '100%', marginTop: 'var(--space-lg)' }}
                  >
                    <FaWhatsapp /> Send Preferences on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="dashboard__modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="dashboard__modal" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard__modal-icon">🚀</div>
            <h2>Ready to Go Live?</h2>
            <p>Once you approve, your website will be launched and available to the public. Make sure you've reviewed all pages.</p>
            <div className="dashboard__modal-actions">
              <button onClick={() => setShowApproveModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmApprove} className="btn btn-success">
                <HiOutlineCheck /> Yes, Go Live!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}