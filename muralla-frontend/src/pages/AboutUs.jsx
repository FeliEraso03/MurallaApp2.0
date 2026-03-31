import React from 'react';
import { Link } from 'react-router-dom';

export const AboutUs = () => {
    return (
        <div className="landing-container secondary-page">
            <nav className="navbar">
                <div className="navbar-brand">
                    MURALLA <span className="brand-tag">2.0</span>
                </div>
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/instructions" className="nav-link">Instrucciones</Link>
                    <Link to="/about" className="nav-link active">Acerca de</Link>
                </div>
            </nav>

            <div className="page-content">
                <div className="glass-container page-box">
                    <h1 className="title">Sobre el Proyecto <span className="brand-tag">MURALLA GRAPH</span></h1>
                    <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                        <div>
                            <p>
                                El proyecto <strong>MurallaGraph</strong> fue diseñado para ayudar a residentes y turistas de 
                                <em> Cartagena de Indias</em> a encontrar las rutas de evacuación más rápidas y seguras.
                            </p>
                            <p>
                                Integrando datos vectoriales e interactivos, y empoderado con algoritmos combinatorios en backend como Dijkstra y flujos como Ford-Fulkerson,
                                se adapta eficientemente a un entorno dinámico de red geográfica.
                            </p>
                            <Link to="/editor" className="cta-btn primary">Probar Editor Interactivo</Link>
                        </div>
                        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                            <img src="/assets/grafos.gif" alt="Grafos de evacuación" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
