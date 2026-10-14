import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FileText, DownloadCloud, FileSpreadsheet, BarChart2, Clock, Shield } from 'lucide-react';

const ReportCard = ({ icon: Icon, iconColor, title, description, btnText, btnColor, onClick }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
    <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: `${iconColor}22`, border: `1px solid ${iconColor}44` }}>
      <Icon size={28} color={iconColor} />
    </div>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>{description}</p>
    </div>
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)',
      background: `linear-gradient(135deg, ${btnColor}cc 0%, ${btnColor} 100%)`,
      color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-family)',
      fontWeight: 600, fontSize: '0.875rem', width: '100%', justifyContent: 'center',
      boxShadow: `0 4px 14px 0 ${btnColor}44`, transition: 'all 0.2s ease'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
    >
      <DownloadCloud size={16} /> {btnText}
    </button>
  </div>
);

const Reports = () => {
  const { token } = useContext(AuthContext);

  const downloadReport = (type, level) => {
    const url = `http://localhost:5000/api/reports/download?type=${type}&level=${level}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error('Failed'); return res.blob(); })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = type === 'pdf' ? 'Executive_Summary.pdf' : 'Technical_Detail.csv';
        document.body.appendChild(a); a.click(); a.remove();
      })
      .catch(() => alert('Failed to download report. Make sure the backend is running.'));
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <BarChart2 size={22} color="var(--primary)" />
          <h1 style={{ fontSize: '1.75rem' }}>Reporting & Analytics</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Generate exportable reports for stakeholders and security teams.
        </p>
      </div>

      {/* Report Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <ReportCard
          icon={FileText}
          iconColor="#6366f1"
          title="Executive Summary"
          description="A high-level PDF snapshot of the organization's security posture — Critical/High vulnerability counts, top at-risk assets, and overall risk distribution for leadership teams."
          btnText="Download PDF Report"
          btnColor="#6366f1"
          onClick={() => downloadReport('pdf', 'executive')}
        />

        <ReportCard
          icon={FileSpreadsheet}
          iconColor="#10b981"
          title="Technical Details"
          description="A full CSV/Excel export of every vulnerability in the system — including CVSS scores, CVE IDs, remediation steps, assignees, due dates, and compliance tags."
          btnText="Download CSV Report"
          btnColor="#10b981"
          onClick={() => downloadReport('csv', 'technical')}
        />
      </div>

      {/* Info Banner */}
      <div className="card" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', flexShrink: 0 }}>
          <Shield size={18} color="var(--primary)" />
        </div>
        <div>
          <h4 style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>About These Reports</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.65 }}>
            Reports are generated on-demand from live database data. The Executive Summary is optimized for non-technical stakeholders, while the Technical Details export is designed for security engineers and compliance auditors. All data is sourced directly from imported scan results and lifecycle updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
