import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { AlertTriangle, ShieldCheck, Activity, TrendingDown, ArrowUpRight } from 'lucide-react';

const SEV_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981' };
const STATUS_COLORS = { Open: '#ef4444', 'In Progress': '#6366f1', Resolved: '#10b981' };

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card" style={{
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
    borderLeft: `3px solid ${color}`,
    background: 'rgba(15,23,42,0.6)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ padding: '0.4rem', borderRadius: '8px', background: `${color}22` }}>
        <Icon size={16} color={color} />
      </div>
    </div>
    <span style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{value}</span>
    {sub && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</span>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,23,42,0.95)', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.875rem'
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ fontWeight: 600, color: payload[0].color }}>{payload[0].value} vulnerabilities</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse-glow 2s infinite' }}>⚡</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard data...</p>
      </div>
    </div>
  );

  const critical = stats?.severity.find(s => s.name === 'Critical')?.value || 0;
  const high = stats?.severity.find(s => s.name === 'High')?.value || 0;
  const medium = stats?.severity.find(s => s.name === 'Medium')?.value || 0;
  const low = stats?.severity.find(s => s.name === 'Low')?.value || 0;

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Activity size={22} color="var(--primary)" />
          <h1 style={{ fontSize: '1.75rem' }}>Dashboard</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Real-time security posture overview
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard label="Critical" value={critical} icon={AlertTriangle} color="#ef4444" sub="Immediate action required" />
        <StatCard label="High" value={high} icon={ArrowUpRight} color="#f97316" sub="Remediate within 7 days" />
        <StatCard label="Medium" value={medium} icon={TrendingDown} color="#f59e0b" sub="Scheduled remediation" />
        <StatCard label="Low" value={low} icon={ShieldCheck} color="#10b981" sub="Monitor regularly" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Severity Pie */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Severity Distribution</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.severity} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={100} innerRadius={55} paddingAngle={4}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false}>
                  {stats?.severity.map((entry, i) => (
                    <Cell key={i} fill={SEV_COLORS[entry.name]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {stats?.severity.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: SEV_COLORS[s.name] }} />
                <span style={{ color: 'var(--text-muted)' }}>{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Resolution Status</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.statusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats?.statusDistribution.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || 'var(--primary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {stats?.statusDistribution.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: STATUS_COLORS[s.name] }} />
                <span style={{ color: 'var(--text-muted)' }}>{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Assets at Risk */}
      {stats?.topAssets && stats.topAssets.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Top At-Risk Assets</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Asset / Hostname</th>
                <th style={{ textAlign: 'center' }}>Critical Findings</th>
                <th style={{ textAlign: 'center' }}>High Findings</th>
                <th style={{ textAlign: 'center' }}>Total Open</th>
                <th style={{ textAlign: 'right' }}>Cumulative Risk</th>
              </tr>
            </thead>
            <tbody>
              {stats.topAssets.map((asset) => (
                <tr key={asset.ip}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{asset.ip}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{asset.hostname}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {asset.critical > 0 ? <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{asset.critical}</span> : <span style={{ color: 'var(--text-muted)' }}>0</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {asset.high > 0 ? <span style={{ color: '#f97316', fontWeight: 'bold' }}>{asset.high}</span> : <span style={{ color: 'var(--text-muted)' }}>0</span>}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{asset.total}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>{asset.score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
