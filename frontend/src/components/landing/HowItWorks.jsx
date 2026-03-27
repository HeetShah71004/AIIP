import React from 'react';
import { FileText, Building2, Cpu, BarChart3 } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Upload your Resume',
      description: 'Our AI analyzes your skills, projects, and experiences to personalize your interview.',
      icon: FileText
    },
    {
      number: '02',
      title: 'Choose your Company',
      description: 'Select from 50+ company profiles to get specific questions used in their hiring process.',
      icon: Building2
    },
    {
      number: '03',
      title: 'Practice with AI',
      description: 'Have a natural, voice or text-based conversation with our highly realistic interviewer.',
      icon: Cpu
    },
    {
      number: '04',
      title: 'Get Instant Feedback',
      description: 'Review your detailed analysis and personalized improvement plan within seconds.',
      icon: BarChart3
    }
  ];

  return (
    <section id="how-it-works" className="py-32 border-t border-border bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">How it works.</h2>
          <p className="text-muted-foreground font-light max-w-2xl mx-auto">Simple four-step process to transform your interview skills.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="group relative flex flex-col gap-6 p-8 rounded-[2.5rem] border border-border bg-card transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-[#14b8a6] border border-border/50 group-hover:scale-110 transition-transform duration-500">
                  <step.icon size={24} strokeWidth={2.25} />
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/40 uppercase">
                  {step.number}
                </span>
              </div>
              
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="text-[0.925rem] leading-relaxed text-muted-foreground font-light">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
