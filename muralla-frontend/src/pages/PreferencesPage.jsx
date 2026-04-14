import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import { useI18n } from '../contexts/I18nContext';
import { Landmark, Church, Utensils, TreePine, Palette, Map, User, HeartHandshake, Users, Footprints, Car, Clock, Globe } from 'lucide-react';
import '../auth.css';
import { getSupportedLanguages } from '../i18n';

// ── Traveler profile label ────────────────────────────
function getTravelerProfile(interests, t) {
  const top = Object.entries(interests).reduce((a, b) => b[1] > a[1] ? b : a, ['', 0]);
  const map = {
    interestCulture:     { label: t('profile.cultural_explorer'), icon: <Landmark size={24} /> },
    interestReligion:    { label: t('profile.spiritual_traveler'),  icon: <Church size={24} /> },
    interestGastronomy:  { label: t('profile.gourmet_traveler'), icon: <Utensils size={24} /> },
    interestNature:      { label: t('profile.nature_lover'), icon: <TreePine size={24} /> },
    interestArts:        { label: t('profile.artistic_bohemian'),   icon: <Palette size={24} /> },
    interestAdventure:   { label: t('profile.urban_adventurer'),   icon: <Map size={24} /> },
  };
  return map[top[0]] || { label: t('profile.complete_traveler'), icon: <Map size={24} /> };
}

