import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, CheckCircle2, MapPin, Briefcase, Heart, X, Star } from 'lucide-react';
import { PROFILES } from '../data';
import { useToast } from '../context/ToastContext';

interface DiscoveryProps {
  onProfileClick: (id: string) => void;
}

function DiscoverySkeleton() {
  return (
    <div className="px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i} 
          className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 animate-pulse flex flex-col justify-end p-5 border border-slate-200/50"
        >
          {/* Skeleton Top-Right Badge */}
          <div className="absolute top-4 right-4 bg-slate-200 dark:bg-slate-700 w-20 h-7 rounded-full"></div>
          
          {/* Bottom Info Section */}
          <div className="space-y-4 z-10 w-full">
            {/* Name and Age */}
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-3/5"></div>
            
            {/* Subtext info */}
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-4/5 flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-600 flex-shrink-0"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
              </div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4 flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-600 flex-shrink-0"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="flex justify-end gap-2 pt-2">
              <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Discovery({ onProfileClick }: DiscoveryProps) {
  const { showToast } = useToast();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [profession, setProfession] = useState('');
  const [selectedReligion, setSelectedReligion] = useState<string | null>(null);

  // Applied Filter States
  const [appliedFilters, setAppliedFilters] = useState({
    minAge: '',
    maxAge: '',
    profession: '',
    community: null as string | null
  });

  // Simulation of first page load
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Simulation of search query debounce and reload
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    setIsLoading(true);
    setTimeout(() => {
      setAppliedFilters({
        minAge,
        maxAge,
        profession,
        community: selectedReligion
      });
      setIsLoading(false);

      let summaryParts = [];
      if (minAge || maxAge) summaryParts.push(`Age: ${minAge || 18}-${maxAge || 60}`);
      if (profession) summaryParts.push(`Profession: ${profession}`);
      if (selectedReligion) summaryParts.push(`Religion: ${selectedReligion}`);

      const msg = summaryParts.length > 0 
        ? `Filters applied: ${summaryParts.join(', ')}` 
        : 'Filters applied successfully!';
      showToast(msg, 'success');
    }, 800);
  };

  const handleClearFilters = () => {
    setMinAge('');
    setMaxAge('');
    setProfession('');
    setSelectedReligion(null);
    setIsFilterOpen(false);
    setIsLoading(true);
    setTimeout(() => {
      setAppliedFilters({
        minAge: '',
        maxAge: '',
        profession: '',
        community: null
      });
      setIsLoading(false);
      showToast('Filters cleared successfully.', 'info');
    }, 600);
  };

  const handleLike = (name: string) => {
    showToast(`Interest request sent to ${name.split(' ')[0]}!`, 'success');
  };

  const [savedProfileIds, setSavedProfileIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saved_interests_profiles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleSave = (e: React.MouseEvent, profileId: string, profileName: string) => {
    e.stopPropagation();
    const isSaved = savedProfileIds.includes(profileId);
    let updated: string[];
    if (isSaved) {
      updated = savedProfileIds.filter(id => id !== profileId);
      showToast(`${profileName.split(' ')[0]} removed from saved interests.`, 'info');
    } else {
      updated = [...savedProfileIds, profileId];
      showToast(`${profileName.split(' ')[0]} saved to your interests!`, 'success');
    }
    setSavedProfileIds(updated);
    localStorage.setItem('saved_interests_profiles', JSON.stringify(updated));
  };

  // Filter profile items dynamically
  const filteredProfiles = PROFILES.filter(profile => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        profile.name.toLowerCase().includes(q) ||
        profile.occupation.toLowerCase().includes(q) ||
        profile.location.toLowerCase().includes(q) ||
        (profile.community && profile.community.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    if (appliedFilters.minAge) {
      if (profile.age < parseInt(appliedFilters.minAge)) return false;
    }
    if (appliedFilters.maxAge) {
      if (profile.age > parseInt(appliedFilters.maxAge)) return false;
    }
    if (appliedFilters.profession) {
      const pFilter = appliedFilters.profession.toLowerCase();
      if (!profile.occupation.toLowerCase().includes(pFilter)) return false;
    }
    if (appliedFilters.community) {
      const relFilter = appliedFilters.community.toLowerCase();
      const isCommunityMatch = 
        (profile.community && profile.community.toLowerCase().includes(relFilter)) ||
        (profile.about && profile.about.toLowerCase().includes(relFilter));
      if (!isCommunityMatch) return false;
    }

    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 pt-4 min-h-screen bg-background"
    >
      {/* Search Header */}
      <div className="px-5 bg-surface pb-4 sticky top-16 z-40">
        <div className="flex gap-2">
          <div className="relative group flex-1">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search profiles or communities..." 
              className="w-full h-12 pl-12 pr-4 rounded-xl border-none bg-surface-container-low text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary transition-all duration-300 font-sans text-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary" />
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="w-12 h-12 flex-none flex items-center justify-center bg-primary text-white rounded-xl shadow-sm active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 hide-scrollbar">
          <button className="flex-none px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container font-sans text-sm font-semibold">
            {minAge || maxAge ? `Age: ${minAge || '18'}-${maxAge || '60'}` : 'Age: 24-30'}
          </button>
          <button className="flex-none px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container font-sans text-sm font-semibold">
            {selectedReligion || 'Community'}
          </button>
          <button className="flex-none px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container font-sans text-sm font-semibold">
            {profession || 'Location'}
          </button>
        </div>
      </div>

      <div className="px-5 mt-4 mb-4 flex justify-between items-end">
        <div>
          <p className="text-primary font-sans text-[10px] font-bold uppercase tracking-wider mb-1">Handpicked for you</p>
          <h2 className="font-heading text-2xl font-bold text-on-surface">Daily Discoveries</h2>
        </div>
        <span className="text-on-surface-variant font-sans text-xs font-medium">{filteredProfiles.length} Matches</span>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <DiscoverySkeleton />
          </motion.div>
        ) : filteredProfiles.length > 0 ? (
          <motion.div 
            key="grid"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredProfiles.map((profile, index) => (
              <motion.div 
                key={profile.id} 
                onClick={() => onProfileClick(profile.id)}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.96 },
                  show: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1, 
                    transition: { type: "spring", stiffness: 100, damping: 15 } 
                  }
                }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-surface-container-highest shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
              >
                <img src={profile.imageUrl} alt={profile.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/85 via-on-background/30 to-transparent"></div>
                
                {profile.verified && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-tertiary" />
                    <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Verified</span>
                  </div>
                )}
                
                <div className="absolute bottom-0 w-full p-5 text-white z-10">
                  <div className="flex justify-between items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-sans text-xl font-bold flex items-center gap-2 truncate">
                        {profile.name}, {profile.age}
                      </h3>
                      <div className="flex flex-col gap-1 mt-2 opacity-90 text-sm">
                        <span className="flex items-center gap-1.5 truncate">
                          <Briefcase className="w-4 h-4 flex-shrink-0" />
                          {profile.occupation}
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          {profile.location}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Quick-action Save to Interests Button */}
                      <button 
                        onClick={(e) => handleToggleSave(e, profile.id, profile.name)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all ${
                          savedProfileIds.includes(profile.id)
                            ? 'bg-amber-500 text-white'
                            : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/10'
                        }`}
                        title={savedProfileIds.includes(profile.id) ? "Saved in Interests" : "Save to Interests"}
                      >
                        <Star className={`w-5 h-5 ${savedProfileIds.includes(profile.id) ? 'fill-current' : ''}`} />
                      </button>

                      {/* Connect/Like Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(profile.name);
                        }}
                        className="w-11 h-11 rounded-full bg-white text-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:bg-primary-fixed-dim text-primary"
                        title="Send Interest request"
                      >
                        <Heart className="w-5 h-5 text-primary fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mx-5 py-16 text-center bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/50 p-6 space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-sans text-lg font-bold text-on-surface">No matches found</h3>
              <p className="text-on-surface-variant text-sm px-4">
                We couldn't find any profiles matching your search or filters. Try expanding your filters or clearing them.
              </p>
            </div>
            <button 
              onClick={handleClearFilters}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition-all"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Side Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            
            {/* Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-surface z-[70] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-outline-variant/30">
                <h3 className="font-heading text-xl font-bold text-primary">Filters</h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 -mr-2 text-on-surface-variant hover:text-primary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Age */}
                <div className="space-y-3">
                  <label className="font-sans text-sm font-semibold text-on-surface">Age Range</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input 
                        type="number" 
                        value={minAge}
                        onChange={(e) => setMinAge(e.target.value)}
                        placeholder="Min" 
                        className="w-full bg-surface-container-low border-b-2 border-primary/20 focus:border-primary outline-none py-3 px-3 rounded-t-lg text-sm font-sans text-on-surface" 
                      />
                    </div>
                    <span className="text-on-surface-variant">-</span>
                    <div className="flex-1">
                      <input 
                        type="number" 
                        value={maxAge}
                        onChange={(e) => setMaxAge(e.target.value)}
                        placeholder="Max" 
                        className="w-full bg-surface-container-low border-b-2 border-primary/20 focus:border-primary outline-none py-3 px-3 rounded-t-lg text-sm font-sans text-on-surface" 
                      />
                    </div>
                  </div>
                </div>

                {/* Profession */}
                <div className="space-y-3">
                  <label className="font-sans text-sm font-semibold text-on-surface">Profession</label>
                  <select 
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full bg-surface-container-low border-b-2 border-primary/20 focus:border-primary outline-none py-3 px-3 rounded-t-lg text-sm font-sans appearance-none text-on-surface"
                  >
                    <option value="">Any Profession</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Medical Professional">Medical Professional</option>
                    <option value="Finance/Banking">Finance/Banking</option>
                    <option value="Design/Architecture">Design/Architecture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Religion/Community */}
                <div className="space-y-3">
                  <label className="font-sans text-sm font-semibold text-on-surface">Religion / Community</label>
                  <div className="flex flex-wrap gap-2">
                    {['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Other'].map(rel => (
                      <button 
                        key={rel} 
                        onClick={() => setSelectedReligion(selectedReligion === rel ? null : rel)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold hover:bg-primary-container/10 transition-colors ${
                          selectedReligion === rel 
                            ? 'bg-primary border-primary text-white' 
                            : 'border-primary/20 text-on-surface-variant'
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-outline-variant/30 flex gap-3">
                <button onClick={handleClearFilters} className="flex-1 py-3 border border-primary text-primary rounded-xl font-sans text-sm font-semibold">
                  Clear
                </button>
                <button onClick={handleApplyFilters} className="flex-[2] py-3 bg-primary text-white rounded-xl font-sans text-sm font-semibold shadow-md">
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

