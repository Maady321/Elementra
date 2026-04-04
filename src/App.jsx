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
import { useEffect } from 'react';
import './App.css';

function AppLayout({ children, hideNav }) {
  return (
    <div className={`App ${hideNav ? 'App--no-nav' : ''}`}>
      {!hideNav && <Navbar />}
      <main>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.body.className = 'dark-body';
  }, []);

  const Layout = ({ children, hideNav }) => (
    <AppLayout 
      children={children} 
      hideNav={hideNav} 
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
