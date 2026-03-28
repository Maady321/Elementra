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
import ActivityTimeline from '../../components/ActivityTimeline/ActivityTimeline';
import ProjectMockup from '../../components/ProjectMockup/ProjectMockup';
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
  const [activities, setActivities] = useState([]);
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
        let { data: projectData } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // If not found by user_id, check for unlinked projects with same email
        if (!projectData && user.email) {
          const { data: emailData } = await supabase
            .from('projects')
            .select('*')
            .eq('email', user.email)
            .is('user_id', null)
            .maybeSingle();
          
          if (emailData) {
             projectData = emailData;
             // Auto-link to the current logged in user
             await supabase.from('projects').update({ user_id: user.id }).eq('id', emailData.id);
          }
        }

        if (projectData) {
          setProjectId(projectData.id);
          setClientData({
            name: projectData.client_name || user.email,
            email: user.email,
            project_name: projectData.project_name,
            plan: projectData.plan,
            num_pages: projectData.num_pages,
            status: projectData.status,
            features: projectData.features || { contactForm: false, whatsapp: false, booking: false }
          });
          setCustomPages(projectData.num_pages);
          setCustomFeatures(projectData.features || { contactForm: false, whatsapp: false, booking: false });
          setCustomTheme(projectData.theme || 'Modern');
        }

        // Load progress steps
        const { data: stepsData } = await supabase
          .from('progress_steps')
          .select('*')
          .eq('project_id', projectData?.id)
          .order('sort_order', { ascending: true });
        
        if (stepsData) setProgress(stepsData);

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
            setUpdates(updatesData.map(u => ({
              ...u,
              date: new Date(u.created_at).toISOString().split('T')[0]
            })));
          }

          // Load activities
          const { data: actsData } = await supabase.from('activities').select('*').eq('project_id', projectData?.id).order('created_at', { ascending: false }).limit(10);
          if (actsData) setActivities(actsData);
        } catch (err) {
        console.log('Error loading data:', err.message);
      }
    }

    loadData();
  }, [user]);

  // Handle Real-time Subscriptions
  useEffect(() => {
    if (!projectId) return;
    
    // 1. Comments
    const commentChannel = supabase.channel(`project_${projectId}_comments`)
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

    // 2. Project Status & Features
    const projectChannel = supabase.channel(`project_${projectId}_status`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, (payload) => {
        const p = payload.new;
        setClientData(prev => ({ 
          ...prev, 
          status: p.status, 
          features: p.features || prev.features 
        }));
        setCustomFeatures(p.features || {});
      })
      .subscribe();

    // 3. Progress Steps
    const stepsChannel = supabase.channel(`project_${projectId}_steps`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'progress_steps', filter: `project_id=eq.${projectId}` }, async () => {
        const { data } = await supabase.from('progress_steps').select('*').eq('project_id', projectId).order('sort_order', { ascending: true });
        if (data) setProgress(data);
      })
      .subscribe();

    // 4. Project Updates
    const updateChannel = supabase.channel(`project_${projectId}_updates`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_updates', filter: `project_id=eq.${projectId}` }, async () => {
        const { data } = await supabase.from('project_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
        if (data) setUpdates(data.map(u => ({ ...u, date: new Date(u.created_at).toISOString().split('T')[0] })));
      })
      .subscribe();

    // 5. Activities
    const activityChannel = supabase.channel(`project_${projectId}_activities`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities', filter: `project_id=eq.${projectId}` }, (payload) => {
        setActivities(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentChannel);
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(stepsChannel);
      supabase.removeChannel(updateChannel);
    };
  }, [projectId]);

  const uploadToStorage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `chat/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setChatImage('uploading...');
        const url = await uploadToStorage(file);
        setChatImage(url);
      } catch (err) {
        console.error('Upload Error:', err.message);
        setChatImage(null);
        alert('Failed to upload image.');
      }
    }
  };

  const [customPages, setCustomPages] = useState(1);
  const [customFeatures, setCustomFeatures] = useState({
    contactForm: false,
    whatsapp: false,
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
        text: newComment,
        image_url: chatImage,
        is_client: true
      }]);

      await supabase.from('activities').insert([{
        project_id: projectId,
        action_type: 'comment_added',
        description: 'New feedback posted',
        performed_by: 'client'
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

  const confirmApprove = async () => {
    try {
      if (!projectId) return;

      // Update project status
      await supabase.from('projects').update({ status: 'completed' }).eq('id', projectId);

      // Mark all milestones as completed
      await supabase.from('progress_steps')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('project_id', projectId);

      setClientData({ ...clientData, status: 'completed' });
      setShowApproveModal(false);
    } catch (err) {
      console.error('Approval failed:', err.message);
      alert('Launch approval failed. Please try again.');
    }
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

              {/* Activity Timeline */}
              <div className="dashboard__activity-section card">
                <h2 className="dashboard__card-title">Activity Timeline</h2>
                <ActivityTimeline activities={activities} />
              </div>
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
              <div className="dashboard__customize-header card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                <h2 className="dashboard__card-title">Full-Site Design Preview</h2>
                <ProjectMockup theme={customTheme} pages={customPages} features={customFeatures} />
              </div>

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
                    <button className={`dashboard__theme-btn ${customTheme === 'Modern' ? 'dashboard__theme-btn--active' : ''}`} onClick={() => setCustomTheme('Modern')}>
                      <div className="dashboard__theme-preview" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}></div>
                      <span className="dashboard__theme-name">Modern</span>
                    </button>
                    <button className={`dashboard__theme-btn ${customTheme === 'Minimal' ? 'dashboard__theme-btn--active' : ''}`} onClick={() => setCustomTheme('Minimal')}>
                      <div className="dashboard__theme-preview" style={{ background: '#f8fafc' }}></div>
                      <span className="dashboard__theme-name">Minimal</span>
                    </button>
                    <button className={`dashboard__theme-btn ${customTheme === 'Light' ? 'dashboard__theme-btn--active' : ''}`} onClick={() => setCustomTheme('Light')}>
                      <div className="dashboard__theme-preview" style={{ background: '#ffffff', border: '1px solid #ddd' }}></div>
                      <span className="dashboard__theme-name">Light</span>
                    </button>
                    <button className={`dashboard__theme-btn ${customTheme === 'Lavender' ? 'dashboard__theme-btn--active' : ''}`} onClick={() => setCustomTheme('Lavender')}>
                      <div className="dashboard__theme-preview" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}></div>
                      <span className="dashboard__theme-name">Lavender</span>
                    </button>
                    <button className={`dashboard__theme-btn ${customTheme === 'Dark' ? 'dashboard__theme-btn--active' : ''}`} onClick={() => setCustomTheme('Dark')}>
                      <div className="dashboard__theme-preview" style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63)' }}></div>
                      <span className="dashboard__theme-name">Dark</span>
                    </button>
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
                    href={`https://wa.me/919746520910?text=Hi! Here's my website customization: ${customPages} pages, Features: ${Object.entries(customFeatures).filter(([,v]) => v).map(([k]) => k).join(', ')}, Theme: ${customTheme}`}
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