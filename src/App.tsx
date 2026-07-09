import React, { useState } from 'react';
import { 
  Settings, Heart, Shield, Users, Database, LayoutDashboard, 
  UserCheck, AlertCircle, FileCode, CheckCircle, HelpCircle, ArrowRightLeft, User
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BottomNav } from './components/Navigation';
import { Dashboard } from './screens/Dashboard';
import { Discovery } from './screens/Discovery';
import { Interests } from './screens/Interests';
import { ProfileDetail } from './screens/ProfileDetail';
import { Profile } from './screens/Profile';
import { ToastProvider } from './context/ToastContext';
import { SuperAdminDashboard } from './screens/SuperAdminDashboard';
import { CommunityAdminDashboard } from './screens/CommunityAdminDashboard';
import { SubscriptionPage } from './screens/SubscriptionPage';
import { LandingPage } from './screens/LandingPage';

type AppRole = 'SUPER_ADMIN' | 'COMMUNITY_ADMIN' | 'USER';

export default function App() {
  // Active Role State
  const [activeRole, setActiveRole] = useState<AppRole>('USER');

  // User tab
  const [currentTab, setCurrentTab] = useState('landing');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Community Admin state
  const [selectedCasteAdmin, setSelectedCasteAdmin] = useState({
    id: 'c-1',
    name: 'Maratha',
    username: 'maratha_admin'
  });

  const handleProfileClick = (id: string) => {
    setSelectedProfileId(id);
  };

  // Switch community admin roster
  const castes = [
    { id: 'c-1', name: 'Maratha', username: 'maratha_admin' },
    { id: 'c-2', name: 'Kunbi', username: 'kunbi_admin' },
    { id: 'c-5', name: 'Brahmin', username: 'brahmin_admin' }
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-on-background relative w-full flex flex-col md:flex-row">
        
        {/* ==========================================
            ROLE CONTROLLER FLOATING PANEL (HUD)
            ========================================== */}
        <div className="fixed bottom-20 md:bottom-6 right-6 z-[999] bg-inverse-surface text-inverse-on-surface p-3 rounded-2xl shadow-xl flex flex-col gap-2 border border-primary/20 max-w-[280px]">
          <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-secondary-container" />
            <span className="text-[10px] font-bold tracking-wider uppercase font-sans">Role Switcher HUD</span>
          </div>
          <div className="flex flex-col gap-1 font-sans text-xs">
            <button 
              onClick={() => { setActiveRole('USER'); setCurrentTab('dashboard'); }}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all font-semibold ${
                activeRole === 'USER' ? 'bg-primary text-white' : 'hover:bg-white/10 text-neutral-300'
              }`}
            >
              <span>User Profile (SoulMate)</span>
              <User className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setActiveRole('SUPER_ADMIN')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all font-semibold ${
                activeRole === 'SUPER_ADMIN' ? 'bg-primary text-white' : 'hover:bg-white/10 text-neutral-300'
              }`}
            >
              <span>Super Admin Portal</span>
              <Shield className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setActiveRole('COMMUNITY_ADMIN')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all font-semibold ${
                activeRole === 'COMMUNITY_ADMIN' ? 'bg-primary text-white' : 'hover:bg-white/10 text-neutral-300'
              }`}
            >
              <span>Caste Admin Portal</span>
              <UserCheck className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Context switches if Caste Admin */}
          {activeRole === 'COMMUNITY_ADMIN' && (
            <div className="mt-1 pt-1.5 border-t border-white/10 space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Assigned Caste Admin:</p>
              <div className="flex gap-1">
                {castes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCasteAdmin(c)}
                    className={`flex-1 py-1 text-[9px] font-bold rounded transition-all ${
                      selectedCasteAdmin.id === c.id ? 'bg-secondary-container text-on-secondary-container' : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==========================================
            LAYOUT: STANDARD USER CLIENT FLOW
            ========================================== */}
        {activeRole === 'USER' && (
          currentTab === 'landing' ? (
            <div className="w-full min-h-screen bg-slate-50">
              <LandingPage onEnterApp={(tab) => {
                setCurrentTab(tab || 'dashboard');
              }} />
            </div>
          ) : (
            <div className="min-h-screen bg-background text-on-background relative w-full max-w-md mx-auto md:max-w-2xl md:border-x border-primary/5 md:shadow-2xl flex flex-col justify-between">
              {/* Top Bar Header */}
              {!selectedProfileId && (
                <header className="sticky top-0 w-full z-50 bg-surface shadow-sm h-16 flex items-center justify-between px-5 border-b border-primary/5">
                  <div 
                    className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                    onClick={() => setCurrentTab('landing')}
                  >
                    <div className="text-primary flex items-center justify-center">
                      <Heart className="w-6 h-6 fill-current animate-pulse" />
                    </div>
                    <h1 className="font-heading text-2xl font-bold text-primary">SoulMate</h1>
                  </div>
                  <button 
                    onClick={() => setActiveRole('SUPER_ADMIN')} 
                    className="text-on-surface-variant hover:text-primary active:scale-95 transition-transform p-2 border border-primary/10 rounded-xl bg-surface-container-low"
                    title="Switch to Admin Mode"
                  >
                    <Shield className="w-4 h-4 text-primary" />
                  </button>
                </header>
              )}

              {/* Content Area */}
              <main className="w-full flex-grow">
                {currentTab === 'dashboard' && <Dashboard setCurrentTab={setCurrentTab} />}
                {currentTab === 'discovery' && <Discovery onProfileClick={handleProfileClick} />}
                {currentTab === 'interests' && <Interests />}
                {currentTab === 'premium' && <SubscriptionPage />}
                {currentTab === 'profile' && <Profile />}
              </main>

              {/* Bottom Navigation */}
              {!selectedProfileId && (
                <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
              )}

              {/* Overlays Detail */}
              <AnimatePresence>
                {selectedProfileId && (
                  <ProfileDetail 
                    profileId={selectedProfileId} 
                    onBack={() => setSelectedProfileId(null)} 
                    onUpgradeClick={() => {
                      setCurrentTab('premium');
                      setSelectedProfileId(null);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          )
        )}

        {/* ==========================================
            LAYOUT: ADMINISTRATOR VIEWS (SUPER & CASTE)
            ========================================== */}
        {(activeRole === 'SUPER_ADMIN' || activeRole === 'COMMUNITY_ADMIN') && (
          <div className="flex-grow flex flex-col min-h-screen bg-background text-on-background">
            
            {/* Header top bar for Admins */}
            <header className="sticky top-0 w-full z-50 bg-surface border-b border-outline-variant/30 h-16 flex items-center justify-between px-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-primary flex items-center justify-center bg-primary/5 p-2 rounded-xl">
                  <Shield className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h1 className="font-heading text-lg font-bold text-primary leading-tight">SoulMate Admin Portal</h1>
                  <p className="text-[10px] text-on-surface-variant uppercase font-sans font-bold">
                    Authenticated: {activeRole === 'SUPER_ADMIN' ? 'Super Admin (Full Acc)' : `Caste Admin (${selectedCasteAdmin.name} community)`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-secondary font-bold font-sans bg-secondary-container/20 px-2 py-0.5 rounded-full border border-secondary/15 animate-pulse">
                  ● Secure Node Online
                </span>
              </div>
            </header>

            {/* Inner Admin Canvas Workspace with Sidebar Grid */}
            <div className="flex-grow flex flex-col lg:flex-row">
              
              {/* Left Admin Navigation Sidebar */}
              <aside className="w-full lg:w-64 bg-surface-container-low border-r border-outline-variant/30 p-5 space-y-6">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest pl-2">Console Scope</p>
                  <div className="p-3 bg-surface rounded-xl border border-primary/5 shadow-sm space-y-1 font-sans">
                    <p className="text-xs font-bold text-primary">Signed Operator:</p>
                    <p className="text-[11px] text-on-surface-variant font-medium truncate">
                      {activeRole === 'SUPER_ADMIN' ? 'admin@soulmate.org' : selectedCasteAdmin.username}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 font-sans text-xs font-bold text-on-surface-variant">
                  <div className="space-y-1">
                    <p className="text-[9px] text-on-surface-variant/70 uppercase tracking-widest pl-2">Core Services</p>
                    <div className="p-1.5 bg-primary text-white rounded-lg flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Console Dashboard</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Workspace Frame */}
              <main className="flex-1 p-6 space-y-8 bg-surface-container-low/10 overflow-y-auto">
                {activeRole === 'SUPER_ADMIN' ? (
                  <SuperAdminDashboard />
                ) : (
                  <CommunityAdminDashboard 
                    assignedCommunityId={selectedCasteAdmin.id} 
                    assignedCommunityName={selectedCasteAdmin.name} 
                    adminUsername={selectedCasteAdmin.username}
                  />
                )}
              </main>

            </div>

          </div>
        )}

      </div>
    </ToastProvider>
  );
}
