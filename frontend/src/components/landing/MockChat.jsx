import React from 'react';

const MockChat = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative group">
          {/* Card Border/Container */}
          <div className="absolute -inset-[1px] bg-gradient-to-b from-white/[0.1] to-transparent rounded-2xl -z-10" />
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
            {/* Window Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/10 bg-foreground/[0.02]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-foreground/20" />
                <div className="w-3 h-3 rounded-full bg-foreground/20" />
                <div className="w-3 h-3 rounded-full bg-foreground/20" />
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Session ID: AI-742</div>
              <div className="w-9" />
            </div>

            {/* Chat Content */}
            <div className="p-8 flex flex-col gap-8">
              {/* AI Question */}
              <div className="flex items-start gap-4 max-w-2xl">
                <div className="w-8 h-8 rounded-full bg-[#14b8a6]/20 flex items-center justify-center flex-shrink-0 border border-[#14b8a6]/20">
                  <span className="text-[#14b8a6] text-[10px] font-bold">AI</span>
                </div>
                <div className="bg-foreground/[0.03] border border-foreground/[0.05] p-5 rounded-2xl rounded-tl-none">
                  <p className="text-foreground/80 leading-relaxed italic">
                    "Tell me about a time you had to handle a conflict within your team. How did you approach it, and what was the outcome?"
                  </p>
                </div>
              </div>

              {/* User Answer */}
              <div className="flex items-start gap-4 justify-end">
                <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl rounded-tr-none max-w-xl">
                  <p className="text-foreground leading-relaxed">
                    "During our last sprint, there was a disagreement on the architecture for the new API. I scheduled a quick sync, listened to both sides, and we decided to prototype both options..."
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-foreground/40 text-[10px] font-bold">YOU</span>
                </div>
              </div>

              {/* AI Feedback */}
              <div className="mt-4 pt-8 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
                  <span className="text-[11px] uppercase tracking-widest text-[#14b8a6] font-bold">AI Analysis Complete</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-foreground/5 border border-border px-4 py-2 rounded-lg flex items-center gap-3">
                    <span className="text-[11px] text-foreground/40 font-medium">Clarity</span>
                    <span className="text-sm font-bold text-foreground">9/10</span>
                  </div>
                  <div className="bg-foreground/5 border border-border px-4 py-2 rounded-lg flex items-center gap-3">
                    <span className="text-[11px] text-foreground/40 font-medium">Depth</span>
                    <span className="text-sm font-bold text-foreground">8/10</span>
                  </div>
                  <div className="bg-foreground/5 border border-border px-4 py-2 rounded-lg flex items-center gap-3">
                    <span className="text-[11px] text-foreground/40 font-medium">Structure</span>
                    <span className="text-sm font-bold text-foreground">7/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MockChat;
