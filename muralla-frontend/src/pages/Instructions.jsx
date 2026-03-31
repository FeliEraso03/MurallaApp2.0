import React from 'react';
import { Link } from 'react-router-dom';

export const Instructions = () => {
    return (
        <div className="landing-container secondary-page">
            <nav className="navbar">
                <div className="navbar-brand">
                    MURALLA <span className="brand-tag">2.0</span>
                </div>
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/instructions" className="nav-link active">Instrucciones</Link>
                    <Link to="/about" className="nav-link">Acerca de</Link>
                </div>
            </nav>

            <div className="page-content">
                <div className="glass-container page-box">
                    <h1 className="title">Instrucciones de la Versión <span className="brand-tag">2.0</span></h1>
                    <img src="/assets/car1.jpg" alt="Mapa" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '12px', marginBottom: '2rem' }} />
                    
                    <div style={{color: '#ddd', lineHeight: '1.6'}}>
                        <h3>1. Modo de Creación de Grafos</h3>
                        <p>En el editor principal, selecciona "Añadir Nodo" en la barra lateral izquierda y haz clic en cualquier lugar del mapa de Cartagena para colocar un punto en la red.</p>
                        
                        <h3>2. Modo de Algoritmos (Dijkstra)</h3>
                        <p>Busca la pestaña "Algoritmos", selecciona Dijkstra y haz clic sobre un nodo de Origen y luego un nodo Destino. El servidor `Spring Boot` devolverá la ruta óptima de evacuación.</p>

                        <h3>3. Soluciones Múltiples (P-Graph)</h3>
                        <p>Si usas **Resolve Graph**, enviarás todo el grafo al servidor Python (`:3000`) para generar múltiples flujos combinatorios (Ruta 1, Ruta 2, etc.) que puedes navegar directamente en React usando las tarjetas de solución.</p>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <Link to="/editor" className="cta-btn primary">Entendido 👍 Ir al mapa</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
