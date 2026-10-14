import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { AlertTriangle, Tag, ChevronDown, ChevronUp, Shield, Calendar, User2, RefreshCw, Search, Filter, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const SEV_CONFIG = {
  Critical: { bg: 'var(--danger-bg)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)', glow: '0 0 8px rgba(239,68,68,0.3)' },
  High:     { bg: 'rgba(249,115,22,0.15)', color: '#fdba74', border: 'rgba(249,115,22,0.3)', glow: '' },
  Medium:   { bg: 'var(--warning-bg)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)', glow: '' },
  Low:      { bg: 'var(--success-bg)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)', glow: '' },
};

const STATUS_CONFIG = {
  Open:         { color: '#fca5a5', bg: 'var(--danger-bg)' },
  Assigned:     { color: '#93c5fd', bg: 'rgba(59,130,246,0.15)' },
  'In Progress':{ color: '#c4b5fd', bg: 'rgba(139,92,246,0.15)' },
  Resolved:     { color: '#6ee7b7', bg: 'var(--success-bg)' },
  Verified:     { color: '#6ee7b7', bg: 'var(--success-bg)' },
};

const SevBadge = ({ severity }) => {
  const cfg = SEV_CONFIG[severity] || SEV_CONFIG.Low;
  return (
    <span className="badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border, boxShadow: cfg.glow }}>
      {severity}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Open;
  return (
    <span className="badge" style={{ background: cfg.bg, color: cfg.color, borderColor: 'transparent' }}>
      {status}
    </span>
  );
};

const Vulnerabilities = () => {
  const { token } = useContext(AuthContext);
  const [vulns, setVulns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [sevFilter, setSevFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchVulns = async () => {
    try {
      const [vulnRes, userRes] = await Promise.all([
        axios.get('http://localhost:5000/api/vulnerabilities', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setVulns(vulnRes.data);
      setUsers(userRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVulns(); }, [token]);

  const handleUpdate = async (id, field, value) => {
    setUpdating(id);
    try {
      await axios.put(`http://localhost:5000/api/vulnerabilities/${id}`, { [field]: value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVulns(vulns.map(v => v.id === id ? { ...v, [field]: value } : v));
      toast.success(`Updated successfully`);
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || ['Resolved', 'Verified'].includes(status)) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredVulns = useMemo(() => {
    return vulns.filter(v => {
      const matchesSearch = searchTerm === '' || 
        v.vulnerability.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.vulnerability.cve_id && v.vulnerability.cve_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        v.asset.ip_address.includes(searchTerm);
      
      const matchesSev = sevFilter === 'All' || v.vulnerability.severity === sevFilter;
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      
      return matchesSearch && matchesSev && matchesStatus;
    });
  }, [vulns, searchTerm, sevFilter, statusFilter]);

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Shield size={22} color="var(--primary)" />
            <h1 style={{ fontSize: '1.75rem' }}>Vulnerability Management</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Prioritized list sorted by risk score. Click a row to manage lifecycle.
          </p>
        </div>
        <button onClick={() => { fetchVulns(); toast('Refreshing data...', { icon: '🔄' }); }} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer',
          fontFamily: 'var(--font-family)', fontSize: '0.85rem', transition: 'all 0.2s ease'
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by CVE, Title, or IP..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select className="input-field" value={sevFilter} onChange={e => setSevFilter(e.target.value)} style={{ width: '140px', marginBottom: 0 }}>
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '140px', marginBottom: 0 }}>
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Risk Score</th>
              <th>Vulnerability</th>
              <th>Asset</th>
              <th>Severity</th>
              <th>Tags</th>
              <th>Status / SLA</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading vulnerabilities...</td></tr>
            ) : filteredVulns.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No vulnerabilities found matching your criteria.
              </td></tr>
            ) : filteredVulns.map((av) => {
              const overdue = isOverdue(av.due_date, av.status);
              
              return (
              <React.Fragment key={av.id}>
                <tr
                  onClick={() => setExpandedId(expandedId === av.id ? null : av.id)}
                  style={{ cursor: 'pointer', backgroundColor: expandedId === av.id ? 'rgba(99,102,241,0.04)' : 'transparent' }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: SEV_CONFIG[av.vulnerability.severity]?.color || '#fff' }}>
                      <AlertTriangle size={14} />
                      <span>{av.risk_score}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{av.vulnerability.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{av.vulnerability.cve_id || 'No CVE assigned'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{av.asset.ip_address}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{av.asset.hostname} · {av.asset.exposure}</div>
                  </td>
                  <td><SevBadge severity={av.vulnerability.severity} /></td>
                  <td>
                    {av.vulnerability.tags
                      ? <span className="badge badge-tag"><Tag size={10} style={{ marginRight: '4px' }} />{av.vulnerability.tags}</span>
                      : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StatusBadge status={av.status} />
                      {overdue && (
                        <span title="SLA Breached - Overdue" style={{ color: '#ef4444', animation: 'pulse-glow 2s infinite', borderRadius: '50%' }}>
                          <Clock size={14} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    {expandedId === av.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </td>
                </tr>

                {expandedId === av.id && (
                  <tr>
                    <td colSpan="7" style={{ padding: 0, backgroundColor: 'rgba(9,9,11,0.5)', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '0', animation: 'fadeIn 0.2s ease-out' }}>
                        
                        {/* Details Panel */}
                        <div style={{ padding: '1.5rem 2rem', borderRight: '1px solid var(--border-color)' }}>
                          <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h4>
                          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#cbd5e1', marginBottom: '1.5rem' }}>{av.vulnerability.description}</p>

                          <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remediation Steps</h4>
                          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#cbd5e1' }}>{av.vulnerability.remediation_steps || 'No specific remediation steps documented for this finding.'}</p>
                        </div>

                        {/* Actions Panel */}
                        <div style={{ padding: '1.5rem' }}>
                          <h4 style={{ marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>Lifecycle Management</h4>
                          
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                              <Shield size={12} /> Status
                            </label>
                            <select className="input-field" style={{ marginBottom: 0, padding: '0.6rem 0.75rem' }}
                              value={av.status} disabled={updating === av.id}
                              onChange={e => handleUpdate(av.id, 'status', e.target.value)}>
                              {['Open','Assigned','In Progress','Resolved','Verified'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>

                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                              <User2 size={12} /> Assignee
                            </label>
                            <select className="input-field" style={{ marginBottom: 0, padding: '0.6rem 0.75rem' }}
                              value={av.assigned_to || ''} disabled={updating === av.id}
                              onChange={e => handleUpdate(av.id, 'assigned_to', e.target.value)}>
                              <option value="">Unassigned</option>
                              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                              <Calendar size={12} /> Due Date 
                              {overdue && <span style={{ color: '#ef4444', textTransform: 'none', marginLeft: 'auto' }}>Overdue</span>}
                            </label>
                            <input type="date" className="input-field" style={{ marginBottom: 0, padding: '0.6rem 0.75rem', borderColor: overdue ? 'rgba(239,68,68,0.5)' : 'var(--border-color)' }}
                              value={av.due_date ? av.due_date.split('T')[0] : ''} disabled={updating === av.id}
                              onChange={e => handleUpdate(av.id, 'due_date', e.target.value)} />
                          </div>

                          {updating === av.id && (
                            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                              Saving changes...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Vulnerabilities;
