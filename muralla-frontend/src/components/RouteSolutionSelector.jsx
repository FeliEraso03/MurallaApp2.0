import React, { useState } from 'react';

export const RouteSolutionSelector = ({ solutions, activeSolution, onSelectSolution }) => {
    if (!solutions || solutions.length === 0) return null;
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const activeSol = solutions.find(s => s.solucion === activeSolution);
    
    return (
        <div className="route-solution-selector">
            <div className="selector-dropdown">
                <button 
                    className="dropdown-trigger"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <span className="trigger-label">Solución {activeSolution}</span>
                    <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        style={{ 
                            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <div className="dropdown-header">
                            <span className="dropdown-title">Seleccionar Solución</span>
                            <span className="dropdown-count">{solutions.length} opciones</span>
                        </div>
                        <div className="dropdown-items">
                            {solutions.map((sol) => (
                                <button
                                    key={sol.solucion}
                                    className={`dropdown-item ${activeSolution === sol.solucion ? 'active' : ''}`}
                                    onClick={() => {
                                        onSelectSolution(sol.solucion);
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    <span className="item-number">{sol.solucion}</span>
                                    {activeSolution === sol.solucion && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
