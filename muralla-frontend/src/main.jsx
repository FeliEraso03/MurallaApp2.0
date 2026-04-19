import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { AboutUs } from './pages/AboutUs.jsx';
import { Instructions } from './pages/Instructions.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { PreferencesPage } from './pages/PreferencesPage.jsx';
import { UserProfilePage } from './pages/UserProfilePage.jsx';
import { OAuth2CallbackPage } from './pages/OAuth2CallbackPage.jsx';
import { AuthProvider, useAuth } from './utils/authContext.jsx';
import { I18nProvider } from './contexts/I18nContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import './App.css';
import './pages.css';
import './notifications.css';

// Protected route: redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--navy)', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem',
    }}>
      Cargando sesión...
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Guest route: redirects to /editor if already authenticated
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/editor" replace />;
  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <I18nProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/instructions" element={<Instructions />} />

              {/* Guest-only auth pages */}
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

              {/* OAuth2 callback — always public, handles Google redirect */}
              <Route path="/oauth2-callback" element={<OAuth2CallbackPage />} />

              {/* Protected: preferences wizard (right after register) */}
              <Route path="/preferences" element={
                <ProtectedRoute><PreferencesPage /></ProtectedRoute>
              } />

              {/* Public: main editor with nested profile overlay */}
              <Route path="/editor" element={<App />}>
                <Route path="profile" element={
                  <ProtectedRoute><UserProfilePage /></ProtectedRoute>
                } />
              </Route>

              {/* Redirect legacy /profile */}
              <Route path="/profile" element={
                <Navigate to="/editor/profile" replace />
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </I18nProvider>
    </AuthProvider>
  </React.StrictMode>,
);
