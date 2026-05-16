import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import Sidebar from './components/layout/Sidebar';
import SystemFooter from './components/layout/SystemFooter';
import MarketPage from './pages/MarketPage';
import CareerPage from './pages/CareerPage';
import KYSPage from './pages/KYSPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClubDashboardPage from './pages/ClubDashboardPage';
import ClubPostPage from './pages/ClubPostPage';
import ApplyPage from './pages/ApplyPage';
import AdminUsersPage from './pages/AdminUsersPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/club-login" element={<Navigate to="/login" replace />} />

        {/* Protected club routes (standalone layout) */}
        <Route
          path="/club/dashboard"
          element={
            <ProtectedRoute requiredRole={['klub', 'pencari_bakat', 'admin']}>
              <ClubDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club/post"
          element={
            <ProtectedRoute requiredRole={['klub', 'pencari_bakat', 'admin']}>
              <ClubPostPage />
            </ProtectedRoute>
          }
        />

        {/* Protected admin routes (standalone layout) */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        {/* Main app with layout */}
        <Route path="*" element={<MainApp />} />
      </Routes>
    </AuthProvider>
  );
}

function MainApp() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans lg:pl-56">
      <Sidebar />

      <div className="sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto sm:border-x border-white/10 relative min-h-screen pb-32">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/market" element={<MarketPage />} />
            <Route
              path="/career"
              element={
                <ProtectedRoute requiredRole={['talent', 'admin']}>
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
              path="/apply/:jobId"
              element={
                <ProtectedRoute requiredRole={['talent', 'admin']}>
                  <ApplyPage />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<Navigate to="/market" replace />} />
            <Route path="/settings" element={<Navigate to="/market" replace />} />
            <Route path="*" element={<Navigate to="/market" replace />} />
          </Routes>
        </main>

        <div className="lg:hidden">
          <BottomNav />
        </div>
        <SystemFooter />
      </div>
    </div>
  );
}
