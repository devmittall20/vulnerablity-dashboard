import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ImportScan from './pages/ImportScan';
import Vulnerabilities from './pages/Vulnerabilities';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return token ? children : <Navigate to="/login" />;
};

const DashboardLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }
      }} />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes with Sidebar */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vulnerabilities" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Vulnerabilities />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/import" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ImportScan />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
