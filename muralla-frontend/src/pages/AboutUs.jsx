import React from 'react';
import { Navbar } from '../components/Navbar';
import { IconLayers, IconCode } from '../components/Icons';

export const AboutUs = () => {
    return (
        <div className="landing-container secondary-page">
            <Navbar activePage="about" />

            <div className="page-content">
                <div className="glass-container page-box">
                    <h1 className="title">Sobre el Proyecto <span className="brand-tag">MURALLA GRAPH</span></h1>
                    
                    <div className="about-text">
                        <h3 className="section-subtitle">Importancia del Proyecto</h3>
                        <p>
                            El Centro Histórico de Cartagena de Indias es una joya arquitectónica que atrae a miles de turistas. Sin embargo, enfrenta desafíos en la gestión de emergencias debido a su alta densidad poblacional y la complejidad de sus calles estrechas.
                        </p>
                        <p>
                            Nuestra aplicación determina las mejores rutas de evacuación mediante el modelo <strong>P-graph</strong> (Process Graph), originalmente diseñado para redes industriales y adaptado aquí para la <strong>Optimización Combinatoria</strong> de flujos humanos. Esto es esencial para la <strong>Protección de Vidas</strong>, la <strong>Optimización de Recursos</strong> de las autoridades y la <strong>Reducción de Congestión</strong> en vías principales.
                        </p>

                    <div className="architecture-grid" style={{
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                            gap: '2rem', 
                            marginTop: '3rem'
                        }}>
                            <div className="glass-container" style={{padding: '2rem'}}>
                                <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--orange)'}}>
                                    <IconLayers /> Arquitectura Robusta
                                </h4>
                                <p style={{fontSize: '1rem', opacity: 0.8, marginTop: '1rem', lineHeight: '1.6'}}>
                                    Implementamos una arquitectura de <strong>3 capas</strong> desacopladas bajo el estándar ISO/IEC/IEEE 29148:2018:
                                    <br/>• <strong>Frontend:</strong> React + Vite para una UI reactiva y renderizado SIG mediante MapLibre.
                                    <br/>• <strong>Backend:</strong> Core en Spring Boot (Java) que centraliza la lógica algorítmica y seguridad JWT.
                                    <br/>• <strong>Datos:</strong> Motor PostgreSQL con extensión PostGIS para manejo eficiente de coordenadas y topología de red.
                                </p>
                            </div>
                            <div className="glass-container" style={{padding: '2rem'}}>
                                <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--orange)'}}>
                                    <IconCode /> Algoritmos Core (MSG/SSG/ABB)
                                </h4>
                                <p style={{fontSize: '1rem', opacity: 0.8, marginTop: '1rem', lineHeight: '1.6'}}>
                                    A diferencia de un GPS tradicional, nuestro sistema utiliza el método P-graph (Process Graph) para:
                                    <br/>• <strong>MSG:</strong> Generar la estructura máxima de interconexión entre POIs.
                                    <br/>• <strong>SSG:</strong> Identificar sub-estructuras de solución que cumplen con ventanas de tiempo.
                                    <br/>• <strong>ABB:</strong> Organizar las soluciones según su utilidad y costo para ofrecer el catálogo $k$-best.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{marginTop: '4rem', textAlign: 'center'}}>
                        <img src="/assets/grafos.gif" alt="P-Graph Visualization" style={{width: '100%', maxWidth: '800px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)'}} />
                    </div>

                    <h2 className="title" style={{fontSize: '2.4rem', marginTop: '3.5rem', textAlign: 'center'}}>Equipo de Desarrollo</h2>
                    
                    <div className="team-section">
                        <h3 style={{textAlign: 'center', color: 'var(--orange)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px'}}>Core Team</h3>
                        <div className="team-grid" style={{
                            display: 'flex', 
                            justifyContent: 'center',
                            gap: '2rem', 
                            flexWrap: 'wrap',
                            marginBottom: '4rem'
                        }}>
                            {[
                                { name: "Elias Mieles", role: "Software Engineer / Lead UI" },
                                { name: "Juan Felipe Eraso", role: "Software Engineer / Backend Logic" }
                            ].map((m, i) => (
                                <div key={i} className="team-card glass-container" style={{padding: '2rem', textAlign: 'center', minWidth: '280px', border: '1px solid var(--orange)'}}>
                                    <div style={{fontSize: '3.5rem', marginBottom: '1rem'}}>👨‍💻</div>
                                    <h4 style={{fontSize: '1.4rem', color: 'white', marginBottom: '0.5rem'}}>{m.name}</h4>
                                    <p style={{fontSize: '1rem', color: 'var(--orange)', fontWeight: '600'}}>{m.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="collab-section" style={{marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px'}}>
                        <h3 style={{fontSize: '1.5rem', marginBottom: '1.5rem', opacity: 0.9}}>Agradecimientos y Colaboradores Anteriores</h3>
                        <p style={{fontSize: '1rem', opacity: 0.7, marginBottom: '1.5rem'}}>
                            El proyecto MurallaGraph nació del esfuerzo de un grupo dedicado de estudiantes e investigadores. Agradecemos su contribución inicial en las fases de análisis y prototipado:
                        </p>
                        <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'}}>
                            <div style={{flex: 1, minWidth: '200px'}}>
                                <h4 style={{color: 'var(--orange)', fontSize: '1rem', marginBottom: '0.5rem'}}>Director del Proyecto</h4>
                                <p style={{fontSize: '1.1rem'}}>Juan Carlos García Ojeda</p>
                            </div>
                            <div style={{flex: 2, minWidth: '300px'}}>
                                <h4 style={{color: 'var(--orange)', fontSize: '1rem', marginBottom: '0.5rem'}}>Colaboradores</h4>
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
                        <Link to="/editor" className="cta-btn primary lg">Ir al Editor Interactivo</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
