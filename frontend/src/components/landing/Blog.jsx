import React from 'react';
import { ArrowRight, Clock, User } from 'lucide-react';

const Blog = () => {
  const posts = [
    {
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
      category: 'Interview Tips',
      title: 'How to Master System Design Interviews in 2024',
      date: 'March 28, 2024',
      author: 'Alex Chen',
      excerpt: 'System design can be intimidating. Here is a step-by-step roadmap to acing the most common architectural questions.'
    },
    {
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
      category: 'Career Growth',
      title: 'The Hidden Skill Top Recruiters Look For',
      date: 'March 25, 2024',
      author: 'Sarah Johnson',
      excerpt: 'Beyond coding, soft skills play a massive role in final hiring decisions. Learn how to showcase yours effectively.'
    },
    {
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
      category: 'AI Trends',
      title: 'Why AI Mock Interviews Are Outperforming Human Coaching',
      date: 'March 20, 2024',
      author: 'David Kumar',
      excerpt: 'Data-driven feedback is changing the landscape of interview preparation. See how AI is leveling the playing field.'
    }
  ];

  return (
    <section id="blog" className="py-24 bg-background dark:bg-black/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Latest Insights.</h2>
            <p className="text-muted-foreground font-light text-lg">Stay updated with the best interview strategies and industry trends.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-[#14b8a6] font-bold hover:gap-3 transition-all duration-300">
            View All Posts <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post, i) => (
            <div 
              key={i} 
              className="group rounded-[2.5rem] bg-card border border-border overflow-hidden hover:border-[#14b8a6]/20 transition-all duration-500 hover:shadow-2xl hover:shadow-[#14b8a6]/10 flex flex-col"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-6 left-6 px-4 py-2 bg-[#14b8a6] text-white rounded-full text-xs font-bold shadow-lg">
                  {post.category}
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.date}</div>
                  <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> By {post.author}</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground leading-tight group-hover:text-[#14b8a6] transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-light mb-8 flex-grow">
                  {post.excerpt}
                </p>
                <button className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-[#14b8a6] transition-colors duration-300">
                  Read Article <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="md:hidden mt-12 w-full py-4 bg-secondary text-foreground rounded-2xl flex items-center justify-center gap-2 font-bold transition-all">
          View All Posts <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default Blog;
