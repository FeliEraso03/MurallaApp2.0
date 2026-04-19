import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/authContext';
import { useI18n } from '../contexts/I18nContext';
import { useNotification } from '../contexts/NotificationContext';
import './GraphManager.css';

export function GraphManager({ nodes, edges, setNodes, setEdges }) {
  const { user, token } = useAuth();
  const { t } = useI18n();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState('my_graphs'); // 'my_graphs' or 'community'
  const [graphs, setGraphs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Save form states
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load graphs when tab changes or auth changes
  useEffect(() => {
    fetchGraphs();
  }, [activeTab, token]);

  const fetchGraphs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = '/api/graphs/public';
      if (activeTab === 'my_graphs') {
        if (!token) {
          setGraphs([]);
          setIsLoading(false);
          return;
        }
        url = '/api/graphs';
      }

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error('Failed to load graphs');
      }
      const data = await response.json();
      // Spring Data returns a 'content' array for paginated results
      setGraphs(data.content || []);
    } catch (err) {
      console.error('Error fetching graphs:', err);
      setError(t('graphManager.error_load'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!token) {
      setError(t('graphManager.login_required'));
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      name,
      description,
      isPublic,
      nodes,
      edges
    };

    try {
      const response = await fetch('/api/graphs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save graph');
      }

      // Reset form and reload list
      setName('');
      setDescription('');
      setIsPublic(false);
      setShowSaveForm(false);
      
      if (activeTab === 'my_graphs') {
        fetchGraphs();
      }
      showNotification(t('graphManager.success_save'), 'success');
    } catch (err) {
      console.error('Error saving graph:', err);
      setError(t('graphManager.error_save'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (id) => {
    try {
      setIsLoading(true);
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/graphs/${id}`, { headers });
      if (!response.ok) {
        throw new Error('Failed to load graph details');
      }
      
      const data = await response.json();
      if (data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
        showNotification(t('graphManager.success_load'), 'success');
      }
    } catch (err) {
      console.error('Error loading graph:', err);
      showNotification(t('graphManager.error_load'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('graphManager.confirm_delete'))) return;

    try {
      const response = await fetch(`/api/graphs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete graph');
      }
      
      showNotification(t('graphManager.success_delete'), 'success');
      fetchGraphs();
    } catch (err) {
      console.error('Error deleting graph:', err);
      showNotification(t('graphManager.error_delete'), 'error');
    }
  };

  return (
    <div className="graph-manager">
      <div className="graph-manager-tabs">
        <button 
          className={`graph-manager-tab ${activeTab === 'my_graphs' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_graphs')}
        >
          {t('graphManager.my_graphs_tab')}
        </button>
        <button 
          className={`graph-manager-tab ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          {t('graphManager.community_tab')}
        </button>
      </div>

      {/* Save Form Section */}
      {activeTab === 'my_graphs' && user && (
        <div style={{ marginBottom: '15px' }}>
          {!showSaveForm ? (
            <button 
              className="btn-small btn-primary" 
              style={{ width: '100%' }}
              onClick={() => setShowSaveForm(true)}
              disabled={nodes.length === 0}
            >
              {t('graphManager.save_current')}
            </button>
          ) : (
            <form className="save-form" onSubmit={handleSave}>
              <h4>{t('graphManager.save_title')}</h4>
              
              <input 
                type="text" 
                placeholder={t('graphManager.graph_name_placeholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              
              <textarea 
                placeholder={t('graphManager.description_placeholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
              
              <label>
                <input 
                  type="checkbox" 
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                {t('graphManager.make_public')}
              </label>

              {error && <div className="error-message">{error}</div>}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn-small" 
                  onClick={() => setShowSaveForm(false)}
                  style={{ flex: 1 }}
                >
                  {t('graphManager.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn-small btn-primary"
                  disabled={!name.trim() || isSaving}
                  style={{ flex: 1 }}
                >
                  {isSaving ? t('graphManager.saving') : t('graphManager.save')}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!user && activeTab === 'my_graphs' && (
        <div style={{ textAlign: 'center', color: '#aaa', padding: '20px 0' }}>
          {t('graphManager.login_required')}
        </div>
      )}

      {/* Graph List Section */}
      <div className="graph-list">
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '20px 0' }}>
            {t('graphManager.loading')}
          </div>
        ) : graphs.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '20px 0' }}>
            {t('graphManager.no_graphs')}
          </div>
        ) : (
          graphs.map(graph => (
            <div key={graph.id} className="graph-card">
              <div className="graph-card-header">
                <div className="graph-card-title">{graph.name}</div>
                {graph.isPublic ? (
                  <span className="badge-public">{t('graphManager.public_badge')}</span>
                ) : (
                  <span className="badge-private">{t('graphManager.private_badge')}</span>
                )}
              </div>
              
              {graph.description && (
                <div className="graph-card-desc">{graph.description}</div>
              )}
              
              <div className="graph-card-stats">
                <span>{graph.nodeCount || 0} {t('graphManager.nodes')}</span>
                <span>•</span>
                <span>{graph.edgeCount || 0} {t('graphManager.edges')}</span>
              </div>
              
              <div className="graph-card-actions">
                <button 
                  className="btn-small btn-primary"
                  onClick={() => handleLoad(graph.id)}
                >
                  {t('graphManager.load')}
                </button>
                
                {/* Only show delete if user owns the graph. 
                    Since we don't have user.id in the frontend JWT directly accessible easily
                    (unless we parse it), we check if activeTab is my_graphs as a proxy, 
                    OR ideally the API would return a flag. For now, activeTab my_graphs indicates ownership. */}
                {activeTab === 'my_graphs' && user && (
                  <button 
                    className="btn-small btn-danger"
                    onClick={() => handleDelete(graph.id)}
                  >
                    {t('graphManager.delete')}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
