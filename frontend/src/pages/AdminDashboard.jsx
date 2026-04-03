import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, Eye, CheckCircle, Video, Plus, ShieldCheck } from 'lucide-react';
import { io } from 'socket.io-client';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [violations, setViolations] = useState([]);
  const [stations, setStations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [liveFrames, setLiveFrames] = useState({});

  // Station Form
  const [stationId, setStationId] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [activeTab, setActiveTab] = useState('feeds');

  useEffect(() => {
    fetchViolations();
    fetchStations();

    const socketURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketURL);

    socket.on('NEW_VIOLATION', (newViolation) => {
      setViolations(prev => [newViolation, ...prev]);
    });

    socket.on('UPDATE_VIOLATION', (updatedViolation) => {
      setViolations(prev => prev.map(v => v._id === updatedViolation._id ? updatedViolation : v));
    });

    socket.on('LIVE_FRAME', ({ station_id, image }) => {
      setLiveFrames(prev => ({ ...prev, [station_id]: image }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchViolations = async () => {
    try {
      const res = await api.get('/violations');
      setViolations(res.data);
    } catch (error) {
      console.error('Failed to fetch violations', error);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      setStations(res.data);
    } catch (error) {
      console.error('Failed to fetch stations', error);
    }
  };

  const handleVerifyClick = (violation) => {
    setSelectedViolation(violation);
    setShowModal(true);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/violations/${selectedViolation._id}/verify`, { admin_notes: adminNotes });
      setShowModal(false);
      setSelectedViolation(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Verification failed', error);
    }
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stations', { station_id: stationId, password, location });
      alert('Station added successfully');
      setStationId('');
      setPassword('');
      setLocation('');
      fetchStations();
    } catch (error) {
      console.error('Failed to add station', error);
      alert('Error adding station');
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'feeds': return 'Live Monitoring';
      case 'violations': return 'Safety Audits';
      case 'stations': return 'Station Management';
      default: return 'Admin Dashboard';
    }
  };

  const activeViolations = violations.filter(v => ['DETECTED', 'PENDING_REVIEW'].includes(v.status));

  const fallbackImage = 'https://placehold.co/400x300/1e293b/ef4444?text=Not+Available';

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <ShieldCheck color="#ef4444" size={32} />
          <h2>VisionGuard</h2>
        </div>
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'feeds' ? 'active' : ''}`}
            onClick={() => setActiveTab('feeds')}
          >
            <Video size={20} /> Live Monitoring
          </button>
          <button 
            className={`nav-item ${activeTab === 'violations' ? 'active' : ''}`}
            onClick={() => setActiveTab('violations')}
          >
            <Eye size={20} /> Safety Audits
          </button>
          <button 
            className={`nav-item ${activeTab === 'stations' ? 'active' : ''}`}
            onClick={() => setActiveTab('stations')}
          >
            <Plus size={20} /> Station Manager
          </button>
        </nav>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div className="title-area">
            <h1>{getTitle()}</h1>
            <p className="subtitle">Real-time Safety Oversight System</p>
          </div>
          <div className="badge">ADMIN SECURE</div>
        </header>

        {activeTab === 'feeds' && (
          <section className="section standout">
            <div className="section-header">
              <h2>Active Camera Streams</h2>
              <span className="count-pill">{stations.length} Units Added</span>
            </div>
            <div className="camera-grid">
              {stations.map(station => (
                <div key={station._id} className="camera-card">
                  <div className="camera-vid-placeholder">
                    {liveFrames[station.station_id] ? (
                      <img 
                        src={`data:image/jpeg;base64,${liveFrames[station.station_id]}`} 
                        alt="Live Feed"
                      />
                    ) : (
                      <div className="searching-stream">
                        <Video size={48} color="#1e293b" />
                        <span>Searching...</span>
                      </div>
                    )}
                    <span className="status-dot active"></span>
                  </div>
                  <div className="camera-info">
                    <strong>{station.location}</strong>
                    <span>{station.station_id}</span>
                  </div>
                </div>
              ))}
              {stations.length === 0 && <p className="empty-msg">No stations configured.</p>}
            </div>
          </section>
        )}

        {activeTab === 'violations' && (
          <section className="section">
            <h2>Recent Violations (Action Required)</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Station</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeViolations.map(v => (
                    <tr key={v._id}>
                      <td>{v.station_id}</td>
                      <td>{new Date(v.detected_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${v.status.toLowerCase()}`}>
                          {v.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {v.status === 'PENDING_REVIEW' && (
                          <button className="action-btn verify-btn" onClick={() => handleVerifyClick(v)}>
                            <CheckCircle size={16} /> Verify
                          </button>
                        )}
                        {v.status === 'DETECTED' && (
                          <span className="waiting-text">Awaiting Worker Fix</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {activeViolations.length === 0 && (
                    <tr><td colSpan="4">No active violations.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'stations' && (
          <section className="section">
            <h2>Add New Station</h2>
            <form onSubmit={handleAddStation} className="station-form">
              <input 
                type="text" 
                placeholder="Station ID" 
                value={stationId} 
                onChange={e => setStationId(e.target.value)} 
                required 
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Location" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                required 
              />
              <button type="submit" className="add-btn">Create Station</button>
            </form>
          </section>
        )}
      </main>

      {/* Verification Modal */}
      {showModal && selectedViolation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Verify Resolution</h2>
            <p>Station: {selectedViolation.station_id}</p>
            <div className="image-comparison">
              <div className="image-box">
                <h4>Before (Detection)</h4>
                {selectedViolation.detection_image_url ? (
                  <img 
                    src={selectedViolation.detection_image_url} 
                    alt="Detection" 
                    onError={(e) => { e.target.src = fallbackImage; }}
                  />
                ) : (
                  <div>No image</div>
                )}
              </div>
              <div className="image-box">
                <h4>After (Resolution)</h4>
                {selectedViolation.resolution_image_url ? (
                  <img 
                    src={selectedViolation.resolution_image_url} 
                    alt="Resolution" 
                    onError={(e) => { e.target.src = fallbackImage; }}
                  />
                ) : (
                  <div>No image</div>
                )}
              </div>
            </div>
            <form onSubmit={handleVerifySubmit}>
              <textarea 
                placeholder="Admin Notes (Optional)" 
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows="3"
              />
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="confirm-btn">Approve & Close Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
