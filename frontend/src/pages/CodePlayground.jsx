import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Loader2, Terminal, Code, ChevronRight, ArrowLeft, Sparkles, Plus, MoreVertical, Maximize, Minimize, ChevronDown, LogOut, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from '../api/client';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { cn } from "@/lib/utils";
import { Panel, Group, Separator } from 'react-resizable-panels';

const languageDefaults = {
    javascript: '// Write JavaScript code here...\nconsole.log("Hello, World!");\n',
    python: '# Write Python code here...\nprint("Hello, World!")\n',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n',
    csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}\n'
};

const getFileExtension = (lang) => {
    const map = { 'javascript': 'js', 'python': 'py', 'java': 'java', 'cpp': 'cpp', 'go': 'go', 'csharp': 'cs' };
    return map[lang] || 'txt';
};

const getLanguageTitle = (lang) => {
    const map = { 'javascript': 'JavaScript', 'python': 'Python', 'java': 'Java', 'cpp': 'C++', 'go': 'Go', 'csharp': 'C#' };
    return `${map[lang] || lang} Playground`;
};

// Custom Resize Handle Component
const ResizeHandle = ({ direction = "horizontal", isDark }) => (
    <Separator 
        className={cn(
            "relative flex items-center justify-center transition-all duration-300 z-10",
            direction === "horizontal" ? "w-1 hover:w-1.5 cursor-col-resize" : "h-1 hover:h-1.5 cursor-row-resize",
            isDark ? "bg-[#121214]" : "bg-slate-200"
        )}
    >
        <div className={cn(
            "transition-all duration-300 pointer-events-none",
            direction === "horizontal" ? "w-[1.5px] h-10 rounded-full" : "h-[1.5px] w-10 rounded-full",
            isDark ? "bg-white/10 group-hover:bg-[#4d6bfe]" : "bg-slate-300 group-hover:bg-[#4d6bfe]"
        )} />
    </Separator>
);

