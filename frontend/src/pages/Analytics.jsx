import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Award, Calendar, Target } from 'lucide-react';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/summary?limit=100');
        setData(res.data.data);
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
    <div className="container max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">No analytics data available</h2>
        <p className="text-muted-foreground">Complete some interview sessions first to see your performance metrics!</p>
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

  const barData = data.categoryStats.map(c => ({
    name: c._id || 'General',
    score: parseFloat(c.avgScore.toFixed(1))
  }));

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground text-lg">Visualize your growth and identify areas for improvement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Sessions</p>
              <h3 className="text-2xl font-bold tracking-tight">{data.totalSessions}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Average Score</p>
              <h3 className="text-2xl font-bold tracking-tight">{(data.avgOverallScore * 10).toFixed(0)}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Score</p>
              <h3 className="text-2xl font-bold tracking-tight">{(data.highestScore * 10).toFixed(0)}%</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm border-l-4 border-l-orange-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600">
              <Target size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Questions Answered</p>
              <h3 className="text-2xl font-bold tracking-tight">{data.totalQuestionsAnswered}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-8">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp size={20} />
            </div>
            <div>
              <CardTitle>Score Trend</CardTitle>
              <CardDescription>Your performance over time</CardDescription>
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
                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px', fontSize: '10px' }}
                    labelFormatter={(label, payload) => {
                      return payload?.[0]?.payload?.fullDate || label;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-8">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
              <Target size={20} />
            </div>
            <div>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Average scores by interview topic</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={false}
                    tick={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    domain={[0, 10]} 
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
                    labelStyle={{ display: 'none' }}
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  />
                  <Bar name="Avg. Score" dataKey="score" radius={[6, 6, 0, 0]} barSize={40}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
