import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import '../auth.css';

// ── Interest categories definition ───────────────────
const INTERESTS = [
  {
    key: 'interestCulture',
    icon: '🏛️',
    label: 'Cultural e Histórico',
    desc: 'Murallas, museos, plazas históricas y patrimonio colonial',
  },
  {
    key: 'interestReligion',
    icon: '⛪',
    label: 'Religioso y Espiritual',
    desc: 'Iglesias, conventos y sitios de devoción histórica',
  },
  {
    key: 'interestGastronomy',
    icon: '🍽️',
    label: 'Gastronómico',
    desc: 'Restaurantes locales, mercados y gastronomía caribeña',
  },
  {
    key: 'interestNature',
    icon: '🌿',
    label: 'Naturaleza y Espacios Abiertos',
    desc: 'Plazas, parques, miradores y espacios al aire libre',
  },
  {
    key: 'interestArts',
    icon: '🎭',
    label: 'Arte Vivo y Artesanías',
    desc: 'Arte mural, artesanías, galerías y cultura bohemia en Getsemaní',
  },
  {
    key: 'interestAdventure',
    icon: '🗺️',
    label: 'Exploración y Aventura',
    desc: 'Callejones, barrios emergentes y rutas poco convencionales',
  },
];

const TIME_OPTIONS = [
  { value: 2, label: '2h', desc: 'Express' },
  { value: 4, label: '4h', desc: 'Estándar' },
  { value: 6, label: '6h', desc: 'Completo' },
  { value: 8, label: '8h+', desc: 'Día entero' },
];

const GROUP_OPTIONS = [
  { value: 'SOLO',   icon: '🚶', label: 'Solo' },
  { value: 'COUPLE', icon: '👫', label: 'Pareja' },
  { value: 'FAMILY', icon: '👨‍👩‍👧', label: 'Familia' },
  { value: 'GROUP',  icon: '👥', label: 'Grupo' },
];

const MOBILITY_OPTIONS = [
  { value: 'WALK',  icon: '🚶', label: 'A pie', desc: 'Recorrido peatonal completo' },
  { value: 'MULTI', icon: '🐎', label: 'Combinado', desc: 'Coche de caballos, tuk-tuk + caminata' },
];

// ── Traveler profile label ────────────────────────────
function getTravelerProfile(interests) {
  const top = Object.entries(interests).reduce((a, b) => b[1] > a[1] ? b : a, ['', 0]);
  const map = {
    interestCulture:     { label: 'Explorador Cultural', icon: '🏛️' },
    interestReligion:    { label: 'Viajero Espiritual',  icon: '⛪' },
    interestGastronomy:  { label: 'Gastrónomo Viajero', icon: '🍽️' },
    interestNature:      { label: 'Amante de la Naturaleza', icon: '🌿' },
    interestArts:        { label: 'Bohemio Artístico',   icon: '🎭' },
    interestAdventure:   { label: 'Aventurero Urbano',   icon: '🗺️' },
  };
  return map[top[0]] || { label: 'Viajero Completo', icon: '✨' };
}

// ── Stepper ───────────────────────────────────────────
const STEPS = ['Intereses', 'Logística', 'Confirmación'];

