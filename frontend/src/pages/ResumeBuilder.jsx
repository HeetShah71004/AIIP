import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/client';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Globe, 
  Linkedin, 
  Github, 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Save, 
  BarChart3,
  Briefcase,
  GraduationCap,
  Hammer,
  Layout,
  ArrowLeft,
  Upload,
  Code,
  Eye,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ATSScoreCard from '../components/ATSScoreCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import ClassicTemplate from '../components/resume-templates/ClassicTemplate';
import ModernTemplate from '../components/resume-templates/ModernTemplate';
import ProfessionalTemplate from '../components/resume-templates/ProfessionalTemplate';
import CreativeTemplate from '../components/resume-templates/CreativeTemplate';
import ElegantTemplate from '../components/resume-templates/ElegantTemplate';
import MidnightTemplate from '../components/resume-templates/MidnightTemplate';
import ThemeExplorerModal from '../components/ThemeExplorerModal';

const LOCAL_TEMPLATE_SLUGS = new Set(['classic', 'modern', 'professional', 'creative', 'elegant', 'midnight']);
const TEMPLATE_LABELS = {
  classic: 'Classic',
  modern: 'Modern',
  professional: 'Professional',
  creative: 'Creative',
  elegant: 'Elegant',
  midnight: 'Midnight'
};

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedIn: '',
      github: '',
      leetcode: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: []
  });

  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRewriting, setIsRewriting] = useState(null); // stores section index/type
  const [isImporting, setIsImporting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isThemeExplorerOpen, setIsThemeExplorerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const resumeRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectedTemplateLabel = TEMPLATE_LABELS[selectedTemplate] || 'Classic';

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const response = await axios.get('/resume');
      if (response.data.data) {
        setResumeData(response.data.data);
        if (response.data.data.atsScore) {
          setAnalysis(response.data.data.atsScore);
        }
        if (response.data.data.selectedTemplate) {
          const incomingTemplate = response.data.data.selectedTemplate;
          setSelectedTemplate(LOCAL_TEMPLATE_SLUGS.has(incomingTemplate) ? incomingTemplate : 'classic');
        }
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section === 'personalInfo') {
      setResumeData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [field]: value }
      }));
    } else {
      setResumeData(prev => ({ ...prev, [section]: value }));
    }
  };

  const handleArrayInputChange = (section, index, field, value) => {
    const updatedArray = [...resumeData[section]];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    setResumeData(prev => ({ ...prev, [section]: updatedArray }));
  };

  const addItem = (section, template) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], template]
    }));
  };

  const removeItem = (section, index) => {
    const updatedArray = [...resumeData[section]];
    updatedArray.splice(index, 1);
    setResumeData(prev => ({ ...prev, [section]: updatedArray }));
  };

  const handleRewrite = async (section, index = null) => {
    try {
      setIsRewriting(index !== null ? `${section}-${index}` : section);
      
      let textToRewrite = '';
      if (index !== null) {
        textToRewrite = resumeData[section][index].description || '';
      } else {
        textToRewrite = resumeData[section];
      }

      if (!textToRewrite.trim()) {
        toast.error('Please enter some text to rewrite');
        return;
      }

      const response = await axios.post('/resume/rewrite', {
        text: textToRewrite,
        sectionType: section
      });

      if (response.data.success) {
        const rewrittenText = response.data.data;
        if (index !== null) {
          handleArrayInputChange(section, index, 'description', rewrittenText);
        } else {
          handleInputChange(section, null, rewrittenText);
        }
        toast.success('AI Rewrite Successful!');
      }
    } catch (error) {
      toast.error('AI Rewrite failed');
    } finally {
      setIsRewriting(null);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axios.post('/resume', { ...resumeData, selectedTemplate });
      toast.success('Resume saved successfully!');
    } catch (error) {
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyTheme = async (theme) => {
    const nextTemplate = theme?.slug || 'classic';
    const resolvedTemplate = LOCAL_TEMPLATE_SLUGS.has(nextTemplate) ? nextTemplate : 'classic';
    setSelectedTemplate(resolvedTemplate);
    toast.success(`${theme?.name || resolvedTemplate} applied`);
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const response = await axios.post('/resume/ats-score', {
        resumeData,
        targetKeywords: ['React', 'Node.js', 'Full Stack', 'Cloud', 'System Design'] // Default keywords
      });
      if (response.data.success) {
        setAnalysis(response.data.data);
        toast.success('Analysis complete!');
      }
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setIsImporting(true);
      toast.loading('Extracting data with AI...', { id: 'import-toast' });
      
      const response = await axios.post('/resume/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const importedData = response.data.data;
        setResumeData(importedData);
        toast.success('Resume imported successfully!', { id: 'import-toast' });
        
        // Auto-trigger ATS analysis with the new data
        handleAnalyzeForImport(importedData);
      }
    } catch (error) {
      console.error('Import Error:', error);
      toast.error(error.response?.data?.error || 'Failed to import resume', { id: 'import-toast' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeForImport = async (data) => {
    try {
      setIsAnalyzing(true);
      toast.loading('Running initial ATS check...', { id: 'ats-toast' });
      const response = await axios.post('/resume/ats-score', {
        resumeData: data,
        targetKeywords: ['React', 'Node.js', 'Full Stack', 'Cloud', 'System Design']
      });
      if (response.data.success) {
        setAnalysis(response.data.data);
        toast.success('ATS Analysis complete!', { id: 'ats-toast' });
      }
    } catch (error) {
      toast.dismiss('ats-toast');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;

    try {
      toast.loading('Generating PDF...', { id: 'pdf-toast' });
      
      // Temporary style adjustments for PDF capture
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${resumeData.personalInfo.fullName || 'Resume'}.pdf`);
      toast.success('Resume downloaded!', { id: 'pdf-toast' });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-toast' });
    }
  };

  const renderSelectedTemplate = () => {
    if (selectedTemplate === 'classic') return <ClassicTemplate resumeData={resumeData} />;
    if (selectedTemplate === 'modern') return <ModernTemplate resumeData={resumeData} />;
    if (selectedTemplate === 'professional') return <ProfessionalTemplate resumeData={resumeData} />;
    if (selectedTemplate === 'creative') return <CreativeTemplate resumeData={resumeData} />;
    if (selectedTemplate === 'elegant') return <ElegantTemplate resumeData={resumeData} />;
    if (selectedTemplate === 'midnight') return <MidnightTemplate resumeData={resumeData} />;

    return <ClassicTemplate resumeData={resumeData} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-12 pb-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex w-fit items-center gap-2 text-sm text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-slate-900 dark:text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">AI Resume Builder</h1>
            </div>
            <div className="mb-2">
              <span className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
                Applied Theme: {selectedTemplateLabel}
              </span>
            </div>
            <p className="text-slate-500 dark:text-white/40 max-w-md">
              Create a professional, ATS-optimized resume with AI assistance. 
              Improve your impact with one click.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileChange} 
            />
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all font-medium disabled:opacity-50"
            >
              <Upload className={`w-4 h-4 ${isImporting ? 'animate-bounce' : ''}`} />
              {isImporting ? 'Importing...' : 'Import Resume'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all font-medium disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => setIsThemeExplorerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all font-semibold text-sm"
            >
              <Layout className="w-4 h-4" />
              Theme Explorer ({selectedTemplateLabel})
            </button>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all font-semibold"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-slate-900 dark:text-white hover:shadow-lg hover:shadow-teal-500/20 transition-all font-semibold"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Personal Information */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                  <User className="w-5 h-5 text-teal-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30 group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type="text"
                      value={resumeData.personalInfo.fullName}
                      onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30 group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30 group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type="text"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider ml-1">Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30 group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type="text"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider ml-1">LinkedIn Profile</label>
                  <div className="relative group">
                    <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30 group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type="text"
                      value={resumeData.personalInfo.linkedIn}
                      onChange={(e) => handleInputChange('personalInfo', 'linkedIn', e.target.value)}
                      placeholder="linkedin.com/in/johndoe"
                      className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider ml-1">GitHub / Portfolio</label>
                  <div className="relative group">
                    <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30 group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type="text"
                      value={resumeData.personalInfo.github}
                      onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                      placeholder="github.com/johndoe"
                      className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider ml-1">LeetCode Profile</label>
                  <div className="relative group">
                    <Code className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30 group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type="text"
                      value={resumeData.personalInfo.leetcode || ''}
                      onChange={(e) => handleInputChange('personalInfo', 'leetcode', e.target.value)}
                      placeholder="leetcode.com/johndoe"
                      className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Professional Summary */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                    <Layout className="w-5 h-5 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Professional Summary</h2>
                </div>
                <button
                  onClick={() => handleRewrite('summary')}
                  disabled={isRewriting === 'summary'}
                  className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 hover:bg-teal-500/20 transition-all text-sm font-medium disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isRewriting === 'summary' ? 'animate-spin' : ''}`} />
                  AI Rewrite
                </button>
              </div>
              
              <textarea
                value={resumeData.summary}
                onChange={(e) => handleInputChange('summary', null, e.target.value)}
                placeholder="Briefly describe your career goals and key achievements..."
                className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all min-h-[120px] resize-none"
              />
            </section>

            {/* Experience */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                    <Briefcase className="w-5 h-5 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Experience</h2>
                </div>
                <button
                  onClick={() => addItem('experience', { company: '', role: '', location: '', startDate: '', endDate: '', description: '' })}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Experience
                </button>
              </div>

              <div className="space-y-8">
                {resumeData.experience.map((exp, idx) => (
                  <div key={idx} className="relative p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl group">
                    <button 
                      onClick={() => removeItem('experience', idx)}
                      className="absolute top-4 right-4 text-slate-400 dark:text-white/20 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleArrayInputChange('experience', idx, 'company', e.target.value)}
                          placeholder="e.g. Google"
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Role</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleArrayInputChange('experience', idx, 'role', e.target.value)}
                          placeholder="e.g. Senior Frontend Engineer"
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => handleArrayInputChange('experience', idx, 'startDate', e.target.value)}
                          placeholder="Jan 2022"
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">End Date</label>
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => handleArrayInputChange('experience', idx, 'endDate', e.target.value)}
                          placeholder="Present"
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Description</label>
                        <button
                          onClick={() => handleRewrite('experience', idx)}
                          disabled={isRewriting === `experience-${idx}`}
                          className="flex items-center gap-1.5 px-2 py-1 text-teal-400 hover:text-teal-300 transition-colors text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                        >
                          <Sparkles className={`w-3 h-3 ${isRewriting === `experience-${idx}` ? 'animate-spin' : ''}`} />
                          Improve with AI
                        </button>
                      </div>
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleArrayInputChange('experience', idx, 'description', e.target.value)}
                        placeholder="Bullet points of your achievements..."
                        className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                ))}
                {resumeData.experience.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                    <p className="text-slate-400 dark:text-white/20 text-sm">No experience added yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Education */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                    <GraduationCap className="w-5 h-5 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Education</h2>
                </div>
                <button
                  onClick={() => addItem('education', { school: '', degree: '', startDate: '', endDate: '', description: '' })}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Education
                </button>
              </div>

              <div className="space-y-8">
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} className="relative p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl group">
                    <button 
                      onClick={() => removeItem('education', idx)}
                      className="absolute top-4 right-4 text-slate-400 dark:text-white/20 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">School / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleArrayInputChange('education', idx, 'school', e.target.value)}
                          placeholder="e.g. Stanford University"
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleArrayInputChange('education', idx, 'degree', e.target.value)}
                          placeholder="e.g. B.S. Computer Science"
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Start Date</label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => handleArrayInputChange('education', idx, 'startDate', e.target.value)}
                          placeholder="Aug 2018"
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">End Date</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => handleArrayInputChange('education', idx, 'endDate', e.target.value)}
                          placeholder="May 2022"
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Description (Optional)</label>
                      </div>
                      <textarea
                        value={edu.description}
                        onChange={(e) => handleArrayInputChange('education', idx, 'description', e.target.value)}
                        placeholder="Relevant coursework, GPA, honors..."
                        className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all min-h-[60px] resize-none"
                      />
                    </div>
                  </div>
                ))}
                {resumeData.education.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                    <p className="text-slate-400 dark:text-white/20 text-sm">No education added yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Projects */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                    <Code className="w-5 h-5 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Projects</h2>
                </div>
                <button
                  onClick={() => addItem('projects', { name: '', description: '', link: '', technologies: [] })}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Project
                </button>
              </div>

              <div className="space-y-8">
                {resumeData.projects.map((proj, idx) => (
                  <div key={idx} className="relative p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl group">
                    <button 
                      onClick={() => removeItem('projects', idx)}
                      className="absolute top-4 right-4 text-slate-400 dark:text-white/20 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => handleArrayInputChange('projects', idx, 'name', e.target.value)}
                          placeholder="e.g. AI Interview Prep App"
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Project Link</label>
                        <input
                          type="text"
                          value={proj.link}
                          onChange={(e) => handleArrayInputChange('projects', idx, 'link', e.target.value)}
                          placeholder="e.g. github.com/user/project"
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Technologies Used</label>
                        <input
                          type="text"
                          value={(proj.technologies || []).join(', ')}
                          onChange={(e) => {
                            const techArray = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                            handleArrayInputChange('projects', idx, 'technologies', techArray);
                          }}
                          placeholder="React, Node.js, MongoDB (comma separated)"
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Description</label>
                        <button
                          onClick={() => handleRewrite('projects', idx)}
                          disabled={isRewriting === `projects-${idx}`}
                          className="flex items-center gap-1.5 px-2 py-1 text-teal-400 hover:text-teal-300 transition-colors text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                        >
                          <Sparkles className={`w-3 h-3 ${isRewriting === `projects-${idx}` ? 'animate-spin' : ''}`} />
                          Improve with AI
                        </button>
                      </div>
                      <textarea
                        value={proj.description}
                        onChange={(e) => handleArrayInputChange('projects', idx, 'description', e.target.value)}
                        placeholder="Describe your project, features, and achievements..."
                        className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                ))}
                {resumeData.projects.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                    <p className="text-slate-400 dark:text-white/20 text-sm">No projects added yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Skills */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                  <Hammer className="w-5 h-5 text-teal-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Skills</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    id="skillInput"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.target.value.trim();
                        if (val && !resumeData.skills.includes(val)) {
                          setResumeData(prev => ({ ...prev, skills: [...prev.skills, val] }));
                          e.target.value = '';
                        }
                      }
                    }}
                    placeholder="Type a skill and press Enter..."
                    className="flex-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="group flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 text-sm font-medium"
                    >
                      {skill}
                      <button onClick={() => removeItem('skills', idx)} className="text-teal-600/50 dark:text-teal-400/50 hover:text-teal-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {resumeData.skills.length === 0 && (
                    <p className="text-slate-400 dark:text-white/20 text-sm italic">Add skills like JavaScript, React, System Design...</p>
                  )}
                </div>
              </div>
            </section>

            {/* Languages */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                  <Globe className="w-5 h-5 text-teal-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Languages</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.target.value.trim();
                        if (val) {
                          const currentLangs = resumeData.languages || [];
                          if (!currentLangs.includes(val)) {
                            setResumeData(prev => ({ ...prev, languages: [...currentLangs, val] }));
                            e.target.value = '';
                          }
                        }
                      }
                    }}
                    placeholder="Type a language and press Enter (e.g. English, Spanish)..."
                    className="flex-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.languages?.map((lang, idx) => (
                    <span 
                      key={idx}
                      className="group flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-sm font-medium"
                    >
                      {lang}
                      <button onClick={() => removeItem('languages', idx)} className="text-indigo-600/50 dark:text-indigo-400/50 hover:text-indigo-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {(!resumeData.languages || resumeData.languages.length === 0) && (
                    <p className="text-slate-400 dark:text-white/20 text-sm italic">Add spoken languages...</p>
                  )}
                </div>
              </div>
            </section>

          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            {/* ATS Analysis Card */}
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Resume Optimization</h3>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-white/40 mb-6">
                  Check your resume against ATS standards. Our AI will analyze keywords, formatting, and impact.
                </p>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {isAnalyzing ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze ATS Score'}
                </button>
              </div>

              <ATSScoreCard analysis={analysis} isLoading={isAnalyzing} />

              {/* Tips Card */}
              <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-2xl p-6">
                <h4 className="text-sm font-semibold text-teal-400 mb-2 uppercase tracking-widest">Pro Tip</h4>
                <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
                  Focus on **quantifying** your achievements. Instead of saying "Optimized database," say "Reduced query latency by 40% through index optimization."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal Overlay */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-100 dark:bg-[#0a0a0a] w-full max-w-5xl h-full md:h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#111] border-b border-slate-200 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Eye className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">Live Resume Preview</h3>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    setTimeout(exportPDF, 300); // wait for modal transition before capturing
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-slate-900 dark:text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body - Scaled A4 Container */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-slate-200/50 dark:bg-black/50">
              <div className="shadow-2xl ring-1 ring-slate-900/5 bg-white origin-top" style={{ width: '210mm', minHeight: '297mm', transform: 'scale(0.9)', transformOrigin: 'top center', marginBottom: '-10%' }}>
                {renderSelectedTemplate()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Preview Area for PDF Export */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div ref={resumeRef}>
          {renderSelectedTemplate()}
        </div>
      </div>

      <ThemeExplorerModal
        isOpen={isThemeExplorerOpen}
        onClose={() => setIsThemeExplorerOpen(false)}
        selectedTheme={selectedTemplate}
        onApplyTheme={(theme) => {
          handleApplyTheme(theme);
          setIsThemeExplorerOpen(false);
        }}
      />
    </div>
  );
};

export default ResumeBuilder;
