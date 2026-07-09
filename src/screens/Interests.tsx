import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Heart, Trash2, Star } from 'lucide-react';
import { PROFILES } from '../data';
import { useToast } from '../context/ToastContext';

function InterestsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Skeleton Title Row */}
      <div className="flex items-center justify-between">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-32 animate-pulse"></div>
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16 animate-pulse"></div>
      </div>

      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="bg-white/70 dark:bg-slate-800/60 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100 dark:border-slate-800/50 animate-pulse"
        >
          {/* Avatar Skeleton */}
          <div className="relative flex-shrink-0 w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          
          {/* Info block skeletons */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2"></div>
            
            {/* Buttons Skeleton */}
            <div className="flex gap-2 pt-1">
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1"></div>
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Interests() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'saved' | 'accepted'>('received');
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadSavedProfiles = () => {
    try {
      const saved = localStorage.getItem('saved_interests_profiles');
      const savedIds = saved ? JSON.parse(saved) : [];
      const filtered = PROFILES.filter(p => savedIds.includes(p.id));
      setSavedProfiles(filtered);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadSavedProfiles();
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleRemoveSaved = (id: string, name: string) => {
    try {
      const saved = localStorage.getItem('saved_interests_profiles');
      const savedIds = saved ? JSON.parse(saved) : [];
      const updated = savedIds.filter((pId: string) => pId !== id);
      localStorage.setItem('saved_interests_profiles', JSON.stringify(updated));
      showToast(`${name.split(' ')[0]} removed from saved interests.`, 'info');
      loadSavedProfiles();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendInterestFromSaved = (name: string) => {
    showToast(`Interest request sent to ${name.split(' ')[0]}!`, 'success');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 min-h-screen bg-background"
    >
      {/* Sticky Tabs */}
      <section className="sticky top-16 bg-surface/90 backdrop-blur-md z-40 border-b border-outline-variant/30">
        <div className="flex justify-around items-center px-4 relative">
          {(['received', 'sent', 'saved', 'accepted'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-4 px-2 font-sans text-sm font-semibold capitalize transition-colors ${
                activeTab === tab ? 'text-primary' : 'text-on-surface-variant opacity-60'
              }`}
            >
              {tab === 'saved' ? 'Saved' : tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="interest-tab"
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="px-5 pt-6 space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <InterestsSkeleton />
            </motion.div>
          ) : activeTab === 'received' ? (
            <motion.div 
              key="received"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-xl font-semibold text-on-surface">New Interests</h2>
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold">
                  3 New
                </span>
              </div>
              
              {PROFILES.slice(0, 3).map(profile => (
                <div key={profile.id} className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-primary/5">
                  <div className="relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-primary/10">
                    <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover" />
                    {profile.verified && (
                      <div className="absolute top-0 right-0 bg-tertiary-fixed rounded-full p-0.5">
                        <CheckCircle2 className="w-3 h-3 text-on-tertiary-fixed" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-sans text-sm font-semibold text-on-surface truncate">
                      {profile.name}
                    </h3>
                    <p className="text-xs font-medium text-on-surface-variant opacity-80 mb-2">
                      {profile.age} • {profile.occupation.split(' at ')[0]}
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold active:scale-95 transition-all shadow-sm">
                        Accept
                      </button>
                      <button className="flex-1 py-1.5 border border-primary text-primary rounded-lg text-xs font-semibold active:scale-95 transition-all">
                        Ignore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : activeTab === 'sent' ? (
            <motion.div 
              key="sent"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4 text-center py-12"
            >
              <p className="text-on-surface-variant text-sm">No pending sent interests.</p>
            </motion.div>
          ) : activeTab === 'saved' ? (
            <motion.div 
              key="saved"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-xl font-semibold text-on-surface">Saved Profiles</h2>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-500 animate-pulse" />
                  {savedProfiles.length} Saved
                </span>
              </div>
              
              {savedProfiles.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {savedProfiles.map(profile => (
                      <motion.div 
                        key={profile.id} 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-primary/5 hover:border-primary/20 transition-all group"
                      >
                        <div className="relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-primary/10">
                          <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover" />
                          {profile.verified && (
                            <div className="absolute top-0 right-0 bg-tertiary-fixed rounded-full p-0.5">
                              <CheckCircle2 className="w-3 h-3 text-on-tertiary-fixed" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-sans text-sm font-semibold text-on-surface truncate">
                            {profile.name}, {profile.age}
                          </h3>
                          <p className="text-xs font-medium text-on-surface-variant opacity-80 mb-2 truncate">
                            {profile.occupation} • {profile.location}
                          </p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleSendInterestFromSaved(profile.name)}
                              className="flex-1 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1 hover:bg-primary-container"
                            >
                              <Heart className="w-3 h-3 fill-current text-white" />
                              Send Interest
                            </button>
                            <button 
                              onClick={() => handleRemoveSaved(profile.id, profile.name)}
                              className="py-1.5 px-3 border border-error/20 text-error hover:bg-error/5 rounded-lg text-xs font-semibold active:scale-95 transition-all flex items-center justify-center"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/50 p-6 space-y-2">
                  <Star className="w-10 h-10 text-on-surface-variant/30 mx-auto" />
                  <p className="text-on-surface-variant text-sm font-medium">No saved profiles yet.</p>
                  <p className="text-on-surface-variant/60 text-xs px-6">
                    Browse profiles in the Discovery tab and tap the star icon to save them here for quick-actions.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="accepted"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4 text-center py-12"
            >
              <p className="text-on-surface-variant text-sm">You have no new accepted connections.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}
