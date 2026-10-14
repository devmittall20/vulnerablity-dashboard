import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shield, FileText, UploadCloud, LogOut, ShieldAlert } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <ShieldAlert size={22} style={{ color: '#6366f1', flexShrink: 0 }} />
        <span>VulnTrack</span>
      </div>

      {/* User Info */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem', flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '1rem 0', flex: 1 }}>
        <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Main Menu
        </div>

        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link${isActive ? ' active-link' : ''}`}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/vulnerabilities" className={({ isActive }) => `sidebar-link${isActive ? ' active-link' : ''}`}>
          <Shield size={18} /> Vulnerabilities
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => `sidebar-link${isActive ? ' active-link' : ''}`}>
          <FileText size={18} /> Reports
        </NavLink>

        {(user?.role === 'ADMIN' || user?.role === 'ANALYST') && (
          <>
            <div style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>
              Admin
            </div>
            <NavLink to="/import" className={({ isActive }) => `sidebar-link${isActive ? ' active-link' : ''}`}>
              <UploadCloud size={18} /> Import Scan
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '0.75rem 1rem',
            background: 'transparent', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
            fontFamily: 'var(--font-family)', fontSize: '0.9rem', fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--danger-bg)';
            e.currentTarget.style.borderColor = 'var(--danger)';
            e.currentTarget.style.color = '#fca5a5';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
