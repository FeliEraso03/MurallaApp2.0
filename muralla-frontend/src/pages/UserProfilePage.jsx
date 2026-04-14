import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../utils/authContext";
import { useI18n } from "../contexts/I18nContext";
import {
  User,
  Map,
  Save,
  ArrowLeft,
  Settings2,
  Lock,
  ShieldCheck,
  LogOut,
  Home,
} from "lucide-react";
import "../auth.css";

export function UserProfilePage() {
  const navigate = useNavigate();
  const { user, token, savePreferences, logout } = useAuth();
  const { t, loading: i18nLoading } = useI18n();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

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

  return (
    <div className="auth-shell">
      <div className="auth-panel-left hidden-mobile" style={{ flex: 1 }}>
        <div
          className="auth-illustration"
          style={{ filter: "hue-rotate(30deg) brightness(0.9)" }}
        />
        <div className="auth-panel-left-content">
          <div
            className="auth-brand"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/editor")}
          >
            <ArrowLeft style={{ marginRight: "8px" }} />
            <span className="auth-brand-name">
              {t("user_profile.back_to_map")}
            </span>
          </div>
          <h1 className="auth-tagline" style={{ marginTop: "auto" }}>
            {t("user_profile.tagline")}
            <br />
            <span>{t("user_profile.tagline_subtitle")}</span>
          </h1>
          <p className="auth-description text-xl">
            {t("user_profile.description")}
          </p>
        </div>
      </div>

      <div
        className="auth-panel-right"
        style={{ flex: 2, background: "var(--bg-card)" }}
      >
        <div
          className="auth-form-card"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <div
            className="profile-header"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: profilePicture
                  ? `url(${profilePicture}) center/cover no-repeat`
                  : "rgba(255,255,255,0.1)",
                border: "3px solid var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
                flexShrink: 0,
              }}
            >
              {!profilePicture && <User size={40} color="var(--orange)" />}
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
                  <Map size={16} />
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
