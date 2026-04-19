import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../utils/authContext";
import { useI18n } from "../contexts/I18nContext";
import {
  User,
  Map as MapIcon,
  Save,
  ArrowLeft,
  Settings2,
  Lock,
  ShieldCheck,
  LogOut,
  Home,
  Landmark,
  Church,
  Utensils,
  TreePine,
  Palette,
  HeartHandshake,
  Users,
  Footprints,
  Car,
  Clock,
  Star,
  Globe
} from "lucide-react";
import { getSupportedLanguages } from "../i18n";
import "../auth.css";

function getTravelerProfile(interests, t) {
  if (!interests) return { label: t("profile.complete_traveler"), icon: <MapIcon size={32} /> };
  
  const interestKeys = ["interestCulture", "interestReligion", "interestGastronomy", "interestNature", "interestArts", "interestAdventure"];
  let maxVal = 0;
  let topKey = "";
  
  for (const key of interestKeys) {
    if ((interests[key] || 0) > maxVal) {
      maxVal = interests[key];
      topKey = key;
    }
  }

  const map = {
    interestCulture:     { label: t("profile.cultural_explorer"), icon: <Landmark size={32} /> },
    interestReligion:    { label: t("profile.spiritual_traveler"),  icon: <Church size={32} /> },
    interestGastronomy:  { label: t("profile.gourmet_traveler"), icon: <Utensils size={32} /> },
    interestNature:      { label: t("profile.nature_lover"), icon: <TreePine size={32} /> },
    interestArts:        { label: t("profile.artistic_bohemian"),   icon: <Palette size={32} /> },
    interestAdventure:   { label: t("profile.urban_adventurer"),   icon: <MapIcon size={32} /> },
  };
  return map[topKey] || { label: t("profile.complete_traveler"), icon: <MapIcon size={32} /> };
}

