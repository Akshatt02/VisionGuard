import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  const DashboardRouter = () => {
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'ADMIN') return <AdminDashboard />;
    return <WorkerDashboard />;
  };

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<DashboardRouter />} />
    </Routes>
  );
}

export default App;
