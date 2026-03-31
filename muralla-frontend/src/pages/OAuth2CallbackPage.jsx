import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import '../auth.css';

/**
 * OAuth2CallbackPage
 * 
 * Spring Security redirects here after Google login:
 *   http://localhost:5173/oauth2-callback#token=JWT&email=...&name=...
 * 
 * This page reads the hash, persists the session, then redirects.
 */
export function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const { persistOAuth } = useAuth();
  const [status, setStatus] = useState('Procesando autenticación con Google...');
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash.slice(1); // remove leading '#'
    const params = new URLSearchParams(hash);

    const token = params.get('token');
    const email = params.get('email');
    const name  = params.get('name');
    const picture = params.get('picture');

    if (!token || !email) {
      setError('No se recibió un token válido de Google. Intenta de nuevo.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Persist the session (same as after a normal login)
    persistOAuth({ 
      token, 
      email, 
      fullName: decodeURIComponent(name || ''),
      profilePictureUrl: picture ? decodeURIComponent(picture) : null
    });
    setStatus('¡Autenticado! Redirigiendo...');

    // New user via Google goes to preferences wizard; existing users go to editor
    // We check localStorage for an existing "preferences_completed" flag
    const prefsCompleted = localStorage.getItem('muralla_prefs_done');
    setTimeout(() => navigate(prefsCompleted ? '/editor' : '/preferences'), 1000);
  }, []);

  return (
    <div className="pref-shell">
      <div style={{
        textAlign: 'center',
        color: 'rgba(255,255,255,0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
      }}>
        {!error ? (
          <>
            <div style={{
              width: '52px', height: '52px',
              border: '3px solid rgba(255,255,255,0.15)',
              borderTopColor: 'var(--orange)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: '1rem' }}>{status}</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '2rem' }}>⚠️</div>
            <p style={{ color: '#ff8080', fontSize: '0.95rem', maxWidth: '320px' }}>{error}</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
              Redirigiendo al inicio de sesión...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
