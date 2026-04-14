import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/authContext";
import { useI18n } from '../contexts/I18nContext';
import "../auth.css";

// ── SVG Icons ─────────────────────────────────────────
const IconMail = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);
const IconLock = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconUser = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285f4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34a853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#fbbc05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#ea4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);
const IconEye = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function PasswordStrength({ password, t }) {
  const getStrength = (p) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const s = getStrength(password);
  const labels = ["", t('register.weak'), t('register.fair'), t('register.good'), t('register.strong')];
  const colors = ["", "#e55d02", "#f4a021", "#00b4d8", "#4ade9b"];
  if (!password) return null;
  return (
    <div style={{ marginTop: "6px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "3px",
              borderRadius: "2px",
              background: i <= s ? colors[s] : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: "0.72rem", color: colors[s] }}>{labels[s]}</span>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t, language, changeLanguage, loading: i18nLoading } = useI18n();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    // Optional preferences
    gender: "",
    ageRange: "",
    touristType: "",
    mobilityType: "WALK",
    defaultTimeAvailableHours: 4,
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (i18nLoading === false) {
      // Language loaded
    }
  }, [i18nLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
    setFieldErrors((fe) => ({ ...fe, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = t('register.error_fullname');
    if (!form.email.includes("@")) errs.email = t('register.error_email');
    if (form.password.length < 6)
      errs.password = t('register.error_password');
    if (form.password !== form.confirm)
      errs.confirm = t('register.error_confirm');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await register({
        ...form,
        profilePictureUrl: profilePicture,
      });
      // Skip wizard if they already filled optional stuff? 
      // Actually, let's still go to preferences just in case they want to adjust weights.
      navigate("/preferences");
    } catch (err) {
      setError(err.message || t('register.error_account'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
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
        const canvas = document.createElement("canvas");
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Comprimir aggressive JPEG
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        setProfilePicture(base64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (i18nLoading) {
    return null;
  }

  return (
    <div className="auth-shell">
      {/* Left panel */}
      <div className="auth-panel-left">
        <div className="auth-illustration" />
        <div className="auth-panel-left-content">
          <div className="auth-brand">
            <span className="auth-brand-name">Muralla App</span>
            <span className="auth-brand-tag">2.0</span>
          </div>
          <h1 className="auth-tagline">
            {t('register.tagline')}<br />
            <span>{t('register.tagline_subtitle')}</span>
          </h1>
          <p className="auth-description">
            {t('register.description')}
          </p>
          <div className="auth-features">
            {[
              t('register.feature_1'),
              t('register.feature_2'),
              t('register.feature_3'),
              t('register.feature_4'),
            ].map((f) => (
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
          <div
            className="auth-brand"
            style={{ marginBottom: "1.5rem", justifyContent: "center" }}
          >
            <span className="auth-brand-name">Muralla App</span>
            <span className="auth-brand-tag">2.0</span>
          </div>

          <h2 className="auth-form-title">{t('register.title')}</h2>
          <p className="auth-form-subtitle">
            {t('register.subtitle')}
          </p>

          {error && (
            <div className="auth-alert error">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogle}
            id="register-google-btn"
          >
            <IconGoogle />
            {t('register.google_btn')}
          </button>

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">{t('register.divider')}</span>
            <span className="auth-divider-line" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Profile Picture Upload */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <label
                htmlFor="reg-avatar"
                style={{ cursor: "pointer", position: "relative" }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: profilePicture
                      ? `url(${profilePicture}) center/cover no-repeat`
                      : "rgba(255,255,255,0.05)",
                    border: "2px dashed rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.5)",
                    overflow: "hidden",
                    transition: "border 0.2s",
                  }}
                >
                  {!profilePicture && (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  )}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    background: "var(--orange)",
                    borderRadius: "50%",
                    width: "26px",
                    height: "26px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    color: "white",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </label>
              <input
                type="file"
                id="reg-avatar"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: "8px",
                }}
              >
                {t('register.photo_optional')}
              </span>
            </div>

            {/* Full name */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-fullname">
                {t('register.fullname_label')}
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <IconUser />
                </span>
                <input
                  id="reg-fullname"
                  type="text"
                  name="fullName"
                  className={`auth-input ${fieldErrors.fullName ? "error" : ""}`}
                  placeholder={t('register.fullname_placeholder')}
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              {fieldErrors.fullName && (
                <p className="auth-error-text">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-email">
                {t('register.email_label')}
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <IconMail />
                </span>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className={`auth-input ${fieldErrors.email ? "error" : ""}`}
                  placeholder={t('register.email_placeholder')}
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <p className="auth-error-text">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">
                {t('register.password_label')}
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <IconLock />
                </span>
                <input
                  id="reg-password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  className={`auth-input ${fieldErrors.password ? "error" : ""}`}
                  placeholder={t('register.password_placeholder')}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={showPass ? t('register.hide_password') : t('register.show_password')}
                >
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              <PasswordStrength password={form.password} t={t} />
              {fieldErrors.password && (
                <p className="auth-error-text">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-confirm">
                {t('register.confirm_label')}
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <IconLock />
                </span>
                <input
                  id="reg-confirm"
                  type={showPass ? "text" : "password"}
                  name="confirm"
                  className={`auth-input ${fieldErrors.confirm ? "error" : ""}`}
                  placeholder={t('register.confirm_placeholder')}
                  value={form.confirm}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
              {fieldErrors.confirm && (
                <p className="auth-error-text">{fieldErrors.confirm}</p>
              )}
            </div>

            {/* Optional Preferences Section */}
            <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                <span>{t('register.travel_config')}</span>
                <svg 
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
                  style={{ transform: showOptional ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showOptional && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1.5rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  animation: 'slideDown 0.3s ease-out'
                }}>
                  <div className="auth-field" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                    <label className="auth-label">{t('register.gender_label')}</label>
                    <select name="gender" className="auth-input" value={form.gender} onChange={handleChange} style={{ paddingLeft: '12px', appearance: 'auto' }}>
                      <option value="">{t('register.gender_prefer_not')}</option>
                      <option value="MALE">{t('register.gender_male')}</option>
                      <option value="FEMALE">{t('register.gender_female')}</option>
                      <option value="OTHER">{t('register.gender_other')}</option>
                    </select>
                  </div>

                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label className="auth-label">{t('register.age_label')}</label>
                    <select name="ageRange" className="auth-input" value={form.ageRange} onChange={handleChange} style={{ paddingLeft: '12px', appearance: 'auto' }}>
                      <option value="">{t('register.age_not_specified')}</option>
                      <option value="18-25">{t('register.age_18_25')}</option>
                      <option value="26-35">{t('register.age_26_35')}</option>
                      <option value="36-50">{t('register.age_36_50')}</option>
                      <option value="50+">{t('register.age_50_plus')}</option>
                    </select>
                  </div>

                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label className="auth-label">{t('register.tourist_label')}</label>
                    <select name="touristType" className="auth-input" value={form.touristType} onChange={handleChange} style={{ paddingLeft: '12px', appearance: 'auto' }}>
                      <option value="">{t('register.tourist_not_specified')}</option>
                      <option value="LOCAL">{t('register.tourist_local')}</option>
                      <option value="NATIONAL">{t('register.tourist_national')}</option>
                      <option value="INTERNATIONAL">{t('register.tourist_international')}</option>
                    </select>
                  </div>

                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label className="auth-label">{t('register.mobility_label')}</label>
                    <select name="mobilityType" className="auth-input" value={form.mobilityType} onChange={handleChange} style={{ paddingLeft: '12px', appearance: 'auto' }}>
                      <option value="WALK">{t('register.mobility_walk')}</option>
                      <option value="MULTI">{t('register.mobility_multi')}</option>
                    </select>
                  </div>

                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label className="auth-label">{t('register.hours_label')}</label>
                    <select name="defaultTimeAvailableHours" className="auth-input" value={form.defaultTimeAvailableHours} onChange={handleChange} style={{ paddingLeft: '12px', appearance: 'auto' }}>
                      <option value={2}>2 {t('register.hours')}</option>
                      <option value={4}>4 {t('register.hours')}</option>
                      <option value={6}>6 {t('register.hours')}</option>
                      <option value={8}>8 {t('register.hours')}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" /> {t('register.creating')}
                </>
              ) : (
                t('register.submit')
              )}
            </button>
          </form>

          <div className="auth-switch">
            {t('register.has_account')}{" "}
            <button type="button" onClick={() => navigate("/login")}>
              {t('register.login_link')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
