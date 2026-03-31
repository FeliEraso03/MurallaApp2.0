import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; 

export const LandingPage = () => {
    return (
        <div className="landing-container">
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-brand">
                    MURALLA <span className="brand-tag">2.0</span>
                </div>
                <div className="navbar-links">
                    <Link to="/" className="nav-link active">Home</Link>
                    <Link to="/instructions" className="nav-link">Instrucciones</Link>
                    <Link to="/about" className="nav-link">Acerca de</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="hero-section" style={{ backgroundImage: "url('/assets/cartagena.jpg')" }}>
                <div className="hero-overlay">
                    <h5 className="hero-subtitle">UNIVERSIDAD DE CARTAGENA</h5>
                    <h1 className="hero-title glass-container">
                        Rutas Óptimas en el Centro Histórico
                    </h1>
                    <div className="hero-buttons">
                        <Link to="/editor" className="cta-btn primary lg">Ir al Mapa Interactivo</Link>
                        <Link to="/about" className="cta-btn outline lg mx-2">Conocer el Equipo</Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-heading">Características</h2>
                <div className="features-grid">
                    <div className="feature-card glass-container">
                        <span className="icon-large">🗺️</span>
                        <h3>Mapa Interactivo Vectorial</h3>
                        <p>Navega el centro histórico fluidamente gracias a MapLibre GL JS.</p>
                    </div>
                    <div className="feature-card glass-container">
                        <span className="icon-large">🎛️</span>
                        <h3>Gestión de Grafos</h3>
                        <p>Añade y edita nodos libremente visualizando flujos con precisión.</p>
                    </div>
                    <div className="feature-card glass-container">
                        <span className="icon-large">⚡</span>
                        <h3>Algoritmos Nativos</h3>
                        <p>Calcula Dijkstra o Ford-Fulkerson delegados al escalable Spring Boot.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};
