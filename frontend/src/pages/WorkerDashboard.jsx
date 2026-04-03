import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, AlertTriangle, Upload, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import './WorkerDashboard.css';

const WorkerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [violations, setViolations] = useState([]);
  const [fileInputs, setFileInputs] = useState({});
  const [liveFrame, setLiveFrame] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'alerts'

  useEffect(() => {
    fetchViolations();

    const socketURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketURL);

    socket.on('NEW_VIOLATION', (violation) => {
      if (violation.station_id === user.station_id) {
        setViolations(prev => [violation, ...prev]);
      }
    });

    socket.on('UPDATE_VIOLATION', (violation) => {
      if (violation.station_id === user.station_id) {
        if (violation.status === 'CLOSED') {
          setViolations(prev => prev.filter(v => v._id !== violation._id));
        } else {
          setViolations(prev => prev.map(v => v._id === violation._id ? violation : v));
        }
      }
    });

    socket.on('LIVE_FRAME', ({ station_id, image }) => {
      if (station_id === user.station_id) {
        setLiveFrame(image);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchViolations = async () => {
    try {
      const res = await api.get('/violations');
      const mine = res.data.filter(v => v.station_id === user.station_id && ['DETECTED', 'PENDING_REVIEW'].includes(v.status));
      setViolations(mine);
    } catch (error) {
      console.error('Failed to fetch violations', error);
    }
  };

  const handleFileChange = (e, id) => {
    setFileInputs(prev => ({ ...prev, [id]: e.target.files[0] }));
  };

  const handleSubmitResolution = async (e, id) => {
    e.preventDefault();
    if (!fileInputs[id]) return;
    const formData = new FormData();
    formData.append('image', fileInputs[id]);
    try {
      await api.put(`/violations/${id}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFileInputs(prev => ({ ...prev, [id]: null }));
    } catch (error) {
      console.error('Failed to resolve', error);
    }
  };

  const hasEmergency = violations.some(v => v.status === 'DETECTED');
  const fallbackImage = 'https://placehold.co/400x300/1e293b/ef4444?text=Not+Available';

  return (
    <div className={`worker-layout ${hasEmergency ? 'emergency-alert' : ''}`}>
      <header className="worker-topbar">
        <div className="worker-brand">
          <AlertTriangle color="#eab308" size={32} />
          <div>
            <h1>VisionGuard</h1>
            <p>Station ID: {user.station_id} | {user.location || 'Unknown'}</p>
          </div>
        </div>
        <nav className="worker-nav">
          <button 
            className={`nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            Live Monitor
          </button>
          <button 
            className={`nav-tab ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts ({violations.length})
          </button>
        </nav>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} /> Logout
        </button>
      </header>

      <main className="worker-main">
        {activeTab === 'feed' && (
          <section className="worker-section full-height">
            <div className="section-header">
              <h2>Station Camera Feed</h2>
              <div className="live-badge">REAL-TIME</div>
            </div>
            
            <div className="worker-live-container">
              {liveFrame ? (
                <img 
                  src={`data:image/jpeg;base64,${liveFrame}`} 
                  alt="Live Camera" 
                  className="worker-live-img"
                />
              ) : (
                <div className="worker-live-placeholder">
                  <div className="pulse-circle"></div>
                  <AlertTriangle size={48} color="#334155" />
                  <p>Searching for camera stream...</p>
                </div>
              )}
              <div className="live-tag">LIVE</div>
            </div>
          </section>
        )}

        {activeTab === 'alerts' && (
          <section className="worker-section">
            <div className="section-header">
              <h2>Safety Violations</h2>
              <p className="worker-subtitle">Required actions for {user.station_id}</p>
            </div>

            <div className="alert-grid">
              {violations.map(v => (
                <div key={v._id} className="alert-card standout">
                  <div className="alert-image-wrapper">
                    <img 
                      src={v.detection_image_url} 
                      alt="Violation" 
                      onError={(e) => { e.target.src = fallbackImage; }}
                    />
                    <span className={`status-badge ${v.status.toLowerCase()}`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="alert-content">
                    <div className="alert-meta">
                      <strong>Detection Time:</strong> {new Date(v.detected_at).toLocaleString()}
                    </div>
                    
                    {v.status === 'DETECTED' ? (
                      <form className="resolve-form" onSubmit={(e) => handleSubmitResolution(e, v._id)}>
                        <label className="file-upload-label premium">
                          <Upload size={16} /> 
                          {fileInputs[v._id] ? fileInputs[v._id].name : "Select Resolution Proof"}
                          <input 
                            type="file" 
                            accept="image/jpeg, image/png, image/jpg"
                            onChange={(e) => handleFileChange(e, v._id)} 
                            style={{display: 'none'}}
                          />
                        </label>
                        <button type="submit" className="submit-btn gold-btn" disabled={!fileInputs[v._id]}>
                          Upload & Notify Admin
                        </button>
                      </form>
                    ) : (
                      <div className="pending-msg standout">
                        <CheckCircle color="#fbbf24" size={24} />
                        <p>Under Admin Review</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {violations.length === 0 && (
                <div className="no-alerts-premium">
                  <div className="success-icon-bg">
                    <CheckCircle color="#10b981" size={64} />
                  </div>
                  <h3>Station Secure</h3>
                  <p>No active anomalies detected on your shift.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default WorkerDashboard;
