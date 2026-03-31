import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';

export function Navbar({ activePage }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <nav className="navbar" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="navbar-brand">
                Muralla App <span className="brand-tag">2.0</span>
            </div>
            <div className="navbar-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/" className={`nav-link ${activePage === 'home' ? 'active' : ''}`}>Home</Link>
                <Link to="/instructions" className={`nav-link ${activePage === 'instructions' ? 'active' : ''}`}>Instrucciones</Link>
                <Link to="/about" className={`nav-link ${activePage === 'about' ? 'active' : ''}`}>Acerca de</Link>
                
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '20px' }}>
                        <Link to="/editor" className="nav-link" style={{ color: 'var(--orange)', fontWeight: 600 }}>Editor</Link>
                        
                        {/* Profile Logo / Avatar */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link to="/profile" title="Ir a mi perfil / Preferencias" style={{
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
                                Cerrar sesión
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
                        Iniciar sesión
                    </Link>
                )}
            </div>
        </nav>
    );
}
