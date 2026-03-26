import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
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
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <AppLayout>
                <Home />
              </AppLayout>
            }
          />
          <Route
            path="/login"
            element={
              <AppLayout hideNav>
                <Login />
              </AppLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AppLayout hideNav>
                <AdminLogin />
              </AppLayout>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AppLayout hideNav>
                <AdminDashboard />
              </AppLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
