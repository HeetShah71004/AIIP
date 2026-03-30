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
  CheckCircle2,
  Lock,
  Briefcase,
  GraduationCap,
  Hammer,
  Layout,
  GripVertical,
  ScrollText,
  Blocks,
  Wand2,
  Gem,
  MoonStar,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Upload,
  FileText,
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

const THEME_TRIGGER_STYLES = {
  classic: {
    Icon: ScrollText,
    classes: 'bg-gradient-to-r from-amber-300 to-orange-400 border-orange-300/80 hover:shadow-orange-400/40',
    badgeClasses: 'border-orange-400/35 bg-orange-400/10 text-orange-700 dark:text-orange-300'
  },
  modern: {
    Icon: Blocks,
    classes: 'bg-gradient-to-r from-cyan-300 to-sky-400 border-cyan-300/80 hover:shadow-cyan-400/40',
    badgeClasses: 'border-cyan-400/35 bg-cyan-400/10 text-cyan-700 dark:text-cyan-300'
  },
  professional: {
    Icon: Briefcase,
    classes: 'bg-gradient-to-r from-slate-300 to-slate-400 border-slate-300/80 hover:shadow-slate-400/40',
    badgeClasses: 'border-slate-400/35 bg-slate-400/10 text-slate-700 dark:text-slate-300'
  },
  creative: {
    Icon: Wand2,
    classes: 'bg-gradient-to-r from-fuchsia-300 to-violet-400 border-fuchsia-300/80 hover:shadow-violet-400/40',
    badgeClasses: 'border-violet-400/35 bg-violet-400/10 text-violet-700 dark:text-violet-300'
  },
  elegant: {
    Icon: Gem,
    classes: 'bg-gradient-to-r from-rose-300 to-pink-400 border-rose-300/80 hover:shadow-rose-400/40',
    badgeClasses: 'border-rose-400/35 bg-rose-400/10 text-rose-700 dark:text-rose-300'
  },
  midnight: {
    Icon: MoonStar,
    classes: 'bg-gradient-to-r from-indigo-300 to-blue-400 border-indigo-300/80 hover:shadow-indigo-400/40',
    badgeClasses: 'border-indigo-400/35 bg-indigo-400/10 text-indigo-700 dark:text-indigo-300'
  }
};

const PREVIEW_SECTION_KEYS = ['experience', 'projects', 'education', 'skills', 'languages'];
const PREVIEW_SECTION_LABELS = {
  experience: 'Experience',
  projects: 'Projects',
  education: 'Education',
  skills: 'Skills',
  languages: 'Languages'
};

const FORM_SECTION_NAV_ITEMS = [
  { key: 'personalInfo', label: 'Personal Info', subtitle: 'Identity & contact details' },
  { key: 'summary', label: 'Summary', subtitle: 'Professional snapshot' },
  { key: 'experience', label: 'Experience', subtitle: 'Work history & roles' },
  { key: 'education', label: 'Education', subtitle: 'Academic background' },
  { key: 'projects', label: 'Projects', subtitle: 'Impactful project highlights' },
  { key: 'skills', label: 'Skills', subtitle: 'Core technical strengths' },
  { key: 'languages', label: 'Languages', subtitle: 'Spoken language proficiency' }
];

