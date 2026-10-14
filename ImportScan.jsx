import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UploadCloud, FileCode2, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

const ImportScan = () => {
  const { token } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [scannerName, setScannerName] = useState('Nessus');
  const [fileType, setFileType] = useState('xml');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Uploading and processing scan...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scannerName', scannerName);
    formData.append('fileType', fileType);
    try {
      const res = await axios.post('http://localhost:5000/api/scans/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || 'Scan imported successfully!', { id: toastId });
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload scan', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Cpu size={22} color="var(--primary)" />
          <h1 style={{ fontSize: '1.75rem' }}>Import Scan</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Upload vulnerability scan exports from Nessus, Nmap, Qualys, or OpenVAS for automated normalization.
        </p>
      </div>

      <div style={{ maxWidth: '640px' }}>
        {/* Status Messages removed (using toast now) */}

        <div className="card">
          <form onSubmit={handleUpload}>
            {/* Scanner & Format */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Scanner Tool
                </label>
                <select className="input-field" style={{ marginBottom: 0 }} value={scannerName} onChange={e => setScannerName(e.target.value)}>
                  <option value="Nessus">Nessus</option>
                  <option value="Nmap">Nmap</option>
                  <option value="Qualys">Qualys</option>
                  <option value="OpenVAS">OpenVAS</option>
                  <option value="Custom">Custom / Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  File Format
                </label>
                <select className="input-field" style={{ marginBottom: 0 }} value={fileType} onChange={e => setFileType(e.target.value)}>
                  <option value="xml">XML (.nessus, .xml)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)', padding: '2.5rem',
                textAlign: 'center', cursor: 'pointer', marginBottom: '1.5rem',
                background: isDragging ? 'var(--primary-glow)' : 'rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease',
                boxShadow: isDragging ? '0 0 0 3px var(--primary-glow)' : 'none'
              }}
            >
              <input ref={fileInputRef} type="file" accept=".xml,.nessus,.csv"
                onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />

              {file ? (
                <>
                  <FileCode2 size={40} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{file.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </>
              ) : (
                <>
                  <UploadCloud size={40} color={isDragging ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '0.75rem', transition: 'color 0.2s' }} />
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {isDragging ? 'Drop your file here' : 'Drag & drop your scan file'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or click to browse — .xml, .nessus, .csv supported</p>
                </>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <><span>Processing scan...</span></>
              ) : (
                <><UploadCloud size={18} /><span>Upload & Process Scan</span></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImportScan;
