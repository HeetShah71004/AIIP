import React from 'react';
import { BookOpen, Users, Compass, Laptop } from 'lucide-react';

const LearnGrow = () => {
  const tracks = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: 'Free Interview Guide',
      description: 'Access a comprehensive 50-page guide covering technical, behavioral, and architectural mock questions.'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Community Sessions',
      description: 'Join weekly live Q&A sessions with senior engineers from MAANG companies.'
    },
    {
      icon: <Compass className="w-5 h-5" />,
      title: 'Roadmap Builder',
      description: 'Get a personalized learning roadmap based on your current skill gaps and target roles.'
    }
  ];

  return (
    <section id="learn-grow" className="py-24 bg-white dark:bg-black/10 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#14b8a6] rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3b82f6] rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
           <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">Learn, Grow, and <span className="text-[#14b8a6]">Succeed.</span></h2>
           <p className="text-muted-foreground text-lg leading-relaxed font-light">
             Access exclusive resources and a supportive community designed to help you build confidence and master your technical craft.
           </p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Main Visual/Resource Preview */}
          <div className="w-full lg:w-1/2 p-10 rounded-[3rem] bg-gradient-to-br from-[#14b8a6]/20 to-[#3b82f6]/20 border border-white/20 backdrop-blur-3xl shadow-2xl relative group">
             <div className="absolute inset-0 bg-[#14b8a6]/5 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="relative z-10">
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-black/50 flex items-center justify-center text-[#14b8a6] shadow-sm">
                   <Laptop className="w-6 h-6" />
                 </div>
                 <h4 className="text-xl font-bold text-foreground">Premium Learning Tracks</h4>
               </div>
               <div className="space-y-6">
                 {[1, 2, 3].map((item) => (
                   <div key={item} className="flex items-start gap-4 p-4 rounded-2xl bg-white/30 dark:bg-black/30 border border-white/20 shadow-sm backdrop-blur-md">
                     <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#059669] text-white flex items-center justify-center text-sm font-bold shadow-md">
                       {item}
                     </div>
                     <div>
                       <p className="font-semibold text-foreground">Advanced Data Structures Track</p>
                       <p className="text-sm text-muted-foreground">Mastering Trees, Graphs, and DP with AI-guided explanations.</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* Side Grids */}
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
            {tracks.map((t, idx) => (
              <div key={idx} className="group flex items-start gap-6 p-6 rounded-3xl bg-card border border-border hover:border-[#14b8a6]/20 transition-all duration-300 hover:shadow-xl relative overflow-hidden bg-white/50 backdrop-blur-sm">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#14b8a6]/10 flex items-center justify-center text-[#14b8a6] group-hover:bg-[#14b8a6] group-hover:text-white transition-all duration-300">
                  {t.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{t.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-light">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearnGrow;
