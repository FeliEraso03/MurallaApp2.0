import React from 'react';
import { Navbar } from '../components/Navbar';

// ── SVG Icons ──────────────────────────────────────────────
const IconStep = ({ num }) => (
    <div style={{
        width: '32px', height: '32px', borderRadius: '50%', background: 'var(--orange)', 
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontWeight: 'bold', fontSize: '1rem'
    }}>{num}</div>
);

export const Instructions = () => {
    return (
        <div className="landing-container secondary-page">
            <Navbar activePage="instructions" />

            <div className="page-content">
                <div className="glass-container page-box">
                    <h1 className="title">Guía de Uso <span className="brand-tag">PRO</span></h1>
                    
                    <div className="instruction-section glass-container" style={{padding: '0', marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid rgba(255,145,0,0.2)'}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '0'}}>
                            <div style={{padding: '2.5rem', borderRight: '1px solid rgba(255,255,255,0.05)'}}>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0}}>
                                    <IconStep num="1" /> ¿Cómo activar la Grilla?
                                </h3>
                                <p style={{fontSize: '1.05rem', lineHeight: '1.7', opacity: 0.9}}>
                                    La grilla es fundamental para la <strong>discretización del espacio</strong>. Activa el interruptor en la pestaña "Editor" para desplegar la malla de referencia. 
                                    Cada celda representa un área de influencia para el cálculo de densidades.
                                </p>
                            </div>
                            <img src="/assets/grilla1.jpg" alt="Grilla tutorial" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        </div>
                    </div>

                    <div className="instruction-section glass-container" style={{padding: '0', marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid rgba(255,145,0,0.2)'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1.2fr minmax(300px, 1fr)', gap: '0'}}>
                            <img src="/assets/grafo1.jpg" alt="Grafo tutorial" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                            <div style={{padding: '2.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)'}}>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0}}>
                                    <IconStep num="2" /> Modelado de la Red (Grafos)
                                </h3>
                                <p style={{fontSize: '1.05rem', lineHeight: '1.7', opacity: 0.9}}>
                                    Define los <strong>nodos de red</strong>. Haz clic para añadir puntos de interés (POIs) o puntos de decisión. 
                                    Conéctalos para formar aristas, definiendo la <strong>capacidad de flujo</strong> y el <strong>tiempo de recorrido</strong> entre ellos.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="instruction-section glass-container" style={{padding: '0', marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid rgba(255,145,0,0.2)'}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '0'}}>
                            <div style={{padding: '2.5rem', borderRight: '1px solid rgba(255,255,255,0.05)'}}>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0}}>
                                    <IconStep num="3" /> Aplicación de Algoritmos
                                </h3>
                                <p style={{fontSize: '1.05rem', lineHeight: '1.7', opacity: 0.9}}>
                                    Selecciona entre Dijkstra (camino más corto) o Ford-Fulkerson (flujo máximo). 
                                    Haz clic en Origen y Destino. El sistema calculará la <strong>ruta óptima</strong> resaltándola en colores neón para máxima visibilidad.
                                </p>
                            </div>
                            <img src="/assets/algorithm1.jpg" alt="Algoritmos tutorial" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        </div>
                    </div>

                    <div className="instruction-section glass-container" style={{padding: '0', marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid rgba(255,145,0,0.2)'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1.2fr minmax(300px, 1fr)', gap: '0'}}>
                            <img src="/assets/ruta1.jpg" alt="Rutas tutorial" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                            <div style={{padding: '2.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)'}}>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0}}>
                                    <IconStep num="4" /> Soluciones k-best (Avanzado)
                                </h3>
                                <p style={{fontSize: '1.05rem', lineHeight: '1.7', opacity: 0.9}}>
                                    Usa <strong>Resolve Graph</strong> para enviar el grafo al motor P-graph. Obtendrás un catálogo de soluciones alternativas. 
                                    Perfecto para evaluar rutas paralelas en caso de obstrucciones en la vía principal.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="instruction-section glass-container" style={{padding: '0', marginBottom: '2.5rem', overflow: 'hidden', border: '1px solid rgba(255,145,0,0.2)'}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '0'}}>
                            <div style={{padding: '2.5rem', borderRight: '1px solid rgba(255,255,255,0.05)'}}>
                                <h3 style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0}}>
                                    <IconStep num="5" /> Mapas de Calor (Densidad)
                                </h3>
                                <p style={{fontSize: '1.05rem', lineHeight: '1.7', opacity: 0.9}}>
                                    Cambia a la capa de <strong>Heat Map</strong> para visualizar las zonas críticas de congestión. 
                                    Este análisis es vital para predecir dónde se acumularán las personas y redirigirlas antes de que ocurra un bloqueo.
                                </p>
                            </div>
                            <img src="/assets/heat2.jpg" alt="Heat map tutorial" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        </div>
                    </div>

                    <div style={{marginTop: '4rem', padding: '3rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px'}}>
                        <h2 style={{fontSize: '2rem', marginBottom: '2rem', textAlign: 'center'}}>Preguntas Frecuentes (FAQ)</h2>
                        
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                            <div>
                                <h4 style={{color: 'var(--orange)', marginBottom: '0.5rem'}}>¿Por qué mis rutas no se guardan?</h4>
                                <p style={{fontSize: '0.95rem', opacity: 0.7, lineHeight: '1.5'}}>Esta versión 2.0 guarda los datos en la memoria local (SessionStorage). Si refrescas la página sin exportar el archivo <strong>GeoJSON</strong>, los cambios de red se perderán.</p>
                            </div>
                            <div>
                                <h4 style={{color: 'var(--orange)', marginBottom: '0.5rem'}}>¿Cómo edito una arista existente?</h4>
                                <p style={{fontSize: '0.95rem', opacity: 0.7, lineHeight: '1.5'}}>Simplemente haz clic sobre la línea que conecta los nodos. Un panel interactivo te permitirá ajustar el <strong>peso</strong> (distancia) y la <strong>capacidad</strong> (ancho de vía).</p>
                            </div>
                            <div>
                                <h4 style={{color: 'var(--orange)', marginBottom: '0.5rem'}}>¿Qué significa el color neón?</h4>
                                <p style={{fontSize: '0.95rem', opacity: 0.7, lineHeight: '1.5'}}>El verde neón indica el nodo de Origen y el fucsia el nodo de Destino. Tu ruta óptima aparecerá resaltada para diferenciarla de la red vial base.</p>
                            </div>
                            <div>
                                <h4 style={{color: 'var(--orange)', marginBottom: '0.5rem'}}>¿Cómo cargo el mapa real?</h4>
                                <p style={{fontSize: '0.95rem', opacity: 0.7, lineHeight: '1.5'}}>Usa el botón <strong>"Cargar Cartagena (Full)"</strong> en la barra lateral del editor. Esto cargará un grafo predefinido con los puntos de interés más importantes del centro.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                        <Link to="/editor" className="cta-btn primary lg">¡Entendido! Ir al Editor</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
