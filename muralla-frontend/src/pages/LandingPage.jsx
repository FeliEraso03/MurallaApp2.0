import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import { IconScience, IconSafe, IconCpu, IconMap, IconDatabase } from '../components/Icons';
import { useAuth } from '../utils/authContext';
import { Navbar } from '../components/Navbar';

export const LandingPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    return (
        <div className="landing-container">
            <Navbar activePage="home" />

            {/* Hero Section */}
            <div className="hero-section" style={{ backgroundImage: "url('/assets/cartagena.jpg')" }}>
                <div className="hero-overlay">
                    <h5 className="hero-subtitle">UNIVERSIDAD DE CARTAGENA</h5>
                    <h1 className="hero-title glass-container">
                        Turismo Inteligente en el Centro Histórico
                    </h1>
                    <p style={{maxWidth: '800px', margin: '1rem auto', fontSize: '1.2rem', color: '#eee', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                        Optimizando la seguridad y la experiencia del visitante en Cartagena mediante algoritmos avanzados de grafos y lógica combinatoria.
                    </p>
                    <div className="hero-buttons">
                        <Link to={user ? '/editor' : '/register'} className="cta-btn primary lg">
                            {user ? 'Ir al Editor' : 'Comenzar gratis'}
                        </Link>
                        <Link to="/instructions" className="cta-btn outline lg">Manual de Usuario</Link>
                    </div>
                </div>
            </div>

            {/* Science Section (TTDP) */}
            <section className="features-section">
                <div className="container" style={{maxWidth: '1200px', margin: '0 auto'}}>
                    <h2 className="section-heading">Resolviendo el TTDP</h2>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center'}}>
                        <div>
                            <p style={{fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.8'}}>
                                El <strong>Tourist Trip Design Problem (TTDP)</strong> es un reto de optimización que busca la ruta perfecta considerando intereses, tiempo y presupuesto. 
                                En Muralla App, enfrentamos los retos del Centro Histórico (calles estrechas, alta densidad y riesgos de emergencia) para garantizar evacuaciones eficientes y recorridos seguros.
                                <br/><br/>
                                Utilizando el motor <strong>P-graph</strong>, nuestra plataforma no solo calcula el camino más corto, sino que evalúa la <strong>utilidad social y turística</strong> de cada nodo, ofreciendo una experiencia personalizada y segura.
                            </p>
                            <div style={{marginTop: '2rem'}}>
                                <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
                                    <div className="icon-circle" style={{background: 'var(--orange-soft)', padding: '12px', borderRadius: '50%', color: 'var(--orange)'}}>
                                        <IconScience />
                                    </div>
                                    <div>
                                        <h4 style={{color: 'white', marginBottom: '0.25rem'}}>Lógica P-graph</h4>
                                        <p style={{fontSize: '0.95rem', opacity: 0.8}}>Sustento matemático para la generación de estructuras máximas y soluciones combinatorias óptimas.</p>
                                    </div>
                                </div>
                                <div style={{display: 'flex', gap: '1rem'}}>
                                    <div className="icon-circle" style={{background: 'var(--orange-soft)', padding: '12px', borderRadius: '50%', color: 'var(--orange)'}}>
                                        <IconSafe />
                                    </div>
                                    <div>
                                        <h4 style={{color: 'white', marginBottom: '0.25rem'}}>Seguridad Civil</h4>
                                        <p style={{fontSize: '0.95rem', opacity: 0.8}}>Diseñado específicamente para planes de contingencia y evacuación masiva en la Ciudad Heroica.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="glass-container" style={{padding: '1rem', borderRadius: '24px'}}>
                            <img src="/assets/grafos.gif" alt="Algoritmos en acción" style={{width: '100%', borderRadius: '16px'}} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features (Technical) */}
            <section className="features-section" style={{background: 'rgba(0,0,0,0.2)'}}>
                <h2 className="section-heading">Nuestra Arquitectura</h2>
                <div className="features-grid">
                    <div className="feature-card glass-container">
                        <IconCpu />
                        <h3>Core Algorítmico</h3>
                        <p>Implementación de MSG (Maximal Structure Generation) y ABB para encontrar las k-mejores soluciones.</p>
                    </div>
                    <div className="feature-card glass-container">
                        <IconMap />
                        <h3>Visualización SIG</h3>
                        <p>Renderizado vectorial de alta precisión mediante MapLibre GL JS y capas de datos GeoJSON.</p>
                    </div>
                    <div className="feature-card glass-container">
                        <IconDatabase />
                        <h3>Potencia Backend</h3>
                        <p>Motor de cálculo escalable en Spring Boot integrado con bases de datos geográficas PostGIS.</p>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section style={{padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center'}}>
                    <div className="glass-container" style={{overflow: 'hidden', borderRadius: '30px'}}>
                        <img src="/assets/heat1.jpg" alt="Mapa de calor impact" style={{width: '100%', display: 'block'}} />
                    </div>
                    <div>
                        <h2 style={{fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem'}}>Impacto Social y Urbano</h2>
                        <p style={{fontSize: '1.1rem', lineHeight: '1.8', opacity: 0.8, marginBottom: '2rem'}}>
                            No solo somos una herramienta de mapas. Muralla App busca transformar la seguridad de Cartagena brindando a los tomadores de decisiones datos reales sobre:
                        </p>
                        <ul style={{listStyle: 'none', padding: 0}}>
                            <li style={{marginBottom: '1rem', display: 'flex', gap: '1rem'}}>
                                <span style={{color: 'var(--orange)', fontWeight: 'bold'}}>✓</span>
                                <div><strong>Gestión de Multitudes:</strong> Identificación de cuellos de botella en calles como la Calle del Tablón.</div>
                            </li>
                            <li style={{marginBottom: '1rem', display: 'flex', gap: '1rem'}}>
                                <span style={{color: 'var(--orange)', fontWeight: 'bold'}}>✓</span>
                                <div><strong>Resiliencia Urbana:</strong> Planes de evacuación dinámicos ante incendios o desastres naturales.</div>
                            </li>
                            <li style={{marginBottom: '1rem', display: 'flex', gap: '1rem'}}>
                                <span style={{color: 'var(--orange)', fontWeight: 'bold'}}>✓</span>
                                <div><strong>Turismo Inteligente:</strong> Rutas que distribuyen el flujo de personas, evitando la saturación de plazas icónicas.</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
            {/* Final CTA Section */}
            <section className="cta-final" style={{padding: '5rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--navy-mid) 0%, var(--navy) 100%)'}}>
                <h2 style={{fontSize: '2.5rem', marginBottom: '1.5rem'}}>¿Listo para explorar?</h2>
                <p style={{maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.8}}>
                    Únete a los investigadores y turistas que ya utilizan el poder de la ciencia para recorrer la Ciudad Heroica.
                </p>
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                    <Link to={user ? '/editor' : '/register'} className="cta-btn primary lg">
                        {user ? 'Ir al Editor' : 'Crear cuenta gratis'}
                    </Link>
                    <Link to="/about" className="cta-btn outline lg">Sobre el Proyecto</Link>
                </div>
                <div style={{marginTop: '4rem'}}>
                    <img src="/assets/cartagena.jpg" alt="Cartagena Skyline" style={{width: '100%', maxWidth: '1000px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}} />
                </div>
            </section>
        </div>
    );
};
