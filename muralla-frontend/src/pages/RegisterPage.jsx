import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import '../auth.css';

// ── SVG Icons ─────────────────────────────────────────
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function PasswordStrength({ password }) {
  const getStrength = (p) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const s = getStrength(password);
  const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const colors = ['', '#e55d02', '#f4a021', '#00b4d8', '#4ade9b'];
  if (!password) return null;
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: i <= s ? colors[s] : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '0.72rem', color: colors[s] }}>{labels[s]}</span>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setFieldErrors(fe => ({ ...fe, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Ingresa tu nombre completo.';
    if (!form.email.includes('@')) errs.email = 'Correo electrónico inválido.';
    if (form.password.length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres.';
    if (form.password !== form.confirm) errs.confirm = 'Las contraseñas no coinciden.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setLoading(true);
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password });
      // Redirect to preferences wizard after registration
      navigate('/preferences');
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  return (
    <div className="auth-shell">
      {/* Left panel */}
      <div className="auth-panel-left">
        <div className="auth-illustration" />
        <div className="auth-panel-left-content">
          <div className="auth-brand">
            <span className="auth-brand-name">Muralla</span>
            <span className="auth-brand-tag">2.0</span>
          </div>
          <h1 className="auth-tagline">
            Tu ruta perfecta<br />
            <span>empieza aquí</span>
          </h1>
          <p className="auth-description">
            Crea tu perfil de viajero y personaliza cada recorrido según tus intereses. Arte, historia, gastronomía o aventura — tú decides.
          </p>
          <div className="auth-features">
            {[
              'Perfil de viajero personalizable',
              'Preferencias guardadas entre sesiones',
              'Algoritmos adaptados a tus intereses',
              'Acceso al editor de grafos completo',
            ].map(f => (
              <div className="auth-feature-item" key={f}>
                <span className="auth-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-panel-right">
        <div className="auth-form-card">
          <div className="auth-brand" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
            <span className="auth-brand-name">Muralla</span>
            <span className="auth-brand-tag">2.0</span>
          </div>

          <h2 className="auth-form-title">Crear cuenta</h2>
          <p className="auth-form-subtitle">Únete y planifica tu recorrido por Cartagena</p>

          {error && (
            <div className="auth-alert error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Google */}
          <button type="button" className="auth-google-btn" onClick={handleGoogle} id="register-google-btn">
            <IconGoogle />
            Registrarse con Google
          </button>

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">o con correo</span>
            <span className="auth-divider-line" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Full name */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-fullname">Nombre completo</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconUser /></span>
                <input
                  id="reg-fullname"
                  type="text"
                  name="fullName"
                  className={`auth-input ${fieldErrors.fullName ? 'error' : ''}`}
                  placeholder="Juan García"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              {fieldErrors.fullName && <p className="auth-error-text">{fieldErrors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-email">Correo electrónico</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconMail /></span>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className={`auth-input ${fieldErrors.email ? 'error' : ''}`}
                  placeholder="tucorreo@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && <p className="auth-error-text">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">Contraseña</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconLock /></span>
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className={`auth-input ${fieldErrors.password ? 'error' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                  aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                >
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
              {fieldErrors.password && <p className="auth-error-text">{fieldErrors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-confirm">Confirmar contraseña</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><IconLock /></span>
                <input
                  id="reg-confirm"
                  type={showPass ? 'text' : 'password'}
                  name="confirm"
                  className={`auth-input ${fieldErrors.confirm ? 'error' : ''}`}
                  placeholder="Repite tu contraseña"
                  value={form.confirm}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
              {fieldErrors.confirm && <p className="auth-error-text">{fieldErrors.confirm}</p>}
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? <><span className="auth-spinner" /> Creando cuenta...</> : 'Crear cuenta gratis →'}
            </button>
          </form>

          <div className="auth-switch">
            ¿Ya tienes cuenta?{' '}
            <button type="button" onClick={() => navigate('/login')}>
              Inicia sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
