import React, { useState } from 'react';
import { Mail, MessageCircle, Send, MapPin, Loader2 } from 'lucide-react';
import api from '../../api/client';
import { toast } from 'react-hot-toast';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/contact/submit', formData);
      if (response.data.success) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error(response.data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact error:', error);
      toast.error(error.response?.data?.error || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact-us" className="py-24 bg-background dark:bg-black/5 transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Info Side */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
              Get in <span className="text-[#14b8a6]">Touch.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-12 font-light leading-relaxed">
              Have questions about our AI platform or your career path? Our team of experts is here to help you navigate every step of your journey.
            </p>
            
            <div className="space-y-8">
              {[
                { icon: <Mail className="w-5 h-5" />, label: 'Email Support', detail: 'intervaiplatform@gmail.com' },
                { icon: <MessageCircle className="w-5 h-5" />, label: 'Live Chat', detail: 'Available 24/7 for premium members' },
                { icon: <MapPin className="w-5 h-5" />, label: 'Headquarters', detail: 'Innovation Hub, San Francisco, CA' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-[#14b8a6] group-hover:scale-110 transition-all duration-500 border border-border/50">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-lg font-bold text-foreground leading-none">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full lg:w-1/2">
            <div className="p-10 rounded-[3rem] bg-card border border-border shadow-none relative overflow-hidden">
                <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/70 ml-2">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe" 
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-secondary border border-border focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] outline-none transition-all duration-300 text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/70 ml-2">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com" 
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-secondary border border-border focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] outline-none transition-all duration-300 text-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-foreground/70 ml-2">Message</label>
                     <textarea 
                       name="message"
                       value={formData.message}
                       onChange={handleChange}
                       rows="4"
                       placeholder="How can we help you?"
                       required
                       className="w-full px-6 py-4 rounded-2xl bg-secondary border border-border focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] outline-none transition-all duration-300 text-foreground resize-none"
                     ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#14b8a6] to-[#059669] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-300 active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Send Message <Send className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                      </>
                    )}
                  </button>
               </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