// ── Stepper ───────────────────────────────────────────
function Stepper({ current, t }) {
  const STEPS = [
    t('preferences.step_language'),
    t('preferences.step_interests'),
    t('preferences.step_logistics'),
    t('preferences.step_confirmation')
  ];

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
function InterestSlider({ item, value, onChange, t }) {
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
        <span>{t('register.strength_weak')}</span><span>{t('register.strength_regular')}</span><span>{t('register.strength_strong')}</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────
export function PreferencesPage() {
  const navigate = useNavigate();
  const { user, token, savePreferences } = useAuth();
  const { t, language, changeLanguage, loading: i18nLoading } = useI18n();

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
    budget: null,
    currency: 'COP',
    language: 'es',
  });

  const [budgetRanges, setBudgetRanges] = useState({});

  // Interest categories with translations
  const INTERESTS = [
    {
      key: 'interestCulture',
      icon: <Landmark size={20} />,
      label: t('interests.culture'),
      desc: t('interests.culture_desc'),
    },
    {
      key: 'interestReligion',
      icon: <Church size={20} />,
      label: t('interests.religion'),
      desc: t('interests.religion_desc'),
    },
    {
      key: 'interestGastronomy',
      icon: <Utensils size={20} />,
      label: t('interests.gastronomy'),
      desc: t('interests.gastronomy_desc'),
    },
    {
      key: 'interestNature',
      icon: <TreePine size={20} />,
      label: t('interests.nature'),
      desc: t('interests.nature_desc'),
    },
    {
      key: 'interestArts',
      icon: <Palette size={20} />,
      label: t('interests.arts'),
      desc: t('interests.arts_desc'),
    },
    {
      key: 'interestAdventure',
      icon: <Map size={20} />,
      label: t('interests.adventure'),
      desc: t('interests.adventure_desc'),
    },
  ];

  const TIME_OPTIONS = [
    { value: 1, label: '1h', desc: t('time.quick') },
    { value: 2, label: '2h', desc: t('time.express') },
    { value: 4, label: '4h', desc: t('time.standard') },
    { value: 6, label: '6h', desc: t('time.extended') },
    { value: 8, label: '8h', desc: t('time.complete') },
    { value: 10, label: '10h+', desc: t('time.full_day') },
  ];

  const GROUP_OPTIONS = [
    { value: 'SOLO',   icon: <User size={18} />, label: t('group.solo') },
    { value: 'COUPLE', icon: <HeartHandshake size={18} />, label: t('group.couple') },
    { value: 'FAMILY', icon: <Users size={18} />, label: t('group.family') },
    { value: 'GROUP',  icon: <Users size={18} />, label: t('group.group') },
  ];

  const MOBILITY_OPTIONS = [
    { value: 'WALK',  icon: <Footprints size={18} />, label: t('mobility.walk'), desc: t('mobility.walk_desc') },
    { value: 'MULTI', icon: <Car size={18} />, label: t('mobility.multi'), desc: t('mobility.multi_desc') },
  ];

  const CURRENCY_OPTIONS = [
    { value: 'USD', label: t('currency.usd'), symbol: '$' },
    { value: 'EUR', label: t('currency.eur'), symbol: '€' },
    { value: 'GBP', label: t('currency.gbp'), symbol: '£' },
    { value: 'JPY', label: t('currency.jpy'), symbol: '¥' },
    { value: 'CNY', label: t('currency.cny'), symbol: '¥' },
    { value: 'COP', label: t('currency.cop'), symbol: '$' },
  ];

  React.useEffect(() => {
    const fetchBudgetRanges = async () => {
      try {
        const resp = await fetch('/api/users/budget-ranges');
        if (resp.ok) {
          const data = await resp.json();
          setBudgetRanges(data);
        }
      } catch (err) {
        console.error('Failed to fetch budget ranges:', err);
      }
    };
    fetchBudgetRanges();
  }, []);

  React.useEffect(() => {
    const fetchMe = async () => {
      if (!token) return;
      try {
        const resp = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.preferences) {
            setInterests({
              interestCulture: data.preferences.interestCulture ?? 7,
              interestReligion: data.preferences.interestReligion ?? 5,
              interestGastronomy: data.preferences.interestGastronomy ?? 6,
              interestNature: data.preferences.interestNature ?? 5,
              interestArts: data.preferences.interestArts ?? 6,
              interestAdventure: data.preferences.interestAdventure ?? 5,
            });
            const savedLanguage = data.preferences.language ?? 'es';
            setLogistics({
              defaultTimeAvailableHours: data.preferences.defaultTimeAvailableHours ?? 4,
              mobilityType: data.preferences.mobilityType ?? 'WALK',
              groupType: data.preferences.groupType ?? 'SOLO',
              budget: data.preferences.budget ?? null,
              currency: data.preferences.currency ?? 'COP',
              language: savedLanguage,
            });
            // Change language immediately when loaded
            if (savedLanguage !== language) {
              changeLanguage(savedLanguage);
            }
          }
        }
      } catch (err) { }
    };
    fetchMe();
  }, [token]);

  const handleInterestChange = (key, val) => {
    setInterests(p => ({ ...p, [key]: val }));
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      // Only include budget and currency if budget is not null
      const dataToSend = logistics.budget
        ? { ...interests, ...logistics, profilePictureUrl: profilePicture }
        : { ...interests, ...logistics, profilePictureUrl: profilePicture, budget: null, currency: null };
      // Always include language
      dataToSend.language = logistics.language;
      await savePreferences(dataToSend);
      navigate('/editor');
    } catch (err) {
      setError(err.message || t('user_profile.error_save'));
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
      setError(t('register.error_image_size'));
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

  const profile = getTravelerProfile(interests, t);

  if (i18nLoading) {
    return null;
  }

  return (
    <div className="pref-shell">
      <div className="pref-card">
        <Stepper current={step} t={t} />

        {/* ── Step 0: Language ─────────────────────────── */}
        {step === 0 && (
          <>
            <h2 className="pref-step-title">{t('preferences.step1_title')}</h2>
            <p className="pref-step-desc">
              {t('preferences.step1_desc')}
            </p>

            {/* Language */}
            <div className="pref-options-row">
              <label className="pref-option-label" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Globe size={18} /> {t('preferences.language')}
              </label>
              <div style={{marginTop: '1rem'}}>
                <select
                  value={logistics.language}
                  onChange={e => {
                    const newLang = e.target.value;
                    setLogistics(l => ({ ...l, language: newLang }));
                    changeLanguage(newLang);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '1rem',
                  }}
                >
                  {getSupportedLanguages().map(lang => (
                    <option key={lang.code} value={lang.code} style={{backgroundColor: '#1a1a2e'}}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pref-nav">
              <button
                className="pref-back-btn"
                onClick={() => navigate('/editor')}
              >
                {t('preferences.skip')}
              </button>
              <button className="pref-next-btn" onClick={() => setStep(1)}>
                {t('preferences.next')} →
              </button>
            </div>
          </>
        )}

        {/* ── Step 1: Interests ─────────────────────────── */}
        {step === 1 && (
          <>
            <h2 className="pref-step-title">{t('preferences.step2_title')}</h2>
            <p className="pref-step-desc">
              {t('preferences.step2_desc')}
            </p>
            <div className="interest-grid">
              {INTERESTS.map(item => (
                <InterestSlider
                  key={item.key}
                  item={item}
                  value={interests[item.key]}
                  onChange={handleInterestChange}
                  t={t}
                />
              ))}
            </div>
            <div className="pref-nav">
              <button className="pref-back-btn" onClick={() => setStep(0)}>
                ← {t('preferences.back')}
              </button>
              <button className="pref-next-btn" onClick={() => setStep(2)}>
                {t('preferences.next')} →
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Logistics ─────────────────────────── */}
        {step === 2 && (
          <>
            <h2 className="pref-step-title">{t('preferences.step3_title')}</h2>
            <p className="pref-step-desc">
              {t('preferences.step3_desc')}
            </p>

            {/* Time */}
            <div className="pref-options-row">
              <label className="pref-option-label" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Clock size={18} /> {t('preferences.time_available')}
              </label>
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
              <label className="pref-option-label" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Users size={18} /> {t('preferences.travel_with')}
              </label>
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
              <label className="pref-option-label" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Footprints size={18} /> {t('preferences.mobility')}
              </label>
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

            {/* Budget (Optional) */}
            <div className="pref-options-row">
              <label className="pref-option-label" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{fontSize: '18px'}}>💰</span> {t('preferences.budget')}
              </label>
              <div style={{marginTop: '1rem'}}>
                <select
                  value={logistics.currency}
                  onChange={e => setLogistics(l => ({ ...l, currency: e.target.value, budget: null }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  {CURRENCY_OPTIONS.map(c => (
                    <option key={c.value} value={c.value} style={{backgroundColor: '#1a1a2e'}}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {logistics.currency && (
                  <div style={{marginTop: '1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                      <span style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>
                        {logistics.budget
                          ? `${CURRENCY_OPTIONS.find(c => c.value === logistics.currency)?.symbol} ${logistics.budget.toLocaleString()}`
                          : t('preferences.select_budget')}
                      </span>
                      <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>
                        {logistics.budget ? t('preferences.budget_selected') : t('preferences.optional')}
                      </span>
                    </div>
                    {budgetRanges[logistics.currency] ? (
                      <>
                        <input
                          type="range"
                          min={budgetRanges[logistics.currency]?.min || 0}
                          max={budgetRanges[logistics.currency]?.max || 1000}
                          step={budgetRanges[logistics.currency]?.step || 10}
                          value={logistics.budget || budgetRanges[logistics.currency]?.min || 0}
                          onChange={e => setLogistics(l => ({ ...l, budget: parseInt(e.target.value) }))}
                          style={{
                            width: '100%',
                            height: '8px',
                            borderRadius: '4px',
                            background: `linear-gradient(to right, var(--orange) 0%, var(--orange) ${((logistics.budget || budgetRanges[logistics.currency]?.min || 0) - (budgetRanges[logistics.currency]?.min || 0)) / ((budgetRanges[logistics.currency]?.max || 1000) - (budgetRanges[logistics.currency]?.min || 0)) * 100}%, rgba(255,255,255,0.1) ${((logistics.budget || budgetRanges[logistics.currency]?.min || 0) - (budgetRanges[logistics.currency]?.min || 0)) / ((budgetRanges[logistics.currency]?.max || 1000) - (budgetRanges[logistics.currency]?.min || 0)) * 100}%)`,
                            cursor: 'pointer',
                          }}
                        />
                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>
                          <span>{CURRENCY_OPTIONS.find(c => c.value === logistics.currency)?.symbol} {Math.floor(budgetRanges[logistics.currency]?.min)?.toLocaleString()}</span>
                          <span>{CURRENCY_OPTIONS.find(c => c.value === logistics.currency)?.symbol} {Math.floor(budgetRanges[logistics.currency]?.max)?.toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>
                        {t('preferences.loading_ranges')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pref-nav">
              <button className="pref-back-btn" onClick={() => setStep(1)}>
                ← {t('preferences.back')}
              </button>
              <button className="pref-next-btn" onClick={() => setStep(3)}>
                {t('preferences.next')} →
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Confirmation ────────────────────────── */}
        {step === 3 && (
          <>
            <h2 className="pref-step-title">{t('preferences.step3_title')}</h2>
            <p className="pref-step-desc">
              {t('preferences.step3_desc')}
            </p>

            {/* Profile card */}
            <div className="pref-profile-card">
              <label
                htmlFor="pref-avatar-upload"
                title={t('user_profile.change_password')}
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

              <div className="pref-profile-name">{user?.fullName || t('user_profile.tourist')}</div>
              <div className="pref-profile-type">{profile.label}</div>
              <div className="pref-summary-chips">
                {INTERESTS
                  .filter(i => interests[i.key] >= 7)
                  .map(i => (
                    <div className="pref-summary-chip" key={i.key}>
                      {i.icon} {i.label}
                    </div>
                  ))}
                <div className="pref-summary-chip" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <Clock size={16} /> {logistics.defaultTimeAvailableHours}h {t('register.hours')}
                </div>
                <div className="pref-summary-chip" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  {GROUP_OPTIONS.find(g => g.value === logistics.groupType)?.icon}
                  {GROUP_OPTIONS.find(g => g.value === logistics.groupType)?.label}
                </div>
                <div className="pref-summary-chip" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  {MOBILITY_OPTIONS.find(m => m.value === logistics.mobilityType)?.icon}
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
              <button className="pref-back-btn" onClick={() => setStep(2)}>
                ← {t('preferences.edit')}
              </button>
              <button
                className="pref-next-btn"
                onClick={handleFinish}
                disabled={loading}
                style={{display: 'flex', alignItems: 'center', gap: '8px'}}
              >
                {loading
                  ? <><span className="auth-spinner" /> {t('preferences.loading_ranges')}...</>
                  : <>{t('preferences.finish')} <Map size={18} /></>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
