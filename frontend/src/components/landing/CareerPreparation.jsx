import React from 'react';
import { FileText, Award, Target, MessageSquare } from 'lucide-react';

const CareerPreparation = () => {
  const steps = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Resume Optimization',
      description: 'Get AI-powered feedback on your resume to pass Applicant Tracking Systems (ATS) with ease.'
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'Technical Mock Drills',
      description: 'Sharpen your coding skills with timed technical challenges tailored to your dream role.'
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Role-Specific Prep',
      description: 'Practice questions specific to specialized roles like Backend, Frontend, and ML Engineering.'
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Behavioral Strategy',
      description: 'Learn the STAR method and perfect your stories for behavioral interview rounds.'
    }
  ];

  return (
    <section id="career-preparation" className="py-24 bg-background dark:bg-black/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Elevate your <span className="text-[#14b8a6]">Interview Game.</span>
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              We provide the tools and strategy you need to transition from "candidate" to "hired" at top-tier tech companies.
            </p>
          </div>
          <div className="hidden lg:block pb-2">
             <div className="px-4 py-2 bg-[#14b8a6]/10 text-[#14b8a6] rounded-full text-sm font-semibold border border-[#14b8a6]/20">
               Step-by-Step Guidance
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="group p-8 rounded-[2rem] bg-card border border-border hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-[#14b8a6] dark:text-[#14b8a6] mb-6 group-hover:scale-110 transition-transform duration-500 border border-border/50">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground transition-colors group-hover:text-[#14b8a6]">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CareerPreparation;