function Stepper({ current }) {
  return (
    <div className="pref-stepper">
      {STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'pending';
        return (
          <React.Fragment key={i}>
            <div className="pref-step">
              <div className={`pref-step-num ${state}`}>
                {state === 'done' ? '✓' : i + 1}
              </div>
              <span className={`pref-step-label ${state}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`pref-step-line ${state === 'done' ? 'done' : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Slider component ──────────────────────────────────
function InterestSlider({ item, value, onChange }) {
  return (
    <div className="interest-item">
      <div className="interest-header">
        <div className="interest-label">
          <span className="interest-icon">{item.icon}</span>
          {item.label}
        </div>
        <span className="interest-value">{value}</span>
      </div>
      <p className="interest-desc">{item.desc}</p>
      <input
        type="range"
        min="1" max="10"
        value={value}
        onChange={e => onChange(item.key, parseInt(e.target.value))}
        className="interest-slider"
        style={{
          background: `linear-gradient(to right, var(--orange) 0%, var(--orange) ${(value - 1) / 9 * 100}%, rgba(255,255,255,0.1) ${(value - 1) / 9 * 100}%)`,
        }}
      />
      <div className="interest-scale">
        <span>Poco</span><span>Moderado</span><span>Máximo</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────
export function PreferencesPage() {
  const navigate = useNavigate();
  const { user, savePreferences } = useAuth();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState(user?.profilePictureUrl || null);

  const [interests, setInterests] = useState({
    interestCulture:    7,
    interestReligion:   5,
    interestGastronomy: 6,
    interestNature:     5,
    interestArts:       6,
    interestAdventure:  5,
  });

  const [logistics, setLogistics] = useState({
    defaultTimeAvailableHours: 4,
    mobilityType: 'WALK',
    groupType: 'SOLO',
  });

  const handleInterestChange = (key, val) => {
    setInterests(p => ({ ...p, [key]: val }));
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      await savePreferences({ ...interests, ...logistics, profilePictureUrl: profilePicture });
      navigate('/editor');
    } catch (err) {
      setError(err.message || 'Error guardando preferencias. Puedes cambiarlas luego.');
      // Still redirect after 2s even if it fails (backend may not be running)
      setTimeout(() => navigate('/editor'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede pesar más de 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setProfilePicture(base64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const profile = getTravelerProfile(interests);

  return (
    <div className="pref-shell">
      <div className="pref-card">
        <Stepper current={step} />

        {/* ── Step 0: Interests ─────────────────────────── */}
        {step === 0 && (
          <>
            <h2 className="pref-step-title">¿Qué te apasiona?</h2>
            <p className="pref-step-desc">
              Ajusta tus intereses del 1 al 10. El sistema priorizará los puntos de interés que más te gusten en cada ruta.
            </p>
            <div className="interest-grid">
              {INTERESTS.map(item => (
                <InterestSlider
                  key={item.key}
                  item={item}
                  value={interests[item.key]}
                  onChange={handleInterestChange}
                />
              ))}
            </div>
            <div className="pref-nav">
              <button
                className="pref-back-btn"
                onClick={() => navigate('/editor')}
              >
                Omitir por ahora
              </button>
              <button className="pref-next-btn" onClick={() => setStep(1)}>
                Siguiente →
              </button>
            </div>
          </>
        )}

        {/* ── Step 1: Logistics ─────────────────────────── */}
        {step === 1 && (
          <>
            <h2 className="pref-step-title">Cuéntanos más</h2>
            <p className="pref-step-desc">
              Estos parámetros ayudan al algoritmo a generar rutas que se adapten a tu tiempo y estilo de viaje.
            </p>

            {/* Time */}
            <div className="pref-options-row">
              <label className="pref-option-label">⏰ ¿Cuánto tiempo tienes disponible?</label>
              <div className="pref-time-grid">
                {TIME_OPTIONS.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`pref-time-btn ${logistics.defaultTimeAvailableHours === t.value ? 'selected' : ''}`}
                    onClick={() => setLogistics(l => ({ ...l, defaultTimeAvailableHours: t.value }))}
                  >
                    {t.label}
                    <small>{t.desc}</small>
                  </button>
                ))}
              </div>
            </div>

            {/* Group */}
            <div className="pref-options-row">
              <label className="pref-option-label">👥 ¿Con quién viajas?</label>
              <div className="pref-group-grid">
                {GROUP_OPTIONS.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    className={`pref-group-btn ${logistics.groupType === g.value ? 'selected' : ''}`}
                    onClick={() => setLogistics(l => ({ ...l, groupType: g.value }))}
                  >
                    <span className="group-icon">{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobility */}
            <div className="pref-options-row">
              <label className="pref-option-label">🚶 ¿Cómo prefieres moverte?</label>
              <div className="pref-mobility-grid">
                {MOBILITY_OPTIONS.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    className={`pref-mobility-btn ${logistics.mobilityType === m.value ? 'selected' : ''}`}
                    onClick={() => setLogistics(l => ({ ...l, mobilityType: m.value }))}
                  >
                    <span className="mob-icon">{m.icon}</span>
                    {m.label}
                    <small>{m.desc}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="pref-nav">
              <button className="pref-back-btn" onClick={() => setStep(0)}>← Atrás</button>
              <button className="pref-next-btn" onClick={() => setStep(2)}>
                Ver mi perfil →
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Confirmation ────────────────────────── */}
        {step === 2 && (
          <>
            <h2 className="pref-step-title">¡Tu perfil está listo!</h2>
            <p className="pref-step-desc">
              Basado en tus respuestas, hemos generado tu perfil de viajero. Puedes modificarlo en cualquier momento.
            </p>

            {/* Profile card */}
            <div className="pref-profile-card">
              <label 
                htmlFor="pref-avatar-upload" 
                title="Cambiar foto de perfil"
                style={{
                  cursor: 'pointer', display: 'block', margin: '0 auto 1rem', width: '80px', height: '80px', position: 'relative'
                }}
              >
                <div className="pref-avatar" style={{ margin: 0, width: '100%', height: '100%', overflow: 'hidden', border: '3px solid var(--orange)' }}>
                  {profilePicture ? (
                    <img src={profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    profile.icon
                  )}
                </div>
                <div style={{
                  position: 'absolute', bottom: -5, right: -5, background: 'var(--navy-mid)',
                  borderRadius: '50%', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.1)', color: 'white'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                     <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
              </label>
              <input type="file" id="pref-avatar-upload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              
              <div className="pref-profile-name">{user?.fullName || 'Viajero'}</div>
              <div className="pref-profile-type">{profile.label}</div>
              <div className="pref-summary-chips">
                {INTERESTS
                  .filter(i => interests[i.key] >= 7)
                  .map(i => (
                    <div className="pref-summary-chip" key={i.key}>
                      {i.icon} {i.label}
                    </div>
                  ))}
                <div className="pref-summary-chip">
                  ⏰ {logistics.defaultTimeAvailableHours}h disponibles
                </div>
                <div className="pref-summary-chip">
                  {GROUP_OPTIONS.find(g => g.value === logistics.groupType)?.icon}&nbsp;
                  {GROUP_OPTIONS.find(g => g.value === logistics.groupType)?.label}
                </div>
                <div className="pref-summary-chip">
                  {MOBILITY_OPTIONS.find(m => m.value === logistics.mobilityType)?.icon}&nbsp;
                  {MOBILITY_OPTIONS.find(m => m.value === logistics.mobilityType)?.label}
                </div>
              </div>
            </div>

            {error && (
              <div className="auth-alert error" style={{ marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div className="pref-nav">
              <button className="pref-back-btn" onClick={() => setStep(1)}>← Editar</button>
              <button
                className="pref-next-btn"
                onClick={handleFinish}
                disabled={loading}
              >
                {loading
                  ? <><span className="auth-spinner" /> Guardando...</>
                  : '¡Comenzar a explorar! 🗺️'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
