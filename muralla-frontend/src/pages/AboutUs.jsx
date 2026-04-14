import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { IconLayers, IconCode } from '../components/Icons';
import { User } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export const AboutUs = () => {
    const { t, loading } = useI18n();

    if (loading) {
        return null;
    }

    return (
        <div className="landing-container secondary-page">
            <Navbar activePage="about" />

            <div className="page-content">
                <div className="glass-container page-box">
                    <h1 className="title">{t('about.title')} <span className="brand-tag">Muralla App</span></h1>
                    
                    <div className="about-text">
                        <h3 className="section-subtitle">{t('about.importance_title')}</h3>
                        <p>
                            {t('about.importance_p1')}
                        </p>
                        <p>
                            {t('about.importance_p2')}
                        </p>

                    <div className="architecture-grid" style={{
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                            gap: '2rem', 
                            marginTop: '3rem'
                        }}>
                            <div className="glass-container" style={{padding: '2rem'}}>
                                <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--orange)'}}>
                                    <IconLayers /> {t('about.architecture_title')}
                                </h4>
                                <p style={{fontSize: '1rem', opacity: 0.8, marginTop: '1rem', lineHeight: '1.6'}}>
                                    {t('about.architecture_desc')}
                                </p>
                            </div>
                            <div className="glass-container" style={{padding: '2rem'}}>
                                <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--orange)'}}>
                                    <IconCode /> {t('about.algorithms_title')}
                                </h4>
                                <p style={{fontSize: '1rem', opacity: 0.8, marginTop: '1rem', lineHeight: '1.6'}}>
                                    {t('about.algorithms_desc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{marginTop: '4rem', textAlign: 'center'}}>
                        <img src="/assets/grafos.gif" alt={t('about.visualization_alt')} style={{width: '100%', maxWidth: '800px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)'}} />
                    </div>

                    <h2 className="title" style={{fontSize: '2.4rem', marginTop: '3.5rem', textAlign: 'center'}}>{t('about.team_title')}</h2>
                    
                    <div className="team-section">
                        <h3 style={{textAlign: 'center', color: 'var(--orange)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px'}}>{t('about.core_team')}</h3>
                        <div className="team-grid" style={{
                            display: 'flex', 
                            justifyContent: 'center',
                            gap: '2rem', 
                            flexWrap: 'wrap',
                            marginBottom: '4rem'
                        }}>
                            {[
                                { name: "Juan Felipe Eraso Navarro", role: t('about.role_engineer') },
                                { name: "Elias David Mieles Gomez", role: t('about.role_engineer') }
                            ].map((m, i) => (
                                <div key={i} className="team-card glass-container" style={{padding: '2rem', textAlign: 'center', minWidth: '280px', border: '1px solid var(--orange)'}}>
                                    <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                                        <User size={48} color="var(--orange)" />
                                    </div>
                                    <h4 style={{fontSize: '1.4rem', color: 'white', marginBottom: '0.5rem'}}>{m.name}</h4>
                                    <p style={{fontSize: '1rem', color: 'var(--orange)', fontWeight: '600'}}>{m.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="collab-section" style={{marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px'}}>
                        <h3 style={{fontSize: '1.5rem', marginBottom: '1.5rem', opacity: 0.9}}>{t('about.acknowledgments_title')}</h3>
                        <p style={{fontSize: '1rem', opacity: 0.7, marginBottom: '1.5rem'}}>
                            {t('about.acknowledgments_desc')}
                        </p>
                        <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'}}>
                            <div style={{flex: 1, minWidth: '200px'}}>
                                <h4 style={{color: 'var(--orange)', fontSize: '1rem', marginBottom: '0.5rem'}}>{t('about.director_title')}</h4>
                                <p style={{fontSize: '1.1rem'}}>Juan Carlos García Ojeda</p>
                            </div>
                            <div style={{flex: 2, minWidth: '300px'}}>
                                <h4 style={{color: 'var(--orange)', fontSize: '1rem', marginBottom: '0.5rem'}}>{t('about.collaborators_title')}</h4>
                                <ul style={{listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', opacity: 0.8}}>
                                    <li>• Jose Rapalino</li>
                                    <li>• Ramiro Mejía</li>
                                    <li>• Melissa Pizarro</li>
                                    <li>• Faibel Duque</li>
                                    <li>• Diogo Rodriguez</li>
                                    <li>• David Sanabria</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <Link to="/editor" className="cta-btn primary lg">{t('about.editor_link')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
