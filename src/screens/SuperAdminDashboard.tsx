import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle2, AlertTriangle, ShieldAlert, Award, Grid, 
  MapPin, Settings, UserCheck, Plus, Trash2, Edit2, AlertCircle, 
  Lock, RefreshCw, Send, Check, X, ShieldCheck, HelpCircle, Eye, Power,
  BadgePercent, Crown
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Community, CommunityAdmin, MatrimonyUser, AuditLog, BroadcastNotification, AppSettings } from '../types/admin';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip 
} from 'recharts';

export function SuperAdminDashboard() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'communities' | 'admins' | 'users' | 'analytics' | 'notifications' | 'audit' | 'settings' | 'subscriptions'>('dashboard');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Core States
  const [communities, setCommunities] = useState<Community[]>([]);
  const [admins, setAdmins] = useState<CommunityAdmin[]>([]);
  const [users, setUsers] = useState<MatrimonyUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);
  
  // Subscription management state variables
  const [payments, setPayments] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'FLAT' | 'PERCENTAGE'>('FLAT');
  const [newCouponValue, setNewCouponValue] = useState(0);
  const [newCouponExpiry, setNewCouponExpiry] = useState('2026-12-31');
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState(100);
  const [newCouponMinPurchase, setNewCouponMinPurchase] = useState(499);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPlanPrice, setEditingPlanPrice] = useState(0);

  const [settings, setSettings] = useState<AppSettings>({
    websiteName: 'SoulMate Matrimony Portal',
    logo: '💖 SoulMate',
    banner: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200',
    contactDetails: 'support@soulmate.org | +91 98765 43210',
    privacyPolicy: 'Your privacy is absolutely safe...',
    termsAndConditions: 'All members must verify identity...'
  });

  // Helper to generate last 30 days log count
  const getLast30DaysLogData = () => {
    const data: { displayDate: string; count: number }[] = [];
    const today = new Date(2026, 6, 8); // July 8, 2026
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;
      
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const count = auditLogs.filter(log => {
        if (!log.createdAt) return false;
        return log.createdAt.substring(0, 10) === dateKey;
      }).length;
      
      data.push({
        displayDate,
        count
      });
    }
    return data;
  };

  const chartData = getLast30DaysLogData();

  // Query / Search Filters
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [communityFilter, setCommunityFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');

  // Modals
  const [showAddCommunityModal, setShowAddCommunityModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');

  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminCommunityId, setNewAdminCommunityId] = useState('');

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifRecipient, setNotifRecipient] = useState<'ALL_USERS' | 'SPECIFIC_COMMUNITY' | 'COMMUNITY_ADMINS'>('ALL_USERS');
  const [notifCommunityId, setNotifCommunityId] = useState('');

  const [showVerifyDocumentModal, setShowVerifyDocumentModal] = useState<MatrimonyUser | null>(null);

  // Fetch helper with headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer super-admin-token'
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Parallel fetches with error boundaries
      const [resComm, resAdmins, resUsers, resLogs, resNotifs, resSettings, resPayments, resCoupons, resPlans] = await Promise.all([
        fetch('/api/super/communities', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/super/admins', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/users', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/audit-logs', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/notifications', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/payment/history', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/super/coupons', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/subscription/plans').then(r => r.json())
      ]);

      if (Array.isArray(resComm)) setCommunities(resComm);
      if (Array.isArray(resAdmins)) setAdmins(resAdmins);
      if (Array.isArray(resUsers)) setUsers(resUsers);
      if (Array.isArray(resLogs)) setAuditLogs(resLogs);
      if (Array.isArray(resNotifs)) setBroadcasts(resNotifs);
      if (resSettings && resSettings.websiteName) setSettings(resSettings);
      if (Array.isArray(resPayments)) setPayments(resPayments);
      if (Array.isArray(resCoupons)) setCoupons(resCoupons);
      if (Array.isArray(resPlans)) setPlans(resPlans);
    } catch (err) {
      console.error('Error fetching dashboard endpoints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Operations
  const handleAddCommunity = async () => {
    if (!newCommunityName.trim()) return;
    try {
      const res = await fetch('/api/super/communities', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newCommunityName, description: newCommunityDesc })
      });
      if (res.ok) {
        showToast(`Community "${newCommunityName}" created successfully!`, 'success');
        setNewCommunityName('');
        setNewCommunityDesc('');
        setShowAddCommunityModal(false);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create community.', 'error');
      }
    } catch (e) {
      showToast('Network error creating community.', 'error');
    }
  };

  const handleToggleCommunityState = async (id: string, name: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/super/communities/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ isActive: !currentState })
      });
      if (res.ok) {
        showToast(`Community "${name}" ${!currentState ? 'activated' : 'deactivated'} successfully!`, 'success');
        fetchData();
      }
    } catch (e) {
      showToast('Error modifying community status.', 'error');
    }
  };

  const handleDeleteCommunity = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete community "${name}"? This is irreversible.`)) return;
    try {
      const res = await fetch(`/api/super/communities/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showToast(`Community "${name}" permanently deleted.`, 'info');
        fetchData();
      }
    } catch (e) {
      showToast('Error deleting community.', 'error');
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminUsername.trim() || !newAdminEmail.trim() || !newAdminCommunityId) {
      showToast('Please fill all admin form fields.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/super/admins', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          username: newAdminUsername,
          email: newAdminEmail,
          communityId: newAdminCommunityId
        })
      });
      if (res.ok) {
        showToast(`Admin "${newAdminUsername}" assigned successfully! Default password set to admin123`, 'success');
        setNewAdminUsername('');
        setNewAdminEmail('');
        setNewAdminCommunityId('');
        setShowAddAdminModal(false);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to assign admin.', 'error');
      }
    } catch (e) {
      showToast('Network error assigning admin.', 'error');
    }
  };

  const handleToggleAdminStatus = async (id: string, username: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/super/admins/${id}/suspend`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`Admin "${username}" ${nextStatus === 'SUSPENDED' ? 'suspended' : 're-activated'}.`, 'info');
        fetchData();
      }
    } catch (e) {
      showToast('Error toggling admin state.', 'error');
    }
  };

  const handleDeleteAdmin = async (id: string, username: string) => {
    if (!confirm(`Delete admin login credentials for "${username}"?`)) return;
    try {
      const res = await fetch(`/api/super/admins/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showToast(`Admin "${username}" credentials deleted.`, 'info');
        fetchData();
      }
    } catch (e) {
      showToast('Error removing admin.', 'error');
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
        showToast(`User account status updated for "${email}".`, 'success');
        fetchData();
      }
    } catch (e) {
      showToast('Error setting user status.', 'error');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently erase user record "${name}" from the database?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showToast(`User ${name} permanently erased from matrimony records.`, 'info');
        fetchData();
      }
    } catch (e) {
      showToast('Error erasing user database record.', 'error');
    }
  };

  const handleVerifyDocument = async (userId: string, action: 'APPROVED' | 'REJECTED' | 'REQUEST_REUPLOAD') => {
    try {
      const res = await fetch(`/api/users/${userId}/verify`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: action, notes: 'Reviewed by Super Admin' })
      });
      if (res.ok) {
        showToast(`Verification identity status updated to: ${action}`, 'success');
        setShowVerifyDocumentModal(null);
        fetchData();
      }
    } catch (e) {
      showToast('Error processing verification document.', 'error');
    }
  };

  const handleBroadcastAnnouncement = async () => {
    if (!notifTitle.trim() || !notifMsg.trim()) {
      showToast('Please provide a title and announcement text.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: notifTitle,
          message: notifMsg,
          recipientType: notifRecipient,
          communityId: notifRecipient === 'SPECIFIC_COMMUNITY' ? notifCommunityId : undefined
        })
      });
      if (res.ok) {
        showToast('Broadcast announcement deployed successfully!', 'success');
        setNotifTitle('');
        setNotifMsg('');
        setShowNotificationModal(false);
        fetchData();
      }
    } catch (e) {
      showToast('Error sending broadcast.', 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('Matrimony global configuration settings updated!', 'success');
      }
    } catch (e) {
      showToast('Error updating configuration parameters.', 'error');
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim() || !newCouponExpiry || newCouponValue <= 0) {
      showToast('Please fill all required coupon fields.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/super/coupons', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          code: newCouponCode,
          type: newCouponType,
          value: newCouponValue,
          expiryDate: newCouponExpiry,
          usageLimit: newCouponUsageLimit,
          minPurchase: newCouponMinPurchase
        })
      });
      if (res.ok) {
        showToast(`Coupon "${newCouponCode}" successfully deployed!`, 'success');
        setNewCouponCode('');
        setNewCouponValue(0);
        fetchData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to create coupon.', 'error');
      }
    } catch (e) {
      showToast('Error creating coupon.', 'error');
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Are you sure you want to terminate coupon code "${code}"?`)) return;
    try {
      const res = await fetch(`/api/super/coupons/${code}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showToast(`Coupon code "${code}" has been permanently deleted.`, 'info');
        fetchData();
      } else {
        showToast('Failed to delete coupon.', 'error');
      }
    } catch (e) {
      showToast('Error deleting coupon.', 'error');
    }
  };

  const handleSavePlanPrice = async (id: string, price: number) => {
    try {
      const res = await fetch(`/api/super/plans/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ price })
      });
      if (res.ok) {
        showToast('Plan price updated successfully in database.', 'success');
        setEditingPlanId(null);
        fetchData();
      } else {
        showToast('Failed to modify plan price.', 'error');
      }
    } catch (e) {
      showToast('Error editing plan price.', 'error');
    }
  };

  // Derived counts
  const totalUsersCount = users.length;
  const verifiedCount = users.filter(u => u.profile?.verified).length;
  const pendingVerificationsCount = users.filter(u => u.profile?.verificationStatus === 'PENDING').length;
  const activeAdminsCount = admins.filter(a => a.status === 'ACTIVE').length;
  const activeUsersCount = users.filter(u => u.status === 'ACTIVE').length;

  // Filtered Users List
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.profile?.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchUserQuery.toLowerCase());
    const matchesCommunity = communityFilter ? user.communityId === communityFilter : true;
    const matchesVerification = verificationFilter ? user.profile?.verificationStatus === verificationFilter : true;
    return matchesSearch && matchesCommunity && matchesVerification;
  });

  return (
    <div className="space-y-6">
      {/* Overview Head */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <span className="text-xs text-primary font-bold tracking-wider uppercase font-sans">Super Administrator Panel</span>
          <h1 className="font-heading text-3xl font-bold text-on-surface">System Dashboard</h1>
          <p className="text-xs text-on-surface-variant font-sans">Full access to telemetry, global parameters, caste admin provisioning, and audits.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchData} 
            className="p-2.5 rounded-xl border border-primary/20 text-primary bg-surface hover:bg-surface-container-low transition-colors active:scale-95 flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Telemetry
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex overflow-x-auto gap-2 pb-2 -mx-5 px-5 hide-scrollbar">
        {(['dashboard', 'communities', 'admins', 'users', 'subscriptions', 'analytics', 'notifications', 'audit', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-primary text-white shadow-md shadow-primary/15' 
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* MAIN CONTAINER */}
      <div className="space-y-6">
        
        {/* TAB 1: SYSTEM MONITOR OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-heading text-2xl font-bold text-primary">{totalUsersCount}</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Total Members</p>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <h3 className="font-heading text-2xl font-bold text-secondary">{verifiedCount}</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Verified Profiles</p>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-2 relative">
                <AlertCircle className="w-5 h-5 text-tertiary" />
                <h3 className="font-heading text-2xl font-bold text-tertiary">{pendingVerificationsCount}</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Pending Approvals</p>
                {pendingVerificationsCount > 0 && (
                  <span className="absolute top-4 right-4 bg-error text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    Action Required
                  </span>
                )}
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-2">
                <Lock className="w-5 h-5 text-primary-container" />
                <h3 className="font-heading text-2xl font-bold text-primary-container">{activeAdminsCount}</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Caste Admins</p>
              </div>
            </div>

            {/* Quick action grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-4">
                <h3 className="font-sans font-bold text-sm text-primary uppercase tracking-wider">Quick Action Panel</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setShowAddCommunityModal(true)} 
                    className="p-3 bg-surface hover:bg-surface-container text-primary rounded-xl font-sans text-xs font-semibold transition-all text-left flex items-center justify-between border border-primary/5"
                  >
                    <span>Create Community</span>
                    <Plus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setShowAddAdminModal(true)} 
                    className="p-3 bg-surface hover:bg-surface-container text-primary rounded-xl font-sans text-xs font-semibold transition-all text-left flex items-center justify-between border border-primary/5"
                  >
                    <span>Assign Caste Admin</span>
                    <Plus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setShowNotificationModal(true)} 
                    className="p-3 bg-surface hover:bg-surface-container text-primary rounded-xl font-sans text-xs font-semibold transition-all text-left flex items-center justify-between border border-primary/5"
                  >
                    <span>Deploy Broadcast</span>
                    <Send className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('audit')} 
                    className="p-3 bg-surface hover:bg-surface-container text-primary rounded-xl font-sans text-xs font-semibold transition-all text-left flex items-center justify-between border border-primary/5"
                  >
                    <span>Review Audit Logs</span>
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Critical Alert HUD */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-sm text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Identity Verification Pending Queue
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Identity validation protects the community platform integrity. Please review pending government verification proofs inside user manager.
                  </p>
                </div>
                {pendingVerificationsCount > 0 ? (
                  <button 
                    onClick={() => {
                      setVerificationFilter('PENDING');
                      setActiveTab('users');
                    }}
                    className="mt-4 py-2.5 bg-tertiary hover:bg-tertiary-container text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    Review {pendingVerificationsCount} Verification Proofs
                  </button>
                ) : (
                  <div className="mt-4 p-2.5 bg-secondary-container/10 border border-secondary/10 text-secondary text-xs rounded-xl flex items-center gap-2 justify-center font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    All identity verification queues cleared!
                  </div>
                )}
              </div>
            </div>

            {/* Recent Audit Trails */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-sans font-bold text-sm text-primary uppercase tracking-wider">Live System Audit Log</h3>
                <button onClick={() => setActiveTab('audit')} className="text-xs font-semibold text-primary hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-on-surface-variant/75 font-semibold">
                      <th className="pb-2">User</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2">Action</th>
                      <th className="pb-2">Details</th>
                      <th className="pb-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.slice(0, 4).map((log) => (
                      <tr key={log.id} className="border-b border-outline-variant/10 text-on-surface hover:bg-surface/30">
                        <td className="py-2.5 font-medium">{log.username}</td>
                        <td className="py-2.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            log.role === 'SUPER_ADMIN' ? 'bg-primary-container text-white' : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-[10px] text-primary">{log.action}</td>
                        <td className="py-2.5 text-on-surface-variant font-medium max-w-xs truncate">{log.details}</td>
                        <td className="py-2.5 text-right text-on-surface-variant/65">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMMUNITIES MANAGEMENT */}
        {activeTab === 'communities' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-sans font-bold text-base text-primary">Matrimony Communities</h3>
                <p className="text-xs text-on-surface-variant">Configure castes, religions, active directories and view registration stats.</p>
              </div>
              <button 
                onClick={() => setShowAddCommunityModal(true)} 
                className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/10 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Community
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant/75 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Community Name</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-center">Registrations</th>
                    <th className="pb-3 text-center">Directory Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {communities.map((comm) => (
                    <tr key={comm.id} className="border-b border-outline-variant/10 text-on-surface hover:bg-surface/40">
                      <td className="py-3 pl-2 font-bold text-primary">{comm.name}</td>
                      <td className="py-3 text-on-surface-variant max-w-xs truncate font-medium">{comm.description}</td>
                      <td className="py-3 text-center font-bold text-on-surface">{comm.userCount} profiles</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleToggleCommunityState(comm.id, comm.name, comm.isActive)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition-all ${
                            comm.isActive 
                              ? 'bg-secondary-container/10 border-secondary/20 text-secondary' 
                              : 'bg-error-container/10 border-error/20 text-error'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          {comm.isActive ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                      <td className="py-3 text-right pr-2 space-x-1">
                        <button 
                          onClick={() => {
                            const newDesc = prompt(`Update description for ${comm.name}:`, comm.description);
                            if (newDesc !== null) {
                              fetch(`/api/super/communities/${comm.id}`, {
                                method: 'PUT',
                                headers: getHeaders(),
                                body: JSON.stringify({ description: newDesc })
                              }).then(() => {
                                showToast('Community description modified', 'success');
                                fetchData();
                              });
                            }
                          }}
                          className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCommunity(comm.id, comm.name)}
                          className="p-1.5 hover:bg-error-container/10 rounded-lg text-on-surface-variant hover:text-error transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ADMINS ASSIGNMENT */}
        {activeTab === 'admins' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-sans font-bold text-base text-primary">Community Caste Administrators</h3>
                <p className="text-xs text-on-surface-variant">Each Matrimony Community has exactly one administrator assigned to process verifications.</p>
              </div>
              <button 
                onClick={() => setShowAddAdminModal(true)} 
                className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/10 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Assign Admin
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant/75 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Admin Account</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Assigned Caste Community</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b border-outline-variant/10 text-on-surface hover:bg-surface/40">
                      <td className="py-3 pl-2 font-bold text-on-surface">{admin.username}</td>
                      <td className="py-3 text-on-surface-variant font-medium">{admin.email}</td>
                      <td className="py-3 font-semibold text-primary">{admin.communityName}</td>
                      <td className="py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          admin.status === 'ACTIVE' 
                            ? 'bg-secondary-container text-on-secondary-container' 
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          {admin.status}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2 space-x-1">
                        <button
                          onClick={() => handleToggleAdminStatus(admin.id, admin.username, admin.status)}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                            admin.status === 'ACTIVE' 
                              ? 'border-error text-error hover:bg-error-container/5' 
                              : 'border-secondary text-secondary hover:bg-secondary-container/5'
                          }`}
                        >
                          {admin.status === 'ACTIVE' ? 'Suspend' : 'Unsuspend'}
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                          className="p-1.5 hover:bg-error-container/10 rounded-lg text-error hover:text-error-container transition-all"
                          title="Delete Credentials"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: USERS RECORD DIRECTORY (RBAC PROXIED) */}
        {activeTab === 'users' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans font-bold text-base text-primary">Member Database</h3>
                <p className="text-xs text-on-surface-variant font-medium">Verify profiles, modify account statuses, review uploaded credentials, or erase records.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/65 rounded-xl px-3 py-2 text-xs border-none outline-none focus:ring-1 focus:ring-primary w-40"
                />
                <select
                  value={communityFilter}
                  onChange={(e) => setCommunityFilter(e.target.value)}
                  className="bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-xs border-none outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Castes</option>
                  {communities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-xs border-none outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Verification Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="REQUEST_REUPLOAD">Request Re-upload</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant/75 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Profile Name / Age</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Caste Community</th>
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
                      <td className="py-3 font-semibold text-primary">{user.communityName}</td>
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
                            onClick={() => setShowVerifyDocumentModal(user)}
                            className="text-[10px] font-bold bg-primary hover:bg-primary-container text-white px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                          >
                            Review Docs
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.email, user.status)}
                          className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-all"
                          title="Suspend/Unsuspend"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.profile?.name || user.email)}
                          className="p-1.5 hover:bg-error-container/10 rounded-lg text-on-surface-variant hover:text-error transition-all"
                          title="Delete database record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-on-surface-variant font-medium">No matrimony profiles matching filters found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS & INTERACTIVE CHARTING */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-6">
              <div>
                <h3 className="font-sans font-bold text-base text-primary">Matrimony Statistics & Ratios</h3>
                <p className="text-xs text-on-surface-variant font-medium">Live visual intelligence derived from the platform registrations.</p>
              </div>

              {/* Platform Administrative Activity Chart (Line Chart over last 30 days) */}
              <div className="border border-primary/10 rounded-2xl p-5 bg-surface-container-low/20 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Administrative Audit Frequency (Last 30 Days)</h4>
                    <p className="text-[11px] text-on-surface-variant font-medium">Daily tally of administrative actions, caste admin updates, and profile approvals/suspensions.</p>
                  </div>
                  <div className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full w-fit">
                    Total Audit Logs: {auditLogs.length}
                  </div>
                </div>
                
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8f6ff" vertical={false} />
                      <XAxis 
                        dataKey="displayDate" 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#3e4949', fontSize: 10, fontWeight: 500 }}
                        dy={8}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#3e4949', fontSize: 10, fontWeight: 500 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #bdc9c9',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(4, 30, 41, 0.08)',
                          fontSize: '11px',
                          fontFamily: 'sans-serif'
                        }}
                        labelClassName="font-bold text-slate-800"
                        formatter={(value: any) => [`${value} Logs`, 'Events']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#005f62" 
                        strokeWidth={3} 
                        dot={{ r: 4, strokeWidth: 1, stroke: '#ffffff', fill: '#005f62' }}
                        activeDot={{ r: 6, strokeWidth: 1 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphic charts inside SVG for flawless cross-platform styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Chart A: Registrations by caste */}
                <div className="border border-primary/10 rounded-xl p-4 bg-surface-container-low/20 space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Caste Registration Distribution</h4>
                  <div className="h-44 flex items-end justify-between px-4 pb-2 border-b border-outline-variant/30 pt-6">
                    {communities.map(c => {
                      const maxCount = Math.max(...communities.map(item => item.userCount), 1);
                      const pct = (c.userCount / maxCount) * 100;
                      return (
                        <div key={c.id} className="flex flex-col items-center gap-2 group cursor-pointer w-full">
                          <div className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">{c.userCount}</div>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${pct * 0.8}%` }}
                            className="w-4 bg-primary hover:bg-primary-container rounded-t-sm"
                            transition={{ type: 'spring', delay: 0.1 }}
                          />
                          <span className="text-[9px] font-sans font-bold text-on-surface-variant truncate max-w-[40px] uppercase">{c.name.substring(0,3)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart B: Monthly growth */}
                <div className="border border-primary/10 rounded-xl p-4 bg-surface-container-low/20 space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">2026 Monthly User Growth</h4>
                  <div className="h-44 flex items-end justify-between px-4 pb-2 border-b border-outline-variant/30 pt-6">
                    {[
                      { m: 'Jan', count: 12 },
                      { m: 'Feb', count: 19 },
                      { m: 'Mar', count: 32 },
                      { m: 'Apr', count: 48 },
                      { m: 'May', count: 64 },
                      { m: 'Jun', count: 85 },
                      { m: 'Jul', count: 110 }
                    ].map(mon => {
                      const pct = (mon.count / 110) * 100;
                      return (
                        <div key={mon.m} className="flex flex-col items-center gap-2 group cursor-pointer w-full">
                          <div className="text-[9px] font-bold text-secondary opacity-0 group-hover:opacity-100 transition-opacity">{mon.count}</div>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${pct * 0.8}%` }}
                            className="w-4 bg-secondary hover:bg-secondary-container rounded-t-sm"
                            transition={{ type: 'spring', delay: 0.2 }}
                          />
                          <span className="text-[9px] font-sans font-bold text-on-surface-variant uppercase">{mon.m}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart C: Gender Ratios */}
                <div className="border border-primary/10 rounded-xl p-4 bg-surface-container-low/20 space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Active Gender Ratio</h4>
                  <div className="flex items-center justify-around py-8">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-2xl font-bold text-primary font-heading">55%</span>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase">Male Members</span>
                    </div>
                    <div className="w-24 h-24 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" className="stroke-primary fill-none" strokeWidth="12" strokeDasharray="251" strokeDashoffset="113" />
                        <circle cx="48" cy="48" r="40" className="stroke-secondary fill-none" strokeWidth="12" strokeDasharray="251" strokeDashoffset="251" style={{ strokeDashoffset: -113 }} />
                      </svg>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-2xl font-bold text-secondary font-heading">45%</span>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase">Female Members</span>
                    </div>
                  </div>
                </div>

                {/* Chart D: Age Distribution */}
                <div className="border border-primary/10 rounded-xl p-4 bg-surface-container-low/20 space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Age Bracket demographics</h4>
                  <div className="space-y-2 pt-2">
                    {[
                      { range: '18 - 24 years', pct: 20 },
                      { range: '25 - 30 years', pct: 60 },
                      { range: '31 - 35 years', pct: 15 },
                      { range: '36+ years', pct: 5 }
                    ].map(bracket => (
                      <div key={bracket.range} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                          <span>{bracket.range}</span>
                          <span>{bracket.pct}%</span>
                        </div>
                        <div className="h-2 bg-surface rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${bracket.pct}%` }}
                            className="bg-primary h-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BROADCAST DEPLOYMENT */}
        {activeTab === 'notifications' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-sans font-bold text-base text-primary">System Wide Broadcasts</h3>
                <p className="text-xs text-on-surface-variant font-medium">Broadcast announcements to All Members, Selected Communities or Caste Admins.</p>
              </div>
              <button
                onClick={() => setShowNotificationModal(true)}
                className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/10 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                New Announcement
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-sans font-bold text-xs text-primary uppercase tracking-wider">Recent Deployments</h4>
              <div className="space-y-3">
                {broadcasts.map((notif) => (
                  <div key={notif.id} className="p-4 bg-surface rounded-xl border border-primary/5 soft-shadow flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-container text-white">
                          {notif.recipientType}
                        </span>
                        {notif.communityName && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                            Caste: {notif.communityName}
                          </span>
                        )}
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h5 className="font-sans font-bold text-sm text-on-surface">{notif.title}</h5>
                      <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: COMPLETE AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-6">
            <div>
              <h3 className="font-sans font-bold text-base text-primary">Comprehensive Audit Logs</h3>
              <p className="text-xs text-on-surface-variant font-medium">Platform operations are tracked securely to guarantee transparency and secure community moderation.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant/75 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">User / Operator</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Action Target</th>
                    <th className="pb-3">Audit Trails Details</th>
                    <th className="pb-3 text-center">IP Address</th>
                    <th className="pb-3 text-right pr-2">Event Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-outline-variant/10 text-on-surface hover:bg-surface/40">
                      <td className="py-3 pl-2 font-bold text-on-surface">{log.username}</td>
                      <td className="py-3">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          log.role === 'SUPER_ADMIN' ? 'bg-primary-container text-white' : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-primary">{log.action}</td>
                      <td className="py-3 text-on-surface-variant font-medium max-w-xs truncate">{log.details}</td>
                      <td className="py-3 text-center font-mono text-on-surface-variant/80">{log.ipAddress}</td>
                      <td className="py-3 text-right pr-2 text-on-surface-variant/65">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: GLOBAL PORTAL SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-primary/5 soft-shadow space-y-6 max-w-xl mx-auto">
            <div>
              <h3 className="font-sans font-bold text-base text-primary">Portal Configuration</h3>
              <p className="text-xs text-on-surface-variant">Update identity, privacy policies, branding parameters, and site conditions.</p>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-on-surface">Matrimony Website Name</label>
                <input
                  type="text"
                  value={settings.websiteName}
                  onChange={(e) => setSettings({...settings, websiteName: e.target.value})}
                  className="w-full bg-surface text-on-surface rounded-xl p-3 border-none outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-on-surface">Portal Logo Text</label>
                <input
                  type="text"
                  value={settings.logo}
                  onChange={(e) => setSettings({...settings, logo: e.target.value})}
                  className="w-full bg-surface text-on-surface rounded-xl p-3 border-none outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-on-surface">Banner Wallpaper URL</label>
                <input
                  type="text"
                  value={settings.banner}
                  onChange={(e) => setSettings({...settings, banner: e.target.value})}
                  className="w-full bg-surface text-on-surface rounded-xl p-3 border-none outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-on-surface">Contact Details</label>
                <input
                  type="text"
                  value={settings.contactDetails}
                  onChange={(e) => setSettings({...settings, contactDetails: e.target.value})}
                  className="w-full bg-surface text-on-surface rounded-xl p-3 border-none outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-on-surface">Privacy & Image Encryption Policy</label>
                <textarea
                  rows={3}
                  value={settings.privacyPolicy}
                  onChange={(e) => setSettings({...settings, privacyPolicy: e.target.value})}
                  className="w-full bg-surface text-on-surface rounded-xl p-3 border-none outline-none focus:ring-1 focus:ring-primary font-medium resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-on-surface">Official Verification Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={settings.termsAndConditions}
                  onChange={(e) => setSettings({...settings, termsAndConditions: e.target.value})}
                  className="w-full bg-surface text-on-surface rounded-xl p-3 border-none outline-none focus:ring-1 focus:ring-primary font-medium resize-none"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-primary/10 active:scale-95"
              >
                Save Portal Configuration
              </button>
            </div>
          </div>
        )}

        {/* TAB 9: SUBSCRIPTIONS & REVENUE ADMIN PANEL */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-8 font-sans">
            {/* Subscription stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-2">
                <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <h3 className="font-heading text-2xl font-bold text-primary">
                  ₹{payments.filter(p => p.status === 'CAPTURED').reduce((acc, curr) => acc + curr.finalAmount, 0)}
                </h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Total Revenue</p>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-2">
                <Users className="w-5 h-5 text-secondary" />
                <h3 className="font-heading text-2xl font-bold text-secondary">
                  {payments.filter(p => p.status === 'CAPTURED').length}
                </h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Active Subscriptions</p>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-2">
                <BadgePercent className="w-5 h-5 text-tertiary" />
                <h3 className="font-heading text-2xl font-bold text-tertiary">{coupons.length}</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Active Coupons</p>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-2">
                <Award className="w-5 h-5 text-cyan-700" />
                <h3 className="font-heading text-2xl font-bold text-cyan-700">
                  {plans.length}
                </h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Configured Plans</p>
              </div>
            </div>

            {/* Layout: Pricing plans editor & coupon creator */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Plans pricing edit panel */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-4">
                  <div>
                    <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Configure Membership Plans</h4>
                    <p className="text-xs text-on-surface-variant">Update active pricing, duration and features directly in the system database.</p>
                  </div>

                  <div className="space-y-3">
                    {plans.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl bg-surface border border-outline-variant/30 flex items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-primary text-sm flex items-center gap-1.5">
                            {p.name}
                            {p.id === 'plan-gold' && <span className="text-[9px] font-extrabold uppercase bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full">POPULAR</span>}
                          </span>
                          <p className="text-on-surface-variant font-medium">Validity: {p.durationMonths} Months • Features configured: {p.features?.length || 0}</p>
                        </div>

                        {editingPlanId === p.id ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">₹</span>
                            <input 
                              type="number" 
                              value={editingPlanPrice}
                              onChange={(e) => setEditingPlanPrice(Number(e.target.value))}
                              className="w-20 bg-surface-container-low text-on-surface font-bold rounded px-2 py-1 text-xs outline-none border border-primary/40 focus:border-primary"
                            />
                            <button 
                              onClick={() => handleSavePlanPrice(p.id, editingPlanPrice)}
                              className="bg-secondary text-white p-1 rounded hover:opacity-90 font-bold text-[10px]"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingPlanId(null)}
                              className="bg-outline-variant text-on-surface-variant p-1 rounded hover:opacity-90 font-bold text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-secondary">₹{p.price}</span>
                            <button
                              onClick={() => { setEditingPlanId(p.id); setEditingPlanPrice(p.price); }}
                              className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-bold text-[10px]"
                            >
                              Edit Price
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coupons Creator Panel */}
              <div className="space-y-6">
                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-4">
                  <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Create Coupon Code</h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-on-surface">Coupon Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g. WELCOME50"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        className="w-full bg-surface text-on-surface rounded-xl p-3 border border-outline-variant/30 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-on-surface">Type</label>
                        <select 
                          value={newCouponType}
                          onChange={(e) => setNewCouponType(e.target.value as any)}
                          className="w-full bg-surface text-on-surface rounded-xl p-3 border border-outline-variant/30 outline-none font-medium"
                        >
                          <option value="FLAT">Flat (₹)</option>
                          <option value="PERCENTAGE">Percent (%)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-on-surface">Discount Value</label>
                        <input 
                          type="number" 
                          value={newCouponValue}
                          onChange={(e) => setNewCouponValue(Number(e.target.value))}
                          className="w-full bg-surface text-on-surface rounded-xl p-3 border border-outline-variant/30 outline-none font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-on-surface">Min Purchase</label>
                        <input 
                          type="number" 
                          value={newCouponMinPurchase}
                          onChange={(e) => setNewCouponMinPurchase(Number(e.target.value))}
                          className="w-full bg-surface text-on-surface rounded-xl p-3 border border-outline-variant/30 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-on-surface">Usage Limit</label>
                        <input 
                          type="number" 
                          value={newCouponUsageLimit}
                          onChange={(e) => setNewCouponUsageLimit(Number(e.target.value))}
                          className="w-full bg-surface text-on-surface rounded-xl p-3 border border-outline-variant/30 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-on-surface">Expiry Date</label>
                      <input 
                        type="date" 
                        value={newCouponExpiry}
                        onChange={(e) => setNewCouponExpiry(e.target.value)}
                        className="w-full bg-surface text-on-surface rounded-xl p-3 border border-outline-variant/30 outline-none font-semibold"
                      />
                    </div>

                    <button
                      onClick={handleCreateCoupon}
                      className="w-full bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl font-bold transition-all"
                    >
                      Deploy Coupon Code
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Active Coupon codes manager */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-4">
              <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Active System Coupons</h4>
              
              {coupons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {coupons.map((c) => (
                    <div key={c.code} className="p-4 rounded-xl bg-surface border border-outline-variant/30 flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-primary text-sm flex items-center gap-1">
                          <BadgePercent className="w-4 h-4 text-secondary" />
                          {c.code}
                        </span>
                        <p className="text-on-surface-variant mt-1">
                          Discount: {c.type === 'FLAT' ? `₹${c.value}` : `${c.value}%`} • Min Spend: ₹{c.minPurchase}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-medium">Expires: {c.expiryDate} • Used: {c.usageCount}/{c.usageLimit}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCoupon(c.code)}
                        className="p-1.5 hover:bg-error/5 text-error rounded-lg"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-on-surface-variant font-sans text-xs bg-surface-container-low rounded-xl">No active coupons available.</div>
              )}
            </div>

            {/* Total Payments Capture log */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/5 soft-shadow space-y-4">
              <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Captured Transactions Log</h4>
              
              {payments.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-container font-bold text-on-surface-variant border-b border-outline-variant/30">
                        <th className="p-3">User</th>
                        <th className="p-3">Plan Name</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 font-mono">Order ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-surface-container-lowest">
                          <td className="p-3 font-semibold text-on-surface">{p.userName || 'Arnav Singh'}</td>
                          <td className="p-3 font-bold text-primary">{p.planName}</td>
                          <td className="p-3 font-medium">{p.paymentMethod}</td>
                          <td className="p-3 font-bold text-secondary">₹{p.finalAmount}</td>
                          <td className="p-3 text-on-surface-variant">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              p.status === 'CAPTURED' ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-on-surface-variant">{p.razorpayOrderId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-on-surface-variant font-sans text-xs bg-surface-container-low rounded-xl">No transactions captured yet.</div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ==========================================
          MODALS & OVERLAYS
          ========================================== */}
      <AnimatePresence>
        {/* Modal A: Create Community */}
        {showAddCommunityModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddCommunityModal(false)} className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed inset-x-4 bottom-10 md:max-w-md md:mx-auto bg-surface z-[110] rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="font-heading text-xl font-bold text-primary">Create Caste Community</h3>
              <div className="space-y-3 font-sans text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Community Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maratha, Kunbi, Brahmin..."
                    value={newCommunityName}
                    onChange={(e) => setNewCommunityName(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface rounded-xl p-3 border-none outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Description</label>
                  <textarea
                    placeholder="Brief description about roots or location clusters..."
                    value={newCommunityDesc}
                    onChange={(e) => setNewCommunityDesc(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface rounded-xl p-3 border-none outline-none resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowAddCommunityModal(false)} className="flex-1 py-2.5 border border-primary text-primary font-bold rounded-xl transition-all">Cancel</button>
                  <button onClick={handleAddCommunity} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl transition-all shadow-md">Create</button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Modal B: Assign Admin */}
        {showAddAdminModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddAdminModal(false)} className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed inset-x-4 bottom-10 md:max-w-md md:mx-auto bg-surface z-[110] rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="font-heading text-xl font-bold text-primary">Assign Community Admin</h3>
              <div className="space-y-3 font-sans text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Username</label>
                  <input
                    type="text"
                    placeholder="e.g. maratha_admin"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface rounded-xl p-3 border-none outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@community.org"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface rounded-xl p-3 border-none outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Assign Caste Community</label>
                  <select
                    value={newAdminCommunityId}
                    onChange={(e) => setNewAdminCommunityId(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface rounded-xl p-3 border-none outline-none font-medium"
                  >
                    <option value="">Choose Community</option>
                    {communities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowAddAdminModal(false)} className="flex-1 py-2.5 border border-primary text-primary font-bold rounded-xl transition-all">Cancel</button>
                  <button onClick={handleAddAdmin} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl transition-all shadow-md">Assign</button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Modal C: Deploy Broadcast */}
        {showNotificationModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotificationModal(false)} className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed inset-x-4 bottom-10 md:max-w-md md:mx-auto bg-surface z-[110] rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="font-heading text-xl font-bold text-primary">Deploy System Broadcast</h3>
              <div className="space-y-3 font-sans text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Broadcast Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule Maintenance, Festivities greeting..."
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface rounded-xl p-3 border-none outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Broadcast Message</label>
                  <textarea
                    placeholder="Announcement details..."
                    value={notifMsg}
                    onChange={(e) => setNotifMsg(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface rounded-xl p-3 border-none outline-none resize-none"
                    rows={3}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Recipient Channel</label>
                  <select
                    value={notifRecipient}
                    onChange={(e) => setNotifRecipient(e.target.value as any)}
                    className="w-full bg-surface-container-low text-on-surface rounded-xl p-3 border-none outline-none font-medium"
                  >
                    <option value="ALL_USERS">All Members (Global)</option>
                    <option value="SPECIFIC_COMMUNITY">Specific Caste Members</option>
                    <option value="COMMUNITY_ADMINS">Caste Administrators Only</option>
                  </select>
                </div>

                {notifRecipient === 'SPECIFIC_COMMUNITY' && (
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">Target Caste Community</label>
                    <select
                      value={notifCommunityId}
                      onChange={(e) => setNotifCommunityId(e.target.value)}
                      className="w-full bg-surface-container-low text-on-surface rounded-xl p-3 border-none outline-none font-medium"
                    >
                      <option value="">Select Target Caste</option>
                      {communities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowNotificationModal(false)} className="flex-1 py-2.5 border border-primary text-primary font-bold rounded-xl transition-all">Cancel</button>
                  <button onClick={handleBroadcastAnnouncement} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl transition-all shadow-md">Deploy Announcement</button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Modal D: Document Review & Approval */}
        {showVerifyDocumentModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVerifyDocumentModal(null)} className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-md" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed inset-x-4 bottom-5 top-5 md:max-w-xl md:mx-auto bg-surface z-[110] rounded-3xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="space-y-4 overflow-y-auto pr-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-primary">Identity Document Verification</h3>
                    <p className="text-xs text-on-surface-variant">Review official document upload for member: <strong>{showVerifyDocumentModal.profile?.name}</strong></p>
                  </div>
                  <button onClick={() => setShowVerifyDocumentModal(null)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant"><X className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-2 gap-4 font-sans text-xs bg-surface-container-low/50 p-4 rounded-xl border border-primary/5">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">User Email Address</p>
                    <p className="font-bold text-on-surface">{showVerifyDocumentModal.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Caste Community</p>
                    <p className="font-bold text-primary">{showVerifyDocumentModal.communityName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Official Document Type</p>
                    <p className="font-bold text-on-surface">{showVerifyDocumentModal.profile?.documentType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Current Verification State</p>
                    <p className="font-bold text-tertiary">{showVerifyDocumentModal.profile?.verificationStatus}</p>
                  </div>
                </div>

                {/* Scanned verification Document Proof */}
                <div className="space-y-1.5 font-sans">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Scanned ID Proof Image File</p>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-primary/10 flex items-center justify-center">
                    {showVerifyDocumentModal.profile?.documentUrl ? (
                      <img src={showVerifyDocumentModal.profile.documentUrl} className="w-full h-full object-cover" alt="ID Proof Doc" />
                    ) : (
                      <div className="text-center p-6 space-y-2">
                        <AlertTriangle className="w-8 h-8 text-tertiary mx-auto animate-pulse" />
                        <p className="text-xs text-neutral-400 font-bold">No Image Document Loaded</p>
                        <p className="text-[10px] text-neutral-500">Member must re-upload a clean, readable JPG/PNG proof.</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] text-white font-bold tracking-wider uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Encrypted Secures Storage
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval controls */}
              <div className="pt-4 border-t border-outline-variant/30 flex gap-2 font-sans">
                <button
                  onClick={() => handleVerifyDocument(showVerifyDocumentModal.id, 'REJECTED')}
                  className="flex-1 py-3 border border-error text-error hover:bg-error/5 text-xs font-bold rounded-xl transition-all"
                >
                  Reject Proof
                </button>
                <button
                  onClick={() => handleVerifyDocument(showVerifyDocumentModal.id, 'REQUEST_REUPLOAD')}
                  className="flex-1 py-3 border border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition-all"
                >
                  Request Re-upload
                </button>
                <button
                  onClick={() => handleVerifyDocument(showVerifyDocumentModal.id, 'APPROVED')}
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
