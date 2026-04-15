import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import { IconScience, IconSafe, IconCpu, IconMap, IconDatabase } from '../components/Icons';
import { useAuth } from '../utils/authContext';
import { Navbar } from '../components/Navbar';
import { useI18n } from '../contexts/I18nContext';

export const LandingPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t, language, changeLanguage, loading } = useI18n();

    useEffect(() => {
        if (user?.preferences?.language) {
            changeLanguage(user.preferences.language);
        }
    }, [user, changeLanguage]);

    if (loading) {
        return null;
    }

    return (
        <div className="landing-container">
            <Navbar activePage="home" />

            {/* Hero Section */}
            <div className="hero-section" style={{ backgroundImage: "url('/assets/cartagena.jpg')" }}>
                <div className="hero-overlay">
                    <h5 className="hero-subtitle">{t('landing.university')}</h5>
                    <h1 className="hero-title glass-container">
                        {t('landing.title')}
                    </h1>
                    <p style={{maxWidth: '800px', margin: '1rem auto', fontSize: '1.2rem', color: '#eee', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                        {t('landing.description')}
                    </p>
                    <div className="hero-buttons">
                        <Link to={user ? '/editor' : '/register'} className="cta-btn primary lg">
                            {user ? t('landing.go_to_editor') : t('landing.start_free')}
                        </Link>
                        <Link to="/instructions" className="cta-btn outline lg">{t('landing.user_manual')}</Link>
                    </div>
                </div>
            </div>

            {/* Science Section (TTDP) */}
            <section className="features-section">
                <div className="container" style={{maxWidth: '1200px', margin: '0 auto'}}>
                    <h2 className="section-heading">{t('landing.ttdp_title')}</h2>
                    <div className="landing-split-grid">
                        <div>
                            <p style={{fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.8'}}>
                                {t('landing.ttdp_description')}
                            </p>
                            <div style={{marginTop: '2rem'}}>
                                <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
                                    <div className="icon-circle" style={{background: 'var(--orange-soft)', padding: '12px', borderRadius: '50%', color: 'var(--orange)'}}>
                                        <IconScience />
                                    </div>
                                    <div>
                                        <h4 style={{color: 'white', marginBottom: '0.25rem'}}>{t('landing.feature_1')}</h4>
                                        <p style={{fontSize: '0.95rem', opacity: 0.8}}>{t('landing.feature_1_desc')}</p>
                                    </div>
                                </div>
                                <div style={{display: 'flex', gap: '1rem'}}>
                                    <div className="icon-circle" style={{background: 'var(--orange-soft)', padding: '12px', borderRadius: '50%', color: 'var(--orange)'}}>
                                        <IconSafe />
                                    </div>
                                    <div>
                                        <h4 style={{color: 'white', marginBottom: '0.25rem'}}>{t('landing.feature_2')}</h4>
                                        <p style={{fontSize: '0.95rem', opacity: 0.8}}>{t('landing.feature_2_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="glass-container" style={{padding: '1rem', borderRadius: '24px'}}>
                            <img src="/assets/grafos.gif" alt={t('landing.algorithms_alt')} style={{width: '100%', borderRadius: '16px'}} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features (Technical) */}
            <section className="features-section" style={{background: 'rgba(0,0,0,0.2)'}}>
                <h2 className="section-heading">{t('landing.architecture_title')}</h2>
                <div className="features-grid">
                    <div className="feature-card glass-container">
                        <IconCpu />
                        <h3>{t('landing.arch_1')}</h3>
                        <p>{t('landing.arch_1_desc')}</p>
                    </div>
                    <div className="feature-card glass-container">
                        <IconMap />
                        <h3>{t('landing.arch_2')}</h3>
                        <p>{t('landing.arch_2_desc')}</p>
                    </div>
                    <div className="feature-card glass-container">
                        <IconDatabase />
                        <h3>{t('landing.arch_3')}</h3>
                        <p>{t('landing.arch_3_desc')}</p>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section style={{padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto'}}>
                <div className="landing-impact-grid">
                    <div className="glass-container" style={{overflow: 'hidden', borderRadius: '30px'}}>
                        <img src="/assets/heat1.jpg" alt={t('landing.impact_alt')} style={{width: '100%', display: 'block'}} />
                    </div>
                    <div>
                        <h2 style={{fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem'}}>{t('landing.impact_title')}</h2>
                        <p style={{fontSize: '1.1rem', lineHeight: '1.8', opacity: 0.8, marginBottom: '2rem'}}>
                            {t('landing.impact_description')}
                        </p>
                        <ul style={{listStyle: 'none', padding: 0}}>
                            <li style={{marginBottom: '1rem', display: 'flex', gap: '1rem'}}>
                                <span style={{color: 'var(--orange)', fontWeight: 'bold'}}>✓</span>
                                <div><strong>{t('landing.impact_1')}:</strong> {t('landing.impact_1_desc')}</div>
                            </li>
                            <li style={{marginBottom: '1rem', display: 'flex', gap: '1rem'}}>
                                <span style={{color: 'var(--orange)', fontWeight: 'bold'}}>✓</span>
                                <div><strong>{t('landing.impact_2')}:</strong> {t('landing.impact_2_desc')}</div>
                            </li>
                            <li style={{marginBottom: '1rem', display: 'flex', gap: '1rem'}}>
                                <span style={{color: 'var(--orange)', fontWeight: 'bold'}}>✓</span>
                                <div><strong>{t('landing.impact_3')}:</strong> {t('landing.impact_3_desc')}</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
            {/* Final CTA Section */}
            <section className="cta-final" style={{padding: '5rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--navy-mid) 0%, var(--navy) 100%)'}}>
                <h2 style={{fontSize: '2.5rem', marginBottom: '1.5rem'}}>{t('landing.cta_title')}</h2>
                <p style={{maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.8}}>
                    {t('landing.cta_description')}
                </p>
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                    <Link to={user ? '/editor' : '/register'} className="cta-btn primary lg">
                        {user ? t('landing.go_to_editor') : t('landing.create_account')}
                    </Link>
                    <Link to="/about" className="cta-btn outline lg">{t('landing.about_project')}</Link>
                </div>
                <div style={{marginTop: '4rem'}}>
                    <img src="/assets/cartagena.jpg" alt={t('landing.skyline_alt')} style={{width: '100%', maxWidth: '1000px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}} />
                </div>
            </section>
        </div>
    );
};
