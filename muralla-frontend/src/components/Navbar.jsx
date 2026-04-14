import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import { useI18n } from '../contexts/I18nContext';

export function Navbar({ activePage }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t, language, changeLanguage, loading } = useI18n();

    useEffect(() => {
        // Try to get language from user preferences
        if (user?.preferences?.language) {
            changeLanguage(user.preferences.language);
        }
    }, [user, changeLanguage]);

    if (loading) {
        return null;
    }

    return (
        <nav className="navbar" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Link to="/" className="navbar-brand" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                Muralla App <span className="brand-tag">2.0</span>
            </Link>
            <div className="navbar-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/" className={`nav-link ${activePage === 'home' ? 'active' : ''}`}>{t('navbar.home')}</Link>
                <Link to="/instructions" className={`nav-link ${activePage === 'instructions' ? 'active' : ''}`}>{t('navbar.instructions')}</Link>
                <Link to="/about" className={`nav-link ${activePage === 'about' ? 'active' : ''}`}>{t('navbar.about')}</Link>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '20px' }}>
                        <Link to="/editor" className="nav-link" style={{ color: 'var(--orange)', fontWeight: 600 }}>{t('navbar.editor')}</Link>

                        {/* Profile Logo / Avatar */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link to="/profile" title={t('navbar.profile_title')} style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--orange), #e55d02)',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem',
                                boxShadow: '0 0 10px rgba(247, 127, 0, 0.4)', border: '2px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer', overflow: 'hidden'
                            }}>
                                {user.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                                )}
                            </Link>
                            <button
                                onClick={logout}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem'
                                }}
                            >
                                {t('navbar.logout')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        style={{
                            background: 'linear-gradient(135deg, var(--orange), #e55d02)',
                            color: 'white', padding: '8px 18px', borderRadius: '8px',
                            textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', marginLeft: '10px'
                        }}
                    >
                        {t('navbar.login')}
                    </Link>
                )}
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .navbar {
                        padding: 0.75rem 1rem !important;
                    }
                    .navbar-links {
                        gap: 12px !important;
                    }
                    .nav-link {
                        font-size: 0.85rem !important;
                    }
                    .navbar-brand {
                        font-size: 1.1rem !important;
                    }
                }
                @media (max-width: 640px) {
                    .navbar-links {
                        gap: 8px !important;
                    }
                    .nav-link {
                        font-size: 0.75rem !important;
                        padding: 0 4px !important;
                    }
                    .navbar-brand {
                        font-size: 1rem !important;
                    }
                    .navbar-brand .brand-tag {
                        font-size: 0.6rem !important;
                        padding: 2px 6px !important;
                    }
                }
            `}</style>
        </nav>
    );
}
