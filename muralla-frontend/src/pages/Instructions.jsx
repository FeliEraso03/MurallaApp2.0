import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useI18n } from '../contexts/I18nContext';

// ── SVG Icons ──────────────────────────────────────────────
const IconStep = ({ num }) => (
    <div style={{
        width: '32px', height: '32px', borderRadius: '50%', background: 'var(--orange)', 
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontWeight: 'bold', fontSize: '1rem'
    }}>{num}</div>
);

export const Instructions = () => {
    const { t, loading } = useI18n();

    if (loading) {
        return null;
    }

    return (
        <div className="landing-container secondary-page">
            <Navbar activePage="instructions" />

            <div className="page-content">
                <div className="glass-container page-box">
                    <h1 className="title">{t('instructions.title')} <span className="brand-tag">PRO</span></h1>
                    
                    <div className="instruction-section glass-container" style={{padding: '0', marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid rgba(255,145,0,0.2)'}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '0'}}>
                            <div style={{padding: '2.5rem', borderRight: '1px solid rgba(255,255,255,0.05)'}}>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0}}>
                                    <IconStep num="1" /> {t('instructions.step1_title')}
                                </h3>
                                <p style={{fontSize: '1.05rem', lineHeight: '1.7', opacity: 0.9}}>
                                    {t('instructions.step1_desc')}
                                </p>
                            </div>
                            <img src="/assets/grilla1.jpg" alt={t('instructions.step1_alt')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        </div>
                    </div>

                    <div className="instruction-section glass-container" style={{padding: '0', marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid rgba(255,145,0,0.2)'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1.2fr minmax(300px, 1fr)', gap: '0'}}>
                            <img src="/assets/grafo1.jpg" alt={t('instructions.step2_alt')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                            <div style={{padding: '2.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)'}}>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0}}>
                                    <IconStep num="2" /> {t('instructions.step2_title')}
                                </h3>
                                <p style={{fontSize: '1.05rem', lineHeight: '1.7', opacity: 0.9}}>
                                    {t('instructions.step2_desc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="instruction-section glass-container" style={{padding: '0', marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid rgba(255,145,0,0.2)'}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '0'}}>
                            <div style={{padding: '2.5rem', borderRight: '1px solid rgba(255,255,255,0.05)'}}>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0}}>
                                    <IconStep num="3" /> {t('instructions.step3_title')}
                                </h3>
                                <p style={{fontSize: '1.05rem', lineHeight: '1.7', opacity: 0.9}}>
                                    {t('instructions.step3_desc')}
                                </p>
                            </div>
                            <img src="/assets/algorithm1.jpg" alt={t('instructions.step3_alt')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        </div>
                    </div>

                    <div className="instruction-section glass-container" style={{padding: '0', marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid rgba(255,145,0,0.2)'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1.2fr minmax(300px, 1fr)', gap: '0'}}>
                            <img src="/assets/ruta1.jpg" alt={t('instructions.step4_alt')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                            <div style={{padding: '2.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)'}}>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0}}>
                                    <IconStep num="4" /> {t('instructions.step4_title')}
                                </h3>
                                <p style={{fontSize: '1.05rem', lineHeight: '1.7', opacity: 0.9}}>
                                    {t('instructions.step4_desc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="instruction-section glass-container" style={{padding: '0', marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid rgba(255,145,0,0.2)'}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '0'}}>
                            <div style={{padding: '2.5rem', borderRight: '1px solid rgba(255,255,255,0.05)'}}>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0}}>
                                    <IconStep num="5" /> {t('instructions.step5_title')}
                                </h3>
                                <p style={{fontSize: '1.05rem', lineHeight: '1.7', opacity: 0.9}}>
                                    {t('instructions.step5_desc')}
                                </p>
                            </div>
                            <img src="/assets/heat2.jpg" alt={t('instructions.step5_alt')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        </div>
                    </div>

                    <div style={{marginTop: '4rem', padding: '3rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px'}}>
                        <h2 style={{fontSize: '2rem', marginBottom: '2rem', textAlign: 'center'}}>{t('instructions.faq_title')}</h2>
                        
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                            <div>
                                <h4 style={{color: 'var(--orange)', marginBottom: '0.5rem'}}>{t('instructions.faq_q1')}</h4>
                                <p style={{fontSize: '0.95rem', opacity: 0.7, lineHeight: '1.5'}}>{t('instructions.faq_a1')}</p>
                            </div>
                            <div>
                                <h4 style={{color: 'var(--orange)', marginBottom: '0.5rem'}}>{t('instructions.faq_q2')}</h4>
                                <p style={{fontSize: '0.95rem', opacity: 0.7, lineHeight: '1.5'}}>{t('instructions.faq_a2')}</p>
                            </div>
                            <div>
                                <h4 style={{color: 'var(--orange)', marginBottom: '0.5rem'}}>{t('instructions.faq_q3')}</h4>
                                <p style={{fontSize: '0.95rem', opacity: 0.7, lineHeight: '1.5'}}>{t('instructions.faq_a3')}</p>
                            </div>
                            <div>
                                <h4 style={{color: 'var(--orange)', marginBottom: '0.5rem'}}>{t('instructions.faq_q4')}</h4>
                                <p style={{fontSize: '0.95rem', opacity: 0.7, lineHeight: '1.5'}}>{t('instructions.faq_a4')}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                        <Link to="/editor" className="cta-btn primary lg">{t('instructions.go_to_editor')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
