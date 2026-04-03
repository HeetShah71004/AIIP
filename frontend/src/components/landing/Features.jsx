import React from 'react';
import { Target, Zap, BarChart, Settings, Users, BookOpen } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Target className="w-5 h-5" />,
      title: 'AI Answer Scoring',
      description: 'Get real-time scoring on clarity, depth, and structure of your interview answers.'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Adaptive Difficulty',
      description: 'The AI adjusts its follow-up questions based on your previous responses.'
    },
    {
      icon: <BarChart className="w-5 h-5" />,
      title: 'Skill Progress Radar',
      description: 'Track your improvement across 20+ interview competencies over time.'
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: 'Resume-based Questions',
      description: 'Upload your resume and get questions tailored to your specific experience.'
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: 'Company Question Bank',
      description: 'Practice with real questions from top tech companies like Google and Meta.'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Peer Interviews',
      description: 'Connect with other candidates for live peer-to-peer practice sessions.'
    }
  ];

  return (
    <section id="features" className="py-24 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">Built for elite performance.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light">Every feature is designed to simulate the intensity of high-stakes tech interviews.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="group p-8 rounded-[2rem] bg-card border border-border hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-[#14b8a6] dark:text-[#14b8a6] mb-6 group-hover:scale-110 transition-transform duration-500 border border-border/50">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground transition-colors duration-300 group-hover:text-[#14b8a6]">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