const normalizeSectionOrder = (incomingOrder) => {
  if (!Array.isArray(incomingOrder)) return PREVIEW_SECTION_KEYS;

  const deduped = [...new Set(incomingOrder)].filter((key) => PREVIEW_SECTION_KEYS.includes(key));
  const missing = PREVIEW_SECTION_KEYS.filter((key) => !deduped.includes(key));

  return [...deduped, ...missing];
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
  const [previewSectionOrder, setPreviewSectionOrder] = useState(PREVIEW_SECTION_KEYS);
  const [previewOrderSelection, setPreviewOrderSelection] = useState([]);
  const [importedFileName, setImportedFileName] = useState('');
  const [showImportFilePulse, setShowImportFilePulse] = useState(false);
  const [activeFormSection, setActiveFormSection] = useState('personalInfo');
  const [draggingProjectIndex, setDraggingProjectIndex] = useState(null);
  const [dragOverProjectIndex, setDragOverProjectIndex] = useState(null);
  const resumeRef = useRef(null);
  const fileInputRef = useRef(null);
  const formSectionRefs = useRef({});
  const selectedTemplateLabel = TEMPLATE_LABELS[selectedTemplate] || 'Classic';
  const themeTriggerVisual = THEME_TRIGGER_STYLES[selectedTemplate] || THEME_TRIGGER_STYLES.classic;
  const ThemeTriggerIcon = themeTriggerVisual.Icon;
  const themeAppliedBadgeClasses = themeTriggerVisual.badgeClasses || 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300';

  useEffect(() => {
    fetchResume();
  }, []);

  useEffect(() => {
    if (!showImportFilePulse) return;

    const timer = setTimeout(() => setShowImportFilePulse(false), 1200);
    return () => clearTimeout(timer);
  }, [showImportFilePulse]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          const sectionKey = visibleEntries[0].target.getAttribute('data-section-key');
          if (sectionKey) setActiveFormSection(sectionKey);
        }
      },
      {
        root: null,
        threshold: [0.15, 0.35, 0.55],
        rootMargin: '-20% 0px -55% 0px'
      }
    );

    const currentSections = FORM_SECTION_NAV_ITEMS
      .map((item) => formSectionRefs.current[item.key])
      .filter(Boolean);

    currentSections.forEach((sectionEl) => observer.observe(sectionEl));

    return () => observer.disconnect();
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
        setPreviewSectionOrder(normalizeSectionOrder(response.data.data.previewSectionOrder));
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

  const moveItem = (section, index, direction) => {
    setResumeData((prev) => {
      const items = [...(prev[section] || [])];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= items.length) {
        return prev;
      }

      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;

      return {
        ...prev,
        [section]: items
      };
    });
  };

  const reorderItem = (section, fromIndex, toIndex) => {
    setResumeData((prev) => {
      const items = [...(prev[section] || [])];

      if (
        fromIndex < 0
        || toIndex < 0
        || fromIndex >= items.length
        || toIndex >= items.length
        || fromIndex === toIndex
      ) {
        return prev;
      }

      const [movedItem] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, movedItem);

      return {
        ...prev,
        [section]: items
      };
    });
  };

  const handleProjectDragStart = (index) => {
    setDraggingProjectIndex(index);
  };

  const handleProjectDragOver = (index) => {
    setDragOverProjectIndex(index);
  };

  const handleProjectDrop = (index) => {
    if (draggingProjectIndex === null) return;

    reorderItem('projects', draggingProjectIndex, index);
    setDraggingProjectIndex(null);
    setDragOverProjectIndex(null);
  };

  const handleProjectDragEnd = () => {
    setDraggingProjectIndex(null);
    setDragOverProjectIndex(null);
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
      await axios.post('/resume', {
        ...resumeData,
        selectedTemplate,
        previewSectionOrder
      });

      let pdfBlob = null;
      let pdfFilename = `${resumeData.personalInfo.fullName || 'Resume'}-draft.pdf`;
      try {
        const generated = await generateResumePdfBlob({ fitToSinglePage: true });
        pdfBlob = generated.blob;
        pdfFilename = generated.filename;
      } catch (pdfError) {
        console.error('Save Draft PDF generation failed:', pdfError);
      }

      if (pdfBlob) {
        const emailFormData = new FormData();
        emailFormData.append('resumePdf', pdfBlob, pdfFilename);

        try {
          await axios.post('/resume/email-draft', emailFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success('Resume saved and emailed successfully with selected template PDF!');
        } catch (emailError) {
          toast.success('Resume saved, but email delivery failed.');
        }
      } else {
        toast.success('Resume saved, but preview PDF could not be generated for email.');
      }
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
        setImportedFileName(file.name);
        setShowImportFilePulse(true);
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

  const generateResumePdfBlob = async ({ fitToSinglePage = false } = {}) => {
    const element = resumeRef.current;
    if (!element) {
      throw new Error('Resume preview is not available for PDF generation.');
    }

    // Temporary style adjustments for PDF capture
    const canvas = await html2canvas(element, {
      scale: 1.35,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // JPEG keeps attachment size significantly lower than PNG for large resume previews.
    const imgData = canvas.toDataURL('image/jpeg', 0.82);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (fitToSinglePage) {
      const fittedHeight = Math.min(pageHeight, imgHeight);
      const fittedWidth = (canvas.width * fittedHeight) / canvas.height;
      const x = Math.max(0, (pageWidth - fittedWidth) / 2);

      pdf.addImage(imgData, 'JPEG', x, 0, fittedWidth, fittedHeight, undefined, 'FAST');
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Only add new pages if there's significant content left (more than 2mm)
      while (heightLeft > 2) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    return {
      blob: pdf.output('blob'),
      filename: `${resumeData.personalInfo.fullName || 'Resume'}-draft.pdf`
    };
  };

  const exportPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;

    try {
      toast.loading('Generating PDF...', { id: 'pdf-toast' });

      const generated = await generateResumePdfBlob();
      const blobUrl = URL.createObjectURL(generated.blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${resumeData.personalInfo.fullName || 'Resume'}.pdf`;
      link.click();
      URL.revokeObjectURL(blobUrl);

      toast.success('Resume downloaded!', { id: 'pdf-toast' });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-toast' });
    }
  };

  const renderSelectedTemplate = () => {
    if (selectedTemplate === 'classic') return <ClassicTemplate resumeData={resumeData} sectionOrder={previewSectionOrder} />;
    if (selectedTemplate === 'modern') return <ModernTemplate resumeData={resumeData} sectionOrder={previewSectionOrder} />;
    if (selectedTemplate === 'professional') return <ProfessionalTemplate resumeData={resumeData} sectionOrder={previewSectionOrder} />;
    if (selectedTemplate === 'creative') return <CreativeTemplate resumeData={resumeData} sectionOrder={previewSectionOrder} />;
    if (selectedTemplate === 'elegant') return <ElegantTemplate resumeData={resumeData} sectionOrder={previewSectionOrder} />;
    if (selectedTemplate === 'midnight') return <MidnightTemplate resumeData={resumeData} sectionOrder={previewSectionOrder} />;

    return <ClassicTemplate resumeData={resumeData} sectionOrder={previewSectionOrder} />;
  };

  const movePreviewSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= previewSectionOrder.length) return;

    setPreviewSectionOrder((prevOrder) => {
      const nextOrder = [...prevOrder];
      const temp = nextOrder[index];
      nextOrder[index] = nextOrder[targetIndex];
      nextOrder[targetIndex] = temp;
      return nextOrder;
    });
  };

  const handlePreviewOrderCheckbox = (sectionKey, checked) => {
    setPreviewOrderSelection((prevSelection) => {
      const nextSelection = checked
        ? [...prevSelection, sectionKey]
        : prevSelection.filter((key) => key !== sectionKey);

      const remaining = PREVIEW_SECTION_KEYS.filter((key) => !nextSelection.includes(key));
      setPreviewSectionOrder([...nextSelection, ...remaining]);

      return nextSelection;
    });
  };

  const scrollToFormSection = (sectionKey) => {
    const sectionElement = formSectionRefs.current[sectionKey];
    if (!sectionElement) return;

    setActiveFormSection(sectionKey);
    sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sectionCompletionStatus = {
    personalInfo: Boolean(
      resumeData.personalInfo?.fullName?.trim()
      && resumeData.personalInfo?.email?.trim()
      && resumeData.personalInfo?.phone?.trim()
    ),
    summary: Boolean(resumeData.summary?.trim() && resumeData.summary.trim().length >= 30),
    experience: Array.isArray(resumeData.experience)
      && resumeData.experience.length > 0
      && resumeData.experience.every((item) => item.role?.trim() && item.company?.trim() && item.description?.trim()),
    education: Array.isArray(resumeData.education)
      && resumeData.education.length > 0
      && resumeData.education.every((item) => item.degree?.trim() && item.school?.trim()),
    projects: Array.isArray(resumeData.projects)
      && resumeData.projects.length > 0
      && resumeData.projects.every((item) => item.name?.trim() && item.description?.trim()),
    skills: Array.isArray(resumeData.skills) && resumeData.skills.length >= 3,
    languages: Array.isArray(resumeData.languages) && resumeData.languages.length >= 1
  };

  const completionCount = FORM_SECTION_NAV_ITEMS.filter((item) => sectionCompletionStatus[item.key]).length;
  const completionPercent = Math.round((completionCount / FORM_SECTION_NAV_ITEMS.length) * 100);
  const firstIncompleteIndex = FORM_SECTION_NAV_ITEMS.findIndex((item) => !sectionCompletionStatus[item.key]);

  const activeFormSectionIndex = FORM_SECTION_NAV_ITEMS.findIndex((item) => item.key === activeFormSection);
  const navigatorStartIndex = activeFormSectionIndex <= 0 ? 0 : activeFormSectionIndex - 1;
  const navigatorEndIndex = Math.min(FORM_SECTION_NAV_ITEMS.length, navigatorStartIndex + 3);
  const visibleNavigatorItems = FORM_SECTION_NAV_ITEMS.slice(navigatorStartIndex, navigatorEndIndex);

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
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${themeAppliedBadgeClasses}`}>
                Applied Theme: {selectedTemplateLabel}
              </span>
            </div>
            <p className="text-slate-500 dark:text-white/40 max-w-md">
              Create a professional, ATS-optimized resume with AI assistance. 
              Improve your impact with one click.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileChange} 
            />
            <div className="flex items-center gap-3 flex-wrap md:justify-end">
              <button
                onClick={() => setIsThemeExplorerOpen(true)}
                className={`group flex items-center gap-2 px-5 py-2.5 border rounded-xl text-slate-900 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold tracking-tight brightness-100 hover:brightness-105 ${themeTriggerVisual.classes}`}
              >
                <ThemeTriggerIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Explore Themes ({selectedTemplateLabel})
              </button>
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="group flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold"
              >
                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={exportPDF}
                className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-slate-900 dark:text-white hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold brightness-100 hover:brightness-105"
              >
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                Export PDF
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap md:justify-end">
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium disabled:opacity-50"
            >
              <Upload className={`w-4 h-4 ${isImporting ? 'animate-bounce' : 'group-hover:-translate-y-1'} transition-transform`} />
              {isImporting ? 'Importing...' : 'Import Resume'}
            </button>

            {importedFileName && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium max-w-[320px] md:max-w-[380px] transition-all ${
                  showImportFilePulse
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300 shadow-md shadow-teal-500/20'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80'
                }`}
              >
                <FileText className={`w-4 h-4 shrink-0 ${showImportFilePulse ? 'animate-pulse' : ''}`} />
                <span className="text-xs uppercase tracking-wide opacity-70">Last imported:</span>
                <span className="truncate font-semibold" title={importedFileName}>{importedFileName}</span>
              </div>
            )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Personal Information */}
            <section
              data-section-key="personalInfo"
              ref={(el) => {
                formSectionRefs.current.personalInfo = el;
              }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm"
            >
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
            <section
              data-section-key="summary"
              ref={(el) => {
                formSectionRefs.current.summary = el;
              }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm"
            >
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
                  className="group flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 hover:bg-teal-500/20 hover:shadow-md hover:shadow-teal-500/10 hover:-translate-y-0.5 hover:scale-[1.05] active:scale-[0.95] transition-all text-sm font-medium disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isRewriting === 'summary' ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
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
            <section
              data-section-key="experience"
              ref={(el) => {
                formSectionRefs.current.experience = el;
              }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                    <Briefcase className="w-5 h-5 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Experience</h2>
                </div>
                <button
                  onClick={() => addItem('experience', { company: '', role: '', location: '', startDate: '', endDate: '', description: '' })}
                  className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-sm hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  Add Experience
                </button>
              </div>

              <div className="space-y-8">
                {resumeData.experience.map((exp, idx) => (
                  <div key={idx} className="relative p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl group">
                    <button 
                      onClick={() => removeItem('experience', idx)}
                      className="absolute top-4 right-4 p-1 rounded-md text-slate-400 dark:text-white/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all hover:scale-110 active:scale-95"
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
                          <Sparkles className={`w-3 h-3 ${isRewriting === `experience-${idx}` ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
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
            <section
              data-section-key="education"
              ref={(el) => {
                formSectionRefs.current.education = el;
              }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                    <GraduationCap className="w-5 h-5 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Education</h2>
                </div>
                <button
                  onClick={() => addItem('education', { school: '', degree: '', startDate: '', endDate: '', description: '' })}
                  className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-sm hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  Add Education
                </button>
              </div>

              <div className="space-y-8">
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} className="relative p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl group">
                    <button 
                      onClick={() => removeItem('education', idx)}
                      className="absolute top-4 right-4 p-1 rounded-md text-slate-400 dark:text-white/20 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
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
            <section
              data-section-key="projects"
              ref={(el) => {
                formSectionRefs.current.projects = el;
              }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                    <Code className="w-5 h-5 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Projects</h2>
                </div>
                <button
                  onClick={() => addItem('projects', { name: '', description: '', link: '', technologies: [] })}
                  className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-sm hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  Add Project
                </button>
              </div>

              <div className="space-y-8">
                {resumeData.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggingProjectIndex !== null && draggingProjectIndex !== idx) {
                        handleProjectDragOver(idx);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleProjectDrop(idx);
                    }}
                    onDragEnd={handleProjectDragEnd}
                    className={`relative p-6 bg-white dark:bg-white/5 border rounded-xl group transition-all ${
                      dragOverProjectIndex === idx
                        ? 'border-teal-400 dark:border-teal-500/60 shadow-lg shadow-teal-500/10'
                        : 'border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <button
                        type="button"
                        draggable
                        onDragStart={() => handleProjectDragStart(idx)}
                        onDragEnd={handleProjectDragEnd}
                        className="p-1 rounded-md text-slate-400 dark:text-white/25 hover:text-teal-500 hover:bg-teal-500/10 transition-colors cursor-grab active:cursor-grabbing"
                        title="Drag to reorder project"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem('projects', idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded-md text-slate-400 dark:text-white/20 hover:text-teal-500 hover:bg-teal-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Move project up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem('projects', idx, 1)}
                        disabled={idx === resumeData.projects.length - 1}
                        className="p-1 rounded-md text-slate-400 dark:text-white/20 hover:text-teal-500 hover:bg-teal-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Move project down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeItem('projects', idx)}
                        className="p-1 rounded-md text-slate-400 dark:text-white/20 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
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
            <section
              data-section-key="skills"
              ref={(el) => {
                formSectionRefs.current.skills = el;
              }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm"
            >
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
                      <button onClick={() => removeItem('skills', idx)} className="p-0.5 rounded text-teal-600/50 dark:text-teal-400/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all hover:scale-110 active:scale-90">
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
            <section
              data-section-key="languages"
              ref={(el) => {
                formSectionRefs.current.languages = el;
              }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm"
            >
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
                      <button onClick={() => removeItem('languages', idx)} className="p-0.5 rounded text-indigo-600/50 dark:text-indigo-400/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all hover:scale-110 active:scale-90">
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
          <div className="lg:col-span-4">
            <div className="sticky top-24 z-10 space-y-6">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">Section Navigator</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      {completionCount}/{FORM_SECTION_NAV_ITEMS.length} complete
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  {visibleNavigatorItems.map((item, localIndex) => {
                    const index = navigatorStartIndex + localIndex;
                    const isCurrent = activeFormSection === item.key;
                    const isPassed = activeFormSectionIndex > -1 && index < activeFormSectionIndex;
                    const isNext = activeFormSectionIndex > -1 && index === activeFormSectionIndex + 1;
                    const isCompleted = sectionCompletionStatus[item.key];
                    const isLocked = firstIncompleteIndex !== -1 && index > firstIncompleteIndex + 1;

                    return (
                      <button
                        key={item.key}
                        disabled={isLocked}
                        onClick={() => scrollToFormSection(item.key)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border ${
                          isLocked
                            ? 'opacity-45 cursor-not-allowed bg-slate-100/80 dark:bg-white/5 text-slate-500 dark:text-white/40 border-transparent'
                            : ''
                        } ${
                          isCurrent
                            ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30'
                            : isPassed
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                              : isNext
                                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
                                : 'text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium leading-tight">{item.label}</p>
                            <p className="text-[11px] opacity-75 mt-0.5">{item.subtitle}</p>
                          </div>
                          <div className="shrink-0 pt-0.5">
                            {isLocked ? (
                              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-white/40" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : isCurrent ? (
                              <span className="text-[10px] font-semibold uppercase tracking-wider">Current</span>
                            ) : isNext ? (
                              <span className="text-[10px] font-semibold uppercase tracking-wider">Next</span>
                            ) : (
                              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Open</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ATS Analysis Card */}
              <div className="space-y-6">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <BarChart3 className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Resume Optimization</h3>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-white/40 mb-5">
                  Check your resume against ATS standards. Our AI will analyze keywords, formatting, and impact.
                </p>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="group w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {isAnalyzing ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze ATS Score'}
                </button>
              </div>

              <ATSScoreCard analysis={analysis} isLoading={isAnalyzing} />
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
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:bg-rose-500/20 bg-slate-100 dark:bg-white/5 rounded-full transition-all hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-white/80 dark:bg-[#111]/80 border-b border-slate-200 dark:border-white/10 shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-white/60 mb-2">
                Preview Section Order
              </p>
              <p className="text-[11px] text-slate-500 dark:text-white/50 mb-2">
                Select sections in the order you want them to appear.
              </p>
              <div className="flex flex-wrap gap-2">
                {PREVIEW_SECTION_KEYS.map((sectionKey) => {
                  const selectionIndex = previewOrderSelection.indexOf(sectionKey);
                  const isSelected = selectionIndex > -1;

                  return (
                    <label
                      key={sectionKey}
                      className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-teal-500/35 bg-teal-500/10'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-teal-500"
                        checked={isSelected}
                        onChange={(e) => handlePreviewOrderCheckbox(sectionKey, e.target.checked)}
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-white/80">
                        {PREVIEW_SECTION_LABELS[sectionKey]}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                          {selectionIndex + 1}
                        </span>
                      )}
                    </label>
                  );
                })}
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
