import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);
    if (res.success) {
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-container">
      <div style={{
        position: 'fixed', top: '30%', right: '15%', width: '350px', height: '350px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '15%', left: '10%', width: '280px', height: '280px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1, animation: 'fadeIn 0.5s ease-out' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            marginBottom: '1rem', boxShadow: '0 8px 32px var(--primary-glow)'
          }}>
            <ShieldAlert size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Create account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Join VulnTrack to secure your infrastructure</p>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)', padding: '2rem',
          backdropFilter: 'blur(24px)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
        }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5',
              background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem'
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6ee7b7',
              background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem'
            }}>
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="input-field" placeholder="John Doe" value={name}
                  onChange={(e) => setName(e.target.value)} required style={{ paddingLeft: '2.75rem', marginBottom: 0 }} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" className="input-field" placeholder="analyst@company.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required style={{ paddingLeft: '2.75rem', marginBottom: 0 }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" className="input-field" placeholder="Min. 8 characters" value={password}
                  onChange={(e) => setPassword(e.target.value)} required style={{ paddingLeft: '2.75rem', marginBottom: 0 }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
