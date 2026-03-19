import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Upload, FileText, CheckCircle, X, FileUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from 'react-hot-toast';

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
        toast.error('File size too large (max 5MB)');
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
    setProgress(10);
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
      toast.success('Resume processed successfully!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setTimeout(() => setUploading(false), 500);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-center sm:text-left">Upload Your Resume</h1>
        <p className="text-muted-foreground text-lg text-center sm:text-left">
          Let our AI analyze your experience to tailor your interview.
        </p>
      </div>
      
      <div className={`grid gap-8 ${parsedData ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto w-full'}`}>
        <Card className={`border-2 border-dashed border-border/60 transition-all ${!file ? 'hover:border-primary/50 hover:bg-muted/30' : ''}`}>
          <CardContent className="p-8 sm:p-12 text-center">
            <input 
              type="file" 
              id="resume-file" 
              hidden 
              onChange={handleFileChange} 
              accept=".pdf,.docx"
              disabled={uploading || !!parsedData}
            />
            <label htmlFor="resume-file" className={`block ${uploading || parsedData ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-8 ring-primary/5">
                <Upload size={32} className="text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight">
                  {file ? file.name : 'Select or Drag & Drop'}
                </h3>
                <p className="text-sm text-muted-foreground">PDF or DOCX (max 5MB)</p>
              </div>
            </label>

            {file && !uploading && !parsedData && (
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={handleCancel} className="flex-1 gap-2">
                  <X size={18} /> Remove
                </Button>
                <Button onClick={handleUpload} className="flex-[2] gap-2">
                  <FileUp size={18} /> Process Resume
                </Button>
              </div>
            )}

            {uploading && (
              <div className="mt-8 space-y-3">
                <Progress value={progress} className="h-2" />
                <p className="text-sm font-medium text-muted-foreground">{progress}% Uploaded</p>
              </div>
            )}

            {error && <p className="text-sm font-medium text-destructive mt-4">{error}</p>}
          </CardContent>
        </Card>

        {parsedData && (
          <Card className="border-border/50 shadow-md">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-green-500/10 p-2 rounded-full text-green-600">
                <CheckCircle size={28} />
              </div>
              <div>
                <CardTitle className="text-2xl">Parsed Successfully</CardTitle>
                <CardDescription>We've analyzed your profile</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="p-5 rounded-xl bg-primary/5 border border-primary/10 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Identified Role</p>
                  <p className="text-xl font-bold text-primary">{parsedData.developerTitle}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Primary Stack</p>
                  <p className="text-base font-medium">{parsedData.primaryStack}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Detected Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map(s => (
                    <Badge key={s} variant="secondary" className="font-medium">{s}</Badge>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Key Projects</h3>
                <div className="grid gap-4">
                  {parsedData.projects.map((proj, i) => (
                    <div key={i} className="space-y-2">
                      <p className="font-bold text-foreground">{proj.name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.languages.map(lang => (
                          <Badge key={lang} variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20 bg-primary/5 text-primary">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                className="w-full text-lg h-12 gap-2 shadow-sm"
                disabled={starting}
                onClick={async () => {
                  setStarting(true);
                  try {
                    const res = await api.post('/sessions/start', { useResume: true, totalQuestions: 5 });
                    navigate(`/interview/${res.data.data._id}`);
                  } catch (err) {
                    setError('Failed to start resume-based interview');
                    toast.error('Failed to start interview');
                    setStarting(false);
                  }
                }}
              >
                {starting ? <LoadingSpinner size={20} message={null} /> : 'Start Interview Simulation'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
