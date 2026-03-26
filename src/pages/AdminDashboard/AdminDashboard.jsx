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
  });

  // New update form
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '' });

  // Socket chat handling
  const [chatMessages, setChatMessages] = useState([]);
  const [chatImage, setChatImage] = useState(null);

  // Load Clients from Supabase
  const loadClients = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      // Group/fetch updates locally or via a separate query
      const { data: updatesData } = await supabase.from('project_updates').select('*');

      const formatted = data.map(p => ({
        id: p.id,
        name: p.client_name,
        email: p.email || 'N/A',
        project: p.project_name,
        plan: p.plan,
        pages: p.num_pages,
        status: p.status,
        progress: { in_progress: 25, design: 50, development: 75, review: 90, completed: 100 }[p.status] || 0,
        theme: p.theme,
        paid: p.paid,
        amount: p.amount,
        startDate: new Date(p.created_at).toISOString().split('T')[0],
        updates: (updatesData || []).filter(u => u.project_id === p.id).map(u => ({
          ...u,
          date: new Date(u.created_at).toISOString().split('T')[0]
        })),
        comments: [], // Comments handled by socket mostly or could be fetched
      }));
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

    const channel = supabase.channel(`admin_project_${selectedClient.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `project_id=eq.${selectedClient.id}` }, (payload) => {
        const c = payload.new;
        setChatMessages(prev => [...prev, {
          id: c.id,
          text: c.text,
          imageUrl: c.image_url,
          author: c.is_client ? selectedClient.name : 'Admin',
          date: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isClient: c.is_client
        }]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClient]);

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
    try {
      const { data, error } = await supabase.from('project_updates').insert([{
        project_id: selectedClient.id,
        title: newUpdate.title,
        description: newUpdate.description
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
      setSelectedClient({ ...selectedClient, updates: [formattedUpdate, ...selectedClient.updates] });
      setNewUpdate({ title: '', description: '' });
      setShowAddUpdate(false);
    } catch (err) {
      console.error('Error adding update:', err.message);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChatImage(reader.result); // Save Base64 for the chat
      };
      reader.readAsDataURL(file);
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
    { id: 'clients', label: 'All Clients', icon: <HiOutlineUsers /> },
    { id: 'projects', label: 'Projects', icon: <HiOutlineBriefcase /> },
  ];

  return (
    <div className="admin">
      <header className="dashboard__mobile-header">
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
      <nav className="dashboard__bottom-nav">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`dashboard__bottom-item ${activeSection === item.id ? 'active' : ''}`}
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

          {activeSection === 'clients' && !selectedClient && (
            <button onClick={() => setShowAddClient(true)} className="btn btn-primary btn-sm">
              <HiOutlinePlus /> Add Client
            </button>
          )}
          {selectedClient && (
            <button onClick={() => setSelectedClient(null)} className="btn btn-secondary btn-sm">
              ← Back to Clients
            </button>
          )}
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
                      {clients.slice(0, 5).map((client) => (
                        <tr key={client.id} onClick={() => { setSelectedClient(client); setActiveSection('clients'); }}>
                          <td>
                            <div className="admin__client-cell">
                              <div className="admin__client-avatar">{client.name[0]}</div>
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

          {/* ===== CLIENTS LIST ===== */}
          {activeSection === 'clients' && !selectedClient && (
            <div className="admin__clients animate-fade-in">
              <div className="admin__clients-grid">
                {clients.map((client) => (
                  <div key={client.id} className="admin__client-card card">
                    <div className="admin__client-card-header">
                      <div className="admin__client-cell">
                        <div className="admin__client-avatar">{client.name[0]}</div>
                        <div>
                          <span className="admin__client-name">{client.name}</span>
                          <span className="admin__client-email">{client.email}</span>
                        </div>
                      </div>
                      <div className="admin__client-actions">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedClient(client); }}
                          className="admin__action-btn admin__action-btn--view"
                          title="View"
                        >
                          <HiOutlineEye />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }}
                          className="admin__action-btn admin__action-btn--delete"
                          title="Delete"
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </div>

                    <div className="admin__client-card-body">
                      <div className="admin__client-detail">
                        <span>Project</span>
                        <strong>{client.project}</strong>
                      </div>
                      <div className="admin__client-detail">
                        <span>Plan</span>
                        <strong>{client.plan} — ₹{client.amount.toLocaleString()}</strong>
                      </div>
                      <div className="admin__client-detail">
                        <span>Pages</span>
                        <strong>{client.pages}</strong>
                      </div>
                      <div className="admin__client-detail">
                        <span>Theme</span>
                        <strong>{client.theme}</strong>
                      </div>
                    </div>

                    <div className="admin__client-card-footer">
                      <div className="admin__progress-mini">
                        <div className="admin__progress-mini-bar" style={{ width: `${client.progress}%` }}></div>
                      </div>
                      <div className="admin__client-footer-row">
                        {getStatusBadge(client.status)}
                        <button
                          onClick={() => handleTogglePaid(client.id)}
                          className={`admin__payment-toggle ${client.paid ? 'admin__payment-toggle--paid' : ''}`}
                        >
                          {client.paid ? '✅ Paid' : '💸 Mark Paid'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== CLIENT DETAIL ===== */}
          {activeSection === 'clients' && selectedClient && (
            <div className="admin__client-detail-view animate-fade-in">
              {/* Status & Progress */}
              <div className="admin__detail-row">
                <div className="admin__detail-card card">
                  <h3 className="admin__card-title">Project Status</h3>

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
                      <p className="admin__empty">No updates yet. Add one to keep the client informed.</p>
                    ) : (
                      selectedClient.updates.map((update) => (
                        <div key={update.id} className="admin__update-item">
                          <div className="admin__update-dot"></div>
                          <div>
                            <strong>{update.title}</strong>
                            <p>{update.description}</p>
                            <span className="admin__update-date">{update.date}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="admin__detail-card card">
                <h3 className="admin__card-title">
                  <HiOutlineChatAlt /> Client Feedback & Reply
                </h3>

                <div className="admin__chat-messages">
                  {chatMessages.length === 0 ? (
                    <p className="admin__empty">No comments yet. Start a conversation!</p>
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

                {chatImage && (
                  <div className="admin__chat-image-preview-container">
                    <img src={chatImage} alt="preview" className="admin__chat-image-preview" />
                    <button type="button" onClick={() => setChatImage(null)} className="admin__modal-close">
                      <HiOutlineX />
                    </button>
                  </div>
                )}

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
                    placeholder="Type your reply to the client..."
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">Send</button>
                </form>
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
                      <th>Client</th>
                      <th>Project</th>
                      <th>Plan</th>
                      <th>Pages</th>
                      <th>Progress</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id}>
                        <td>
                          <div className="admin__client-cell">
                            <div className="admin__client-avatar">{client.name[0]}</div>
                            <span className="admin__client-name">{client.name}</span>
                          </div>
                        </td>
                        <td>{client.project}</td>
                        <td>{client.plan}</td>
                        <td>{client.pages}</td>
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
