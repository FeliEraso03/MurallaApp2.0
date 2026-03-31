import React, { useState, useEffect } from 'react';
import './ElementModal.css';

/**
 * Modal to create or edit Node / Edge attributes.
 * When `editMode` is true, shows a Delete button and pre-fills with `initialData`.
 */
export const ElementModal = ({ isOpen, type, initialData, editMode, onSave, onCancel, onDelete }) => {
    
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
        } else {
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
            [name]: Number(value)
        }));
    };

    const handleSave = () => onSave(formData);

    const title = editMode
        ? (type === 'NODE' ? `Editar ${initialData?.id || 'Nodo'}` : `Editar Arista ${initialData?.startNodeId ?? ''} → ${initialData?.endNodeId ?? ''}`)
        : (type === 'NODE' ? 'Nuevo Nodo' : 'Nueva Conexión');

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{title}</h3>
                
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
                            {editMode && (
                                <div className="form-group" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500 }}>
                                        {formData.startNodeId} <span style={{color: '#06d6a0', margin: '0 8px'}}>➔</span> {formData.endNodeId}
                                    </span>
                                    <button 
                                        type="button" 
                                        className="btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                                        onClick={() => setFormData(prev => ({ ...prev, startNodeId: prev.endNodeId, endNodeId: prev.startNodeId }))}
                                    >
                                        🔄 Invertir
                                    </button>
                                </div>
                            )}
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
                    {editMode && onDelete && (
                        <button className="btn-danger" onClick={onDelete}>
                            Eliminar
                        </button>
                    )}
                    <div className="modal-actions-right">
                        <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
                        <button className="btn-primary" onClick={handleSave}>Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
