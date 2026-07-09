import React from 'react';
import { LayoutDashboard, Search, Heart, User, Crown } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export function BottomNav({ currentTab, setCurrentTab }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discovery', label: 'Search', icon: Search },
    { id: 'interests', label: 'Interests', icon: Heart },
    { id: 'premium', label: 'Premium', icon: Crown },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface/90 backdrop-blur-md rounded-t-xl shadow-[0_-4px_20px_rgba(4,30,41,0.04)] border-t border-primary/10">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center relative p-2 transition-all duration-200 active:scale-95 ${
              isActive ? 'text-primary' : 'text-on-surface-variant opacity-60 hover:text-primary hover:opacity-100'
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            <span className="font-sans text-[10px] mt-1 font-medium tracking-wide">{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
