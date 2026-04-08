import React, { useEffect, useMemo, useState } from 'react';
import {
  Compass,
  Lock,
  Unlock,
  Sparkles,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Target,
  CheckCircle2,
  Circle,
  RotateCcw,
  PlayCircle
} from 'lucide-react';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ROADMAP_NODES = [
  {
    id: 'frontend-core',
    label: 'Frontend Core',
    category: 'Frontend',
    deps: [],
    x: 70,
    y: 50,
    resources: [
      { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
      { title: 'Frontend Masters - CSS', url: 'https://frontendmasters.com/learn/css/' }
    ]
  },
  {
    id: 'backend-core',
    label: 'Backend Core',
    category: 'Backend',
    deps: [],
    x: 70,
    y: 210,
    resources: [
      { title: 'Node.js Learn', url: 'https://nodejs.org/en/learn' },
      { title: 'REST API Design', url: 'https://restfulapi.net/' }
    ]
  },
  {
    id: 'behavioral-core',
    label: 'Behavioral Core',
    category: 'Behavioral',
    deps: [],
    x: 70,
    y: 370,
    resources: [
      { title: 'STAR Interview Method', url: 'https://www.themuse.com/advice/star-interview-method' },
      { title: 'Google Behavioral Guide', url: 'https://careers.google.com/how-we-hire/interview/' }
    ]
  },
  {
    id: 'fullstack-systems',
    label: 'System Design',
    category: 'Fullstack',
    deps: ['frontend-core', 'backend-core'],
    x: 300,
    y: 130,
    resources: [
      { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
      { title: 'Scalability Guide', url: 'https://www.educative.io/blog/scalability' }
    ]
  },
  {
    id: 'coding-performance',
    label: 'Coding Performance',
    category: 'Backend',
    deps: ['backend-core'],
    x: 300,
    y: 300,
    resources: [
      { title: 'NeetCode Roadmap', url: 'https://neetcode.io/roadmap' },
      { title: 'Big-O Cheatsheet', url: 'https://www.bigocheatsheet.com/' }
    ]
  },
  {
    id: 'leadership-clarity',
    label: 'Leadership Stories',
    category: 'Behavioral',
    deps: ['behavioral-core'],
    x: 300,
    y: 460,
    resources: [
      { title: 'Amazon Leadership Examples', url: 'https://www.levels.fyi/blog/amazon-leadership-principles.html' },
      { title: 'Behavioral Practice Prompts', url: 'https://www.indeed.com/career-advice/interviewing/behavioral-interview-questions' }
    ]
  },
  {
    id: 'interview-mastery',
    label: 'Interview Mastery',
    category: 'Fullstack',
    deps: ['fullstack-systems', 'coding-performance', 'leadership-clarity'],
    x: 500,
    y: 290,
    resources: [
      { title: 'Senior Interview Playbook', url: 'https://blog.pragmaticengineer.com/software-engineering-interviews/' },
      { title: 'Career Growth Framework', url: 'https://staffeng.com/guides/' }
    ]
  }
];

const scoreFromCategoryStats = (categoryStats = []) => {
  return categoryStats.reduce((acc, stat) => {
    const key = String(stat?._id || '').toLowerCase().trim();
    if (!key) return acc;
    const score = Number(stat?.topScore ?? stat?.avgScore ?? 0);
    acc[key] = Number(score.toFixed(2));
    return acc;
  }, {});
};

const SPRINT_STORAGE_KEY = 'learning_roadmap_focus_sprint_v1';

const createSprintTasks = (node, recommendedTopics = []) => {
  const topicTasks = (recommendedTopics || []).slice(0, 3).map((topic, index) => ({
    id: `${node.id}-topic-${index + 1}`,
    title: `Practice: ${topic}`,
    done: false
  }));

  const resourceTasks = (node.resources || []).slice(0, 2).map((resource, index) => ({
    id: `${node.id}-resource-${index + 1}`,
    title: `Study resource: ${resource.title}`,
    done: false,
    url: resource.url
  }));

  return [
    ...topicTasks,
    ...resourceTasks,
    {
      id: `${node.id}-mock`,
      title: 'Complete one timed mock interview and review feedback',
      done: false
    }
  ];
};

const LearningRoadmap = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [advanced, setAdvanced] = useState(null);
  const [activeNodeId, setActiveNodeId] = useState('fullstack-systems');
  const [focusSprint, setFocusSprint] = useState(null);

  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        const [summaryRes, gapRes, advancedRes] = await Promise.all([
          api.get('/analytics/summary?limit=25'),
          api.get('/analytics/skill-gap'),
          api.get('/analytics/advanced-stats')
        ]);

        setSummary(summaryRes.data?.data || null);
        setSkillGap(gapRes.data?.data || null);
        setAdvanced(advancedRes.data?.data || null);
      } catch (error) {
        console.error('Roadmap data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapData();
  }, []);

  useEffect(() => {
    try {
      const savedSprint = localStorage.getItem(SPRINT_STORAGE_KEY);
      if (savedSprint) {
        setFocusSprint(JSON.parse(savedSprint));
      }
    } catch (error) {
      console.error('Failed to parse saved focus sprint:', error);
    }
  }, []);

  const categoryScores = useMemo(() => scoreFromCategoryStats(summary?.categoryStats || []), [summary]);

  const nodeState = useMemo(() => {
    const stateMap = {};

    ROADMAP_NODES.forEach((node) => {
      const categoryScore = Number(categoryScores[node.category.toLowerCase()] || 0);
      const depsSatisfied = node.deps.every((depId) => stateMap[depId]?.isUnlocked || false);
      const baseUnlocked = node.deps.length === 0;
      const isUnlocked = baseUnlocked || depsSatisfied;

      let status = 'locked';
      if (isUnlocked && categoryScore >= 7.5) status = 'mastered';
      else if (isUnlocked && categoryScore >= 4.5) status = 'in-progress';
      else if (isUnlocked) status = 'unlocked';

      stateMap[node.id] = {
        score: categoryScore,
        status,
        isUnlocked,
        depsSatisfied
      };
    });

    return stateMap;
  }, [categoryScores]);

  const recommendedGap = skillGap?.skillGaps?.[0] || null;

  const recommendedNode = useMemo(() => {
    if (!recommendedGap?.category) return ROADMAP_NODES[3];
    const match = ROADMAP_NODES.find((node) => node.category.toLowerCase() === recommendedGap.category.toLowerCase());
    return match || ROADMAP_NODES[3];
  }, [recommendedGap]);

  const treeEdges = useMemo(() => {
    return ROADMAP_NODES.flatMap((node) =>
      node.deps.map((depId) => {
        const depNode = ROADMAP_NODES.find((candidate) => candidate.id === depId);
        return depNode ? { from: depNode, to: node } : null;
      }).filter(Boolean)
    );
  }, []);

  const activeNode = ROADMAP_NODES.find((node) => node.id === activeNodeId) || recommendedNode;
  const activeNodeProgress = nodeState[activeNode.id] || { isUnlocked: false };
  const sprintCompletion = focusSprint?.tasks?.length
    ? Math.round((focusSprint.tasks.filter((task) => task.done).length / focusSprint.tasks.length) * 100)
    : 0;

  const persistSprint = (nextSprint) => {
    setFocusSprint(nextSprint);
    localStorage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(nextSprint));
  };

  const handleStartFocusSprint = () => {
    if (!activeNodeProgress.isUnlocked) return;

    const topics = (recommendedGap?.recommendedTopics || []).slice(0, 3);
    const sprint = {
      nodeId: activeNode.id,
      nodeLabel: activeNode.label,
      category: activeNode.category,
      startedAt: new Date().toISOString(),
      tasks: createSprintTasks(activeNode, topics)
    };

    persistSprint(sprint);
  };

  const toggleSprintTask = (taskId) => {
    if (!focusSprint) return;
    const updatedTasks = focusSprint.tasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task
    );

    persistSprint({ ...focusSprint, tasks: updatedTasks });
  };

  const resetSprint = () => {
    setFocusSprint(null);
    localStorage.removeItem(SPRINT_STORAGE_KEY);
  };

  useEffect(() => {
    if (recommendedNode && !activeNodeId) {
      setActiveNodeId(recommendedNode.id);
    }
  }, [recommendedNode, activeNodeId]);

  if (loading) {
    return <LoadingSpinner fullPage message="Building your adaptive roadmap..." />;
  }

  if (!summary) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-16 text-center space-y-4 font-['Outfit']">
        <h2 className="text-3xl font-black tracking-tight">No roadmap data yet</h2>
        <p className="text-muted-foreground text-lg">Complete at least one interview session so we can unlock your learning path.</p>
      </div>
    );
  }

  const nodeBadgeClass = (status) => {
    if (status === 'mastered') return 'bg-emerald-500/10 text-emerald-700 border-emerald-400/30';
    if (status === 'in-progress') return 'bg-amber-500/10 text-amber-700 border-amber-400/30';
    if (status === 'unlocked') return 'bg-cyan-500/10 text-cyan-700 border-cyan-400/30';
    return 'bg-slate-400/10 text-slate-600 border-slate-300/40';
  };

  const nodeGlowClass = (status, selected) => {
    if (selected) return 'from-teal-400/35 via-cyan-300/20 to-transparent';
    if (status === 'mastered') return 'from-emerald-400/28 via-teal-300/18 to-transparent';
    if (status === 'in-progress') return 'from-amber-400/20 via-orange-300/12 to-transparent';
    if (status === 'unlocked') return 'from-cyan-400/22 via-sky-300/12 to-transparent';
    return 'from-slate-300/12 via-slate-200/8 to-transparent';
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8 font-['Outfit']">
      <section className="relative overflow-hidden rounded-3xl border border-teal-300/30 bg-[linear-gradient(120deg,rgba(20,184,166,0.10),rgba(251,191,36,0.08),rgba(15,23,42,0.04))] p-6 sm:p-8">
        <div className="absolute -top-14 -right-10 h-56 w-56 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-500/15 p-2.5 text-teal-700">
              <Compass size={24} />
            </div>
            <Badge className="bg-white/80 text-teal-700 border-teal-300/40 font-bold">Learning Roadmap</Badge>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">Adaptive Skill Tree</h1>
          <p className="max-w-3xl text-slate-700 text-base sm:text-lg font-medium">
            Node states unlock from your interview analytics. Focus your next sprint on the highest gap category to compound score growth faster.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Card className="border-none bg-white/70 backdrop-blur">
              <CardContent className="p-4 flex items-center gap-3">
                <Target className="text-teal-700" size={20} />
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Current Gap</p>
                  <p className="font-black text-slate-900">{recommendedGap?.category || 'General'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-white/70 backdrop-blur">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="text-amber-600" size={20} />
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Velocity</p>
                  <p className="font-black text-slate-900">{advanced?.velocity > 0 ? '+' : ''}{advanced?.velocity || 0} pts/session</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-white/70 backdrop-blur">
              <CardContent className="p-4 flex items-center gap-3">
                <Sparkles className="text-cyan-700" size={20} />
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Recommended Next</p>
                  <p className="font-black text-slate-900">{recommendedGap?.recommendedTopics?.[0] || 'Practice structured answers'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 border-border/60 shadow-sm overflow-hidden bg-gradient-to-br from-white via-slate-50 to-white">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight">Skill Tree</CardTitle>
            <CardDescription>Locked nodes require dependency unlocks. Click any node to inspect study resources.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[700px] h-[580px] relative rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%),linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.35] bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:48px_48px]" />
                <div className="absolute left-20 top-20 h-44 w-44 rounded-full bg-teal-400/20 blur-3xl roadmap-glow" />
                <div className="absolute right-20 bottom-16 h-52 w-52 rounded-full bg-blue-400/15 blur-3xl roadmap-glow" style={{ animationDelay: '1.2s' }} />

                <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 700 580" preserveAspectRatio="none" aria-hidden>
                  <defs>
                    <linearGradient id="roadmapConnector" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(148,163,184,0.08)" />
                      <stop offset="48%" stopColor="rgba(20,184,166,0.22)" />
                      <stop offset="100%" stopColor="rgba(59,130,246,0.24)" />
                    </linearGradient>
                    <linearGradient id="roadmapConnectorMuted" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(148,163,184,0.10)" />
                      <stop offset="100%" stopColor="rgba(148,163,184,0.16)" />
                    </linearGradient>
                    <filter id="roadmapLineGlow">
                      <feGaussianBlur stdDeviation="0.45" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {treeEdges.map((edge, edgeIndex) => {
                    const sourceStatus = nodeState[edge.from.id]?.status;
                    const targetStatus = nodeState[edge.to.id]?.status;
                    const activeEdge = sourceStatus !== 'locked' && targetStatus !== 'locked';
                    const stroke = activeEdge ? 'url(#roadmapConnector)' : 'url(#roadmapConnectorMuted)';

                    return (
                      <g key={`${edge.from.id}-${edge.to.id}`} filter="url(#roadmapLineGlow)">
                        <path
                          d={`M ${edge.from.x + 90} ${edge.from.y + 30} C ${edge.from.x + 160} ${edge.from.y + 30}, ${edge.to.x - 90} ${edge.to.y + 30}, ${edge.to.x} ${edge.to.y + 30}`}
                          fill="none"
                          stroke={stroke}
                          strokeWidth={activeEdge ? 2.5 : 2}
                          strokeOpacity={activeEdge ? 0.68 : 0.42}
                          className="roadmap-connection"
                          style={{ animationDelay: `${edgeIndex * 180}ms` }}
                        />
                        <path
                          d={`M ${edge.from.x + 90} ${edge.from.y + 30} C ${edge.from.x + 160} ${edge.from.y + 30}, ${edge.to.x - 90} ${edge.to.y + 30}, ${edge.to.x} ${edge.to.y + 30}`}
                          fill="none"
                          stroke={activeEdge ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'}
                          strokeWidth="1"
                          strokeDasharray="1 16"
                          opacity={0.22}
                          className="roadmap-connection"
                          style={{ animationDelay: `${edgeIndex * 180 + 150}ms` }}
                        />
                      </g>
                    );
                  })}
                </svg>

                {ROADMAP_NODES.map((node, index) => {
                  const state = nodeState[node.id] || { status: 'locked', score: 0, isUnlocked: false };
                  const selected = activeNode?.id === node.id;

                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setActiveNodeId(node.id)}
                      className={`roadmap-node-reveal absolute w-[165px] rounded-2xl border p-3 text-left transition-all duration-300 overflow-hidden ${
                        selected ? 'ring-2 ring-teal-500 border-teal-400 bg-teal-50/60' : 'border-slate-200 hover:border-teal-200'
                      } ${state.status === 'locked' ? 'bg-slate-100/95' : 'bg-white/96'}`}
                      style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-black text-slate-900 leading-tight text-sm relative z-10">{node.label}</p>
                        {state.isUnlocked ? <Unlock size={14} className="text-teal-600" /> : <Lock size={14} className="text-slate-500" />}
                      </div>
                      <div className="mt-2 flex items-center justify-between relative z-10">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold ${nodeBadgeClass(state.status)}`}>
                          {state.status.replace('-', ' ')}
                        </Badge>
                        <span className="text-xs font-bold text-slate-600">{state.score.toFixed(1)}/10</span>
                      </div>

                      <div className="absolute right-3 top-3 h-3 w-3 rounded-full bg-teal-400/55 shadow-none roadmap-glow" style={{ animationDelay: `${index * 140}ms` }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-black tracking-tight">Node Brief</CardTitle>
            <CardDescription>Use this as your next 7-day execution checklist.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Selected Node</p>
              <h3 className="text-lg font-black text-slate-900 mt-1">{activeNode.label}</h3>
              <p className="text-sm text-slate-600 mt-1">Category: {activeNode.category}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Recommended Topics</p>
              <ul className="space-y-2">
                {(recommendedGap?.recommendedTopics || ['Practice one timed mock interview', 'Review your weakest category notes']).map((topic) => (
                  <li key={topic} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <ArrowRight size={14} className="text-teal-600" />
                    {topic}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Resource Links</p>
              <div className="space-y-2">
                {activeNode.resources.map((resource) => (
                  <a
                    key={resource.url}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border border-slate-200 px-3 py-2 bg-white hover:bg-teal-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <BookOpen size={14} className="text-teal-700" />
                      {resource.title}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 font-black disabled:bg-slate-400 disabled:cursor-not-allowed"
              onClick={handleStartFocusSprint}
              disabled={!activeNodeProgress.isUnlocked}
            >
              {focusSprint?.nodeId === activeNode.id ? 'Restart Focus Sprint' : 'Start Focus Sprint'}
            </Button>

            {focusSprint && (
              <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Active Sprint</p>
                    <p className="text-sm font-black text-slate-900">{focusSprint.nodeLabel}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={resetSprint}
                  >
                    <RotateCcw size={14} className="mr-1" />
                    Reset
                  </Button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Progress</span>
                    <span>{sprintCompletion}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-teal-600 transition-all duration-300"
                      style={{ width: `${sprintCompletion}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {focusSprint.tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => toggleSprintTask(task.id)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left flex items-start gap-2 hover:border-teal-300 transition-colors"
                    >
                      {task.done ? (
                        <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <Circle size={16} className="text-slate-500 mt-0.5 shrink-0" />
                      )}
                      <span className={`text-sm font-semibold ${task.done ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                        {task.title}
                      </span>
                    </button>
                  ))}
                </div>

                {sprintCompletion === 100 && (
                  <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 flex items-center gap-2">
                    <PlayCircle size={16} />
                    Sprint completed. Switch to your next weakest node and start a new cycle.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningRoadmap;
