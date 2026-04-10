import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineCurrencyRupee,
  HiOutlineChartBar,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineChatAlt,
  HiOutlinePhotograph,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineEye,
  HiOutlineClipboardCheck,
  HiOutlineMenuAlt2,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import { supabase } from '../../lib/supabase';
import logoImg from '../../assets/logo.png';
import './AdminDashboard.css';

// Empty initial clients (ready to fetch from DB later)
const INITIAL_CLIENTS = [];

const PROGRESS_STEPS = ['Design Completed', 'Development In Progress', 'Review Pending', 'Ready to Launch'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [adminReply, setAdminReply] = useState('');

  // New client form
  const [newClient, setNewClient] = useState({
    name: '', email: '', project: '', plan: 'Basic', pages: 1, theme: 'Modern', amount: 1499,
    features: { contactForm: false, whatsapp: false, booking: false }
  });

  // New update form
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '', image: null });
  const [isUploadingUpdate, setIsUploadingUpdate] = useState(false);

  // Progress steps
  const [progressSteps, setProgressSteps] = useState([]);
  const [newStepLabel, setNewStepLabel] = useState('');

  const [chatMessages, setChatMessages] = useState([]);
  const [chatImage, setChatImage] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]); // All registered profiles
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadMessages, setLeadMessages] = useState([]);
  const [leadReply, setLeadReply] = useState('');

  // Load Leads from Supabase
  const loadLeads = async () => {
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data);
    } catch (err) {
      console.error('Error loading leads:', err.message);
    }
  };

  // Load Clients from Supabase
  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          progress_steps(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const { data: updatesData } = await supabase.from('project_updates').select('*');

      const formatted = data.map(p => {
        const steps = p.progress_steps || [];
        const completedCount = steps.filter(s => s.status === 'completed').length;
        const currentCount = steps.findIndex(s => s.status === 'current') >= 0 ? 0.5 : 0;
        const calculatedProgress = steps.length > 0 
          ? Math.round(((completedCount + currentCount) / steps.length) * 100) 
          : 0;

        return {
          id: p.id,
          name: p.client_name,
          email: p.email || 'N/A',
          project: p.project_name,
          plan: p.plan,
          pages: p.num_pages,
          status: p.status,
          progress: calculatedProgress,
          theme: p.theme,
          paid: p.paid,
          amount: p.amount,
          features: p.features || { contactForm: false, whatsapp: false, booking: false },
          startDate: new Date(p.created_at).toISOString().split('T')[0],
          updates: (updatesData || []).filter(u => u.project_id === p.id).map(u => ({
            ...u,
            date: new Date(u.created_at).toISOString().split('T')[0]
          })),
        };
      });
      setClients(formatted);
    } catch (err) {
      console.error('Error loading clients:', err.message);
    }
  };

  useEffect(() => {
    const admin = localStorage.getItem('elmentra_admin');
    if (!admin) {
      navigate('/admin');
    } else {
      loadClients();
      loadLeads();
    }
  }, [navigate]);

  useEffect(() => {
    if (!selectedClient) return;

    // Load initial chat history when a client is selected
    const loadComments = async () => {
      const { data } = await supabase.from('comments').select('*').eq('project_id', selectedClient.id).order('created_at', { ascending: true });
      if (data) {
        setChatMessages(data.map(c => ({
          id: c.id,
          text: c.text,
          imageUrl: c.image_url,
          author: c.is_client ? selectedClient.name : 'Admin',
          date: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isClient: c.is_client
        })));
      }
    };
    loadComments();

    const loadProgressSteps = async () => {
      const { data } = await supabase.from('progress_steps')
        .select('*')
        .eq('project_id', selectedClient.id)
        .order('sort_order', { ascending: true });
      if (data) setProgressSteps(data);
    };
    loadProgressSteps();

    // 1. Comments real-time
    const commentChannel = supabase.channel(`admin_project_${selectedClient.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `project_id=eq.${selectedClient.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const c = payload.new;
          setChatMessages(prev => [...prev, {
            id: c.id,
            text: c.text,
            imageUrl: c.image_url,
            author: c.is_client ? selectedClient.name : 'Admin',
            date: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isClient: c.is_client
          }]);
        }
      })
      .subscribe();

    // 2. Project updates real-time
    const updateChannel = supabase.channel(`admin_updates_${selectedClient.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_updates', filter: `project_id=eq.${selectedClient.id}` }, (payload) => {
        if(payload.eventType === 'INSERT') {
           const u = payload.new;
           const formatted = { ...u, date: new Date(u.created_at).toISOString().split('T')[0] };
           setSelectedClient(prev => ({ ...prev, updates: [formatted, ...prev.updates] }));
           setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, updates: [formatted, ...c.updates] } : c));
        }
      })
      .subscribe();

    // 3. Progress steps real-time
    const progressChannel = supabase.channel(`admin_progress_${selectedClient.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'progress_steps', filter: `project_id=eq.${selectedClient.id}` }, () => {
        loadProgressSteps();
        loadClients(); // Reload clients to update overall progress % in list
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentChannel);
      supabase.removeChannel(updateChannel);
      supabase.removeChannel(progressChannel);
    };
  }, [selectedClient]);

  // Global project subscription
  useEffect(() => {
    const projectChannel = supabase.channel('admin_projects_all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
         loadClients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
    };
  }, []);

  useEffect(() => {
    if (!selectedLead) return;
    
    // Load lead messages
    const loadLeadMsgs = async () => {
      const { data } = await supabase.from('lead_messages').select('*').eq('lead_id', selectedLead.id).order('created_at', { ascending: true });
      if (data) setLeadMessages(data);
    };
    loadLeadMsgs();

    const channel = supabase.channel(`admin_lead_${selectedLead.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lead_messages', filter: `lead_id=eq.${selectedLead.id}` }, (payload) => {
        setLeadMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }, [selectedLead]);

  useEffect(() => {
    const leadChannel = supabase.channel('admin_leads_all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        loadLeads();
      })
      .subscribe();
    return () => supabase.removeChannel(leadChannel);
  }, []);

  const handleSendLeadReply = async (e) => {
    e.preventDefault();
    if (!selectedLead || !leadReply.trim()) return;
    try {
      await supabase.from('lead_messages').insert([{
        lead_id: selectedLead.id,
        sender: 'admin',
        message: leadReply
      }]);
      setLeadReply('');
    } catch (err) {
      console.error('Reply error:', err.message);
    }
  };

  const handleUpdateLeadStatus = async (id, status) => {
    try {
      await supabase.from('leads').update({ status }).eq('id', id);
      setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
      if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status });
    } catch (err) {
      console.error('Status error:', err.message);
    }
  };

  const convertLeadToProject = async (lead) => {
    if (confirm(`Convert ${lead.name}'s inquiry to an active project?`)) {
      try {
        const { data: project, error: pError } = await supabase.from('projects').insert([{
           client_name: lead.name,
           email: lead.email,
           project_name: lead.business_type || 'New Project',
           plan: lead.plan || 'Basic',
           num_pages: lead.pages || 1,
           amount: { Basic: 1499, Standard: 3499, Premium: 5999 }[lead.plan] || 1499,
           status: 'in_progress'
        }]).select().single();

        if (pError) throw pError;

        // Add default milestones
        const defaultSteps = [
          { project_id: project.id, step_name: 'Design Phase', sort_order: 0 },
          { project_id: project.id, step_name: 'Development', sort_order: 1 },
          { project_id: project.id, step_name: 'Final Review', sort_order: 2 }
        ];
        await supabase.from('progress_steps').insert(defaultSteps);

        // Update lead status to closed
        await supabase.from('leads').update({ status: 'closed' }).eq('id', lead.id);

        alert('Project created successfully! You can find it in All Clients tab.');
        setActiveSection('clients');
        setSelectedClient({ ...project, updates: [], progress: 0, startDate: new Date().toISOString().split('T')[0] });
        loadLeads();
      } catch (err) {
        console.error('Conversion failed:', err.message);
      }
    }
  };

  const logActivity = async (projectId, type, description) => {
    try {
      await supabase.from('activities').insert([{
        project_id: projectId,
        action_type: type,
        description,
        performed_by: 'admin'
      }]);
    } catch (err) {
      console.error('Activity Log Error:', err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('elmentra_admin');
    navigate('/admin');
  };

  const stats = {
    totalClients: clients.length,
    activeProjects: clients.filter((c) => c.status !== 'completed').length,
    totalRevenue: clients.filter((c) => c.paid).reduce((sum, c) => sum + c.amount, 0),
    completedProjects: clients.filter((c) => c.status === 'completed').length,
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('projects').insert([{
        client_name: newClient.name,
        email: newClient.email,
        project_name: newClient.project,
        plan: newClient.plan,
        num_pages: newClient.pages,
        theme: newClient.theme,
        amount: newClient.amount,
        features: newClient.features,
        status: 'in_progress',
        paid: false
      }]).select().single();
      
      if (error) throw error;
      
      await loadClients();
      setNewClient({ name: '', email: '', project: '', plan: 'Basic', pages: 1, theme: 'Modern', amount: 1499 });
      setShowAddClient(false);
    } catch (err) {
      console.error('Error adding client:', err.message);
      alert('Failed to add client.');
    }
  };

  const handleDeleteClient = async (id) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await supabase.from('projects').delete().eq('id', id);
        setClients(clients.filter((c) => c.id !== id));
        if (selectedClient?.id === id) setSelectedClient(null);
      } catch (err) {
        console.error('Error deleting:', err.message);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await supabase.from('projects').update({ status: newStatus }).eq('id', id);
      setClients(clients.map((c) => {
        if (c.id === id) {
          const progressMap = { in_progress: 25, design: 50, development: 75, review: 90, completed: 100 };
          logActivity(id, 'status_change', `Project status updated to ${newStatus.replace('_', ' ')}`);
          return { ...c, status: newStatus, progress: progressMap[newStatus] || c.progress };
        }
        return c;
      }));
    } catch (err) {
      console.error('Status check fail:', err.message);
    }
  };

  const handleTogglePaid = async (id) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    try {
      await supabase.from('projects').update({ paid: !client.paid }).eq('id', id);
      setClients(clients.map((c) => c.id === id ? { ...c, paid: !c.paid } : c));
    } catch (err) {
      console.error('Toggle paid fail:', err.message);
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    setIsUploadingUpdate(true);
    try {
      let finalImg = newUpdate.image;
      if (newUpdate.image instanceof File) {
        finalImg = await uploadToStorage(newUpdate.image);
      }

      const { data, error } = await supabase.from('project_updates').insert([{
        project_id: selectedClient.id,
        title: newUpdate.title,
        description: newUpdate.description,
        image: finalImg
      }]).select().single();
      
      if (error) throw error;

      const formattedUpdate = {
        ...data,
        date: new Date(data.created_at).toISOString().split('T')[0],
      };

      setClients(clients.map((c) =>
        c.id === selectedClient.id
          ? { ...c, updates: [formattedUpdate, ...c.updates] }
          : c
      ));
      logActivity(selectedClient.id, 'update_added', `New update posted: ${newUpdate.title}`);
      setSelectedClient({ ...selectedClient, updates: [formattedUpdate, ...selectedClient.updates] });
      setNewUpdate({ title: '', description: '', image: null });
      setShowAddUpdate(false);
    } catch (err) {
      console.error('Error adding update:', err.message);
      alert('Failed to add update.');
    } finally {
      setIsUploadingUpdate(false);
    }
  };

  const handleAddProgressStep = async (e) => {
    e.preventDefault();
    if (!newStepLabel.trim() || !selectedClient) return;
    try {
      const { data, error } = await supabase.from('progress_steps').insert([{
        project_id: selectedClient.id,
        step_name: newStepLabel,
        status: 'pending',
        sort_order: progressSteps.length
      }]).select().single();

      if (error) throw error;
      setProgressSteps([...progressSteps, data]);
      setNewStepLabel('');
    } catch (err) {
      console.error('Add Step Error:', err.message);
    }
  };

  const handleToggleStep = async (stepId, currentStatus) => {
    const nextStatus = { pending: 'current', current: 'completed', completed: 'pending' }[currentStatus];
    try {
      const { error } = await supabase.from('progress_steps').update({ 
        status: nextStatus,
        completed_at: nextStatus === 'completed' ? new Date().toISOString() : null
      }).eq('id', stepId);
      if (error) throw error;
      setProgressSteps(progressSteps.map(s => s.id === stepId ? { ...s, status: nextStatus } : s));
    } catch (err) {
      console.error('Toggle Step Error:', err.message);
    }
  };

  const handleDeleteStep = async (stepId) => {
    try {
      await supabase.from('progress_steps').delete().eq('id', stepId);
      setProgressSteps(progressSteps.filter(s => s.id !== stepId));
    } catch (err) {
      console.error('Delete Step Error:', err.message);
    }
  };

  const handleToggleFeature = async (featureName) => {
    if (!selectedClient) return;
    const updatedFeatures = { ...selectedClient.features, [featureName]: !selectedClient.features[featureName] };
    try {
      const { error } = await supabase.from('projects').update({ features: updatedFeatures }).eq('id', selectedClient.id);
      if (error) throw error;
      logActivity(selectedClient.id, 'feature_toggled', `${featureName} ${updatedFeatures[featureName] ? 'enabled' : 'disabled'}`);
      setSelectedClient({ ...selectedClient, features: updatedFeatures });
      setClients(clients.map(c => c.id === selectedClient.id ? { ...c, features: updatedFeatures } : c));
    } catch (err) {
      console.error('Toggle Feature Error:', err.message);
    }
  };

  const uploadToStorage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

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
        setChatImage('uploading...'); // Temporal placeholder
        const url = await uploadToStorage(file);
        setChatImage(url);
      } catch (err) {
        console.error('Upload Error:', err.message);
        setChatImage(null);
        alert('Failed to upload image. Please check your storage settings.');
      }
    }
  };

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    if (!adminReply.trim() && !chatImage) return;

    try {
      await supabase.from('comments').insert([{
        project_id: selectedClient.id,
        text: adminReply,
        image_url: chatImage,
        is_client: false
      }]);

      setAdminReply('');
      setChatImage(null);
    } catch(err) {
       console.error('Failed to post admin reply', err.message);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      in_progress: { label: 'In Progress', cls: 'badge-primary' },
      design: { label: 'Design', cls: 'badge-primary' },
      development: { label: 'Development', cls: 'badge-warning' },
      review: { label: 'Review', cls: 'badge-warning' },
      completed: { label: 'Completed', cls: 'badge-success' },
    };
    const s = map[status] || map.in_progress;
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <HiOutlineChartBar /> },
    { id: 'leads', label: 'Leads', icon: <HiOutlineChatAlt /> },
    { id: 'clients', label: 'All Clients', icon: <HiOutlineUsers /> },
    { id: 'users', label: 'User Database', icon: <HiOutlineShieldCheck /> },
    { id: 'projects', label: 'Projects', icon: <HiOutlineBriefcase /> },
    { id: 'settings', label: 'Settings', icon: <HiOutlineCog /> },
  ];

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' ? c.paid : !c.paid);
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} projects?`)) {
      try {
        await supabase.from('projects').delete().in('id', selectedIds);
        setClients(clients.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
      } catch (err) {
        console.error('Bulk Delete Error:', err.message);
      }
    }
  };

  return (
    <div className="admin">
      <header className="admin__mobile-header">
        <Link to="/" className="mobile-logo">
           <img src={logoImg} alt="logo" height="32" />
        </Link>
        <button className="mobile-logout" onClick={handleLogout}>
          <HiOutlineLogout size={20} />
        </button>
      </header>

      {/* SIDEBAR FOR DESKTOP */}
      <aside className="admin__sidebar">
        <div className="admin__sidebar-header">
          <Link to="/" className="admin__sidebar-logo-wrap">
            <img src={logoImg} alt="Elementra" className="admin__sidebar-logo-img" />
          </Link>
          <span className="admin__role-badge">Admin</span>
        </div>

        <nav className="admin__nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`admin__nav-item ${activeSection === item.id ? 'admin__nav-item--active' : ''}`}
              onClick={() => { setActiveSection(item.id); setSelectedClient(null); }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin__sidebar-footer">
          <button onClick={handleLogout} className="admin__logout-btn">
            <HiOutlineLogout /> Logout
          </button>
        </div>
      </aside>

      {/* BOTTOM NAV FOR MOBILE */}
      <nav className="admin__bottom-nav">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`admin__bottom-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => { setActiveSection(item.id); setSelectedClient(null); }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT */}
      <main className="admin__main">
        {/* Header */}
        <header className="admin__header">
          <div>
            <h1 className="admin__page-title">
              {activeSection === 'overview' && 'Dashboard Overview'}
              {activeSection === 'clients' && (selectedClient ? selectedClient.name : 'Client Management')}
              {activeSection === 'projects' && 'Project Tracker'}
            </h1>
            <p className="admin__page-subtitle">
              {activeSection === 'overview' && 'Welcome back, Admin'}
              {activeSection === 'clients' && (selectedClient ? selectedClient.project : `${clients.length} total clients`)}
              {activeSection === 'projects' && `${stats.activeProjects} active projects`}
            </p>
          </div>

          {activeSection !== 'overview' && activeSection !== 'settings' && !selectedClient && (
            <div className="admin__header-search">
              <input 
                type="text" 
                placeholder="Search clients or projects..." 
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select 
                className="form-input" 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          <div className="admin__header-actions">
            {selectedIds.length > 0 && (
              <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                <HiOutlineTrash /> Delete ({selectedIds.length})
              </button>
            )}
            {activeSection === 'clients' && !selectedClient && (
              <button onClick={() => setShowAddClient(true)} className="btn btn-primary btn-sm">
                <HiOutlinePlus /> Add Client
              </button>
            )}
            {selectedClient && (
              <button onClick={() => setSelectedClient(null)} className="btn btn-secondary btn-sm">
                ← Back
              </button>
            )}
          </div>
        </header>

        <div className="admin__content">
          {/* ===== OVERVIEW ===== */}
          {activeSection === 'overview' && (
            <div className="admin__overview animate-fade-in">
              <div className="admin__stats-grid">
                <div className="admin__stat-card card">
                  <div className="admin__stat-icon admin__stat-icon--blue"><HiOutlineUsers /></div>
                  <div className="admin__stat-info">
                    <span className="admin__stat-number">{stats.totalClients}</span>
                    <span className="admin__stat-label">Total Clients</span>
                  </div>
                </div>
                <div className="admin__stat-card card">
                  <div className="admin__stat-icon admin__stat-icon--purple"><HiOutlineBriefcase /></div>
                  <div className="admin__stat-info">
                    <span className="admin__stat-number">{stats.activeProjects}</span>
                    <span className="admin__stat-label">Active Projects</span>
                  </div>
                </div>
                <div className="admin__stat-card card">
                  <div className="admin__stat-icon admin__stat-icon--green"><HiOutlineCurrencyRupee /></div>
                  <div className="admin__stat-info">
                    <span className="admin__stat-number">₹{stats.totalRevenue.toLocaleString()}</span>
                    <span className="admin__stat-label">Revenue Collected</span>
                  </div>
                </div>
                <div className="admin__stat-card card">
                  <div className="admin__stat-icon admin__stat-icon--gold"><HiOutlineClipboardCheck /></div>
                  <div className="admin__stat-info">
                    <span className="admin__stat-number">{stats.completedProjects}</span>
                    <span className="admin__stat-label">Completed</span>
                  </div>
                </div>
              </div>

              {/* Recent clients table */}
              <div className="admin__recent card">
                <div className="admin__recent-header">
                  <h2 className="admin__card-title">Recent Clients</h2>
                  <button onClick={() => setActiveSection('clients')} className="admin__view-all">
                    View All →
                  </button>
                </div>
                <div className="admin__table-wrap">
                  <table className="admin__table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Project</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.slice(0, 5).map((client) => (
                        <tr key={client.id} onClick={() => { setSelectedClient(client); setActiveSection('clients'); }}>
                          <td>
                            <div className="admin__client-cell">
                              <div className="admin__client-avatar">{(client.name || 'C')[0]}</div>
                              <div>
                                <span className="admin__client-name">{client.name}</span>
                                <span className="admin__client-email">{client.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>{client.project}</td>
                          <td><span className="badge badge-primary">{client.plan}</span></td>
                          <td>{getStatusBadge(client.status)}</td>
                          <td>
                            <span className={`admin__payment ${client.paid ? 'admin__payment--paid' : 'admin__payment--pending'}`}>
                              {client.paid ? '✅ Paid' : '⏳ Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== SETTINGS SECTION ===== */}
          {activeSection === 'settings' && (
            <div className="admin__settings animate-fade-in">
               <div className="card admin__settings-card">
                  <h2 className="admin__card-title">Admin Account Settings</h2>
                  <p className="admin__page-subtitle">Manage your credentials and security</p>
                  
                  <div className="form-group" style={{marginTop: '2rem'}}>
                    <label className="form-label">Username</label>
                    <input type="text" className="form-input" disabled value={JSON.parse(localStorage.getItem('elmentra_admin'))?.username} />
                  </div>

                  <hr style={{margin: '2rem 0', opacity: 0.1}}/>
                  
                  <div className="admin__settings-danger">
                     <h3>Security</h3>
                     <p>Changes to security settings require re-authentication.</p>
                     <button className="btn btn-secondary" onClick={() => alert('Password reset link sent to admin email (simulated).')}>Change Password</button>
                  </div>
               </div>
            </div>
          )}

          {/* ===== LEADS SECTION ===== */}
          {activeSection === 'leads' && (
            <div className="admin__leads animate-fade-in" style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
              <div className="admin__leads-list card">
                <div className="admin__recent-header">
                  <h2 className="admin__card-title">Inbound Leads</h2>
                </div>
                <div className="admin__table-wrap">
                  <table className="admin__table">
                    <thead>
                      <tr>
                        <th>Recipient</th>
                        <th>Business</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(lead => (
                        <tr key={lead.id} onClick={() => setSelectedLead(lead)} className={selectedLead?.id === lead.id ? 'admin__table-row--selected' : ''}>
                          <td>
                             <div className="admin__client-cell">
                                <div className="admin__client-avatar" style={{background: '#4ade80'}}>{(lead.name || 'L')[0]}</div>
                                <div>
                                   <span className="admin__client-name">{lead.name || 'Anonymous'}</span>
                                   <span className="admin__client-email">{lead.plan || 'No Plan'}</span>
                                </div>
                             </div>
                          </td>
                          <td>{lead.business_type || 'N/A'}</td>
                          <td>
                             <select 
                               value={lead.status} 
                               onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                               className="admin__status-select"
                               onClick={(e) => e.stopPropagation()}
                             >
                               <option value="new">New</option>
                               <option value="contacted">Contacted</option>
                               <option value="closed">Closed</option>
                             </select>
                          </td>
                          <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                          <td>
                             <button 
                               className="btn btn-primary btn-sm"
                               onClick={(e) => { e.stopPropagation(); convertLeadToProject(lead); }}
                             >
                               Convert
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedLead && (
                <div className="admin__detail-card card animate-fade-in">
                   <div className="admin__card-header-row">
                      <h3 className="admin__card-title">Chat with {selectedLead.name || 'Lead'}</h3>
                      <button onClick={() => setSelectedLead(null)} className="admin__modal-close"><HiOutlineX /></button>
                   </div>

                   <div className="admin__chat-messages" style={{ height: '400px' }}>
                      {leadMessages.map(m => (
                        <div key={m.id} className={`admin__chat-msg admin__chat-msg--${m.sender === 'admin' ? 'admin' : 'client'}`}>
                           <div className="admin__chat-bubble">
                              <p>{m.message}</p>
                              <span style={{ fontSize: '10px', opacity: 0.5, marginTop: '4px', display: 'block' }}>
                                 {new Date(m.created_at).toLocaleTimeString()}
                              </span>
                           </div>
                        </div>
                      ))}
                   </div>

                   <form onSubmit={handleSendLeadReply} className="admin__reply-form">
                      <input 
                        type="text" 
                        value={leadReply} 
                        onChange={(e) => setLeadReply(e.target.value)}
                        placeholder="Type a reply to lead..." 
                        className="form-input"
                      />
                      <button type="submit" className="btn btn-primary">Send</button>
                   </form>

                   <div className="admin__detail-meta" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                      <div><span>Business Type:</span> <strong>{selectedLead.business_type}</strong></div>
                      <div><span>Pages:</span> <strong>{selectedLead.pages}</strong></div>
                      <div><span>Plan:</span> <strong>{selectedLead.plan}</strong></div>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* ===== CLIENTS LIST ===== */}
          {activeSection === 'clients' && !selectedClient && (
            <div className="admin__clients animate-fade-in card">
              <div className="admin__recent-header" style={{ marginBottom: '1.5rem' }}>
                <h2 className="admin__card-title">All Active Clients & Projects</h2>
              </div>
              
              <div className="admin__table-wrap">
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>Client Info</th>
                      <th>Project Overview</th>
                      <th>Plan & Pages</th>
                      <th>Theme</th>
                      <th>Progress</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id} onClick={() => setSelectedClient(client)} className="admin__row-hover">
                        <td>
                          <div className="admin__client-cell">
                            <div className="admin__client-avatar">{(client.name || 'C')[0]}</div>
                            <div>
                              <span className="admin__client-name">{client.name}</span>
                              <span className="admin__client-email">{client.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong>{client.project}</strong>
                            <span style={{ fontSize: '11px', opacity: 0.6 }}>Started: {client.startDate}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="badge badge-primary">{client.plan}</span>
                            <span style={{ fontSize: '11px', marginTop: '4px' }}>{client.pages} Pages</span>
                          </div>
                        </td>
                        <td>{client.theme}</td>
                        <td style={{ minWidth: '120px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="admin__progress-mini" style={{ flex: 1 }}>
                              <div className="admin__progress-mini-bar" style={{ width: `${client.progress}%` }}></div>
                            </div>
                            <span style={{ fontSize: '11px' }}>{client.progress}%</span>
                          </div>
                        </td>
                        <td>{getStatusBadge(client.status)}</td>
                        <td>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleTogglePaid(client.id); }}
                            className={`admin__payment-toggle ${client.paid ? 'admin__payment-toggle--paid' : ''}`}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '11px' }}
                          >
                            {client.paid ? '✅ Paid' : '💸 Mark Paid'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin__client-actions" style={{ justifyContent: 'flex-end' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedClient(client); }}
                              className="admin__action-btn admin__action-btn--view"
                            >
                              <HiOutlineEye />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }}
                              className="admin__action-btn admin__action-btn--delete"
                            >
                              <HiOutlineTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== USER DATABASE SECTION ===== */}
          {activeSection === 'users' && (
            <div className="admin__users animate-fade-in card">
              <div className="admin__recent-header">
                <h2 className="admin__card-title">Registered Web Accounts</h2>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>Profiles from website registrations</div>
              </div>
              
              <div className="admin__table-wrap" style={{ marginTop: '1.5rem' }}>
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>User Info</th>
                      <th>Email</th>
                      <th>Join Date</th>
                      <th>Account Status</th>
                      <th>Active Projects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="admin__client-cell">
                            <div className="admin__client-avatar" style={{ background: 'var(--grad-primary)' }}>{(user.name || 'U')[0]}</div>
                            <span className="admin__client-name">{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.startDate}</td>
                        <td><span className="badge badge-success">Verified</span></td>
                        <td>{clients.filter(p => p.email === user.email).length} Projects</td>
                      </tr>
                    ))}
                    {clients.length === 0 && (
                      <tr>
                        <td colSpan="5" className="admin__empty">No users found in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* ===== CLIENT DETAIL VIEW ===== */}
          {activeSection === 'clients' && selectedClient && (
            <div className="admin__client-detail-view animate-fade-in">
              {/* Status & Features Row */}
              <div className="admin__detail-row">
                <div className="admin__detail-card card">
                  <h3 className="admin__card-title">Project Status & Config</h3>

                  <div className="admin__status-selector">
                    {['in_progress', 'design', 'development', 'review', 'completed'].map((status) => (
                      <button
                        key={status}
                        className={`admin__status-btn ${selectedClient.status === status ? 'admin__status-btn--active' : ''}`}
                        onClick={() => {
                          handleStatusChange(selectedClient.id, status);
                          setSelectedClient({ ...selectedClient, status });
                        }}
                      >
                        {status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </button>
                    ))}
                  </div>

                  <div className="admin__features-management" style={{marginTop: '1.5rem'}}>
                    <h4 className="admin__small-title">Active Features</h4>
                    <div className="admin__features-grid">
                      {Object.keys(selectedClient.features).map(feature => (
                        <label key={feature} className="admin__feature-check">
                          <input 
                            type="checkbox" 
                            checked={selectedClient.features[feature]} 
                            onChange={() => handleToggleFeature(feature)}
                          />
                          <span>{feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="admin__detail-meta">
                    <div><span>Started:</span> <strong>{selectedClient.startDate}</strong></div>
                    <div><span>Plan:</span> <strong>{selectedClient.plan}</strong></div>
                    <div><span>Amount:</span> <strong>₹{selectedClient.amount.toLocaleString()}</strong></div>
                    <div>
                      <span>Payment:</span>
                      <button
                        onClick={() => {
                          handleTogglePaid(selectedClient.id);
                          setSelectedClient({ ...selectedClient, paid: !selectedClient.paid });
                        }}
                        className={`admin__payment-toggle ${selectedClient.paid ? 'admin__payment-toggle--paid' : ''}`}
                      >
                        {selectedClient.paid ? '✅ Paid' : '💸 Mark as Paid'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Steps Management */}
                <div className="admin__detail-card card">
                  <div className="admin__card-header-row">
                    <h3 className="admin__card-title">Detailed Milestones</h3>
                    <span className="badge badge-primary">{progressSteps.filter(s => s.status === 'completed').length}/{progressSteps.length}</span>
                  </div>

                  <div className="admin__steps-manager">
                    <form onSubmit={handleAddProgressStep} className="admin__step-form">
                      <input 
                        type="text" 
                        placeholder="New milestone..." 
                        className="form-input"
                        value={newStepLabel}
                        onChange={(e) => setNewStepLabel(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary btn-sm"><HiOutlinePlus /></button>
                    </form>

                    <div className="admin__steps-list">
                      {progressSteps.length === 0 ? (
                        <p className="admin__empty">No milestones added yet.</p>
                      ) : (
                        progressSteps.map(step => (
                          <div key={step.id} className={`admin__step-item admin__step-item--${step.status}`}>
                            <button 
                              className="admin__step-status-btn"
                              onClick={() => handleToggleStep(step.id, step.status)}
                            >
                              {step.status === 'completed' ? <HiOutlineCheck /> : step.status === 'current' ? <HiOutlineClock /> : null}
                            </button>
                            <span className="admin__step-label">{step.step_name}</span>
                            <button className="admin__step-delete" onClick={() => handleDeleteStep(step.id)}>
                              <HiOutlineX />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Updates & Chat */}
              <div className="admin__detail-row">
                 {/* Updates */}
                  <div className="admin__detail-card card">
                    <div className="admin__card-header-row">
                      <h3 className="admin__card-title">Project Updates</h3>
                      <button onClick={() => setShowAddUpdate(true)} className="btn btn-primary btn-sm">
                        <HiOutlinePlus /> Add Update
                      </button>
                    </div>

                    <div className="admin__updates-list">
                      {selectedClient.updates.length === 0 ? (
                        <p className="admin__empty">No updates yet.</p>
                      ) : (
                        selectedClient.updates.map((update) => (
                          <div key={update.id} className="admin__update-item">
                            <div className="admin__update-dot"></div>
                            <div>
                              <strong>{update.title}</strong>
                              <p>{update.description}</p>
                              {update.image && <img src={update.image} alt="update" className="admin__update-img" style={{maxHeight: '100px', borderRadius: '8px', marginTop: '8px'}} />}
                              <span className="admin__update-date">{update.date}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Chat */}
                  <div className="admin__detail-card card">
                    <h3 className="admin__card-title">
                      <HiOutlineChatAlt /> Communication
                    </h3>

                    <div className="admin__chat-messages">
                      {chatMessages.length === 0 ? (
                        <p className="admin__empty">No comments yet.</p>
                      ) : (
                        chatMessages.map((comment) => (
                          <div
                            key={comment.id}
                            className={`admin__chat-msg ${comment.isClient ? 'admin__chat-msg--client' : 'admin__chat-msg--admin'}`}
                          >
                            <div className="admin__chat-avatar">
                              {comment.isClient ? '👤' : '⚡'}
                            </div>
                            <div className="admin__chat-bubble">
                              <div className="admin__chat-meta">
                                <strong>{comment.author}</strong>
                                <span>{comment.date}</span>
                              </div>
                              {comment.text && <p>{comment.text}</p>}
                              {comment.imageUrl && (
                                <img 
                                  src={comment.imageUrl} 
                                  alt="Upload preview" 
                                  className="admin__chat-image" 
                                />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleAdminReply} className="admin__reply-form">
                      <label htmlFor="file-upload" className="admin__attach-btn">
                        <HiOutlinePhotograph />
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder={chatImage === 'uploading...' ? 'Uploading image...' : "Type reply..."}
                        value={adminReply}
                        onChange={(e) => setAdminReply(e.target.value)}
                        disabled={chatImage === 'uploading...'}
                      />
                      <button type="submit" className="btn btn-primary" disabled={chatImage === 'uploading...'}>Send</button>
                    </form>
                  </div>
              </div>
            </div>
          )}

          {/* ===== PROJECTS TAB ===== */}
          {activeSection === 'projects' && (
            <div className="admin__projects animate-fade-in">
              <div className="admin__table-wrap">
                <table className="admin__table admin__table--full">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox" 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds(filteredClients.map(c => c.id));
                            else setSelectedIds([]);
                          }}
                          checked={selectedIds.length > 0 && selectedIds.length === filteredClients.length}
                        />
                      </th>
                      <th>Client</th>
                      <th>Project</th>
                      <th>Plan</th>
                      <th>Progress</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id} className={selectedIds.includes(client.id) ? 'admin__table-row--selected' : ''}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(client.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds([...selectedIds, client.id]);
                              else setSelectedIds(selectedIds.filter(id => id !== client.id));
                            }}
                          />
                        </td>
                        <td>
                          <div className="admin__client-cell">
                            <div className="admin__client-avatar">{(client.name || 'C')[0]}</div>
                            <span className="admin__client-name">{client.name}</span>
                          </div>
                        </td>
                        <td>{client.project}</td>
                        <td>{client.plan}</td>
                        <td>
                          <div className="admin__progress-cell">
                            <div className="admin__progress-mini">
                              <div className="admin__progress-mini-bar" style={{ width: `${client.progress}%` }}></div>
                            </div>
                            <span>{client.progress}%</span>
                          </div>
                        </td>
                        <td>
                          <select
                            value={client.status}
                            onChange={(e) => handleStatusChange(client.id, e.target.value)}
                            className="admin__status-select"
                          >
                            <option value="in_progress">In Progress</option>
                            <option value="design">Design</option>
                            <option value="development">Development</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => handleTogglePaid(client.id)}
                            className={`admin__payment-toggle ${client.paid ? 'admin__payment-toggle--paid' : ''}`}
                          >
                            {client.paid ? '✅ Paid' : '💸 Pending'}
                          </button>
                        </td>
                        <td>
                          <div className="admin__table-actions">
                            <button
                              onClick={() => { setSelectedClient(client); setActiveSection('clients'); }}
                              className="admin__action-btn admin__action-btn--view"
                            >
                              <HiOutlineEye />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              className="admin__action-btn admin__action-btn--delete"
                            >
                              <HiOutlineTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ===== ADD CLIENT MODAL ===== */}
      {showAddClient && (
        <div className="admin__modal-overlay" onClick={() => setShowAddClient(false)}>
          <div className="admin__modal admin__modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin__modal-header">
              <h2>Add New Client</h2>
              <button onClick={() => setShowAddClient(false)} className="admin__modal-close"><HiOutlineX /></button>
            </div>

            <form onSubmit={handleAddClient} className="admin__modal-form">
              <div className="admin__form-grid">
                <div className="form-group">
                  <label className="form-label">Client Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter client name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="client@email.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Salon Website"
                    value={newClient.project}
                    onChange={(e) => setNewClient({ ...newClient, project: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                   <label className="form-label">Features Required</label>
                   <div className="admin__modal-features">
                      <label className="admin__feature-check">
                        <input 
                          type="checkbox" 
                          checked={newClient.features.contactForm}
                          onChange={(e) => setNewClient({...newClient, features: {...newClient.features, contactForm: e.target.checked}})}
                        />
                        <span>Contact Form</span>
                      </label>
                      <label className="admin__feature-check">
                        <input 
                          type="checkbox" 
                          checked={newClient.features.whatsapp}
                          onChange={(e) => setNewClient({...newClient, features: {...newClient.features, whatsapp: e.target.checked}})}
                        />
                        <span>WhatsApp</span>
                      </label>
                      <label className="admin__feature-check">
                        <input 
                          type="checkbox" 
                          checked={newClient.features.booking}
                          onChange={(e) => setNewClient({...newClient, features: {...newClient.features, booking: e.target.checked}})}
                        />
                        <span>Booking</span>
                      </label>
                   </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Plan</label>
                  <select
                    className="form-input"
                    value={newClient.plan}
                    onChange={(e) => {
                      const planAmounts = { Basic: 1499, Standard: 3499, Premium: 5999 };
                      setNewClient({
                        ...newClient,
                        plan: e.target.value,
                        amount: planAmounts[e.target.value],
                      });
                    }}
                  >
                    <option value="Basic">Basic — ₹1,499</option>
                    <option value="Standard">Standard — ₹3,499</option>
                    <option value="Premium">Premium — ₹5,999</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Pages</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="10"
                    value={newClient.pages}
                    onChange={(e) => setNewClient({ ...newClient, pages: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <select
                    className="form-input"
                    value={newClient.theme}
                    onChange={(e) => setNewClient({ ...newClient, theme: e.target.value })}
                  >
                    <option value="Modern">Modern</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Dark">Dark</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newClient.amount}
                    onChange={(e) => setNewClient({ ...newClient, amount: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="admin__modal-actions">
                <button type="button" onClick={() => setShowAddClient(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Client Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== ADD UPDATE MODAL ===== */}
      {showAddUpdate && (
        <div className="admin__modal-overlay" onClick={() => setShowAddUpdate(false)}>
          <div className="admin__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin__modal-header">
              <h2>Add Project Update</h2>
              <button onClick={() => setShowAddUpdate(false)} className="admin__modal-close"><HiOutlineX /></button>
            </div>
            <p className="admin__modal-subtitle">Notify {selectedClient.name} about project progress.</p>

            <form onSubmit={handleAddUpdate} className="admin__modal-form">
              <div className="form-group">
                <label className="form-label">Update Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Design Phase Completed"
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="What have you worked on?"
                  value={newUpdate.description}
                  onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="admin__modal-actions">
                <button type="button" onClick={() => setShowAddUpdate(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Post Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper icons
function HiOutlineClock(props) {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}
