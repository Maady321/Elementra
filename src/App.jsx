import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AIArchitect from './pages/AIArchitect/AIArchitect';
import ChatWidget from './components/Chatbot/ChatWidget';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import { useState, useEffect } from 'react';
import './App.css';

function AppLayout({ children, hideNav, isDarkMode, toggleTheme }) {
  return (
    <div className={`App ${hideNav ? 'App--no-nav' : ''} ${isDarkMode ? '' : 'light-mode'}`}>
      {!hideNav && <Navbar />}
      <div className="global-theme-switch">
        <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
      </div>
      <main>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('elmentra_theme');
    return saved === null ? true : saved === 'dark';
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    localStorage.setItem('elmentra_theme', isDarkMode ? 'dark' : 'light');
    document.body.className = isDarkMode ? 'dark-body' : 'light-body';
  }, [isDarkMode]);

  const Layout = ({ children, hideNav }) => (
    <AppLayout 
      children={children} 
      hideNav={hideNav} 
      isDarkMode={isDarkMode} 
      toggleTheme={toggleTheme} 
    />
  );

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/login"
            element={
              <Layout hideNav>
                <Login />
              </Layout>
            }
          />
          <Route
            path="/ai-architect"
            element={
              <Layout hideNav>
                <AIArchitect />
              </Layout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <Layout hideNav>
                <AdminLogin />
              </Layout>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <Layout hideNav>
                <AdminDashboard />
              </Layout>
            }
          />
        </Routes>
        <ChatBotSwitcher />
      </Router>
    </AuthProvider>
  );
}

function ChatBotSwitcher() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;
  return <ChatWidget />;
}
