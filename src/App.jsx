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
import Pricing from './pages/Pricing/Pricing';
import Portfolio from './pages/Portfolio/Portfolio';
import Contact from './pages/Contact/Contact';
import AdminProtectedRoute from './components/ProtectedRoute/AdminProtectedRoute';
import NotFound from './pages/NotFound/NotFound';
import ChatWidget from './components/Chatbot/ChatWidget';
import Cursor from './components/Cursor/Cursor';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

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

function AnimatedRoutes() {
  const location = useLocation();

  const Layout = ({ children, hideNav }) => (
    <AppLayout 
      children={children} 
      hideNav={hideNav} 
    />
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Layout>
                <Home />
              </Layout>
            </PageWrapper>
          }
        />
        <Route
          path="/pricing"
          element={
            <PageWrapper>
              <Layout>
                <Pricing />
              </Layout>
            </PageWrapper>
          }
        />
        <Route
          path="/portfolio"
          element={
            <PageWrapper>
              <Layout>
                <Portfolio />
              </Layout>
            </PageWrapper>
          }
        />
        <Route
          path="/contact"
          element={
            <PageWrapper>
              <Layout>
                <Contact />
              </Layout>
            </PageWrapper>
          }
        />
        <Route
          path="/login"
          element={
            <PageWrapper>
              <Layout hideNav>
                <Login />
              </Layout>
            </PageWrapper>
          }
        />
        <Route
          path="/ai-architect"
          element={
            <PageWrapper>
              <Layout hideNav>
                <AIArchitect />
              </Layout>
            </PageWrapper>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <Layout hideNav>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/admin"
          element={
            <PageWrapper>
              <Layout hideNav>
                <AdminLogin />
              </Layout>
            </PageWrapper>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PageWrapper>
              <AdminProtectedRoute>
                <Layout hideNav>
                  <AdminDashboard />
                </Layout>
              </AdminProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="*"
          element={
            <PageWrapper>
              <Layout hideNav>
                <NotFound />
              </Layout>
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  useEffect(() => {
    document.body.className = 'dark-body';
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
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
