import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  ChartTooltip,
  Legend
);
import { TrendingUp, Award, Calendar, Target } from 'lucide-react';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const Analytics = () => {
  const [data, setData] = useState(null);
  const [advancedData, setAdvancedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sumRes, advRes] = await Promise.all([
          api.get('/analytics/summary?limit=100'),
          api.get('/analytics/advanced-stats')
        ]);
        setData(sumRes.data.data);
        setAdvancedData(advRes.data.data);
      } catch (err) {
        console.error('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Crunching your career data..." />;
  if (!data) return (
    <div className="container max-w-4xl mx-auto px-4 py-20 text-center space-y-4 font-['Outfit'] dark:text-zinc-100">
        <h2 className="text-2xl font-bold dark:text-zinc-50">No analytics data available</h2>
        <p className="text-muted-foreground dark:text-zinc-400">Complete some interview sessions first to see your performance metrics!</p>
    </div>
  );

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString([], { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const lineData = data.sessionHistory.map(s => ({
    displayDate: formatDateTime(s.createdAt),
    fullDate: new Date(s.createdAt).toLocaleString(),
    score: s.score
  })).reverse();

  const maxScoreInTrend = lineData.length > 0 ? Math.max(...lineData.map(d => d.score)) : 0;

  const barData = data.categoryStats.map(c => ({
    name: c._id || 'General',
    score: parseFloat((c.topScore || c.avgScore || 0).toFixed(1))
  }));

  const chartJsBarData = {
    labels: barData.map(d => d.name),
    datasets: [
      {
        label: 'Score',
        data: barData.map(d => d.score),
        backgroundColor: barData.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 6,
        barPercentage: 0.6,
      }
    ]
  };

  const chartJsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2, color: isDark ? '#94a3b8' : '#64748b' },
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)', drawBorder: false }
      },
      x: {
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 11 } },
        grid: { display: false, drawBorder: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        displayColors: false,
        callbacks: {
          label: (context) => `Score: ${context.parsed.y}/10`
        }
      }
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8 font-['Outfit'] dark:text-zinc-100">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight dark:text-zinc-50 dark:font-extrabold">Performance Analytics</h1>
        <p className="text-muted-foreground text-lg dark:text-zinc-400">Visualize your growth and identify areas for improvement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 dark:border-zinc-800/90 dark:bg-[#0d1117] shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">Total Sessions</p>
              <h3 className="text-2xl font-bold tracking-tight dark:text-zinc-100">{data.totalSessions}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 dark:border-zinc-800/90 dark:bg-[#0d1117] shadow-sm border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">Average Score</p>
              <h3 className="text-2xl font-bold tracking-tight dark:text-zinc-100">{(data.avgOverallScore * 10).toFixed(0)}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 dark:border-zinc-800/90 dark:bg-[#0d1117] shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">Top Score</p>
              <h3 className="text-2xl font-bold tracking-tight dark:text-zinc-100">{(data.highestScore * 10).toFixed(0)}%</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 dark:border-zinc-800/90 dark:bg-[#0d1117] shadow-sm border-l-4 border-l-orange-500 relative group cursor-pointer transition-colors hover:bg-muted/30 dark:hover:bg-zinc-900/60">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600">
              <Target size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">Questions Attempted</p>
              <h3 className="text-2xl font-bold tracking-tight dark:text-zinc-100">{data.totalQuestionsAnswered + (data.totalSkippedQuestions || 0)}</h3>
            </div>
            
            {/* Hover Data Info Tooltip */}
            <div className="absolute left-1/2 -bottom-2 translate-y-full -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 min-w-44">
              <div className="bg-popover text-popover-foreground border border-border dark:border-zinc-700 dark:bg-[#111827] shadow-xl rounded-lg p-3 text-sm flex flex-col gap-2 relative">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground font-medium">Total:</span>
                  <span className="font-bold text-primary">{data.totalQuestionsAnswered + (data.totalSkippedQuestions || 0)}</span>
                </div>
                <div className="h-px bg-border w-full my-0.5"></div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground font-medium">Completed:</span>
                  <span className="font-bold text-orange-600">{data.totalQuestionsAnswered}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground font-medium">Skipped:</span>
                  <span className="font-bold">{data.totalSkippedQuestions || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {advancedData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 dark:border-zinc-800/90 dark:bg-[#0d1117] shadow-sm bg-gradient-to-br from-blue-500/5 to-transparent">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-widest">Global Percentile</p>
                <h3 className="text-3xl font-bold dark:text-zinc-100">{advancedData.percentile}th <span className="text-sm font-normal text-muted-foreground dark:text-zinc-400">percentile</span></h3>
                <p className="text-xs text-muted-foreground dark:text-zinc-400 pt-1">You score higher than {advancedData.percentile}% of users.</p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">{advancedData.percentile}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 dark:border-zinc-800/90 dark:bg-[#0d1117] shadow-sm bg-gradient-to-br from-green-500/5 to-transparent">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground dark:text-zinc-400 uppercase tracking-widest">Skill Velocity</p>
                <h3 className="text-3xl font-bold dark:text-zinc-100">{advancedData.velocity > 0 ? '+' : ''}{advancedData.velocity} <span className="text-sm font-normal text-muted-foreground dark:text-zinc-400">pts / session</span></h3>
                <p className="text-xs text-muted-foreground dark:text-zinc-400 pt-1">Rate of improvement over your recent sessions.</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10 text-green-600">
                <TrendingUp size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="border-border/50 dark:border-zinc-800/90 dark:bg-[#0d1117] shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-8">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp size={20} />
            </div>
            <div>
              <CardTitle className="dark:text-zinc-100">Score Trend</CardTitle>
              <CardDescription className="dark:text-zinc-400">Your performance over time</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    domain={[0, 10]} 
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                        background: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold', textTransform: 'capitalize' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px', fontSize: '10px' }}
                    labelFormatter={(label, payload) => {
                      return payload?.[0]?.payload?.fullDate || label;
                    }}
                    formatter={(value) => {
                      const isMax = value === maxScoreInTrend && value > 0;
                      return [value, isMax ? 'Top Score' : 'Score'];
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={(props) => {
                      const { cx, cy, value, index } = props;
                      const isMax = value === maxScoreInTrend && value > 0;
                      if (isMax) {
                        return (
                          <g key={`custom-dot-${index}`}>
                            <circle cx={cx} cy={cy} r={10} fill="#f59e0b" opacity={0.3} />
                            <circle cx={cx} cy={cy} r={5} fill="#f59e0b" stroke="hsl(var(--background))" strokeWidth={2} />
                          </g>
                        );
                      }
                      return (
                        <circle 
                          key={`custom-dot-${index}`} 
                          cx={cx} cy={cy} r={4} 
                          fill="hsl(var(--primary))" 
                          stroke="hsl(var(--background))" 
                          strokeWidth={2} 
                        />
                      );
                    }}
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 dark:border-zinc-800/90 dark:bg-[#0d1117] shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-8">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
              <Target size={20} />
            </div>
            <div>
              <CardTitle className="dark:text-zinc-100">Category Breakdown</CardTitle>
              <CardDescription className="dark:text-zinc-400">Top scores by interview topic</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] relative w-full">
              <Bar options={chartJsBarOptions} data={chartJsBarData} />
            </div>
          </CardContent>
        </Card>

        {advancedData?.radarData && (
          <Card className="border-border/50 dark:border-zinc-800/90 dark:bg-[#0d1117] shadow-sm overflow-hidden md:col-span-2 xl:col-span-1">
            <CardHeader className="flex flex-row items-center gap-4 pb-8">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Award size={20} />
              </div>
              <div>
                <CardTitle className="dark:text-zinc-100">Skill Dimensions</CardTitle>
                <CardDescription className="dark:text-zinc-400">Communication, depth, and structure</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={advancedData.radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar
                      name="User"
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: 'var(--radius)' 
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;
