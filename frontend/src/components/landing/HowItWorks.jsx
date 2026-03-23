import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Upload your Resume',
      description: 'Our AI analyzes your skills, projects, and experiences to personalize your interview.'
    },
    {
      number: '02',
      title: 'Choose your Company',
      description: 'Select from 50+ company profiles to get specific questions used in their hiring process.'
    },
    {
      number: '03',
      title: 'Practice with AI',
      description: 'Have a natural, voice or text-based conversation with our highly realistic interviewer.'
    },
    {
      number: '04',
      title: 'Get Instant Feedback',
      description: 'Review your detailed analysis and personalized improvement plan within seconds.'
    }
  ];

  return (
    <section id="how-it-works" className="py-32 border-t border-border bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="md:w-1/3">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">How it works.</h2>
            <p className="text-muted-foreground font-light">Simple four-step process to transform your interview skills.</p>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-y-16 gap-x-12">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <span className="text-[10px] font-black tracking-[0.3em] text-primary/50 uppercase">{step.number}</span>
                <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
