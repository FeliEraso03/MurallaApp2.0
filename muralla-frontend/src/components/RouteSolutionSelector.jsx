import React from 'react';

export const RouteSolutionSelector = ({ solutions, activeSolution, onSelectSolution }) => {
    if (!solutions || solutions.length === 0) return null;
    
    return (
        <div className="solution-selector">
            <label htmlFor="solution-select">Seleccionar Solución:</label>
            <select 
                id="solution-select"
                value={activeSolution || ''}
                onChange={(e) => onSelectSolution(Number(e.target.value))}
            >
                <option value="">-- Seleccionar --</option>
                {solutions.map((sol) => (
                    <option key={sol.solucion} value={sol.solucion}>
                        {sol.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
