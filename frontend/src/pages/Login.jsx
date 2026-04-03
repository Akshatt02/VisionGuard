import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [stationId, setStationId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(stationId, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <ShieldAlert className="login-logo" size={48} />
          <h1>VisionGuard</h1>
          <p>Safety Monitoring System</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Station ID / Username</label>
            <input 
              type="text" 
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              placeholder="e.g. STATION_01 or admin"
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="login-button">ACCESS SYSTEM</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
