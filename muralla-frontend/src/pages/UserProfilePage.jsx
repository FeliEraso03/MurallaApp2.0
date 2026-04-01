import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import { User, Map, Save, ArrowLeft, Settings2, Lock, ShieldCheck } from 'lucide-react';
import '../auth.css';

export function UserProfilePage() {
  const navigate = useNavigate();
  const { user, token, savePreferences } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [form, setForm] = useState({
    fullName: '',
    touristType: '',
    ageRange: '',
    gender: ''
  });

  // State for password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for read-only user info
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const resp = await fetch('http://localhost:8081/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          setEmail(data.email || '');
          setProfilePicture(data.profilePictureUrl || null);
          setForm({
            fullName: data.fullName || '',
            touristType: data.preferences?.touristType || '',
            ageRange: data.preferences?.ageRange || '',
            gender: data.preferences?.gender || ''
          });
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchData();
  }, [token]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePasswordChangeInput = (e) => {
    setPasswordForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      await savePreferences(form);
      setMessage({ text: 'Perfil actualizado correctamente.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Error al guardar el perfil.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const resp = await fetch('http://localhost:8081/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (resp.ok) {
        setMessage({ text: 'Contraseña actualizada correctamente.', type: 'success' });
        setShowPasswordForm(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorText = await resp.text();
        setMessage({ text: errorText || 'Error al actualizar contraseña.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error de conexión.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-shell" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="auth-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel-left hidden-mobile" style={{ flex: 1 }}>
        <div className="auth-illustration" style={{ filter: 'hue-rotate(30deg) brightness(0.9)' }} />
        <div className="auth-panel-left-content">
          <div className="auth-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/editor')}>
            <ArrowLeft style={{ marginRight: '8px' }} />
            <span className="auth-brand-name">Volver al mapa</span>
          </div>
          <h1 className="auth-tagline" style={{ marginTop: 'auto' }}>
            Tu información,<br />
            <span>tu experiencia</span>
          </h1>
          <p className="auth-description text-xl">
            Conocer tu perfil nos ayuda a entender las dinámicas de turismo en Cartagena y a ofrecerte mejores rutas.
          </p>
        </div>
      </div>

      <div className="auth-panel-right" style={{ flex: 2, background: 'var(--bg-card)' }}>
        <div className="auth-form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          
          <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: profilePicture ? `url(${profilePicture}) center/cover no-repeat` : 'rgba(255,255,255,0.1)',
              border: '3px solid var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)', flexShrink: 0
            }}>
              {!profilePicture && <User size={40} color="var(--orange)" />}
            </div>
            <div>
              <h2 className="auth-form-title" style={{ marginBottom: '4px' }}>
                {form.fullName ? `Hola, ${form.fullName.split(' ')[0]}` : 'Perfil de Viajero'}
              </h2>
              <p className="auth-form-subtitle" style={{ margin: 0, fontWeight: 500 }}>{email}</p>
            </div>
          </div>

          {message.text && (
            <div className={`auth-alert ${message.type === 'success' ? '' : 'error'}`} style={{ 
              background: message.type === 'success' ? 'rgba(74, 222, 155, 0.1)' : '',
              color: message.type === 'success' ? '#4ade9b' : '',
              border: message.type === 'success' ? '1px solid rgba(74, 222, 155, 0.3)' : ''
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="profile-section-title">Información Personal</div>

            <div className="auth-field">
              <label className="auth-label">Nombre Completo</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><User size={16} /></span>
                <input
                  type="text"
                  name="fullName"
                  className="auth-input"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Género (Opcional)</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><User size={16} /></span>
                <select
                  name="gender"
                  className="auth-input"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar...</option>
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Femenino</option>
                  <option value="OTHER">Otro</option>
                  <option value="NON_DISCLOSED">Prefiero no decirlo</option>
                </select>
              </div>
            </div>

            <div className="profile-section-title">Análisis Turístico</div>

            <div className="auth-field">
              <label className="auth-label">Naturaleza del visitante (Análisis demográfico)</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Map size={16} /></span>
                <select
                  name="touristType"
                  className="auth-input"
                  value={form.touristType}
                  onChange={handleChange}
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="">No especificado</option>
                  <option value="LOCAL">Local (Residente en Cartagena)</option>
                  <option value="NATIONAL">Nacional (Resto de Colombia)</option>
                  <option value="INTERNATIONAL">Internacional (Extranjero)</option>
                </select>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Rango de Edad</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><User size={16} /></span>
                <select
                  name="ageRange"
                  className="auth-input"
                  value={form.ageRange}
                  onChange={handleChange}
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="">No especificado</option>
                  <option value="18-25">18 - 25 años</option>
                  <option value="26-35">26 - 35 años</option>
                  <option value="36-50">36 - 50 años</option>
                  <option value="50+">Más de 50 años</option>
                </select>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={saving} style={{ marginTop: '2rem' }}>
              {saving ? <><span className="auth-spinner" /> Guardando...</> : <><Save size={18}/> Guardar Perfil</>}
            </button>
          </form>

          <div className="profile-section-title">Seguridad</div>
          
          {!showPasswordForm ? (
            <button 
              className="btn-ghost" 
              onClick={() => setShowPasswordForm(true)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Lock size={16} /> Cambiar Contraseña
            </button>
          ) : (
            <div className="password-section">
              <form onSubmit={handlePasswordSubmit}>
                <div className="auth-field">
                  <label className="auth-label">Contraseña Actual</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Lock size={16} /></span>
                    <input
                      type="password"
                      name="currentPassword"
                      className="auth-input"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChangeInput}
                      required
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Nueva Contraseña</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><ShieldCheck size={16} /></span>
                    <input
                      type="password"
                      name="newPassword"
                      className="auth-input"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChangeInput}
                      required
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Confirmar Nueva Contraseña</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><ShieldCheck size={16} /></span>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="auth-input"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChangeInput}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowPasswordForm(false)} style={{ flex: 1, justifyContent: 'center' }}>
                    Cancelar
                  </button>
                  <button type="submit" className="auth-submit-btn" disabled={saving} style={{ flex: 2, margin: 0 }}>
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              ¿Quieres ajustar tus preferencias de ruta y algoritmos?
            </p>
            <Link to="/preferences" className="auth-secondary-btn" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px', 
              padding: '10px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
              color: 'var(--orange)', textDecoration: 'none', fontWeight: 600,
              border: '1px solid rgba(247, 127, 0, 0.3)', transition: 'all 0.2s'
            }}>
              <Settings2 size={18} />
              Modificar Preferencias de Viaje
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
