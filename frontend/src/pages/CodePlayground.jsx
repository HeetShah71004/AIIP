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

const languageIcons = {
    javascript: (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="#f7df1e"/>
        </svg>
    ),
    python: (props) => (
        <svg viewBox="0 0 24 24" {...props}>
            <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09z" fill="#3776ab"/>
            <path d="M13.09 5.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" fill="#ffd43b"/>
        </svg>
    ),
    java: (props) => (
        <svg viewBox="0 0 32 32" {...props}>
            <path d="M11.622 24.74s-1.23.748.855.962c2.51.32 3.847.267 6.625-.267a10.02 10.02 0 0 0 1.763.855c-6.25 2.672-14.16-.16-9.244-1.55zm-.8-3.473s-1.336 1.015.748 1.23c2.725.267 4.862.32 8.55-.427a3.26 3.26 0 0 0 1.282.801c-7.534 2.244-15.976.214-10.58-1.603zm14.747 6.09s.908.748-1.015 1.336c-3.58 1.07-15.014 1.39-18.22 0-1.122-.48 1.015-1.175 1.7-1.282.695-.16 1.07-.16 1.07-.16-1.23-.855-8.175 1.763-3.526 2.51 12.77 2.084 23.296-.908 19.983-2.404zM12.2 17.633s-5.824 1.39-2.084 1.87c1.603.214 4.755.16 7.694-.053 2.404-.214 4.81-.64 4.81-.64s-.855.374-1.443.748c-5.93 1.55-17.312.855-14.052-.748 2.778-1.336 5.076-1.175 5.076-1.175zm10.42 5.824c5.984-3.1 3.206-6.09 1.282-5.717-.48.107-.695.214-.695.214s.16-.32.534-.427c3.794-1.336 6.786 4.007-1.23 6.09 0 0 .053-.053.107-.16zm-9.83 8.442c5.77.374 14.587-.214 14.8-2.94 0 0-.427 1.07-4.755 1.87-4.916.908-11.007.8-14.587.214 0 0 .748.64 4.542.855z" fill="#4e7896"/>
            <path d="M18.996.001s3.313 3.366-3.152 8.442c-5.183 4.114-1.175 6.465 0 9.137-3.046-2.725-5.236-5.13-3.74-7.373C14.294 6.893 20.332 5.3 18.996.001zm-1.7 15.335c1.55 1.763-.427 3.366-.427 3.366s3.954-2.03 2.137-4.542c-1.656-2.404-2.94-3.58 4.007-7.587 0 0-10.953 2.725-5.717 8.763z" fill="#f58219"/>
        </svg>
    ),
    cpp: (props) => (
        <svg viewBox="0 0 24 24" {...props}>
            <path d="M22.394 6c-.167-.29-.398-.543-.652-.69L12.926.22c-.509-.294-1.34-.294-1.848 0L2.26 5.31c-.508.293-.923 1.013-.923 1.6v10.18c0 .294.104.62.271.91.167.29.398.543.652.69l8.816 5.09c.508.293 1.34.293 1.848 0l8.816-5.09c.254-.147.485-.4.652-.69.167-.29.27-.616.27-.91V6.91c.003-.294-.1-.62-.268-.91z" fill="#00599c"/>
            <path d="M12 19.11c-3.92 0-7.109-3.19-7.109-7.11 0-3.92 3.19-7.11 7.11-7.11a7.133 7.133 0 016.156 3.553l-3.076 1.78a3.567 3.567 0 00-3.08-1.78A3.56 3.56 0 008.444 12 3.56 3.56 0 0012 15.555a3.57 3.57 0 003.08-1.778l3.078 1.78A7.135 7.135 0 0112 19.11zm7.11-6.715h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79zm2.962 0h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79z" fill="#00599c"/>
        </svg>
    ),
    go: (props) => (
        <svg viewBox="0 0 24 24" {...props}>
            <path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2m3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 01-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.63.07-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788.935-2.045 2.033-.21.912.234 1.835 1.075 2.21.643.28 1.285.244 1.905-.07.923-.48 1.425-1.228 1.484-2.233z" fill="#00add8"/>
        </svg>
    ),
    csharp: (props) => (
        <svg viewBox="0 0 24 24" {...props}>
            <path d="M22.062 10.65v2.852h-2.148v2.12h-2.132v-2.12h-2.203v-2.852h2.203V8.52h2.132v2.13zm-5.748 6.32v-1.928h-3.328v1.928zm0-3.83v-1.926h-3.328v1.926zm0-3.832V7.382h-3.328v1.926z" fill="#512bd4"/>
            <path d="M11.516 19.053V5.463H3.047v13.596z" fill="#512bd4"/>
        </svg>
    )
};

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
                                        {languageIcons[language] && languageIcons[language]({ className: "w-3 h-3 text-[#4d6bfe]" })}
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
                        <div className="flex items-center gap-2.5">
                            {languageIcons[language] && languageIcons[language]({ className: cn("w-4 h-4", isDark ? "text-white/60" : "text-[#4d6bfe]/60") })}
                            <span className="text-[13px] font-bold tracking-tight">Main.{getFileExtension(language)}</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex flex-1 justify-center">
                    <span className="text-[13px] font-medium text-[#4d6bfe] tracking-wide">{getLanguageTitle(language)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                className={cn(
                                    "h-8 pr-2 pl-3 text-[11px] font-bold gap-2 rounded-xl transition-all active:scale-95 shadow-sm uppercase border ring-0 focus-visible:ring-0",
                                    isDark 
                                        ? "bg-zinc-800/50 hover:bg-zinc-800 border-white/5 text-zinc-300" 
                                        : "bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 text-slate-600"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                                        isDark ? "bg-white/10" : "bg-white shadow-sm border border-slate-100"
                                    )}>
                                        {languageIcons[language] && languageIcons[language]({ className: "w-3 h-3" })}
                                    </div>
                                    <span>{language}</span>
                                </div>
                                <ChevronDown size={14} className="opacity-40" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={cn(
                            "w-48 backdrop-blur-xl border-border/40 p-1 rounded-xl shadow-2xl",
                            isDark ? "bg-slate-900/95" : "bg-white/95"
                        )}>
                            <div className="p-1.5 flex flex-col gap-1">
                                {Object.keys(languageDefaults).map(lang => (
                                    <DropdownMenuItem 
                                        key={lang} 
                                        onClick={() => handleLanguageChange(lang)}
                                        className={cn(
                                            "w-full text-[11px] font-bold uppercase tracking-wider cursor-pointer rounded-xl px-3 py-2 flex items-center gap-3 transition-all outline-none focus:bg-transparent",
                                            language === lang 
                                                ? (isDark ? "bg-white/10 text-white" : "bg-primary/10 text-primary")
                                                : (isDark ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-600 focus:bg-slate-100")
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm",
                                            language === lang 
                                                ? (isDark ? "bg-[#4d6bfe]" : "bg-[#4d6bfe]") 
                                                : (isDark ? "bg-white/5" : "bg-slate-100")
                                        )}>
                                            {languageIcons[lang] && languageIcons[lang]({ 
                                                className: cn("w-4 h-4", language === lang ? "text-white" : (isDark ? "text-slate-400" : "text-slate-500")) 
                                            })}
                                        </div>
                                        {lang}
                                    </DropdownMenuItem>
                                ))}
                            </div>
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
