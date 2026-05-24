import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MarketPage from './pages/MarketPage';
import ApplyPage from './pages/ApplyPage';
import CareerPage from './pages/CareerPage';
import KYSPage from './pages/KYSPage';
import ClubDashboardPage from './pages/ClubDashboardPage';
import ClubPostPage from './pages/ClubPostPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Layout
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import SystemFooter from './components/layout/SystemFooter';

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/users" replace />;
  }

  if (user.role === 'klub' || user.role === 'pencari_bakat') {
    return <Navigate to="/club/dashboard" replace />;
  }

  return <Navigate to="/market" replace />;
}

function MainApp() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const showNavLayout = isAuthenticated && user && !isAuthPage;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D1FF00] selection:text-black">
      {showNavLayout && (
        <>
          <Navbar />
          <Sidebar />
          {user.role === 'talent' && <BottomNav />}
          <SystemFooter />
        </>
      )}

      <main className={showNavLayout ? 'lg:pl-56 pt-4 px-4 sm:px-6 lg:px-8 pb-32 sm:pb-36' : ''}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Pages */}
          <Route
            path="/market"
            element={
              <ProtectedRoute requiredRole={['talent', 'admin']}>
                <MarketPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply/:id"
            element={
              <ProtectedRoute requiredRole={['talent']}>
                <ApplyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/career"
            element={
              <ProtectedRoute requiredRole={['talent']}>
                <CareerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kys"
            element={
              <ProtectedRoute requiredRole={['talent', 'admin']}>
                <KYSPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Club Protected Pages */}
          <Route
            path="/club/dashboard"
            element={
              <ProtectedRoute requiredRole={['klub', 'pencari_bakat']}>
                <ClubDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/post"
            element={
              <ProtectedRoute requiredRole={['klub', 'pencari_bakat']}>
                <ClubPostPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Pages */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