const CodePlayground = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(languageDefaults['javascript']);
    const [output, setOutput] = useState('');
    const [stdin, setStdin] = useState(''); // Changed from userInput to stdin
    const [isRunning, setIsRunning] = useState(false);
    const [isHeaderHidden, setIsHeaderHidden] = useState(false);
    const { user, logout } = useAuth();
    const editorRef = useRef(null);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        // One Dark Style for Dark Mode
        monaco.editor.defineTheme('one-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#1e1e20',
                'editor.lineHighlightBackground': '#ffffff15', // High-visibility dark overlay (approx 9%)
                'editorCursor.foreground': '#4d6bfe',
                'editorLineNumber.foreground': '#4b4b4d',
                'editorLineNumber.activeForeground': '#4d6bfe', // Brand Blue Active
                'editorGutter.background': '#1e1e20', // Seamless
            }
        });

        // Custom Light Theme with Yellow Line Highlight
        monaco.editor.defineTheme('custom-light', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#ffffff',
                'editor.lineHighlightBackground': '#fffde7', // Pale yellow highlight
                'editorCursor.foreground': '#4d6bfe',
                'editorLineNumber.foreground': '#cbd5e1',
                'editorLineNumber.activeForeground': '#4d6bfe', // Brand Blue Active
                'editorGutter.background': '#fafafa', // Subtle gray gutter
            }
        });

        monaco.editor.setTheme(isDark ? 'one-dark' : 'custom-light');
    };

    useEffect(() => {
        if (window.monaco) {
            window.monaco.editor.setTheme(isDark ? 'one-dark' : 'custom-light');
        }
    }, [isDark]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleLanguageChange = (val) => {
        setLanguage(val);
        // Only set default code if the current code is empty or from another default
        setCode(languageDefaults[val]);
    };

    const handleReset = () => {
        setCode(languageDefaults[language]);
        setOutput('');
        setStdin(''); // Changed from userInput to stdin
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([code], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `Main.${getFileExtension(language)}`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    };

    const handleClearOutput = () => {
        setOutput('');
    };

    const handleRunCode = async () => {
        if (!code.trim()) {
            toast.error('Code cannot be empty');
            return;
        }
        setIsRunning(true);
        setOutput('');
        try {
            const res = await api.post('/code/execute', {
                language,
                code,
                input: stdin // Changed from userInput to stdin
            });
            
            if (res.data.success && res.data.data) {
                const { stdout, stderr, output: fullOutput } = res.data.data;
                
                let executionOutput = '';
                if (stdout) executionOutput += `${stdout}\n`;
                if (stderr) executionOutput += `[Error]\n${stderr}\n`;
                if (!stdout && !stderr && fullOutput) executionOutput += `${fullOutput}\n`;
                if (!stdout && !stderr && !fullOutput) executionOutput += `Process finished successfully. (No output produced)\n`;
                
                setOutput(executionOutput.trim());
            } else {
                setOutput('No output received from execution server.');
            }
        } catch (err) {
            setOutput(`[Error]\n${err.response?.data?.message || err.response?.data?.error || err.message}`);
            toast.error('Failed to execute code');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className={cn("h-screen flex flex-col overflow-hidden transition-colors duration-300", isDark ? "bg-[#1e1e20]" : "bg-slate-50")}>
            {/* Header */}
            {!isHeaderHidden && (
                <header className={cn(
                    "h-14 shrink-0 border-b flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300",
                    isDark ? "bg-[#111] border-white/[0.05] backdrop-blur-xl" : "bg-white/80 border-slate-200 backdrop-blur-xl shadow-sm"
                )}>
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className={cn(
                                "rounded-full hover:scale-105 transition-all",
                                isDark ? "hover:bg-white/10" : "hover:bg-slate-100"
                            )}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div className="flex items-center gap-4">
                            <Link to="/" className="flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                <span className="text-2xl font-black tracking-tighter text-[#4d6bfe] font-outfit">Interv</span>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-lg text-primary-foreground shadow-sm transform -rotate-3 transition-colors duration-300",
                                    isDark ? "bg-zinc-100 text-zinc-900" : "bg-[#4d6bfe] text-white"
                                )}>
                                    <span className="text-base font-extrabold font-outfit uppercase">AI</span>
                                </div>
                            </Link>

                            <div className="h-8 w-px bg-border/40 hidden sm:block" />

                            <div className="hidden sm:flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10",
                                        isDark ? "text-[#4d6bfe]" : "text-primary"
                                    )}>
                                        {language} editor
                                    </span>
                                </div>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Playground</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-1 ring-border/70 dark:ring-zinc-700 hover:bg-muted/60 dark:hover:bg-zinc-800/70">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar} alt={user.name || 'User'} referrerPolicy="no-referrer" />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {(user.name || user.email)?.charAt(0).toUpperCase() || <UserIcon size={18} />}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className={cn("w-56 border border-border/60 dark:border-zinc-700", isDark ? "bg-[#1e1e20]" : "bg-white")} align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal border-b border-border/10 pb-3 mb-1 px-4">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold leading-none tracking-tight uppercase">{user.name || 'User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground font-medium">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive cursor-pointer px-4 py-2.5"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                </header>
            )}

            {/* Editor Toolbar (Full Width) */}
            <div className={cn(
                "flex items-center justify-between px-3 h-11 w-full border-b shrink-0 transition-colors duration-300 relative z-20",
                isDark ? "bg-[#1e1e20] border-white/[0.05]" : "bg-slate-100 border-slate-200"
            )}>
                <div className="flex items-center h-full">
                    <div className={cn(
                        "flex items-center gap-2 px-6 h-full border-b-[3px] transition-all cursor-default",
                        isDark 
                            ? "bg-white/[0.03] border-white text-white/90" 
                            : "bg-[#4d6bfe]/5 border-[#4d6bfe] text-[#4d6bfe]"
                    )}>
                        <Code size={14} className={isDark ? "text-white/40" : "text-[#4d6bfe]/40"} />
                        <span className="text-[13px] font-bold tracking-tight">Main.{getFileExtension(language)}</span>
                    </div>
                </div>

                <div className="hidden md:flex flex-1 justify-center">
                    <span className="text-[13px] font-medium text-[#4d6bfe] tracking-wide">{getLanguageTitle(language)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="h-8 px-3 bg-[#4d6bfe] hover:bg-[#3d5bde] text-white text-[11px] font-bold gap-1.5 rounded uppercase">
                                {language} <ChevronDown size={14} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={cn(
                            "w-48 backdrop-blur-xl border-border/40 p-1 rounded-xl shadow-2xl",
                            isDark ? "bg-slate-900/95" : "bg-white/95"
                        )}>
                            <DropdownMenuRadioGroup value={language} onValueChange={handleLanguageChange}>
                                {Object.keys(languageDefaults).map(lang => (
                                    <DropdownMenuRadioItem key={lang} value={lang} className="text-xs font-bold uppercase tracking-wider focus:bg-primary focus:text-primary-foreground cursor-pointer rounded-lg m-0.5">
                                        {lang}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                        onClick={handleRunCode} 
                        disabled={isRunning} 
                        className="h-8 px-4 bg-[#f92a5d] hover:bg-[#e91040] text-white text-[11px] font-bold gap-1.5 rounded uppercase"
                    >
                        {isRunning ? 'RUNNING' : 'RUN'} {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                    </Button>

                    <div className="flex items-center gap-1 ml-1 text-muted-foreground">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5 rounded">
                                    <MoreVertical size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className={cn(
                                "w-48 backdrop-blur-xl border-border/40 p-1 rounded-xl shadow-lg",
                                isDark ? "bg-slate-900/95" : "bg-white/95"
                            )}>
                                <DropdownMenuItem onClick={handleReset} className="text-[13px] font-medium cursor-pointer rounded-lg m-0.5">
                                    Reset (New)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDownload} className="text-[13px] font-medium cursor-pointer rounded-lg m-0.5">
                                    Download
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/40 my-1 mx-1" />
                                <DropdownMenuItem onClick={handleClearOutput} className="text-[13px] font-medium cursor-pointer rounded-lg m-0.5">
                                    Clear Output
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsHeaderHidden(!isHeaderHidden)}
                            className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5 rounded"
                        >
                            {isHeaderHidden ? <Minimize size={16} /> : <Maximize size={16} />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Resizable Project Layout */}
            <main className="flex-1 overflow-hidden relative z-10">
                <Group orientation="horizontal">
                    <Panel defaultSize={70} minSize={0} collapsible>
                        <div className={cn(
                            "h-full flex flex-col overflow-hidden transition-colors duration-300",
                            isDark ? "bg-[#1e1e20]" : "bg-white"
                        )}>
                            <div className="flex-1 min-h-0 relative">
                                <Editor
                                    height="100%"
                                    theme={isDark ? 'one-dark' : 'custom-light'}
                                    language={language}
                                    value={code}
                                    onChange={(value) => setCode(value || '')}
                                    onMount={handleEditorDidMount}
                                    options={{
                                        fontSize: 14,
                                        fontFamily: 'Fira Code, monospace',
                                        fontLigatures: true,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        lineNumbers: 'on',
                                        renderLineHighlight: 'all',
                                        padding: { top: 20 },
                                        smoothScrolling: true,
                                        cursorSmoothCaretAnimation: 'on',
                                        wordWrap: 'on',
                                        automaticLayout: true,
                                    }}
                                />
                            </div>
                        </div>
                    </Panel>

                    <ResizeHandle isDark={isDark} />

                    <Panel defaultSize={30} minSize={0} collapsible>
                        <Group orientation="vertical">
                            {/* STDIN Panel */}
                            <Panel defaultSize={40} minSize={0} collapsible>
                                <div className={cn(
                                    "h-full overflow-hidden flex flex-col transition-colors duration-300",
                                    isDark ? "bg-[#1e1e20] border-l border-white/[0.05]" : "bg-white border-l border-slate-200"
                                )}>
                                    <div className={cn(
                                        "h-9 px-4 border-b text-[10px] font-bold uppercase tracking-widest flex items-center justify-between transition-colors duration-300",
                                        isDark ? "bg-[#252528] text-zinc-400 border-white/[0.05]" : "bg-slate-50 text-slate-500 border-slate-200"
                                    )}>
                                        STDIN
                                        <ChevronRight size={14} className="text-muted-foreground/40 rotate-90" />
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={stdin}
                                            onChange={(e) => setStdin(e.target.value)}
                                            placeholder="Input for the program (Optional)"
                                            className={cn(
                                                "absolute inset-0 w-full h-full p-4 resize-none outline-none text-sm font-mono transition-colors duration-300",
                                                isDark ? "bg-[#1e1e20] text-zinc-300 placeholder:text-zinc-700" : "bg-white text-slate-700 placeholder:text-slate-300"
                                            )}
                                            style={{ fontFamily: 'Fira Code, monospace' }}
                                        />
                                    </div>
                                </div>
                            </Panel>

                            <ResizeHandle direction="vertical" isDark={isDark} />

                            {/* Output Panel */}
                            <Panel defaultSize={60} minSize={0} collapsible>
                                <div className={cn(
                                    "h-full overflow-hidden flex flex-col transition-colors duration-300 relative group",
                                    isDark ? "bg-[#1e1e20] border-l border-white/[0.05]" : "bg-white border-l border-slate-200"
                                )}>
                                    <div className={cn(
                                        "h-9 px-4 border-b text-[10px] font-bold uppercase tracking-widest flex items-center justify-between transition-colors duration-300",
                                        isDark ? "bg-[#252528] text-zinc-400 border-white/[0.05]" : "bg-slate-50 text-slate-500 border-slate-200"
                                    )}>
                                        Output
                                        <Terminal size={14} className="text-muted-foreground/40" />
                                    </div>
                                    <div className="flex-1 relative">
                                        <pre className={cn(
                                            "absolute inset-0 w-full h-full p-6 overflow-auto text-sm font-mono whitespace-pre-wrap transition-colors duration-300 scrollbar-thin",
                                            isDark 
                                                ? "bg-[#1e1e20] text-blue-400 custom-scrollbar-dark scrollbar-thumb-white/10" 
                                                : "bg-white text-slate-800 scrollbar-thumb-slate-200"
                                        )} style={{ fontFamily: 'Fira Code, monospace' }}>
                                            {output || <span className="text-muted-foreground/30 italic">Click on Run Code button to see the output</span>}
                                        </pre>
                                    </div>
                                </div>
                            </Panel>
                        </Group>
                    </Panel>
                </Group>
            </main>
        </div>
    );
};

export default CodePlayground;
