import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, Clock, CheckCircle2, X } from 'lucide-react';
import { PROFILES } from '../data';
import { useToast } from '../context/ToastContext';

interface DashboardProps {
  setCurrentTab?: (tab: string) => void;
}

export function Dashboard({ setCurrentTab }: DashboardProps) {
  const { showToast } = useToast();
  const newMatches = PROFILES.slice(0, 3);

  // Dynamic state for received interests
  const [receivedInterests, setReceivedInterests] = useState([
    {
      id: 'interest-1',
      name: 'Aditi Verma',
      profile: PROFILES[2],
      type: 'interest',
      time: '2h ago',
      verified: true
    },
    {
      id: 'interest-2',
      name: 'Ritika Sen',
      profile: PROFILES[1],
      type: 'visit',
      time: 'Yesterday',
      verified: false
    }
  ]);

  const handleAccept = (id: string, name: string) => {
    setReceivedInterests(prev => prev.filter(item => item.id !== id));
    showToast(`You accepted ${name}'s interest! Connection is now active.`, 'success');
  };

  const handleDismiss = (id: string, name: string) => {
    setReceivedInterests(prev => prev.filter(item => item.id !== id));
    showToast(`Notification for ${name} dismissed.`, 'info');
  };

  const handleViewAll = () => {
    showToast('Showing all personalized handpicked matches!', 'info');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 pt-6 px-5 max-w-2xl mx-auto space-y-8"
    >
      {/* Welcome Greeting */}
      <section className="space-y-1">
        <h2 className="font-heading text-2xl font-bold text-on-surface">Welcome back, Arnav</h2>
        <p className="font-sans text-sm text-on-surface-variant">Your journey to finding the perfect match continues.</p>
      </section>

      {/* Premium Upgrade Promotion Banner */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 border border-primary/10 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
            <span className="text-yellow-500">👑</span> Premium Membership Active
          </h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Get 10x more connections, unlimited chats, view profile contact details, and unlock premium matching status.
          </p>
        </div>
        <button 
          onClick={() => {
            if (setCurrentTab) {
              setCurrentTab('premium');
            } else {
              showToast('Navigate to the Premium tab to see subscription pricing & options.', 'info');
            }
          }}
          className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs px-4 py-2 rounded-xl shrink-0 transition-transform active:scale-95 shadow-sm"
        >
          View Plans
        </button>
      </section>

      {/* New Matches */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="font-sans text-lg font-semibold text-on-surface">New Matches</h3>
          <button onClick={handleViewAll} className="font-sans text-sm font-semibold text-primary hover:underline">View All</button>
        </div>
        
        <div className="flex overflow-x-auto gap-4 hide-scrollbar -mx-5 px-5 pb-2">
          {newMatches.map((profile) => (
            <div key={profile.id} className="flex-none w-60 bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(4,30,41,0.04)] overflow-hidden relative border border-primary/5 active:scale-[0.98] transition-transform duration-200">
              <div className="relative h-72">
                <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-transparent to-transparent"></div>
                
                {profile.verified && (
                  <div className="absolute top-3 right-3 bg-tertiary-fixed text-on-tertiary-fixed px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-tertiary" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">Verified</span>
                  </div>
                )}
                
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="font-sans text-lg font-semibold">{profile.name}, {profile.age}</p>
                  <p className="text-xs opacity-90">{profile.occupation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => showToast('Total views tracked automatically in real time.', 'info')}
          className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 shadow-sm border border-primary/5 cursor-pointer active:scale-98 transition-transform"
        >
          <Eye className="w-8 h-8 text-primary" />
          <p className="font-heading text-3xl font-bold text-primary">124</p>
          <p className="font-sans text-xs text-on-surface-variant uppercase tracking-widest font-medium">Profile Views</p>
        </div>
        <div 
          onClick={() => showToast('Recent visits display guests who loaded your profile.', 'info')}
          className="bg-secondary-container/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 shadow-sm border border-secondary/10 cursor-pointer active:scale-98 transition-transform"
        >
          <Clock className="w-8 h-8 text-secondary" />
          <p className="font-heading text-3xl font-bold text-secondary">42</p>
          <p className="font-sans text-xs text-on-surface-variant uppercase tracking-widest font-medium">Recent Visits</p>
        </div>
      </section>

      {/* Received Interests */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="font-sans text-lg font-semibold text-on-surface">Received Interests</h3>
          {receivedInterests.length > 0 && (
            <span className="bg-primary-container text-on-primary-container font-sans text-xs px-2 py-0.5 rounded-full font-medium">
              {receivedInterests.length} New
            </span>
          )}
        </div>
        
        {receivedInterests.length > 0 ? (
          <div className="space-y-2">
            {receivedInterests.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 shadow-[0_4px_20px_rgba(4,30,41,0.04)] border border-primary/5">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-none">
                  <img src={item.profile.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <p className="font-sans text-sm font-semibold text-on-surface flex items-center gap-1">
                    {item.name} {item.verified && <CheckCircle2 className="w-3 h-3 text-primary" />}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {item.type === 'interest' ? 'Sent you an interest' : 'Viewed your profile'} • {item.time}
                  </p>
                </div>
                {item.type === 'interest' ? (
                  <button 
                    onClick={() => handleAccept(item.id, item.name)}
                    className="bg-primary hover:bg-primary-container text-white hover:text-on-primary-container px-4 py-2 rounded-full font-sans text-xs font-medium transition-all shadow-sm"
                  >
                    Accept
                  </button>
                ) : (
                  <button 
                    onClick={() => handleDismiss(item.id, item.name)}
                    className="border border-outline text-on-surface-variant px-4 py-2 rounded-full font-sans text-xs font-medium transition-all"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant text-center py-6">No new received interests or visits.</p>
        )}
      </section>
    </motion.div>
  );
}
