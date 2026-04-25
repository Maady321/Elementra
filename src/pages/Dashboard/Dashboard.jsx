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
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import logoImg from '../../assets/logo.png';
import './Dashboard.css';

const DEMO_DATA = {
  client: { name: '', email: '', project_name: '', plan: '', num_pages: 0, status: '' },
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProject, setHasProject] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const [projectId, setProjectId] = useState(null);
  const [accountForm, setAccountForm] = useState({ name: '', password: '' });
  const [accountStatus, setAccountStatus] = useState({ type: '', message: '' });

  const [customPages, setCustomPages] = useState(1);
  const [customFeatures, setCustomFeatures] = useState({ contactForm: false, whatsapp: false, booking: false });
  const [customTheme, setCustomTheme] = useState('Modern');

  const SkeletonBox = ({ width = '100%', height = '20px', style = {} }) => (
    <div style={{
      width, height, borderRadius: '6px',
      background: 'rgba(255,255,255,0.05)',
      animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      ...style
    }} />
  );

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        let { data: projectData } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!projectData && user.email) {
          const { data: emailData } = await supabase
            .from('projects')
            .select('*')
            .eq('email', user.email)
            .is('user_id', null)
            .maybeSingle();
          
          if (emailData) {
             projectData = emailData;
             await supabase.from('projects').update({ user_id: user.id }).eq('id', emailData.id);
          }
        }

        if (!projectData) {
          setHasProject(false);
          return;
        }

        setHasProject(true);
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
        setAccountForm({ name: projectData.client_name || '', password: '' });

        const { data: stepsData } = await supabase.from('progress_steps').select('*').eq('project_id', projectData.id).order('sort_order', { ascending: true });
        if (stepsData) setProgress(stepsData);

        const { data: commentsData } = await supabase.from('comments').select('*').eq('project_id', projectData.id).order('created_at', { ascending: true });
        if (commentsData) setChatMessages(commentsData.map(c => ({
          id: c.id, author: c.is_client ? 'You' : 'Developer', text: c.text, imageUrl: c.image_url,
          date: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isClient: c.is_client
        })));

        const { data: updatesData } = await supabase.from('project_updates').select('*').eq('project_id', projectData.id).order('created_at', { ascending: false });
        if (updatesData) setUpdates(updatesData.map(u => ({ ...u, date: new Date(u.created_at).toISOString().split('T')[0] })));

        const { data: actsData } = await supabase.from('activities').select('*').eq('project_id', projectData.id).order('created_at', { ascending: false }).limit(10);
        if (actsData) setActivities(actsData);

      } catch (err) {
        toast.error('Error loading dashboard data');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  useEffect(() => {
    if (!projectId) return;

    const channels = [
      supabase.channel(`project_${projectId}_comments`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `project_id=eq.${projectId}` }, (p) => {
        const c = p.new;
        setChatMessages(prev => [...prev, { id: c.id, author: c.is_client ? 'You' : 'Developer', text: c.text, imageUrl: c.image_url, date: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isClient: c.is_client }]);
      }).subscribe(),
      supabase.channel(`project_${projectId}_status`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, (p) => {
        setClientData(prev => ({ ...prev, status: p.new.status, features: p.new.features || prev.features }));
      }).subscribe(),
      supabase.channel(`project_${projectId}_steps`).on('postgres_changes', { event: '*', schema: 'public', table: 'progress_steps', filter: `project_id=eq.${projectId}` }, async () => {
        const { data } = await supabase.from('progress_steps').select('*').eq('project_id', projectId).order('sort_order', { ascending: true });
        if (data) setProgress(data);
      }).subscribe()
    ];

    return () => channels.forEach(ch => supabase.removeChannel(ch));
  }, [projectId]);

  const saveCustomization = async () => {
    if (!projectId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('projects').update({ num_pages: customPages, theme: customTheme, features: customFeatures }).eq('id', projectId);
      if (error) throw error;
      setClientData(prev => ({ ...prev, num_pages: customPages, features: customFeatures }));
      toast.success('Preferences saved!');
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const requestLaunchApproval = async () => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/approve-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ projectId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setClientData({ ...clientData, status: 'review' });
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Approval request failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      if (accountForm.name !== clientData.name) {
        await supabase.from('projects').update({ client_name: accountForm.name }).eq('id', projectId);
        setClientData(prev => ({ ...prev, name: accountForm.name }));
      }
      if (accountForm.password) {
        if (accountForm.password.length < 6) throw new Error('Password too short');
        await supabase.auth.updateUser({ password: accountForm.password });
        setAccountForm(prev => ({ ...prev, password: '' }));
      }
      toast.success('Account updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getProgressPercentage = () => {
    if (!progress.length) return 0;
    const completed = progress.filter(p => p.status === 'completed').length;
    const current = progress.findIndex(p => p.status === 'current') >= 0 ? 0.5 : 0;
    return Math.round(((completed + current) / progress.length) * 100);
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <HiOutlineCheckCircle className="progress__icon progress__icon--completed" />;
    if (status === 'current') return <HiOutlineClock className="progress__icon progress__icon--current" />;
    return <div className="progress__icon progress__icon--pending" />;
  };

  if (hasProject === false) return (
    <div className="dashboard__no-project">
      <Helmet><title>Dashboard — Elementra</title></Helmet>
      <div className="dashboard__no-project-card card">
        <div style={{fontSize: '3.5rem', marginBottom: '1.5rem'}}>⏳</div>
        <h2>Your Project is Being Set Up</h2>
        <p>Our team is reviewing your inquiry and will create your dashboard shortly.</p>
        <div style={{marginTop: '2rem', display:'flex', flexDirection:'column', gap:'1rem'}}>
          <a href="https://wa.me/919746520910" className="btn btn-primary">Chat on WhatsApp</a>
          <button onClick={() => { signOut(); navigate('/'); }} className="btn btn-secondary">Sign Out</button>
        </div>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="dashboard dashboard--loading">
      <SkeletonBox height="60px" style={{ marginBottom: '2rem' }} />
      <div className="dashboard__info-grid">
        {[1,2,3,4].map(i => (
          <div key={i} className="dashboard__info-card card">
            <SkeletonBox height="40px" width="40px" style={{borderRadius:'50%'}} />
            <div style={{flex:1, display:'flex', flexDirection:'column', gap:'8px'}}>
              <SkeletonBox height="12px" width="60%" />
              <SkeletonBox height="16px" width="80%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <HiOutlineBriefcase /> },
    { id: 'updates', label: 'Updates', icon: <HiOutlinePhotograph /> },
    { id: 'comments', label: 'Comments', icon: <HiOutlineChatAlt /> },
    { id: 'customize', label: 'Customize', icon: <HiOutlineAdjustments /> },
    { id: 'account', label: 'Account', icon: <HiOutlineUser /> },
  ];

  return (
    <div className="dashboard">
      <Helmet><title>{clientData.project_name || 'Dashboard'} | Elementra</title></Helmet>
      
      <div className="dashboard__sidebar">
        <div className="dashboard__sidebar-header">
           {/* Logo removed per user request */}
        </div>
        <nav className="dashboard__nav">
          {tabs.map(tab => (
            <button key={tab.id} className={`dashboard__nav-item ${activeTab === tab.id ? 'dashboard__nav-item--active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="dashboard__sidebar-footer">
          <button onClick={() => { signOut(); navigate('/'); }} className="dashboard__logout-btn"><HiOutlineLogout /> Logout</button>
        </div>
      </div>

      <main className="dashboard__main">
        {activeTab === 'overview' && (
          <div className="dashboard__overview animate-fade-in">
            <div className="dashboard__header-row">
              <div>
                <h1>{clientData.project_name}</h1>
                <p>Track your project progress and milestones in real-time.</p>
              </div>
              {clientData.status === 'review' ? (
                <div className="badge badge-warning">Launch Requested — Awaiting Admin Approval</div>
              ) : clientData.status === 'completed' ? (
                <div className="badge badge-success">🚀 Project Launched!</div>
              ) : (
                <button onClick={requestLaunchApproval} disabled={isUpdating} className="btn btn-primary">
                  <FaRocket style={{marginRight: '8px'}}/> {isUpdating ? 'Requesting...' : 'Request Launch Approval'}
                </button>
              )}
            </div>

            <div className="dashboard__info-grid">
              <div className="dashboard__info-card card">
                <div className="dashboard__info-icon" style={{background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1'}}><HiOutlineBriefcase /></div>
                <div><span className="dashboard__info-label">Plan</span><span className="dashboard__info-value">{clientData.plan}</span></div>
              </div>
              <div className="dashboard__info-card card">
                <div className="dashboard__info-icon" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}><HiOutlineClipboardCheck /></div>
                <div><span className="dashboard__info-label">Pages</span><span className="dashboard__info-value">{clientData.num_pages} Pages</span></div>
              </div>
              <div className="dashboard__info-card card">
                <div className="dashboard__info-icon" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}><HiOutlineClock /></div>
                <div><span className="dashboard__info-label">Status</span><span className="dashboard__info-value" style={{textTransform: 'capitalize'}}>{clientData.status.replace('_', ' ')}</span></div>
              </div>
              <div className="dashboard__info-card card">
                 <div className="dashboard__info-icon" style={{background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1'}}><HiOutlineDesktopComputer /></div>
                 <div><span className="dashboard__info-label">Theme</span><span className="dashboard__info-value">{customTheme}</span></div>
              </div>
            </div>

            <div className="dashboard__main-grid">
              <div className="dashboard__progress-section card">
                <div className="dashboard__card-header">
                  <h2 className="dashboard__card-title">Project Milestones</h2>
                  <span className="dashboard__progress-percent">{getProgressPercentage()}%</span>
                </div>
                <div className="dashboard__master-progress">
                   <div className="dashboard__progress-fill" style={{width: `${getProgressPercentage()}%`}}></div>
                </div>
                <div className="dashboard__steps">
                  {progress.map((step) => (
                    <div key={step.id} className={`dashboard__step ${step.status === 'completed' ? 'dashboard__step--completed' : step.status === 'current' ? 'dashboard__step--current' : ''}`}>
                      {getStatusIcon(step.status)}
                      <div className="dashboard__step-info">
                        <span className="dashboard__step-name">{step.step_name}</span>
                        <span className="dashboard__step-date">{step.completed_at ? new Date(step.completed_at).toLocaleDateString() : ''}</span>
                      </div>
                      {step.status === 'completed' && <HiOutlineCheck className="dashboard__step-check" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard__secondary-column">
                {updates.length > 0 && (
                  <div className="dashboard__latest-update card">
                    <h2 className="dashboard__card-title">Latest Update</h2>
                    <div className="dashboard__update-preview">
                      {updates[0].image && <img src={updates[0].image} alt={updates[0].title} className="dashboard__update-image" />}
                      <div className="dashboard__update-info">
                        <h3>{updates[0].title}</h3>
                        <p>{updates[0].description}</p>
                        <span className="dashboard__update-date">{updates[0].date}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="dashboard__mockup-section card">
                   <h2 className="dashboard__card-title">Live Preview</h2>
                   <ProjectMockup theme={customTheme} screenshot={updates[0]?.image} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="dashboard__updates animate-fade-in">
            <h1 className="dashboard__page-title">Project Updates</h1>
            <div className="dashboard__updates-grid">
              {updates.map(u => (
                <div key={u.id} className="dashboard__update-card card">
                  {u.image && <div className="dashboard__update-img-wrap"><img src={u.image} alt={u.title} /></div>}
                  <div className="dashboard__update-body">
                    <h3>{u.title}</h3>
                    <p>{u.description}</p>
                    <span className="dashboard__update-date">{u.date}</span>
                  </div>
                </div>
              ))}
              {updates.length === 0 && <div className="dashboard__empty-state card">No updates yet. Check back soon!</div>}
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="dashboard__comments animate-fade-in">
            <h1 className="dashboard__page-title">Feedback & Support</h1>
            <div className="dashboard__chat-card card">
              <div className="dashboard__chat-messages">
                {chatMessages.map(m => (
                  <div key={m.id} className={`dashboard__chat-msg ${m.isClient ? 'dashboard__chat-msg--client' : 'dashboard__chat-msg--admin'}`}>
                    <div className="dashboard__chat-bubble">
                      {m.imageUrl && <img src={m.imageUrl} alt="attached" className="dashboard__chat-img" />}
                      <p>{m.text}</p>
                      <span className="dashboard__chat-time">{m.date}</span>
                    </div>
                  </div>
                ))}
              </div>
              <form className="dashboard__chat-input" onSubmit={async (e) => {
                e.preventDefault();
                if (!newComment.trim()) return;
                await supabase.from('comments').insert({ project_id: projectId, text: newComment, is_client: true });
                setNewComment('');
              }}>
                <input type="text" placeholder="Type your message..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                <button type="submit" className="btn btn-primary">Send</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'customize' && (
          <div className="dashboard__customize animate-fade-in">
             <h1 className="dashboard__page-title">Customize Your Website</h1>
             <div className="dashboard__customize-grid">
                <div className="card">
                   <h2 className="dashboard__card-title">Preferences</h2>
                   <div className="customize__option">
                      <label>Theme Style</label>
                      <select value={customTheme} onChange={e => setCustomTheme(e.target.value)} className="form-input">
                         <option value="Modern">Modern & Sleek</option>
                         <option value="Minimal">Minimalist</option>
                         <option value="Dark">Executive Dark</option>
                      </select>
                   </div>
                   <div className="customize__option">
                      <label>Additional Pages</label>
                      <input type="number" value={customPages} onChange={e => setCustomPages(e.target.value)} className="form-input" min="1" max="10" />
                   </div>
                   <button onClick={saveCustomization} className="btn btn-primary" style={{width: '100%', marginTop: '2rem'}} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="dashboard__account animate-fade-in">
             <h1>Account Settings</h1>
             <div className="card" style={{maxWidth: '500px'}}>
                <form onSubmit={handleUpdateAccount}>
                   <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" className="form-input" value={accountForm.name} onChange={e => setAccountForm({...accountForm, name: e.target.value})} />
                   </div>
                   <div className="form-group">
                      <label>New Password (leave blank to keep)</label>
                      <input type="password" className="form-input" value={accountForm.password} onChange={e => setAccountForm({...accountForm, password: e.target.value})} />
                   </div>
                   <button type="submit" className="btn btn-primary" disabled={isUpdating}>Update Account</button>
                </form>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}