import React, { useState } from 'react';
import api from '../api/client';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');

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
          <label htmlFor="resume-file" style={{ cursor: 'pointer' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1.5rem' }}>
              <Upload size={32} color="var(--primary)" />
            </div>
            <h3>{file ? file.name : 'Select or Drag & Drop'}</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>PDF or DOCX (max 5MB)</p>
          </label>

          {file && !parsedData && (
            <button 
              className="btn-primary" 
              style={{ marginTop: '2rem', width: '100%' }}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="animate-spin" /> : 'Process Resume'}
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
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SKILLS</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {parsedData.skills.map(s => (
                  <span key={s} style={{ background: 'var(--card-bg)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', border: '1px solid var(--border)' }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>EXPERIENCE</h3>
              {parsedData.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 'bold' }}>{exp.title}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{exp.company} • {exp.duration}</div>
                </div>
              ))}
            </div>

            <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Start Interview Simulation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
