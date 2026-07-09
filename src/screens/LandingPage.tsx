import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, CheckCircle2, Shield, Users, Search, Sparkles, 
  MapPin, GraduationCap, ChevronRight, ChevronLeft, Quote, MessageSquare, 
  PhoneCall, Lock, ArrowRight, UserCheck, Star, Award
} from 'lucide-react';
import { PROFILES } from '../data';

interface LandingPageProps {
  onEnterApp: (tab?: string) => void;
}

// Cinematic scroll-reveal animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export function LandingPage({ onEnterApp }: LandingPageProps) {
  // Interactive Match Finder State
  const [selectedCommunity, setSelectedCommunity] = useState('All Communities');
  const [selectedAge, setSelectedAge] = useState('22-28');
  const [selectedGender, setSelectedGender] = useState('Female');

  // Carousel Active Index State
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const communities = ['All Communities', 'Maratha', 'Kunbi', 'Brahmin', 'Patel', 'Iyer', 'Reddy'];
  const ageRanges = ['20-25', '22-28', '25-30', '28-35'];

  // Testimonials
  const successStories = [
    {
      id: 1,
      couple: "Arjun & Priyanka (Maratha)",
      story: "We found our perfect match through the Maratha community filter. Within 3 months of connecting, our families met and we got married. Extremely secure and trusted platform!",
      year: "Married in 2025",
      image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=400",
      location: "Pune, Maharashtra"
    },
    {
      id: 2,
      couple: "Rohan & Sneha (Brahmin)",
      story: "The direct chat option and verified profiles made the process so easy and comfortable. I was looking for someone with similar family values and found her here in no time.",
      year: "Married in 2026",
      image: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&q=80&w=400",
      location: "Bengaluru, Karnataka"
    },
    {
      id: 3,
      couple: "Vikram & Aditi (Patel)",
      story: "My parents were very particular about community values. SoulMate allowed us to filter profiles precisely. After matching, we talked for two weeks and knew we were meant to be together.",
      year: "Married in 2025",
      image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=400",
      location: "Ahmedabad, Gujarat"
    },
    {
      id: 4,
      couple: "Karthik & Divya (Iyer)",
      story: "We were both busy working professionals. SoulMate's detailed education and lifestyle tags helped us find compatibility effortlessly. The matchmaker service was absolutely excellent!",
      year: "Married in 2026",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400",
      location: "Chennai, Tamil Nadu"
    }
  ];

  // Features list
  const features = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "100% Verified Profiles",
      description: "Every profile is manually audited by community managers with mandatory Aadhaar & government ID verification."
    },
    {
      icon: <Users className="w-6 h-6 text-secondary" />,
      title: "Community Specific Filters",
      description: "Search matches seamlessly within your specific sub-caste, community, lineage, or family values."
    },
    {
      icon: <Lock className="w-6 h-6 text-tertiary" />,
      title: "Strict Privacy Controls",
      description: "Control who can see your photos, contact details, and phone number. Encrypted and secured safely."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      title: "Premium Matchmaking Support",
      description: "Personalized assistance from dedicated community managers to help find handpicked elite suggestions."
    }
  ];

  // Statistics
  const stats = [
    { value: "50,000+", label: "Verified Members" },
    { value: "12,000+", label: "Happy Marriages" },
    { value: "98.4%", label: "Trust Score" },
    { value: "15+", label: "Communities Supported" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
      {/* Premium Navbar */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-slate-200/60 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onEnterApp('dashboard')}>
            <div className="text-primary bg-primary/10 p-2.5 rounded-2xl flex items-center justify-center">
              <Heart className="w-7 h-7 fill-current text-primary animate-pulse" />
            </div>
            <div>
              <span className="font-heading text-2xl font-black tracking-tight text-primary">SoulMate</span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Community Matrimony</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => onEnterApp('discovery')} className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Browse Profiles</button>
            <button onClick={() => {
              const el = document.getElementById('features');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Our Trust Features</button>
            <button onClick={() => onEnterApp('premium')} className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Premium Plans</button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onEnterApp('dashboard')}
              className="px-5 py-2.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl text-sm font-bold transition-all active:scale-95 border border-primary/10"
            >
              Sign In
            </button>
            <button 
              onClick={() => onEnterApp('discovery')}
              className="hidden sm:inline-flex px-6 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md shadow-primary/20 hover:shadow-primary/30"
            >
              Join Free Now
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-white via-primary/5 to-slate-50">
        {/* Background Art Accents */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[450px] h-[450px] bg-secondary/10 rounded-full filter blur-3xl opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Side Content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={slideInLeft}
            className="lg:col-span-7 space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              India's Premier Community Matchmaking Portal
            </div>

            <div className="space-y-4">
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Find Your Perfect Life Partner Within Your <span className="text-primary relative inline-block">Community <Heart className="absolute -right-10 -top-2 w-8 h-8 text-primary fill-current animate-bounce hidden md:block" /></span> ❤️
              </h1>
              <p className="font-sans text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-medium">
                Join thousands of verified members searching for meaningful relationships. Our secure platform helps you find compatible matches based on your community, values, education, and lifestyle.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button 
                onClick={() => onEnterApp('profile')}
                className="px-8 py-4 bg-primary hover:bg-primary/95 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 text-base flex items-center justify-center gap-2 active:scale-95 group"
              >
                ❤️ Create Free Profile
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button 
                onClick={() => onEnterApp('discovery')}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-extrabold rounded-2xl transition-all text-base flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                🔍 Browse Profiles
              </button>
            </div>

            {/* Checkmarks / Trust Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200/80">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>100% Verified Profiles</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Safe & Secure Platform</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Trusted by Thousands of Families</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Privacy Protected</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side Content - Elegant Card Showcase */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInScale}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-[380px] sm:max-w-md bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 z-10 space-y-6">
              {/* Premium Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-heading text-lg font-extrabold text-slate-800">Verified Connections</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SoulMate Handpicked Matches</p>
                </div>
                <span className="bg-amber-100 text-amber-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200">
                  <Award className="w-3.5 h-3.5" />
                  Premium
                </span>
              </div>

              {/* Sample Profile Cards with Framer Motion Stack */}
              <div className="relative h-[290px] w-full flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  {PROFILES.slice(0, 2).map((profile, i) => (
                    <motion.div
                      key={profile.id}
                      style={{ 
                        zIndex: 10 - i,
                        rotate: i === 0 ? -3 : 4,
                        scale: i === 0 ? 1 : 0.95,
                        y: i === 0 ? 0 : 15
                      }}
                      className="absolute top-0 w-[240px] bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col p-3 space-y-3"
                    >
                      <div className="relative h-44 rounded-2xl overflow-hidden">
                        <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        {profile.verified && (
                          <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white p-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3 fill-current" />
                          </span>
                        )}
                        <div className="absolute bottom-2.5 left-2.5 text-white">
                          <p className="text-xs font-bold">{profile.name}, {profile.age}</p>
                          <p className="text-[9px] opacity-80">{profile.location}</p>
                        </div>
                      </div>

                      <div className="text-[10px] space-y-1">
                        <div className="flex justify-between font-medium text-slate-500">
                          <span>Occupation:</span>
                          <span className="font-bold text-slate-800">{profile.occupation}</span>
                        </div>
                        <div className="flex justify-between font-medium text-slate-500">
                          <span>Community:</span>
                          <span className="font-bold text-primary">{profile.community || 'General'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Instant Match Searcher */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-primary" />
                  Quick search in your community:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                  <select 
                    value={selectedCommunity} 
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {communities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button 
                    onClick={() => onEnterApp('discovery')}
                    className="p-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-center active:scale-95 transition-all shadow-sm shadow-primary/10"
                  >
                    Find Match
                  </button>
                </div>
              </div>
            </div>

            {/* Glowing Accent Ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-[36px] filter blur-xl opacity-20 -z-10 translate-x-4 translate-y-4" />
          </motion.div>
        </div>
      </section>

      {/* Trust Stats Counter */}
      <section className="bg-white border-y border-slate-200/50 py-12 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
          >
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                className="space-y-1"
              >
                <p className="text-3xl sm:text-4xl font-black text-primary font-heading tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Value Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-slate-50 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="text-primary font-extrabold text-xs uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full">
              Why Choose SoulMate
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              A Platform Built On Pure Trust & Traditional Family Values
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Our unique approach is focused on security, compatibility, and community values to ensure you find a partner who aligns with your soul and lineage.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feat, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-slate-800">{feat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{feat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Success Stories Testimonials Carousel */}
      <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="text-emerald-600 font-extrabold text-xs uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-full">
              Real Love Stories
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Thousands of Couples Met on SoulMate
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              See how verified members found their beautiful life partners and started their happily ever afters.
            </p>
          </motion.div>

          {/* Carousel Frame */}
          <div className="relative max-w-4xl mx-auto px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStoryIndex}
                initial={{ opacity: 0, x: 50, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-slate-50/80 rounded-[32px] border border-slate-200/60 p-6 sm:p-10 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-12 relative min-h-[340px]"
              >
                {/* Image Showcase */}
                <div className="w-full md:w-1/3 aspect-[4/3] md:aspect-square rounded-3xl overflow-hidden relative shadow-md flex-shrink-0 group">
                  <img 
                    src={successStories[activeStoryIndex].image} 
                    alt={successStories[activeStoryIndex].couple} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/90 rounded-full">Verified Match</span>
                  </div>
                </div>

                {/* Narrative Details */}
                <div className="flex-1 text-left space-y-4 relative">
                  <div className="absolute -top-6 md:-top-10 -left-2 opacity-10">
                    <Quote className="w-16 h-16 text-emerald-600 fill-current" />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] text-emerald-600 font-extrabold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                      {successStories[activeStoryIndex].year}
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {successStories[activeStoryIndex].location}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                    {successStories[activeStoryIndex].couple}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed italic pr-4">
                    "{successStories[activeStoryIndex].story}"
                  </p>

                  <div className="pt-4 border-t border-slate-200/60 flex items-center gap-2">
                    <div className="text-xs text-slate-400 font-bold">Matched & verified within the community</div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Side Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-8 z-20">
              <button
                onClick={() => {
                  setActiveStoryIndex((prev) => 
                    prev === 0 ? successStories.length - 1 : prev - 1
                  );
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200/80 shadow-md flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/30 transition-all active:scale-90"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-8 z-20">
              <button
                onClick={() => {
                  setActiveStoryIndex((prev) => 
                    prev === successStories.length - 1 ? 0 : prev + 1
                  );
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200/80 shadow-md flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/30 transition-all active:scale-90"
                aria-label="Next story"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Carousel Dot Indicators */}
          <div className="flex justify-center items-center gap-2.5 pt-4">
            {successStories.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStoryIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  activeStoryIndex === index 
                    ? "w-8 h-2.5 bg-primary" 
                    : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Pricing Preview Section */}
      <section className="py-20 lg:py-28 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="text-primary font-extrabold text-xs uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full">
              Premium Memberships
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Choose the Plan That Fits Your Search
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Premium members get 10x higher matching rates, direct calling access, and dedicated advisors.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {/* Silver Plan */}
            <motion.div 
              variants={fadeInScale}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between text-left space-y-6"
            >
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-500">Silver Plan</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹499</span>
                  <span className="text-xs font-bold text-slate-400">/ 3 Months</span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Excellent entry-level plan to begin direct communication with interested matches.
                </p>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>View 15 Verified Mobile Numbers</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Send Unlimited Interests</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Basic Matching Filters</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onEnterApp('premium')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition-all"
              >
                Choose Silver
              </button>
            </motion.div>

            {/* Gold Plan */}
            <motion.div 
              variants={fadeInScale}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white p-8 rounded-3xl border-2 border-primary shadow-lg relative overflow-hidden flex flex-col justify-between text-left space-y-6"
            >
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <h4 className="text-base font-bold text-primary">Gold Plan</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹999</span>
                  <span className="text-xs font-bold text-slate-400">/ 3 Months</span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Highly recommended. Unlocks active communication and boosts profile visibility.
                </p>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>View 40 Verified Mobile Numbers</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Direct WhatsApp & Chat</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Profile Boosted 3x in Search</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>View Horoscope Matches</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onEnterApp('premium')}
                className="w-full py-3 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold rounded-xl shadow-md shadow-primary/20 transition-all"
              >
                Choose Gold
              </button>
            </motion.div>

            {/* Platinum Plan */}
            <motion.div 
              variants={fadeInScale}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between text-left space-y-6"
            >
              <div className="space-y-4">
                <h4 className="text-base font-bold text-amber-600">Platinum Plan</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹1999</span>
                  <span className="text-xs font-bold text-slate-400">/ 6 Months</span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Ultimate tier offering personalized matchmaking support from dedicated experts.
                </p>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>View Unlimited Mobile Numbers</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Dedicated Personal Matchmaker</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Featured Elite Profile Badge</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Pre-screened Parental Calls</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onEnterApp('premium')}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all"
              >
                Choose Platinum
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Safe Guard Panel */}
      <motion.section 
        variants={fadeInScale}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="bg-primary/5 py-16 border-y border-primary/10 overflow-hidden"
      >
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <Shield className="w-12 h-12 text-primary mx-auto" />
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Your Security & Safety is Our #1 Priority</h2>
          <p className="text-slate-600 font-medium text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            At SoulMate, we are strictly committed to keeping your profile details private. Every single phone number is locked by default. Only users with a mutually accepted interest or subscription can initiate direct contact with your consent.
          </p>
          <div className="flex justify-center items-center gap-4 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-500" /> Secure Encryption</span>
            <span className="flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-emerald-500" /> ID Verified Only</span>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-slate-900 text-white py-16 border-t border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 fill-current text-primary" />
              <span className="font-heading text-xl font-bold tracking-tight">SoulMate</span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              India's premium, community-first matrimony matchmaking network. Helping you find your perfect life partner securely and traditionally.
            </p>
          </div>
          <div>
            <h5 className="font-sans text-sm font-bold text-white mb-4">Core Links</h5>
            <ul className="text-xs text-slate-400 font-medium space-y-2">
              <li><button onClick={() => onEnterApp('discovery')} className="hover:text-primary transition-colors">Search Partners</button></li>
              <li><button onClick={() => onEnterApp('premium')} className="hover:text-primary transition-colors">Premium Plans</button></li>
              <li><button onClick={() => onEnterApp('interests')} className="hover:text-primary transition-colors">Interests Tab</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-sans text-sm font-bold text-white mb-4">Safety & Privacy</h5>
            <ul className="text-xs text-slate-400 font-medium space-y-2">
              <li><button onClick={() => onEnterApp('dashboard')} className="hover:text-primary transition-colors">Aadhaar Verification</button></li>
              <li><button onClick={() => onEnterApp('dashboard')} className="hover:text-primary transition-colors">Secure Encrypted Chats</button></li>
              <li><button onClick={() => onEnterApp('profile')} className="hover:text-primary transition-colors">Photo Visibility Settings</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-sans text-sm font-bold text-white mb-4">Contact Support</h5>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Have questions or need assistance? Reach out to our dedicated support managers.<br/>
              <span className="font-bold text-white block mt-2">support@soulmate.org</span>
              <span className="font-bold text-white block">1800-309-9000 (Toll Free)</span>
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 mt-12 pt-6 text-center text-xs text-slate-500 font-bold">
          <p>© 2026 SoulMate Community Matrimony. All rights reserved. Made in India with Love.</p>
        </div>
      </motion.footer>
    </div>
  );
}
