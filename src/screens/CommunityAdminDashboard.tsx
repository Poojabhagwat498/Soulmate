import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle2, AlertCircle, Award, Heart, MessageSquare, 
  MapPin, SlidersHorizontal, Eye, Send, Plus, X, Edit2, ShieldAlert, 
  Power, ShieldCheck, Mail, Shield, AlertTriangle, FileText, Check, HelpCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { MatrimonyUser, BroadcastNotification } from '../types/admin';

interface CommunityAdminDashboardProps {
  assignedCommunityId: string;
  assignedCommunityName: string;
  adminUsername: string;
}

export function CommunityAdminDashboard({ assignedCommunityId, assignedCommunityName, adminUsername }: CommunityAdminDashboardProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports' | 'chat' | 'broadcast'>('dashboard');

  // Load state
  const [isLoading, setIsLoading] = useState(false);

  // Core Community Data
  const [users, setUsers] = useState<MatrimonyUser[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Advanced Filters
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [eduFilter, setEduFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Modals / Detail Overlays
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<MatrimonyUser | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState<MatrimonyUser | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [editOcc, setEditOcc] = useState('');
  const [editLoc, setEditLoc] = useState('');
  const [editEdu, setEditEdu] = useState('');
  const [editInc, setEditInc] = useState('');
  const [editBio, setEditBio] = useState('');

  // Simulated Reports
  const reports = [
    { id: 'rep-1', userName: 'Rohan Patil', email: 'rohan.das@gmail.com', reason: 'Mismatch between bio claims and document spelling', reporter: 'Priya Sharma', date: '2026-07-06' },
    { id: 'rep-2', userName: 'Siddharth Mali', email: 'siddharth.mali@gmail.com', reason: 'Using blurred photo, verification rejected once', reporter: 'Admin System Flag', date: '2026-07-04' }
  ].filter(r => {
    // If the reported user belongs to this community
    // Let's check matching community. Rohan Patil is c-1 (Maratha). Siddharth Mali is c-3 (Mali).
    if (assignedCommunityName === 'Maratha') return r.userName === 'Rohan Patil';
    if (assignedCommunityName === 'Mali') return r.userName === 'Siddharth Mali';
    return false;
  });

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer comm-admin-${adminUsername}` // pass simulated token
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resUsers, resNotifs] = await Promise.all([
        fetch(`/api/users?communityId=${assignedCommunityId}`, { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/notifications', { headers: getHeaders() }).then(r => r.json())
      ]);

      if (Array.isArray(resUsers)) setUsers(resUsers);
      if (Array.isArray(resNotifs)) {
        // Only show broadcasts that are sent to this specific community or all users
        const communityNotifs = resNotifs.filter(n => n.recipientType === 'ALL_USERS' || (n.recipientType === 'SPECIFIC_COMMUNITY' && n.communityName === assignedCommunityName));
        setBroadcasts(communityNotifs);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [assignedCommunityId, activeTab]);

  const handleOpenEdit = (user: MatrimonyUser) => {
    setSelectedUserForEdit(user);
    setEditName(user.profile?.name || '');
    setEditAge(String(user.profile?.age || ''));
    setEditGender(user.profile?.gender || 'Male');
    setEditOcc(user.profile?.occupation || '');
    setEditLoc(user.profile?.location || '');
    setEditEdu(user.profile?.education || '');
    setEditInc(user.profile?.income || '');
    setEditBio(user.profile?.bio || '');
  };

  const handleSaveUserEdit = async () => {
    if (!selectedUserForEdit) return;
    try {
      const res = await fetch(`/api/users/${selectedUserForEdit.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: editName,
          age: editAge,
          gender: editGender,
          occupation: editOcc,
          location: editLoc,
          education: editEdu,
          income: editInc,
          bio: editBio
        })
      });
      if (res.ok) {
        showToast(`Profile of "${editName}" updated successfully!`, 'success');
        setSelectedUserForEdit(null);
        fetchData();
      }
    } catch (e) {
      showToast('Error saving user profile edits.', 'error');
    }
  };

  const handleToggleUserStatus = async (id: string, email: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/users/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`User status set to ${nextStatus}`, 'info');
        fetchData();
      }
    } catch (e) {
      showToast('Error changing account state.', 'error');
    }
  };

  const handleVerifyDocument = async (userId: string, status: 'APPROVED' | 'REJECTED' | 'REQUEST_REUPLOAD') => {
    try {
      const res = await fetch(`/api/users/${userId}/verify`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, notes: `Reviewed by Caste Admin: ${adminUsername}` })
      });
      if (res.ok) {
        showToast(`Member profile identity ${status.toLowerCase()} successfully.`, 'success');
        setShowVerifyModal(null);
        fetchData();
      }
    } catch (e) {
      showToast('Error reviewing identity documents.', 'error');
    }
  };

  const handleSendCommunityBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('Please enter both a title and announcement message.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          recipientType: 'SPECIFIC_COMMUNITY',
          communityId: assignedCommunityId
        })
      });
      if (res.ok) {
        showToast('Community broadcast announcement deployed successfully!', 'success');
        setBroadcastTitle('');
        setBroadcastMessage('');
        setActiveTab('dashboard');
        fetchData();
      }
    } catch (e) {
      showToast('Error deploying community broadcast.', 'error');
    }
  };

  // Calculations
  const communityMembers = users.filter(u => u.communityId === assignedCommunityId);
  const totalMembersCount = communityMembers.length;
  const verifiedCount = communityMembers.filter(u => u.profile?.verified).length;
  const pendingCount = communityMembers.filter(u => u.profile?.verificationStatus === 'PENDING').length;
  const reuploadCount = communityMembers.filter(u => u.profile?.verificationStatus === 'REQUEST_REUPLOAD').length;

  // Filter implementation
  const filteredUsers = communityMembers.filter(user => {
    const p = user.profile;
    const matchesSearch = p?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = genderFilter ? p?.gender === genderFilter : true;
    const matchesVerify = verificationFilter ? p?.verificationStatus === verificationFilter : true;
    
    // Advanced Filters
    const matchesMinAge = ageMin ? (p?.age || 0) >= Number(ageMin) : true;
    const matchesMaxAge = ageMax ? (p?.age || 0) <= Number(ageMax) : true;
    const matchesEdu = eduFilter ? p?.education.toLowerCase().includes(eduFilter.toLowerCase()) : true;
    const matchesCity = cityFilter ? p?.location.toLowerCase().includes(cityFilter.toLowerCase()) : true;

    return matchesSearch && matchesGender && matchesVerify && matchesMinAge && matchesMaxAge && matchesEdu && matchesCity;
  });

  return (
    <div className="space-y-6">
      {/* Upper Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-primary text-white font-bold tracking-wider px-2 py-0.5 rounded-full uppercase">Caste Admin</span>
            <span className="text-xs text-primary font-bold uppercase font-sans">Assigned Community: <strong>{assignedCommunityName} Only</strong></span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-on-surface">Community Hub</h1>
          <p className="text-xs text-on-surface-variant font-sans">Moderating matrimony directory, identity validation, and caste user records safely.</p>
        </div>
        <button 
          onClick={fetchData}
          className="px-3 py-2 bg-surface hover:bg-surface-container-low text-primary border border-primary/20 rounded-xl text-xs font-bold font-sans transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5 rotate-45" />
          Sync Caste Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {(['dashboard', 'users', 'reports', 'chat', 'broadcast'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-primary text-white shadow-md shadow-primary/10' 
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-primary'
            }`}
          >
            {tab === 'users' ? 'Manage Castes' : tab}
          </button>
        ))}
      </div>

      {/* SUB PANELS */}
      <div className="space-y-6">
        
        {/* TAB 1: MONITOR DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-1.5">
                <Users className="w-5 h-5 text-primary" />
                <h4 className="font-heading text-2xl font-bold text-primary">{totalMembersCount}</h4>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Total Members</p>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-1.5 relative">
                <AlertCircle className="w-5 h-5 text-tertiary" />
                <h4 className="font-heading text-2xl font-bold text-tertiary">{pendingCount}</h4>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Pending Review</p>
                {pendingCount > 0 && (
                  <span className="absolute top-4 right-4 w-2 h-2 bg-error rounded-full animate-ping" />
                )}
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-1.5">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <h4 className="font-heading text-2xl font-bold text-secondary">{verifiedCount}</h4>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Verified Profiles</p>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-1.5">
                <ShieldAlert className="w-5 h-5 text-primary-container" />
                <h4 className="font-heading text-2xl font-bold text-primary-container">{reuploadCount}</h4>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Needs Re-upload</p>
              </div>
            </div>

            {/* Quick action grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-4">
                <h3 className="font-sans font-bold text-sm text-primary uppercase tracking-wider">Caste Admin Quick Launch</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setActiveTab('users')} 
                    className="p-3 bg-surface hover:bg-surface-container text-primary rounded-xl font-sans text-xs font-semibold transition-all text-left flex items-center justify-between border border-primary/5"
                  >
                    <span>Verification Queue</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('broadcast')} 
                    className="p-3 bg-surface hover:bg-surface-container text-primary rounded-xl font-sans text-xs font-semibold transition-all text-left flex items-center justify-between border border-primary/5"
                  >
                    <span>Community Broadcast</span>
                    <Send className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('reports')} 
                    className="p-3 bg-surface hover:bg-surface-container text-primary rounded-xl font-sans text-xs font-semibold transition-all text-left flex items-center justify-between border border-primary/5"
                  >
                    <span>Reported Users</span>
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('chat')} 
                    className="p-3 bg-surface hover:bg-surface-container text-primary rounded-xl font-sans text-xs font-semibold transition-all text-left flex items-center justify-between border border-primary/5"
                  >
                    <span>Chat Logs Simulator</span>
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status HUD */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-sans font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Security Constraints
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                    As a community admin, you are only permitted to inspect and edit users belonging to the <strong>{assignedCommunityName}</strong> caste. Under database constraints, you <strong>cannot delete user profiles</strong>. Contact Super Admin for permanent deletions.
                  </p>
                </div>
                <div className="p-2.5 bg-primary/5 border border-primary/10 rounded-xl text-primary text-[10px] font-bold text-center tracking-wider uppercase mt-4">
                  Community isolation rules actively enforced
                </div>
              </div>
            </div>

            {/* Broadcast history in assigned community */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-4">
              <h3 className="font-sans font-bold text-sm text-primary uppercase tracking-wider">Caste Community Announcements</h3>
              <div className="space-y-3">
                {broadcasts.length > 0 ? (
                  broadcasts.slice(0, 3).map((notif) => (
                    <div key={notif.id} className="p-4 bg-surface rounded-xl border border-primary/5 flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-container text-white">
                            {notif.recipientType}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-medium">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h5 className="font-sans font-bold text-sm text-on-surface">{notif.title}</h5>
                        <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-on-surface-variant py-4 text-center">No community broadcasts published yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER DIRECTORY & VERIFICATIONS */}
        {activeTab === 'users' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans font-bold text-base text-primary">Member Directories: {assignedCommunityName} Only</h3>
                <p className="text-xs text-on-surface-variant font-medium">Manage members of your assigned caste. Inspect profiles, execute identity validation reviews, edit credentials, or suspend logins.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/65 rounded-xl px-3 py-2 text-xs border-none outline-none focus:ring-1 focus:ring-primary w-40"
                />
                <button
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="px-3 py-2 bg-surface-container-low text-primary hover:bg-surface-container rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filter Drawer
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant/75 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Name / Age</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Location Cluster</th>
                    <th className="pb-3 text-center">Verification Status</th>
                    <th className="pb-3 text-center">User Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-outline-variant/10 text-on-surface hover:bg-surface/40">
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-2">
                          <img src={user.profile?.imageUrl} className="w-8 h-8 rounded-full object-cover border border-primary/10" alt="" />
                          <div>
                            <p className="font-bold text-on-surface">{user.profile?.name || 'Incomplete Profile'}</p>
                            <p className="text-[10px] text-on-surface-variant font-medium">{user.profile?.gender} • {user.profile?.age} yrs</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-on-surface-variant font-medium">{user.email}</td>
                      <td className="py-3 text-on-surface font-medium">{user.profile?.location}</td>
                      <td className="py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.profile?.verificationStatus === 'APPROVED' ? 'bg-secondary-container text-on-secondary-container' :
                          user.profile?.verificationStatus === 'PENDING' ? 'bg-tertiary-container text-on-tertiary-container animate-pulse' :
                          user.profile?.verificationStatus === 'REQUEST_REUPLOAD' ? 'bg-primary-container text-white' :
                          'bg-error-container text-on-error-container'
                        }`}>
                          {user.profile?.verificationStatus || 'No Docs'}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.status === 'ACTIVE' 
                            ? 'bg-secondary-container/20 text-secondary' 
                            : 'bg-error-container/20 text-error'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2 space-x-1">
                        {user.profile?.documentUrl && (
                          <button
                            onClick={() => setShowVerifyModal(user)}
                            className="text-[10px] font-bold bg-primary hover:bg-primary-container text-white px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                          >
                            Review ID Proof
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-all"
                          title="Edit profile credentials"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.email, user.status)}
                          className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-all"
                          title="Suspend/Unsuspend account"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-on-surface-variant font-medium">No matrimony profiles matching filters found in {assignedCommunityName}.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REPORTED PROFILE FRAUDS */}
        {activeTab === 'reports' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-6">
            <div>
              <h3 className="font-sans font-bold text-base text-primary">Caste Report Center</h3>
              <p className="text-xs text-on-surface-variant font-medium">Inspect profile flags raised by other users or the machine system regarding duplicate credentials or suspicious identities.</p>
            </div>

            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map(rep => (
                  <div key={rep.id} className="p-4 bg-error-container/10 border border-error/20 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-sans font-bold text-sm text-on-surface">{rep.userName}</h4>
                        <p className="text-[10px] text-on-surface-variant font-medium">{rep.email}</p>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container">
                        Identity Flagged
                      </span>
                    </div>
                    <div className="p-3 bg-surface rounded-lg text-xs space-y-1">
                      <p className="font-semibold text-on-surface">Report Detail:</p>
                      <p className="text-on-surface-variant font-medium leading-relaxed">{rep.reason}</p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium pt-1">
                      <span>Reporter: {rep.reporter}</span>
                      <span>Flag Date: {rep.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 bg-surface rounded-xl border border-primary/5 flex flex-col items-center justify-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-secondary" />
                  <p className="text-xs font-bold text-on-surface">Clean slate! No flagged profiles in {assignedCommunityName}.</p>
                  <p className="text-[10px] text-on-surface-variant">Profiles in your caste are operating in compliance with rules.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CHAT MONITORING SIMULATOR */}
        {activeTab === 'chat' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-6">
            <div>
              <h3 className="font-sans font-bold text-base text-primary">Anonymized Chat Activity logs</h3>
              <p className="text-xs text-on-surface-variant font-medium">To protect user safety and security, standard triggers look for commercial spam or fraudulent messages inside community chats.</p>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-4 bg-surface rounded-xl border border-primary/5 flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary font-sans">Active Chat Room 42</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary-container/15 text-secondary">
                      Clear • 0 Warnings
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-medium">Participants: Arnav P. & Priya S.</p>
                  <p className="text-xs text-on-surface-variant italic font-medium">Conversations encrypted. Safety score checked automatically: 100% compliant.</p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-primary/5 flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary font-sans">Active Chat Room 15</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary-container/15 text-secondary">
                      Clear • 0 Warnings
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-medium">Participants: Arjun M. & Deepali S.</p>
                  <p className="text-xs text-on-surface-variant italic font-medium">Conversations encrypted. Safety score checked automatically: 100% compliant.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BROADCAST PANEL */}
        {activeTab === 'broadcast' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-6 max-w-lg mx-auto">
            <div>
              <h3 className="font-sans font-bold text-base text-primary">Caste Broadcast Panel</h3>
              <p className="text-xs text-on-surface-variant font-medium">Send caste announcements directly to all registered members of <strong>{assignedCommunityName}</strong>.</p>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-on-surface">Announcement Title</label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Caste Get-together, Meet & Greet Meetup..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-surface text-on-surface rounded-xl p-3 border-none outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-on-surface">Message Body</label>
                <textarea
                  placeholder="Type the broadcast message that members of your assigned caste will receive..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-surface text-on-surface rounded-xl p-3 border-none outline-none focus:ring-1 focus:ring-primary font-medium resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleSendCommunityBroadcast}
                className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-primary/10 active:scale-95"
              >
                Send Caste Broadcast Message
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ==========================================
          MODALS & DRAWERS
          ========================================== */}
      <AnimatePresence>
        
        {/* Filter Drawer */}
        {isFilterDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterDrawerOpen(false)} className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-surface z-[110] shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center p-5 border-b border-outline-variant/30">
                  <h3 className="font-heading text-lg font-bold text-primary">Advanced Caste Filters</h3>
                  <button onClick={() => setIsFilterDrawerOpen(false)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-5 space-y-4 font-sans text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-on-surface">Min Age</label>
                      <input type="number" placeholder="18" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2 rounded-lg border-none outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-on-surface">Max Age</label>
                      <input type="number" placeholder="60" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2 rounded-lg border-none outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">Gender</label>
                    <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-lg border-none outline-none font-semibold">
                      <option value="">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">Verification Status</label>
                    <select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-lg border-none outline-none font-semibold">
                      <option value="">All Statuses</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending Review</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="REQUEST_REUPLOAD">Request Re-upload</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">Education Keyword</label>
                    <input type="text" placeholder="e.g. B.Tech, CA, MBA..." value={eduFilter} onChange={(e) => setEduFilter(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2 rounded-lg border-none outline-none font-medium" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">City Cluster Location</label>
                    <input type="text" placeholder="e.g. Pune, Mumbai, Bangalore..." value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2 rounded-lg border-none outline-none font-medium" />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-outline-variant/30 flex gap-2 font-sans">
                <button
                  onClick={() => {
                    setAgeMin('');
                    setAgeMax('');
                    setGenderFilter('');
                    setVerificationFilter('');
                    setEduFilter('');
                    setCityFilter('');
                    setIsFilterDrawerOpen(false);
                    showToast('Caste search filters reset.', 'info');
                  }}
                  className="flex-1 py-3 border border-primary text-primary font-bold rounded-xl text-xs transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    setIsFilterDrawerOpen(false);
                    showToast('Advanced search filters applied.', 'success');
                  }}
                  className="flex-[2] py-3 bg-primary text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* Modal: Edit User Details */}
        {selectedUserForEdit && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUserForEdit(null)} className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed inset-x-4 bottom-5 top-5 md:max-w-md md:mx-auto bg-surface z-[110] rounded-3xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="space-y-4 overflow-y-auto pr-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-primary">Edit Member Credentials</h3>
                    <p className="text-xs text-on-surface-variant font-medium">Update profile inputs for <strong>{selectedUserForEdit.email}</strong></p>
                  </div>
                  <button onClick={() => setSelectedUserForEdit(null)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">Full Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border-none outline-none font-semibold" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-on-surface">Age</label>
                      <input type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border-none outline-none font-semibold" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-on-surface">Gender</label>
                      <select value={editGender} onChange={(e) => setEditGender(e.target.value as any)} className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border-none outline-none font-semibold">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">Occupation / Company</label>
                    <input type="text" value={editOcc} onChange={(e) => setEditOcc(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border-none outline-none font-medium" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">Location Cluster</label>
                    <input type="text" value={editLoc} onChange={(e) => setEditLoc(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border-none outline-none font-medium" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">Education</label>
                    <input type="text" value={editEdu} onChange={(e) => setEditEdu(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border-none outline-none font-medium" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">Income Bracket</label>
                    <input type="text" value={editInc} onChange={(e) => setEditInc(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border-none outline-none font-medium" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">Bio / Personal statement</label>
                    <textarea rows={2} value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-surface-container-low text-on-surface p-2.5 rounded-xl border-none outline-none resize-none font-medium" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/30 flex gap-2 font-sans">
                <button onClick={() => setSelectedUserForEdit(null)} className="flex-1 py-3 border border-primary text-primary font-bold rounded-xl text-xs transition-all">Cancel</button>
                <button onClick={handleSaveUserEdit} className="flex-[2] py-3 bg-primary text-white font-bold rounded-xl text-xs transition-all shadow-md">Save Changes</button>
              </div>
            </motion.div>
          </>
        )}

        {/* Modal: Identity Doc review */}
        {showVerifyModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVerifyModal(null)} className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-md" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed inset-x-4 bottom-5 top-5 md:max-w-xl md:mx-auto bg-surface z-[110] rounded-3xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="space-y-4 overflow-y-auto pr-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-primary">Verification identity Proof</h3>
                    <p className="text-xs text-on-surface-variant font-medium">Review official identity paper of caste member: <strong>{showVerifyModal.profile?.name}</strong></p>
                  </div>
                  <button onClick={() => setShowVerifyModal(null)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant"><X className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-2 gap-4 font-sans text-xs bg-surface-container-low/50 p-4 rounded-xl border border-primary/5">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">User Email Address</p>
                    <p className="font-bold text-on-surface">{showVerifyModal.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Caste Community</p>
                    <p className="font-bold text-primary">{showVerifyModal.communityName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Official Document Type</p>
                    <p className="font-bold text-on-surface">{showVerifyModal.profile?.documentType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Current Verification State</p>
                    <p className="font-bold text-tertiary">{showVerifyModal.profile?.verificationStatus}</p>
                  </div>
                </div>

                <div className="space-y-1.5 font-sans">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Scanned Document Image</p>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-primary/10 flex items-center justify-center">
                    {showVerifyModal.profile?.documentUrl ? (
                      <img src={showVerifyModal.profile.documentUrl} className="w-full h-full object-cover" alt="Verification proof document" />
                    ) : (
                      <div className="text-center p-6 space-y-2">
                        <AlertTriangle className="w-8 h-8 text-tertiary mx-auto animate-pulse" />
                        <p className="text-xs text-neutral-400 font-bold">No Identity Image Available</p>
                        <p className="text-[10px] text-neutral-500">Contact candidate to re-upload official ID card scans.</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] text-white font-bold tracking-wider uppercase flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Encrypted Proof
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/30 flex gap-2 font-sans">
                <button
                  onClick={() => handleVerifyDocument(showVerifyModal.id, 'REJECTED')}
                  className="flex-1 py-3 border border-error text-error hover:bg-error/5 text-xs font-bold rounded-xl transition-all"
                >
                  Reject Proof
                </button>
                <button
                  onClick={() => handleVerifyDocument(showVerifyModal.id, 'REQUEST_REUPLOAD')}
                  className="flex-1 py-3 border border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition-all"
                >
                  Request Re-upload
                </button>
                <button
                  onClick={() => handleVerifyDocument(showVerifyModal.id, 'APPROVED')}
                  className="flex-[2] py-3 bg-secondary text-white hover:bg-secondary/90 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Approve Verification
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
