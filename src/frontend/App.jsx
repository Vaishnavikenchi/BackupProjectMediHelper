import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import SearchMedicine from './pages/SearchMedicine';
import ScannerPage from './pages/ScannerPage';
import UploadPrescription from './pages/UploadPrescription';
import MedicineDetail from './pages/MedicineDetail';
import RemindersPage from './pages/RemindersPage';
import AddReminder from './pages/AddReminder';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import NotificationManager from './components/NotificationManager';
import FontSizeAdjuster from './components/FontSizeAdjuster';

import { FontSizeProvider } from './context/FontSizeContext';

// Admin route guard — redirects non-admins back to dashboard
function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin-login" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <FontSizeProvider>
            <Router>
              <div className="min-h-screen bg-glow-effect flex flex-col relative w-full overflow-hidden">
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--glass-border)',
                    },
                  }}
                />

                <NotificationManager />
                <FontSizeAdjuster />

                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/admin-login" element={<AdminLogin />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                      {/* User routes */}
                      <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/search" element={<SearchMedicine />} />
                    <Route path="/scanner" element={<ScannerPage />} />
                    <Route path="/upload-prescription" element={<UploadPrescription />} />
                    <Route path="/medicine/:id" element={<MedicineDetail />} />
                    <Route path="/reminders" element={<RemindersPage />} />
                    <Route path="/reminders/add" element={<AddReminder />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* Admin-only route */}
                    <Route path="/admin" element={
                      <AdminRoute><AdminDashboard /></AdminRoute>
                    } />
                  </Route>
                </Route>
              </Routes>
            </div>
          </Router>
          </FontSizeProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;