export function UserProfilePage() {
  const navigate = useNavigate();
  const { user, token, savePreferences, logout } = useAuth();
  const { t, language, changeLanguage, loading: i18nLoading } = useI18n();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [preferencesData, setPreferencesData] = useState(null);

  const [mobileTab, setMobileTab] = useState('settings'); // 'settings' or 'dashboard'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [form, setForm] = useState({
    fullName: "",
    touristType: "",
    ageRange: "",
    gender: "",
  });

  // State for password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State for read-only user info
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const resp = await fetch("http://localhost:8081/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          setEmail(data.email || "");
          setProfilePicture(data.profilePictureUrl || null);
          setPreferencesData(data.preferences || null);
          setForm({
            fullName: data.fullName || "",
            touristType: data.preferences?.touristType || "",
            ageRange: data.preferences?.ageRange || "",
            gender: data.preferences?.gender || "",
          });
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchData();
  }, [token]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePasswordChangeInput = (e) => {
    setPasswordForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      await savePreferences(form);
      setMessage({ text: t("user_profile.save_success"), type: "success" });
    } catch (err) {
      setMessage({
        text: err.message || t("user_profile.save_error"),
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: t("user_profile.password_mismatch"), type: "error" });
      return;
    }
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const resp = await fetch(
        "http://localhost:8081/api/users/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      if (resp.ok) {
        setMessage({
          text: t("user_profile.password_success"),
          type: "success",
        });
        setShowPasswordForm(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errorText = await resp.text();
        setMessage({
          text: errorText || t("user_profile.password_error"),
          type: "error",
        });
      }
    } catch (err) {
      setMessage({ text: t("user_profile.connection_error"), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || i18nLoading) {
    return (
      <div
        className="auth-shell"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div
          className="auth-spinner"
          style={{ width: "40px", height: "40px" }}
        />
      </div>
    );
  }

  const travelerProfile = getTravelerProfile(preferencesData, t);

  const GROUP_OPTIONS = [
    { value: 'SOLO',   icon: <User size={20} />, label: t('group.solo') },
    { value: 'COUPLE', icon: <HeartHandshake size={20} />, label: t('group.couple') },
    { value: 'FAMILY', icon: <Users size={20} />, label: t('group.family') },
    { value: 'GROUP',  icon: <Users size={20} />, label: t('group.group') },
  ];

  const MOBILITY_OPTIONS = [
    { value: 'WALK',  icon: <Footprints size={20} />, label: t('mobility.walk') },
    { value: 'MULTI', icon: <Car size={20} />, label: t('mobility.multi') },
  ];

  const INTERESTS = [
    { key: 'interestCulture', icon: <Landmark size={18} />, label: t('interests.culture'), color: '#ff6b6b' },
    { key: 'interestReligion', icon: <Church size={18} />, label: t('interests.religion'), color: '#4ade80' },
    { key: 'interestGastronomy', icon: <Utensils size={18} />, label: t('interests.gastronomy'), color: '#facc15' },
    { key: 'interestNature', icon: <TreePine size={18} />, label: t('interests.nature'), color: '#38bdf8' },
    { key: 'interestArts', icon: <Palette size={18} />, label: t('interests.arts'), color: '#c084fc' },
    { key: 'interestAdventure', icon: <MapIcon size={18} />, label: t('interests.adventure'), color: '#fb923c' },
  ];

  return (
    <div className="auth-shell">
      {/* MOBILE TABS (Only visible on mobile) */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          background: 'var(--navy-card)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '10px 15px',
          gap: '10px'
        }}>
          <button 
            onClick={() => setMobileTab('settings')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px',
              backgroundColor: mobileTab === 'settings' ? 'rgba(247, 127, 0, 0.15)' : 'transparent',
              color: mobileTab === 'settings' ? 'var(--orange)' : 'rgba(255,255,255,0.6)',
              border: `1px solid ${mobileTab === 'settings' ? 'var(--orange)' : 'transparent'}`,
              fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer'
            }}
          >
            <User size={16}/> Ajustes
          </button>
          <button 
            onClick={() => setMobileTab('dashboard')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px',
              backgroundColor: mobileTab === 'dashboard' ? 'rgba(247, 127, 0, 0.15)' : 'transparent',
              color: mobileTab === 'dashboard' ? 'var(--orange)' : 'rgba(255,255,255,0.6)',
              border: `1px solid ${mobileTab === 'dashboard' ? 'var(--orange)' : 'transparent'}`,
              fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer'
            }}
          >
            <Star size={16}/> Dashboard
          </button>
        </div>
      )}

      <div 
        className={!isMobile ? "auth-panel-left hidden-mobile" : "auth-panel-left"} 
        style={{ 
          flex: 1.5, 
          position: 'relative',
          display: isMobile ? (mobileTab === 'dashboard' ? 'flex' : 'none') : undefined,
          marginTop: isMobile ? '60px' : '0'
        }}
      >
        <div
          className="auth-illustration"
          style={{ filter: "hue-rotate(30deg) brightness(0.9)" }}
        />
        <div className="auth-panel-left-content" style={{ zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: isMobile ? '20px' : '40px', alignItems: isMobile ? 'center' : 'stretch' }}>
          
          <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center', width: '100%' }}>
            <div
              className="auth-brand"
              style={{ cursor: "pointer", marginBottom: 0 }}
              onClick={() => navigate("/editor")}
            >
              <ArrowLeft style={{ marginRight: "8px" }} />
              <span className="auth-brand-name">
                {t("user_profile.back_to_map")}
              </span>
            </div>
          </div>
          
          <h1 className="auth-tagline" style={{ marginTop: "1.5rem", fontSize: isMobile ? '2rem' : '2.5rem', textAlign: isMobile ? 'center' : 'left' }}>
            {t("user_profile.tagline")}
            <br />
            <span style={{ color: "var(--orange)" }}>{t("user_profile.tagline_subtitle")}</span>
          </h1>

          {preferencesData ? (
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
              
              {/* Profile Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.3s',
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--orange), #ff4b1f)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(247, 127, 0, 0.4)',
                  flexShrink: 0
                }}>
                  {travelerProfile.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 600, color: 'white' }}>{travelerProfile.label}</h3>
                  <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{t("user_profile.archetype_subtitle")}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Clock size={28} style={{ margin: '0 auto 12px', color: 'var(--orange)' }} />
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{preferencesData.defaultTimeAvailableHours || 4}h</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{t("user_profile.time_lbl")}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ margin: '0 auto 12px', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', color: 'var(--orange)' }}>
                    {GROUP_OPTIONS.find(g => g.value === preferencesData.groupType)?.icon || <User size={28}/>}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{GROUP_OPTIONS.find(g => g.value === preferencesData.groupType)?.label || t('group.solo')}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{t("user_profile.company_lbl")}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ margin: '0 auto 12px', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', color: 'var(--orange)' }}>
                    {MOBILITY_OPTIONS.find(m => m.value === preferencesData.mobilityType)?.icon || <Footprints size={28}/>}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{MOBILITY_OPTIONS.find(m => m.value === preferencesData.mobilityType)?.label || (preferencesData.mobilityType === 'WALK' ? t('mobility.walk') : t('mobility.multi'))}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{t("register.mobility_label")}</div>
                </div>
              </div>

              {/* Interests progress bars */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                marginBottom: 'auto'
              }}>
                <h4 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                  <Star size={20} color="var(--orange)" /> {t("user_profile.top_interests")}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {INTERESTS
                    .sort((a,b) => (preferencesData[b.key] || 0) - (preferencesData[a.key] || 0))
                    .slice(0, 3)
                    .map(item => (
                      <div key={item.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{item.icon} {item.label}</span>
                          <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{preferencesData[item.key] || 0}/10</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${((preferencesData[item.key] || 0)/10)*100}%`, 
                            height: '100%', 
                            background: item.color,
                            borderRadius: '4px',
                            boxShadow: `0 0 10px ${item.color}80` 
                          }} />
                        </div>
                      </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
             <p className="auth-description text-xl" style={{ marginTop: "auto" }}>
              {t("user_profile.description")}
             </p>
          )}

        </div>
      </div>

      <div
        className="auth-panel-right"
        style={{ 
          flex: 1, 
          background: "var(--bg-card)",
          display: isMobile ? (mobileTab === 'settings' ? 'flex' : 'none') : 'flex',
          marginTop: isMobile ? '60px' : '0'
        }}
      >
        <div
          className="auth-form-card"
          style={{ maxWidth: "100%", margin: "0 auto" }}
        >
          <div
            className="profile-header"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: profilePicture
                  ? `url(${profilePicture}) center/cover no-repeat`
                  : "rgba(255,255,255,0.1)",
                border: "2px solid var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
                flexShrink: 0,
              }}
            >
              {!profilePicture && <User size={32} color="var(--orange)" />}
            </div>
            <div>
              <h2 className="auth-form-title" style={{ marginBottom: "4px" }}>
                {form.fullName
                  ? `${t("user_profile.hello")} ${form.fullName.split(" ")[0]}`
                  : t("user_profile.traveler_profile")}
              </h2>
              <p
                className="auth-form-subtitle"
                style={{ margin: 0, fontWeight: 500 }}
              >
                {email}
              </p>
            </div>
          </div>

          {/* Selector de Idioma Rápido */}
          <div className="auth-field" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <label className="auth-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--orange)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Globe size={14} /> {t('preferences.language')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
              {getSupportedLanguages().map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    changeLanguage(lang.code);
                    // Guardar preferencia de idioma en el backend
                    savePreferences({ language: lang.code }).catch(err => console.error("Error saving language preference:", err));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${language === lang.code ? 'var(--orange)' : 'rgba(255,255,255,0.08)'}`,
                    background: language === lang.code ? 'rgba(247, 127, 0, 0.1)' : 'rgba(255,255,255,0.01)',
                    color: language === lang.code ? 'var(--orange)' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                    fontWeight: language === lang.code ? '600' : 'normal'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {message.text && (
            <div
              className={`auth-alert ${message.type === "success" ? "" : "error"}`}
              style={{
                background:
                  message.type === "success" ? "rgba(74, 222, 155, 0.1)" : "",
                color: message.type === "success" ? "#4ade9b" : "",
                border:
                  message.type === "success"
                    ? "1px solid rgba(74, 222, 155, 0.3)"
                    : "",
              }}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="profile-section-title">
              {t("user_profile.personal_info")}
            </div>

            <div className="auth-field">
              <label className="auth-label">
                {t("user_profile.fullname_label")}
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  name="fullName"
                  className="auth-input"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder={t("user_profile.fullname_placeholder")}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">
                {t("user_profile.gender_label")}
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <User size={16} />
                </span>
                <select
                  name="gender"
                  className="auth-input"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">{t("user_profile.select")}</option>
                  <option value="MALE">{t("user_profile.gender_male")}</option>
                  <option value="FEMALE">
                    {t("user_profile.gender_female")}
                  </option>
                  <option value="OTHER">
                    {t("user_profile.gender_other")}
                  </option>
                  <option value="NON_DISCLOSED">
                    {t("user_profile.gender_prefer_not")}
                  </option>
                </select>
              </div>
            </div>

            <div className="profile-section-title">
              {t("user_profile.tourist_analysis")}
            </div>

            <div className="auth-field">
              <label className="auth-label">
                {t("user_profile.tourist_type_label")}
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <MapIcon size={16} />
                </span>
                <select
                  name="touristType"
                  className="auth-input"
                  value={form.touristType}
                  onChange={handleChange}
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  <option value="">{t("user_profile.not_specified")}</option>
                  <option value="LOCAL">
                    {t("user_profile.tourist_local")}
                  </option>
                  <option value="NATIONAL">
                    {t("user_profile.tourist_national")}
                  </option>
                  <option value="INTERNATIONAL">
                    {t("user_profile.tourist_international")}
                  </option>
                </select>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">
                {t("user_profile.age_range_label")}
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <User size={16} />
                </span>
                <select
                  name="ageRange"
                  className="auth-input"
                  value={form.ageRange}
                  onChange={handleChange}
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  <option value="">{t("user_profile.not_specified")}</option>
                  <option value="18-25">{t("user_profile.age_18_25")}</option>
                  <option value="26-35">{t("user_profile.age_26_35")}</option>
                  <option value="36-50">{t("user_profile.age_36_50")}</option>
                  <option value="50+">{t("user_profile.age_50_plus")}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={saving}
              style={{ marginTop: "2rem" }}
            >
              {saving ? (
                <>
                  <span className="auth-spinner" /> {t("user_profile.saving")}
                </>
              ) : (
                <>
                  <Save size={18} /> {t("user_profile.save_profile")}
                </>
              )}
            </button>
          </form>

          <div className="profile-section-title">
            {t("user_profile.security")}
          </div>

          {!showPasswordForm ? (
            <button
              className="btn-ghost"
              onClick={() => setShowPasswordForm(true)}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Lock size={16} /> {t("user_profile.change_password")}
            </button>
          ) : (
            <div className="password-section">
              <form onSubmit={handlePasswordSubmit}>
                <div className="auth-field">
                  <label className="auth-label">
                    {t("user_profile.current_password")}
                  </label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <Lock size={16} />
                    </span>
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
                  <label className="auth-label">
                    {t("user_profile.new_password")}
                  </label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <ShieldCheck size={16} />
                    </span>
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
                  <label className="auth-label">
                    {t("user_profile.confirm_new_password")}
                  </label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <ShieldCheck size={16} />
                    </span>
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
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "1rem" }}
                >
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setShowPasswordForm(false)}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    {t("user_profile.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={saving}
                    style={{ flex: 2, margin: 0 }}
                  >
                    {t("user_profile.update")}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              {t("user_profile.preferences_question")}
            </p>
            <Link
              to="/preferences"
              className="auth-secondary-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                color: "var(--orange)",
                textDecoration: "none",
                fontWeight: 600,
                border: "1px solid rgba(247, 127, 0, 0.3)",
                transition: "all 0.2s",
              }}
            >
              <Settings2 size={18} />
              {t("user_profile.modify_preferences")}
            </Link>
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => navigate("/")}
              className="btn-ghost"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.2)",
                transition: "all 0.2s",
              }}
            >
              <Home size={18} />
              {t("user_profile.go_home")}
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="btn-ghost"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                color: "#ff6b6b",
                fontWeight: 600,
                border: "1px solid rgba(255,107,107,0.3)",
                transition: "all 0.2s",
              }}
            >
              <LogOut size={18} />
              {t("user_profile.logout")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
