import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AttendanceClock from './pages/AttendanceClock';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<AttendanceClock />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
