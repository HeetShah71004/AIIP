import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size too large (max 5MB)');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleCancel = (e) => {
    if (e) e.stopPropagation();
    setFile(null);
    setProgress(0);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(20);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      setParsedData(res.data.data.parsedData);
      setSessionId(res.data.data._id);
      setProgress(100);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setTimeout(() => setUploading(false), 500);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Upload Your Resume</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: parsedData ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--border)' }}>
          <input 
            type="file" 
            id="resume-file" 
            hidden 
            onChange={handleFileChange} 
            accept=".pdf,.docx"
          />
          <label htmlFor="resume-file" style={{ cursor: 'pointer', display: 'block' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1.5rem' }}>
              <Upload size={32} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', position: 'relative' }}>
              <h3 style={{ margin: 0 }}>{file ? file.name : 'Select or Drag & Drop'}</h3>
              {file && !uploading && !parsedData && (
                <button 
                  onClick={handleCancel}
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: 'none', 
                    borderRadius: '50%', 
                    padding: '4px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  title="Remove file"
                >
                  <X size={16} color="var(--danger)" />
                </button>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>PDF or DOCX (max 5MB)</p>
          </label>

          {file && !parsedData && (
            <button 
              className="btn-primary" 
              style={{ marginTop: '2rem', width: '100%' }}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? <LoadingSpinner size={20} message={null} /> : 'Process Resume'}
            </button>
          )}

          {uploading && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ height: '8px', background: 'var(--card-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }}></div>
              </div>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{progress}% Uploaded</p>
            </div>
          )}

          {error && <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>{error}</p>}
        </div>

        {parsedData && (
          <div className="glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--success)' }}>
              <CheckCircle size={24} />
              <h2 style={{ color: 'var(--text)' }}>Parsed Successfully</h2>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>IDENTIFIED ROLE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1rem' }}>{parsedData.developerTitle}</div>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PRIMARY STACK</div>
              <div style={{ fontSize: '1rem', fontWeight: '600' }}>{parsedData.primaryStack}</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>ALL DETECTED SKILLS</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {parsedData.skills.map(s => (
                  <span key={s} style={{ background: 'var(--card-bg)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', border: '1px solid var(--border)' }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>KEY PROJECTS</h3>
              {parsedData.projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: i === 0 && parsedData.projects.length > 1 ? '1px dotted var(--border)' : 'none' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>{proj.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {proj.languages.map(lang => (
                      <span key={lang} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{lang}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={starting}
              onClick={async () => {
                setStarting(true);
                try {
                  const res = await api.post('/sessions/start', { useResume: true, totalQuestions: 5 });
                  navigate(`/interview/${res.data.data._id}`);
                } catch (err) {
                  setError('Failed to start resume-based interview');
                  setStarting(false);
                }
              }}
            >
              {starting ? <LoadingSpinner size={20} message={null} /> : 'Start Interview Simulation'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
