import React, { useState, useEffect } from 'react';
import './ElementModal.css';

/**
 * A reusable Modal component to input Node or Edge attributes.
 */
export const ElementModal = ({ isOpen, type, initialData, onSave, onCancel }) => {
    
    // State to hold the current form values
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
        } else {
            // Reset to defaults if not provided
            if (type === 'NODE') {
                setFormData({ type: 1, initialContent: 0, maximumCapacity: 100 });
            } else if (type === 'EDGE') {
                setFormData({ weight: 10, capacity: 50, time: 5 });
            }
        }
    }, [isOpen, initialData, type]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: Number(value) // Cast to number since attributes are numeric
        }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{type === 'NODE' ? 'Configurar Nodo' : 'Configurar Conexión'}</h3>
                
                <div className="modal-form">
                    {type === 'NODE' && (
                        <>
                            <div className="form-group">
                                <label>Tipo de Nodo</label>
                                <select name="type" value={formData.type || 1} onChange={handleChange}>
                                    <option value={1}>1: Source (Origen)</option>
                                    <option value={2}>2: Intermediate (Tránsito)</option>
                                    <option value={3}>3: Output (Destino)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Contenido Inicial</label>
                                <input name="initialContent" type="number" min="0" value={formData.initialContent || 0} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Capacidad Máxima</label>
                                <input name="maximumCapacity" type="number" min="1" value={formData.maximumCapacity || 100} onChange={handleChange} />
                            </div>
                        </>
                    )}

                    {type === 'EDGE' && (
                        <>
                            <div className="form-group">
                                <label>Distancia / Peso Matemático</label>
                                <input name="weight" type="number" min="0" step="0.1" value={formData.weight || 0} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Capacidad de Flujo</label>
                                <input name="capacity" type="number" min="1" value={formData.capacity || 1} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Tiempo (minutos)</label>
                                <input name="time" type="number" min="1" value={formData.time || 1} onChange={handleChange} />
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
                    <button className="btn-primary" onClick={handleSave}>Guardar</button>
                </div>
            </div>
        </div>
    );
};
