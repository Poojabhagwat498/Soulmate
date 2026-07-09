import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// IN-MEMORY DATABASE SEED
// ==========================================

let communities = [
  { id: 'c-1', name: 'Maratha', description: 'Warrior roots & agrarian community.', isActive: true, userCount: 4, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'c-2', name: 'Kunbi', description: 'Agriculturalist community with historic legacy.', isActive: true, userCount: 2, createdAt: '2026-01-11T11:00:00Z' },
  { id: 'c-3', name: 'Mali', description: 'Legacy of horticulture and social reform.', isActive: true, userCount: 1, createdAt: '2026-01-12T12:00:00Z' },
  { id: 'c-4', name: 'Dhangar', description: 'Shepherds and herders heritage with strong spiritual practices.', isActive: true, userCount: 0, createdAt: '2026-01-13T13:00:00Z' },
  { id: 'c-5', name: 'Brahmin', description: 'Traditional priestly, scholarly, and professional community.', isActive: true, userCount: 2, createdAt: '2026-01-14T14:00:00Z' },
  { id: 'c-6', name: 'Jain', description: 'Business, philosophy, and ahimsa legacy.', isActive: true, userCount: 1, createdAt: '2026-01-15T15:00:00Z' },
  { id: 'c-7', name: 'Lingayat', description: 'Followers of social reformer Basaveshwara.', isActive: true, userCount: 0, createdAt: '2026-01-16T16:00:00Z' }
];

let admins = [
  { id: 'adm-1', username: 'maratha_admin', email: 'maratha.admin@soulmate.org', communityId: 'c-1', communityName: 'Maratha', status: 'ACTIVE', createdAt: '2026-02-01T09:00:00Z' },
  { id: 'adm-2', username: 'kunbi_admin', email: 'kunbi.admin@soulmate.org', communityId: 'c-2', communityName: 'Kunbi', status: 'ACTIVE', createdAt: '2026-02-02T09:00:00Z' },
  { id: 'adm-3', username: 'mali_admin', email: 'mali.admin@soulmate.org', communityId: 'c-3', communityName: 'Mali', status: 'ACTIVE', createdAt: '2026-02-03T09:00:00Z' },
  { id: 'adm-4', username: 'brahmin_admin', email: 'brahmin.admin@soulmate.org', communityId: 'c-5', communityName: 'Brahmin', status: 'ACTIVE', createdAt: '2026-02-04T09:00:00Z' }
];

let users = [
  {
    id: 'u-1',
    email: 'priya.sharma@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    communityId: 'c-5',
    communityName: 'Brahmin',
    profile: {
      id: 'p-1',
      name: 'Priya Sharma',
      age: 26,
      gender: 'Female',
      occupation: 'Software Engineer at Google',
      location: 'Bangalore, India',
      education: 'B.Tech, IIT Delhi',
      income: '₹30L+ annually',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=640',
      verified: true,
      verificationStatus: 'APPROVED',
      documentType: 'Aadhaar Card',
      documentUrl: 'https://assets.mixkit.co/images/preview/mixkit-card-proof-901-large.jpg',
      bio: 'Grounded individual balancing technology and tradition.'
    },
    createdAt: '2026-03-01T08:00:00Z'
  },
  {
    id: 'u-2',
    email: 'arjun.mehta@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    communityId: 'c-1',
    communityName: 'Maratha',
    profile: {
      id: 'p-2',
      name: 'Arjun Mehta',
      age: 29,
      gender: 'Male',
      occupation: 'Investment Banker',
      location: 'Mumbai, India',
      education: 'MBA, IIM Ahmedabad',
      income: '₹45L+ annually',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=640',
      verified: false,
      verificationStatus: 'PENDING',
      documentType: 'Passport',
      documentUrl: 'https://assets.mixkit.co/images/preview/mixkit-passport-proof-902-large.jpg',
      bio: 'Professional sharing wonderful moments.'
    },
    createdAt: '2026-03-02T08:00:00Z'
  },
  {
    id: 'u-3',
    email: 'ananya.iyer@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    communityId: 'c-5',
    communityName: 'Brahmin',
    profile: {
      id: 'p-3',
      name: 'Ananya Iyer',
      age: 25,
      gender: 'Female',
      occupation: 'Creative Director',
      location: 'Chennai, India',
      education: 'B.Des, NID',
      income: '₹20L+ annually',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=640',
      verified: true,
      verificationStatus: 'APPROVED',
      documentType: 'Aadhaar Card',
      documentUrl: 'https://assets.mixkit.co/images/preview/mixkit-card-proof-903-large.jpg',
      bio: 'Creative soul with a love for arts.'
    },
    createdAt: '2026-03-03T08:00:00Z'
  },
  {
    id: 'u-4',
    email: 'rohan.das@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    communityId: 'c-1',
    communityName: 'Maratha',
    profile: {
      id: 'p-4',
      name: 'Rohan Patil',
      age: 31,
      gender: 'Male',
      occupation: 'Architect & Designer',
      location: 'Pune, India',
      education: 'M.Arch, CEPT',
      income: '₹25L+ annually',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=640',
      verified: false,
      verificationStatus: 'PENDING',
      documentType: 'Driving License',
      documentUrl: 'https://assets.mixkit.co/images/preview/mixkit-licence-proof-904-large.jpg',
      bio: 'Passionate about building homes and life.'
    },
    createdAt: '2026-03-04T08:00:00Z'
  },
  {
    id: 'u-5',
    email: 'siddharth.mali@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    communityId: 'c-3',
    communityName: 'Mali',
    profile: {
      id: 'p-5',
      name: 'Siddharth Mali',
      age: 27,
      gender: 'Male',
      occupation: 'Horticulturist Specialist',
      location: 'Nashik, India',
      education: 'B.Sc Agriculture',
      income: '₹12L+ annually',
      imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=640',
      verified: false,
      verificationStatus: 'REQUEST_REUPLOAD',
      documentType: 'Aadhaar Card',
      documentUrl: '',
      bio: 'Passionate about plants, seeking simple life partner.'
    },
    createdAt: '2026-03-05T08:00:00Z'
  },
  {
    id: 'u-6',
    email: 'deepali.kunbi@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    communityId: 'c-2',
    communityName: 'Kunbi',
    profile: {
      id: 'p-6',
      name: 'Deepali Shinde',
      age: 24,
      gender: 'Female',
      occupation: 'High School Teacher',
      location: 'Satara, India',
      education: 'M.A., B.Ed',
      income: '₹8L+ annually',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=640',
      verified: false,
      verificationStatus: 'PENDING',
      documentType: 'Passport',
      documentUrl: 'https://assets.mixkit.co/images/preview/mixkit-passport-proof-905-large.jpg',
      bio: 'Educated, warm, nature lover looking for a partner.'
    },
    createdAt: '2026-03-06T08:00:00Z'
  },
  {
    id: 'u-7',
    email: 'rahul.kunbi@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    communityId: 'c-2',
    communityName: 'Kunbi',
    profile: {
      id: 'p-7',
      name: 'Rahul Nikam',
      age: 28,
      gender: 'Male',
      occupation: 'Govt Contractor',
      location: 'Kolhapur, India',
      education: 'B.E. Civil',
      income: '₹18L+ annually',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=640',
      verified: true,
      verificationStatus: 'APPROVED',
      documentType: 'Aadhaar Card',
      documentUrl: 'https://assets.mixkit.co/images/preview/mixkit-proof-906-large.jpg',
      bio: 'Determined contractor, strong believer of moral values.'
    },
    createdAt: '2026-03-07T08:00:00Z'
  },
  {
    id: 'u-8',
    email: 'meera.jain@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    communityId: 'c-6',
    communityName: 'Jain',
    profile: {
      id: 'p-8',
      name: 'Meera Shah',
      age: 26,
      gender: 'Female',
      occupation: 'Chartered Accountant',
      location: 'Ahmedabad, India',
      education: 'CA, ICAI',
      income: '₹22L+ annually',
      imageUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=640',
      verified: true,
      verificationStatus: 'APPROVED',
      documentType: 'Pan Card',
      documentUrl: 'https://assets.mixkit.co/images/preview/mixkit-proof-907-large.jpg',
      bio: 'CA professional, loves reading, seeks an educated partner.'
    },
    createdAt: '2026-03-08T08:00:00Z'
  },
  {
    id: 'u-9',
    email: 'vikram.maratha@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    communityId: 'c-1',
    communityName: 'Maratha',
    profile: {
      id: 'p-9',
      name: 'Vikram Sawant',
      age: 30,
      gender: 'Male',
      occupation: 'Assistant Police Inspector',
      location: 'Thane, India',
      education: 'B.Sc Chemistry, MPSC',
      income: '₹14L+ annually',
      imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=640',
      verified: true,
      verificationStatus: 'APPROVED',
      documentType: 'Aadhaar Card',
      documentUrl: 'https://assets.mixkit.co/images/preview/mixkit-proof-908-large.jpg',
      bio: 'In uniform serving society, grounded family boy.'
    },
    createdAt: '2026-03-09T08:00:00Z'
  },
  {
    id: 'u-10',
    email: 'snehal.maratha@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    communityId: 'c-1',
    communityName: 'Maratha',
    profile: {
      id: 'p-10',
      name: 'Snehal Patil',
      age: 25,
      gender: 'Female',
      occupation: 'Research Scientist',
      location: 'Pune, India',
      education: 'Ph.D Biotechnology',
      income: '₹16L+ annually',
      imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=640',
      verified: false,
      verificationStatus: 'PENDING',
      documentType: 'Passport',
      documentUrl: 'https://assets.mixkit.co/images/preview/mixkit-proof-909-large.jpg',
      bio: 'Inquisitive scientist loving literature and treks.'
    },
    createdAt: '2026-03-10T08:00:00Z'
  }
];

let auditLogs = [
  { id: 'log-1', action: 'APPROVE_PROFILE', username: 'maratha_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Vikram Sawant (API)', ipAddress: '192.168.1.42', createdAt: '2026-07-07T12:00:00Z' },
  { id: 'log-2', action: 'CREATE_COMMUNITY', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Created community "Lingayat"', ipAddress: '10.0.0.12', createdAt: '2026-07-06T14:30:00Z' },
  { id: 'log-3', action: 'ADD_ADMIN', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Assigned kunbi_admin to community "Kunbi"', ipAddress: '10.0.0.12', createdAt: '2026-07-05T10:15:00Z' },
  { id: 'log-4', action: 'REQUEST_REUPLOAD', username: 'mali_admin', role: 'COMMUNITY_ADMIN', details: 'Requested document re-upload for Siddharth Mali', ipAddress: '172.16.2.11', createdAt: '2026-07-04T16:22:00Z' },
  { id: 'log-5', action: 'APPROVE_PROFILE', username: 'brahmin_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Neha Joshi', ipAddress: '192.168.4.15', createdAt: '2026-07-03T09:12:00Z' },
  { id: 'log-6', action: 'SUSPEND_USER', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Suspended fraudulent account spammer@fake.com', ipAddress: '10.0.0.12', createdAt: '2026-07-03T11:45:00Z' },
  { id: 'log-7', action: 'UPDATE_SETTINGS', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Updated global terms and conditions', ipAddress: '10.0.0.12', createdAt: '2026-07-03T15:00:00Z' },
  { id: 'log-8', action: 'APPROVE_PROFILE', username: 'maratha_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Rahul Shinde', ipAddress: '192.168.1.10', createdAt: '2026-07-02T10:30:00Z' },
  { id: 'log-9', action: 'DEPLOY_BROADCAST', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Deployed notification: System Maintenance Scheduled', ipAddress: '10.0.0.12', createdAt: '2026-07-01T08:00:00Z' },
  { id: 'log-10', action: 'APPROVE_PROFILE', username: 'kunbi_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Suresh Patil', ipAddress: '192.168.2.22', createdAt: '2026-07-01T11:20:00Z' },
  { id: 'log-11', action: 'REJECT_PROFILE', username: 'brahmin_admin', role: 'COMMUNITY_ADMIN', details: 'Rejected profile verification of Amit Kulkarni due to blurry document', ipAddress: '192.168.4.15', createdAt: '2026-07-01T14:15:00Z' },
  { id: 'log-12', action: 'ADD_ADMIN', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Assigned brahmin_admin to Brahmin Community', ipAddress: '10.0.0.12', createdAt: '2026-07-01T16:40:00Z' },
  { id: 'log-13', action: 'APPROVE_PROFILE', username: 'maratha_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Priya Deshmukh', ipAddress: '192.168.1.33', createdAt: '2026-06-30T10:00:00Z' },
  { id: 'log-14', action: 'CREATE_COMMUNITY', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Created community "Brahmin"', ipAddress: '10.0.0.12', createdAt: '2026-06-30T14:00:00Z' },
  { id: 'log-15', action: 'APPROVE_PROFILE', username: 'mali_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Snehal Mali', ipAddress: '172.16.2.45', createdAt: '2026-06-29T11:50:00Z' },
  { id: 'log-16', action: 'DEPLOY_BROADCAST', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Deployed notification: Community Get Together', ipAddress: '10.0.0.12', createdAt: '2026-06-28T09:15:00Z' },
  { id: 'log-17', action: 'APPROVE_PROFILE', username: 'maratha_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Rohit Pawar', ipAddress: '192.168.1.14', createdAt: '2026-06-28T10:45:00Z' },
  { id: 'log-18', action: 'APPROVE_PROFILE', username: 'kunbi_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Kiran Gite', ipAddress: '192.168.2.11', createdAt: '2026-06-28T13:00:00Z' },
  { id: 'log-19', action: 'SUSPEND_USER', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Suspended suspicious profile test1@xyz.com', ipAddress: '10.0.0.12', createdAt: '2026-06-28T15:20:00Z' },
  { id: 'log-20', action: 'UPDATE_SETTINGS', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Updated contact email configuration', ipAddress: '10.0.0.12', createdAt: '2026-06-28T17:10:00Z' },
  { id: 'log-21', action: 'APPROVE_PROFILE', username: 'mali_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Jayesh Phadtare', ipAddress: '172.16.2.11', createdAt: '2026-06-26T09:30:00Z' },
  { id: 'log-22', action: 'APPROVE_PROFILE', username: 'maratha_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Aniket Patil', ipAddress: '192.168.1.42', createdAt: '2026-06-26T14:40:00Z' },
  { id: 'log-23', action: 'APPROVE_PROFILE', username: 'kunbi_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Meera Kadam', ipAddress: '192.168.2.11', createdAt: '2026-06-25T11:00:00Z' },
  { id: 'log-24', action: 'DEPLOY_BROADCAST', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Deployed notification: Welcome new users', ipAddress: '10.0.0.12', createdAt: '2026-06-25T13:30:00Z' },
  { id: 'log-25', action: 'APPROVE_PROFILE', username: 'mali_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Dipak Mali', ipAddress: '172.16.2.22', createdAt: '2026-06-25T16:15:00Z' },
  { id: 'log-26', action: 'APPROVE_PROFILE', username: 'maratha_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Pooja Raje', ipAddress: '192.168.1.12', createdAt: '2026-06-22T10:15:00Z' },
  { id: 'log-27', action: 'APPROVE_PROFILE', username: 'kunbi_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Nilesh Patil', ipAddress: '192.168.2.40', createdAt: '2026-06-20T09:00:00Z' },
  { id: 'log-28', action: 'APPROVE_PROFILE', username: 'mali_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Varsha Mali', ipAddress: '172.16.2.12', createdAt: '2026-06-20T11:45:00Z' },
  { id: 'log-29', action: 'CREATE_COMMUNITY', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Created community "Mali"', ipAddress: '10.0.0.12', createdAt: '2026-06-20T14:20:00Z' },
  { id: 'log-30', action: 'ADD_ADMIN', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Assigned mali_admin to community "Mali"', ipAddress: '10.0.0.12', createdAt: '2026-06-20T16:00:00Z' },
  { id: 'log-31', action: 'APPROVE_PROFILE', username: 'maratha_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Amol Sawant', ipAddress: '192.168.1.20', createdAt: '2026-06-18T10:10:00Z' },
  { id: 'log-32', action: 'DEPLOY_BROADCAST', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Deployed notification: Admin Guideline Update', ipAddress: '10.0.0.12', createdAt: '2026-06-18T14:30:00Z' },
  { id: 'log-33', action: 'APPROVE_PROFILE', username: 'kunbi_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Sachin Shinde', ipAddress: '192.168.2.14', createdAt: '2026-06-15T09:20:00Z' },
  { id: 'log-34', action: 'APPROVE_PROFILE', username: 'maratha_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Ganesh Pawar', ipAddress: '192.168.1.18', createdAt: '2026-06-15T11:15:00Z' },
  { id: 'log-35', action: 'SUSPEND_USER', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Suspended suspicious account bot@spam.com', ipAddress: '10.0.0.12', createdAt: '2026-06-15T15:00:00Z' },
  { id: 'log-36', action: 'APPROVE_PROFILE', username: 'kunbi_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Tushar Gite', ipAddress: '192.168.2.14', createdAt: '2026-06-12T10:30:00Z' },
  { id: 'log-37', action: 'CREATE_COMMUNITY', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Created community "Kunbi"', ipAddress: '10.0.0.12', createdAt: '2026-06-10T14:00:00Z' },
  { id: 'log-38', action: 'ADD_ADMIN', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Assigned kunbi_admin to community "Kunbi"', ipAddress: '10.0.0.12', createdAt: '2026-06-10T15:30:00Z' },
  { id: 'log-39', action: 'APPROVE_PROFILE', username: 'maratha_admin', role: 'COMMUNITY_ADMIN', details: 'Approved profile verification of Manoj Deshmukh', ipAddress: '192.168.1.10', createdAt: '2026-06-10T11:00:00Z' },
  { id: 'log-40', action: 'DEPLOY_BROADCAST', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Deployed notification: Registration Guide', ipAddress: '10.0.0.12', createdAt: '2026-06-10T09:00:00Z' },
  { id: 'log-41', action: 'CREATE_COMMUNITY', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Created community "Maratha"', ipAddress: '10.0.0.12', createdAt: '2026-06-08T14:00:00Z' },
  { id: 'log-42', action: 'ADD_ADMIN', username: 'SuperAdmin', role: 'SUPER_ADMIN', details: 'Assigned maratha_admin to community "Maratha"', ipAddress: '10.0.0.12', createdAt: '2026-06-08T15:30:00Z' }
];

let notifications = [
  { id: 'not-1', title: 'System Maintenance Scheduled', message: 'The SoulMate database will undergo maintenance on Sunday from 2 AM to 4 AM UTC.', recipientType: 'ALL_USERS', createdAt: '2026-07-07T08:00:00Z' },
  { id: 'not-2', title: 'Community Get Together', message: 'Annual family gather event scheduled in Pune this weekend.', recipientType: 'SPECIFIC_COMMUNITY', communityName: 'Maratha', createdAt: '2026-07-05T10:00:00Z' },
  { id: 'not-3', title: 'Admin Guideline Update', message: 'Please ensure verification reviews are handled within 48 hours of upload.', recipientType: 'COMMUNITY_ADMINS', createdAt: '2026-07-01T09:00:00Z' }
];

let appSettings = {
  websiteName: 'SoulMate Matrimony Portal',
  logo: '💖 SoulMate',
  banner: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200',
  contactDetails: 'support@soulmate.org | +91 98765 43210',
  privacyPolicy: 'Your privacy is absolutely safe. We protect your photos and personal identification documents with strict enterprise end-to-end encryption.',
  termsAndConditions: 'All members must verify their identity using a valid official government proof. Impersonation, fake profiles, and commercial activities are strictly grounds for immediate account termination.'
};

// ==========================================
// SUBSCRIPTION & PAYMENT DATABASE STATE
// ==========================================

let subscriptionPlans = [
  { id: 'plan-free', name: 'Free Plan', price: 0, durationMonths: 0, badge: '', features: ['Create Profile', 'Search Profiles', 'Upload 3 Photos', 'Receive Interests', '20 Profile Views Per Day', 'No Chat', 'No Contact Details', 'Ads Enabled'] },
  { id: 'plan-silver', name: 'Silver Plan', price: 499, durationMonths: 3, badge: 'Silver', features: ['Unlimited Profile Views', 'Unlimited Interests', 'Chat After Interest Acceptance', 'View Contact Number', 'View Email', 'No Ads'] },
  { id: 'plan-gold', name: 'Gold Plan', price: 999, durationMonths: 6, badge: 'Premium', features: ['Everything in Silver', 'Premium Badge', 'Highlighted Profile', 'Top Search Ranking', 'Unlimited Chat', 'Advanced Filters', 'View Who Visited Profile', 'Read Receipts', 'Faster Verification'] },
  { id: 'plan-platinum', name: 'Platinum Plan', price: 1999, durationMonths: 12, badge: 'VIP', features: ['Everything in Gold', 'VIP Badge', 'AI Match Recommendation', 'Weekly Profile Boost', 'Dedicated Relationship Manager', 'Unlimited Video Calls', 'Highest Search Priority', 'Exclusive Premium Support'] }
];

let userSubscriptions = [
  {
    id: 'sub-1',
    userId: 'u-1', // Default user
    planId: 'plan-free',
    planName: 'Free Plan',
    status: 'ACTIVE',
    amountPaid: 0,
    startDate: '2026-06-01T00:00:00Z',
    expiryDate: '2027-06-01T00:00:00Z',
    daysRemaining: 365,
    autoRenew: true
  },
  {
    id: 'sub-2',
    userId: 'u-2', // Arjun Mehta
    planId: 'plan-gold',
    planName: 'Gold Plan',
    status: 'ACTIVE',
    amountPaid: 999,
    startDate: '2026-05-15T12:00:00Z',
    expiryDate: '2026-11-15T12:00:00Z',
    daysRemaining: 130,
    autoRenew: true
  },
  {
    id: 'sub-3',
    userId: 'u-3', // Ananya Iyer
    planId: 'plan-platinum',
    planName: 'Platinum Plan',
    status: 'ACTIVE',
    amountPaid: 1999,
    startDate: '2026-04-10T10:00:00Z',
    expiryDate: '2027-04-10T10:00:00Z',
    daysRemaining: 276,
    autoRenew: false
  },
  {
    id: 'sub-4',
    userId: 'u-4', // Rohan Patil
    planId: 'plan-silver',
    planName: 'Silver Plan',
    status: 'EXPIRED',
    amountPaid: 499,
    startDate: '2026-03-01T09:00:00Z',
    expiryDate: '2026-06-01T09:00:00Z',
    daysRemaining: 0,
    autoRenew: false
  }
];

let coupons = [
  { code: 'SAVE100', type: 'FLAT', value: 100, expiryDate: '2026-12-31', usageLimit: 100, usageCount: 25, minPurchase: 499, maxDiscount: 100 },
  { code: 'FESTIVAL20', type: 'PERCENTAGE', value: 20, expiryDate: '2026-12-31', usageLimit: 200, usageCount: 42, minPurchase: 499, maxDiscount: 300 },
  { code: 'WELCOME50', type: 'PERCENTAGE', value: 50, expiryDate: '2026-12-31', usageLimit: 1000, usageCount: 512, minPurchase: 0, maxDiscount: 100 },
  { code: 'SOULMATE15', type: 'PERCENTAGE', value: 15, expiryDate: '2026-12-31', usageLimit: 500, usageCount: 88, minPurchase: 499, maxDiscount: 250 },
  { code: 'REFERRAL50', type: 'FLAT', value: 50, expiryDate: '2026-12-31', usageLimit: 50, usageCount: 12, minPurchase: 499, maxDiscount: 50 }
];

let payments: any[] = [
  { id: 'pay-1', userId: 'u-2', userName: 'Arjun Mehta', planId: 'plan-gold', planName: 'Gold Plan', amount: 999, discount: 0, finalAmount: 999, status: 'CAPTURED', razorpayOrderId: 'order_gold_112', razorpayPaymentId: 'pay_gold_112a', paymentMethod: 'UPI', createdAt: '2026-05-15T12:00:00Z' },
  { id: 'pay-2', userId: 'u-3', userName: 'Ananya Iyer', planId: 'plan-platinum', planName: 'Platinum Plan', amount: 1999, discount: 100, finalAmount: 1899, status: 'CAPTURED', razorpayOrderId: 'order_plat_113', razorpayPaymentId: 'pay_plat_113b', paymentMethod: 'Credit Card', createdAt: '2026-04-10T10:00:00Z' },
  { id: 'pay-3', userId: 'u-4', userName: 'Rohan Patil', planId: 'plan-silver', planName: 'Silver Plan', amount: 499, discount: 50, finalAmount: 449, status: 'CAPTURED', razorpayOrderId: 'order_silv_114', razorpayPaymentId: 'pay_silv_114c', paymentMethod: 'Netbanking', createdAt: '2026-03-01T09:00:00Z' },
  { id: 'pay-4', userId: 'u-5', userName: 'Siddharth Mali', planId: 'plan-silver', planName: 'Silver Plan', amount: 499, discount: 0, finalAmount: 499, status: 'FAILED', razorpayOrderId: 'order_silv_115', razorpayPaymentId: 'pay_silv_115f', paymentMethod: 'UPI', createdAt: '2026-07-01T15:00:00Z' },
  { id: 'pay-5', userId: 'u-1', userName: 'Arnav Singh', planId: 'plan-silver', planName: 'Silver Plan', amount: 499, discount: 100, finalAmount: 399, status: 'CAPTURED', razorpayOrderId: 'order_silv_116', razorpayPaymentId: 'pay_silv_116d', paymentMethod: 'UPI', createdAt: '2026-07-06T10:00:00Z' }
];

let invoices = [
  { id: 'inv-1', paymentId: 'pay-1', invoiceNo: 'INV-2026-001', userId: 'u-2', customerName: 'Arjun Mehta', planName: 'Gold Plan', paymentMethod: 'UPI', subTotal: 846.61, gst: 152.39, discount: 0, total: 999, status: 'PAID', createdAt: '2026-05-15T12:00:00Z' },
  { id: 'inv-2', paymentId: 'pay-2', invoiceNo: 'INV-2026-002', userId: 'u-3', customerName: 'Ananya Iyer', planName: 'Platinum Plan', paymentMethod: 'Credit Card', subTotal: 1609.32, gst: 289.68, discount: 100, total: 1899, status: 'PAID', createdAt: '2026-04-10T10:00:00Z' },
  { id: 'inv-3', paymentId: 'pay-3', invoiceNo: 'INV-2026-003', userId: 'u-4', customerName: 'Rohan Patil', planName: 'Silver Plan', paymentMethod: 'Netbanking', subTotal: 380.51, gst: 68.49, discount: 50, total: 449, status: 'PAID', createdAt: '2026-03-01T09:00:00Z' },
  { id: 'inv-4', paymentId: 'pay-5', invoiceNo: 'INV-2026-004', userId: 'u-1', customerName: 'Arnav Singh', planName: 'Silver Plan', paymentMethod: 'UPI', subTotal: 338.14, gst: 60.86, discount: 100, total: 399, status: 'PAID', createdAt: '2026-07-06T10:00:00Z' }
];

let subscriptionHistory = [
  { id: 'his-1', userId: 'u-2', planName: 'Gold Plan', action: 'UPGRADE', date: '2026-05-15T12:00:00Z' },
  { id: 'his-2', userId: 'u-3', planName: 'Platinum Plan', action: 'UPGRADE', date: '2026-04-10T10:00:00Z' },
  { id: 'his-3', userId: 'u-4', planName: 'Silver Plan', action: 'UPGRADE', date: '2026-03-01T09:00:00Z' },
  { id: 'his-4', userId: 'u-1', planName: 'Silver Plan', action: 'UPGRADE', date: '2026-07-06T10:00:00Z' }
];

let paymentWebhooks = [];

// ==========================================
// MIDDLEWARES
// ==========================================

// Mock checking authorization using simulated JWT tokens passed in Headers
function checkAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing.' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (token === 'super-admin-token') {
    req.user = { id: 'sa-1', username: 'SuperAdmin', role: 'SUPER_ADMIN', email: 'admin@soulmate.org' };
    return next();
  } else if (token.startsWith('comm-admin-')) {
    const adminId = token.replace('comm-admin-', '');
    const found = admins.find(a => a.id === adminId);
    if (!found || found.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Community Admin account is inactive or suspended.' });
    }
    req.user = { id: found.id, username: found.username, role: 'COMMUNITY_ADMIN', email: found.email, communityId: found.communityId, communityName: found.communityName };
    return next();
  } else if (token === 'user-token') {
    req.user = { id: 'u-1', username: 'arnav', role: 'USER', email: 'arnav@soulmate.org', communityId: 'c-1' };
    return next();
  }

  return res.status(401).json({ error: 'Invalid authentication token.' });
}

// Check role capabilities
function checkRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of these roles: ${allowedRoles.join(', ')}` });
    }
    next();
  };
}

// Check assigned community permission logic for Community Admins (Caste Admins)
function checkCommunity(req: any, res: any, next: any) {
  if (req.user.role === 'SUPER_ADMIN') {
    return next(); // Super Admin can see any community
  }

  const targetCommunityId = req.query.communityId || req.body.communityId || req.params.communityId;
  
  if (req.user.role === 'COMMUNITY_ADMIN') {
    if (targetCommunityId && targetCommunityId !== req.user.communityId) {
      return res.status(403).json({ error: `Access restricted. You are only permitted to manage the ${req.user.communityName} community.` });
    }
  }
  next();
}

// Logger helper
function createAuditLog(action: string, username: string, role: string, details: string, ip: string = '127.0.0.1') {
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    action,
    username,
    role: role as any,
    details,
    ipAddress: ip,
    createdAt: new Date().toISOString()
  });
}

// ==========================================
// REST APIS
// ==========================================

// Authenticate / Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    createAuditLog('LOGIN', 'SuperAdmin', 'SUPER_ADMIN', 'Super admin logged into portal');
    return res.json({
      token: 'super-admin-token',
      user: { id: 'sa-1', username: 'SuperAdmin', role: 'SUPER_ADMIN', email: 'admin@soulmate.org' }
    });
  }

  // Find community admin
  const foundAdmin = admins.find(a => a.username === username);
  if (foundAdmin && password === 'admin123') {
    if (foundAdmin.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your community admin account is suspended.' });
    }
    createAuditLog('LOGIN', foundAdmin.username, 'COMMUNITY_ADMIN', `Logged into assigned community: ${foundAdmin.communityName}`);
    return res.json({
      token: `comm-admin-${foundAdmin.id}`,
      user: { id: foundAdmin.id, username: foundAdmin.username, role: 'COMMUNITY_ADMIN', email: foundAdmin.email, communityId: foundAdmin.communityId, communityName: foundAdmin.communityName }
    });
  }

  return res.status(401).json({ error: 'Incorrect username or password. Use "admin" / "admin123" for testing!' });
});

app.get('/api/auth/me', checkAuth, (req, res) => {
  res.json({ user: req.user });
});

// ---------------------
// SUPER ADMIN ENDPOINTS
// ---------------------

// Communities Management
app.get('/api/super/communities', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  res.json(communities);
});

app.post('/api/super/communities', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Community name is required.' });

  const exists = communities.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (exists) return res.status(400).json({ error: 'Community already exists.' });

  const newComm = {
    id: `c-${Date.now()}`,
    name,
    description: description || 'No description provided.',
    isActive: true,
    userCount: 0,
    createdAt: new Date().toISOString()
  };
  communities.push(newComm);
  createAuditLog('CREATE_COMMUNITY', 'SuperAdmin', 'SUPER_ADMIN', `Created community "${name}"`);
  res.status(201).json(newComm);
});

app.put('/api/super/communities/:id', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;
  const found = communities.find(c => c.id === id);
  if (!found) return res.status(404).json({ error: 'Community not found.' });

  if (name) found.name = name;
  if (description !== undefined) found.description = description;
  if (isActive !== undefined) found.isActive = isActive;

  createAuditLog('UPDATE_COMMUNITY', 'SuperAdmin', 'SUPER_ADMIN', `Updated community "${found.name}" state`);
  res.json(found);
});

app.delete('/api/super/communities/:id', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  const { id } = req.params;
  const foundIndex = communities.findIndex(c => c.id === id);
  if (foundIndex === -1) return res.status(404).json({ error: 'Community not found.' });

  const name = communities[foundIndex].name;
  communities.splice(foundIndex, 1);
  createAuditLog('DELETE_COMMUNITY', 'SuperAdmin', 'SUPER_ADMIN', `Deleted community "${name}"`);
  res.json({ success: true, message: `Community ${name} deleted successfully.` });
});

// Community Admins Management
app.get('/api/super/admins', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  res.json(admins);
});

app.post('/api/super/admins', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  const { username, email, communityId } = req.body;
  if (!username || !email || !communityId) {
    return res.status(400).json({ error: 'Username, email and community assignment are all required.' });
  }

  // Each community can only have one active admin
  const existingActiveAdmin = admins.find(a => a.communityId === communityId && a.status === 'ACTIVE');
  if (existingActiveAdmin) {
    return res.status(400).json({ error: `This community already has an active Admin: ${existingActiveAdmin.username}` });
  }

  const comm = communities.find(c => c.id === communityId);
  if (!comm) return res.status(400).json({ error: 'Selected community does not exist.' });

  const newAdmin = {
    id: `adm-${Date.now()}`,
    username,
    email,
    communityId,
    communityName: comm.name,
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString()
  };
  admins.push(newAdmin);
  createAuditLog('ADD_ADMIN', 'SuperAdmin', 'SUPER_ADMIN', `Added admin "${username}" to "${comm.name}"`);
  res.status(201).json(newAdmin);
});

app.delete('/api/super/admins/:id', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  const { id } = req.params;
  const index = admins.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Admin not found.' });

  const username = admins[index].username;
  admins.splice(index, 1);
  createAuditLog('REMOVE_ADMIN', 'SuperAdmin', 'SUPER_ADMIN', `Removed admin "${username}"`);
  res.json({ success: true });
});

app.put('/api/super/admins/:id/suspend', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'ACTIVE' or 'SUSPENDED'
  const found = admins.find(a => a.id === id);
  if (!found) return res.status(404).json({ error: 'Admin not found.' });

  found.status = status;
  createAuditLog('TOGGLE_ADMIN_STATUS', 'SuperAdmin', 'SUPER_ADMIN', `Changed admin "${found.username}" status to ${status}`);
  res.json(found);
});

// ---------------------------
// GENERAL USER DATA ENDPOINTS (PROXIED / RBAC PROTECTED)
// ---------------------------

app.get('/api/users', checkAuth, checkCommunity, (req, res) => {
  let result = [...users];
  
  // Community Admin restrictions
  if (req.user.role === 'COMMUNITY_ADMIN') {
    result = result.filter(u => u.communityId === req.user.communityId);
  }

  // Optional query filter
  if (req.query.communityId) {
    result = result.filter(u => u.communityId === req.query.communityId);
  }

  res.json(result);
});

// Edit profile
app.put('/api/users/:id', checkAuth, checkCommunity, (req, res) => {
  const { id } = req.params;
  const foundUser = users.find(u => u.id === id);
  if (!foundUser) return res.status(404).json({ error: 'User not found.' });

  if (req.user.role === 'COMMUNITY_ADMIN' && foundUser.communityId !== req.user.communityId) {
    return res.status(403).json({ error: 'Access denied to this community user.' });
  }

  const { name, age, gender, occupation, location, education, income, bio } = req.body;
  if (foundUser.profile) {
    if (name) foundUser.profile.name = name;
    if (age) foundUser.profile.age = Number(age);
    if (gender) foundUser.profile.gender = gender;
    if (occupation) foundUser.profile.occupation = occupation;
    if (location) foundUser.profile.location = location;
    if (education) foundUser.profile.education = education;
    if (income) foundUser.profile.income = income;
    if (bio !== undefined) foundUser.profile.bio = bio;
  }

  createAuditLog('UPDATE_PROFILE', req.user.username, req.user.role, `Updated profile of ${foundUser.profile?.name || foundUser.email}`);
  res.json(foundUser);
});

// Suspend/Deactivate user
app.put('/api/users/:id/status', checkAuth, checkCommunity, (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'ACTIVE' or 'SUSPENDED'
  const foundUser = users.find(u => u.id === id);
  if (!foundUser) return res.status(404).json({ error: 'User not found.' });

  if (req.user.role === 'COMMUNITY_ADMIN' && foundUser.communityId !== req.user.communityId) {
    return res.status(403).json({ error: 'Access denied to this community user.' });
  }

  foundUser.status = status;
  createAuditLog('TOGGLE_USER_STATUS', req.user.username, req.user.role, `Set status of user "${foundUser.email}" to ${status}`);
  res.json(foundUser);
});

// Verify profile / Approve or Reject
app.put('/api/users/:id/verify', checkAuth, checkCommunity, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body; // 'APPROVED', 'REJECTED', 'REQUEST_REUPLOAD'
  const foundUser = users.find(u => u.id === id);
  if (!foundUser) return res.status(404).json({ error: 'User not found.' });

  if (req.user.role === 'COMMUNITY_ADMIN' && foundUser.communityId !== req.user.communityId) {
    return res.status(403).json({ error: 'Access denied to this community user.' });
  }

  if (foundUser.profile) {
    foundUser.profile.verificationStatus = status;
    foundUser.profile.verified = (status === 'APPROVED');
  }

  createAuditLog('VERIFY_PROFILE', req.user.username, req.user.role, `Set verification status of "${foundUser.profile?.name}" to ${status} (Notes: ${notes || 'none'})`);
  res.json(foundUser);
});

// Delete user (SUPER_ADMIN ONLY. Caste admin CANNOT delete database records!)
app.delete('/api/users/:id', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'User not found.' });

  const name = users[index].profile?.name || users[index].email;
  users.splice(index, 1);
  createAuditLog('DELETE_USER', 'SuperAdmin', 'SUPER_ADMIN', `Permanently deleted user database record: "${name}"`);
  res.json({ success: true });
});

// ---------------------------
// AUDIT LOGS, NOTIFICATIONS, & SETTINGS
// ---------------------------

app.get('/api/audit-logs', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  res.json(auditLogs);
});

app.get('/api/notifications', checkAuth, (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications', checkAuth, (req, res) => {
  const { title, message, recipientType, communityId } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Title and message are required.' });

  let commName = undefined;
  if (recipientType === 'SPECIFIC_COMMUNITY' && communityId) {
    const found = communities.find(c => c.id === communityId);
    commName = found?.name;
  }

  const newNotif = {
    id: `not-${Date.now()}`,
    title,
    message,
    recipientType,
    communityName: commName,
    createdAt: new Date().toISOString()
  };
  notifications.unshift(newNotif);
  createAuditLog('BROADCAST_NOTIFICATION', req.user.username, req.user.role, `Broadcast announcement: "${title}" to ${recipientType}`);
  res.status(201).json(newNotif);
});

app.get('/api/settings', (req, res) => {
  res.json(appSettings);
});

app.put('/api/settings', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  const { websiteName, logo, banner, contactDetails, privacyPolicy, termsAndConditions } = req.body;
  
  if (websiteName) appSettings.websiteName = websiteName;
  if (logo) appSettings.logo = logo;
  if (banner) appSettings.banner = banner;
  if (contactDetails) appSettings.contactDetails = contactDetails;
  if (privacyPolicy) appSettings.privacyPolicy = privacyPolicy;
  if (termsAndConditions) appSettings.termsAndConditions = termsAndConditions;

  createAuditLog('UPDATE_SETTINGS', 'SuperAdmin', 'SUPER_ADMIN', 'Updated global matrimony configuration');
  res.json(appSettings);
});

// ------------------------------------------
// SUBSCRIPTION & PAYMENT GATEWAY API ROUTES
// ------------------------------------------

// Get user's current subscription details
app.get('/api/subscription/current', checkAuth, (req, res) => {
  const userId = req.user.id;
  let sub = userSubscriptions.find(s => s.userId === userId && s.status === 'ACTIVE');
  if (!sub) {
    // Fallback or create Free plan
    sub = {
      id: `sub-free-${userId}`,
      userId,
      planId: 'plan-free',
      planName: 'Free Plan',
      status: 'ACTIVE',
      amountPaid: 0,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 365,
      autoRenew: true
    };
  }
  res.json(sub);
});

// Create Razorpay Order
app.post('/api/payment/create-order', checkAuth, async (req, res) => {
  const { planId, couponCode, isSandbox = false } = req.body;
  const plan = subscriptionPlans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ error: 'Subscription plan not found.' });

  let amount = plan.price;
  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon) {
      const today = new Date().toISOString().substring(0, 10);
      if (coupon.expiryDate >= today && coupon.usageCount < coupon.usageLimit && amount >= coupon.minPurchase) {
        appliedCoupon = coupon;
        if (coupon.type === 'FLAT') {
          discount = coupon.value;
        } else if (coupon.type === 'PERCENTAGE') {
          discount = Math.min((amount * coupon.value) / 100, coupon.maxDiscount || 99999);
        }
      }
    }
  }

  const finalAmount = Math.max(amount - discount, 0);
  const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 15)}`;

  // Create payment record in PENDING state
  const newPayment = {
    id: `pay-${Date.now()}`,
    userId: req.user.id,
    userName: req.user.username === 'SuperAdmin' ? 'SuperAdmin' : 'Arnav Singh', // Fallback for simulation
    planId,
    planName: plan.name,
    amount,
    discount,
    finalAmount,
    status: 'PENDING' as const,
    razorpayOrderId,
    paymentMethod: 'UPI',
    createdAt: new Date().toISOString()
  };
  payments.push(newPayment);

  // If Razorpay credentials are set AND we aren't explicitly forcing isSandbox, we can use Razorpay SDK:
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !isSandbox) {
    try {
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const order = await rzp.orders.create({
        amount: finalAmount * 100, // paise
        currency: 'INR',
        receipt: newPayment.id,
        notes: { planId, userId: req.user.id }
      });
      newPayment.razorpayOrderId = order.id;
      return res.json({
        success: true,
        orderId: order.id,
        amount: finalAmount,
        currency: 'INR',
        paymentId: newPayment.id,
        key: process.env.RAZORPAY_KEY_ID,
        isSandbox: false
      });
    } catch (err: any) {
      console.error('Razorpay Order Creation Failed, falling back to secure sandbox:', err.message);
    }
  }

  // Return sandbox / simulated credentials
  res.json({
    success: true,
    orderId: razorpayOrderId,
    amount: finalAmount,
    currency: 'INR',
    paymentId: newPayment.id,
    key: 'rzp_test_simulated_key_123',
    isSandbox: true
  });
});

// Verify Payment Signature
app.post('/api/payment/verify', checkAuth, (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, paymentId, isSandbox = false } = req.body;

  const paymentIndex = payments.findIndex(p => p.id === paymentId || p.razorpayOrderId === razorpay_order_id);
  if (paymentIndex === -1) return res.status(404).json({ error: 'Payment transaction record not found.' });

  const payment = payments[paymentIndex];

  // Signature verification
  let signatureVerified = false;
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && razorpay_signature && !isSandbox) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');
    signatureVerified = (generatedSignature === razorpay_signature);
  } else {
    // Sandbox / Simulator verified
    signatureVerified = true;
  }

  if (!signatureVerified) {
    payment.status = 'FAILED';
    createAuditLog('PAYMENT_FAILED', req.user.username, req.user.role, `Payment signature verification failed for order ${razorpay_order_id}`);
    return res.status(400).json({ error: 'Payment signature verification failed.' });
  }

  // Complete Payment
  payment.status = 'CAPTURED';
  payment.razorpayPaymentId = razorpay_payment_id || `pay_sim_${Math.random().toString(36).substring(2, 10)}`;
  payment.razorpaySignature = razorpay_signature || 'sim_sig_123';

  // Increment coupon usage
  const plan = subscriptionPlans.find(p => p.id === payment.planId);
  if (!plan) return res.status(400).json({ error: 'Plan details not found.' });

  // Update User Subscription State
  const durationMonths = plan.durationMonths;
  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setMonth(startDate.getMonth() + durationMonths);

  // Inactivate existing subscriptions for the user
  userSubscriptions.forEach(sub => {
    if (sub.userId === req.user.id) {
      sub.status = 'EXPIRED';
    }
  });

  const newSubId = `sub-${Date.now()}`;
  userSubscriptions.push({
    id: newSubId,
    userId: req.user.id,
    planId: plan.id,
    planName: plan.name,
    status: 'ACTIVE',
    amountPaid: payment.finalAmount,
    startDate: startDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    daysRemaining: durationMonths * 30,
    autoRenew: true
  });

  // Generate Invoice automatically
  const invoiceNo = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
  const total = payment.finalAmount;
  const subTotal = Number((total / 1.18).toFixed(2));
  const gst = Number((total - subTotal).toFixed(2));

  const newInvoice = {
    id: `inv-${Date.now()}`,
    paymentId: payment.id,
    invoiceNo,
    userId: req.user.id,
    customerName: req.user.username === 'SuperAdmin' ? 'SuperAdmin' : 'Arnav Singh',
    planName: plan.name,
    paymentMethod: payment.paymentMethod || 'UPI',
    subTotal,
    gst,
    discount: payment.discount,
    total,
    status: 'PAID',
    createdAt: new Date().toISOString()
  };
  invoices.push(newInvoice);

  // Add to Subscription History
  subscriptionHistory.unshift({
    id: `his-${Date.now()}`,
    userId: req.user.id,
    planName: plan.name,
    action: 'UPGRADE',
    date: new Date().toISOString()
  });

  createAuditLog(
    'SUBSCRIBE_UPGRADE',
    req.user.username,
    req.user.role,
    `Upgraded user ${req.user.username} to ${plan.name}. Amount paid: ₹${payment.finalAmount}`
  );

  res.json({
    success: true,
    message: 'Subscription activated successfully!',
    payment,
    invoice: newInvoice
  });
});

// Razorpay Webhook Endpoint
app.post('/api/payment/webhook', (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (secret && signature) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(req.body));
    const generatedSignature = hmac.digest('hex');
    if (generatedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }
  }

  const { event, payload } = req.body;
  paymentWebhooks.push({
    id: `wh-${Date.now()}`,
    event,
    payload,
    processedAt: new Date().toISOString()
  });

  console.log(`[Webhook Received] ${event}`);

  if (event === 'payment.captured' || event === 'order.paid') {
    const paymentEntity = payload.payment?.entity || payload.order?.entity;
    if (paymentEntity) {
      const orderId = paymentEntity.order_id;
      const paymentIndex = payments.findIndex(p => p.razorpayOrderId === orderId);
      if (paymentIndex !== -1 && payments[paymentIndex].status === 'PENDING') {
        payments[paymentIndex].status = 'CAPTURED';
        payments[paymentIndex].razorpayPaymentId = paymentEntity.id;
        
        // Activate subscription automatically
        const pay = payments[paymentIndex];
        const plan = subscriptionPlans.find(p => p.id === pay.planId);
        if (plan) {
          const startDate = new Date();
          const expiryDate = new Date();
          expiryDate.setMonth(startDate.getMonth() + plan.durationMonths);

          userSubscriptions.forEach(sub => {
            if (sub.userId === pay.userId) sub.status = 'EXPIRED';
          });

          userSubscriptions.push({
            id: `sub-wh-${Date.now()}`,
            userId: pay.userId,
            planId: plan.id,
            planName: plan.name,
            status: 'ACTIVE',
            amountPaid: pay.finalAmount,
            startDate: startDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
            daysRemaining: plan.durationMonths * 30,
            autoRenew: true
          });
        }
      }
    }
  } else if (event === 'payment.failed') {
    const paymentEntity = payload.payment?.entity;
    if (paymentEntity) {
      const orderId = paymentEntity.order_id;
      const paymentIndex = payments.findIndex(p => p.razorpayOrderId === orderId);
      if (paymentIndex !== -1) {
        payments[paymentIndex].status = 'FAILED';
      }
    }
  }

  res.json({ status: 'ok' });
});

// Coupon Validation API
app.post('/api/coupons/validate', checkAuth, (req, res) => {
  const { code, amount } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code is required.' });

  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (!coupon) return res.status(404).json({ error: 'Invalid coupon code.' });

  const today = new Date().toISOString().substring(0, 10);
  if (coupon.expiryDate < today) {
    return res.status(400).json({ error: 'This coupon has expired.' });
  }

  if (coupon.usageCount >= coupon.usageLimit) {
    return res.status(400).json({ error: 'This coupon usage limit has been exceeded.' });
  }

  if (amount < coupon.minPurchase) {
    return res.status(400).json({ error: `Minimum purchase amount of ₹${coupon.minPurchase} is required to apply this coupon.` });
  }

  let discount = 0;
  if (coupon.type === 'FLAT') {
    discount = coupon.value;
  } else if (coupon.type === 'PERCENTAGE') {
    discount = Math.min((amount * coupon.value) / 100, coupon.maxDiscount || 99999);
  }

  res.json({
    success: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
    finalAmount: Math.max(amount - discount, 0)
  });
});

// Upgrade Subscription Directly
app.post('/api/subscription/upgrade', checkAuth, (req, res) => {
  const { planId } = req.body;
  const plan = subscriptionPlans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ error: 'Subscription plan not found.' });

  userSubscriptions.forEach(sub => {
    if (sub.userId === req.user.id) sub.status = 'EXPIRED';
  });

  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setMonth(startDate.getMonth() + plan.durationMonths);

  const newSub = {
    id: `sub-direct-${Date.now()}`,
    userId: req.user.id,
    planId: plan.id,
    planName: plan.name,
    status: 'ACTIVE' as const,
    amountPaid: plan.price,
    startDate: startDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    daysRemaining: plan.durationMonths * 30,
    autoRenew: true
  };
  userSubscriptions.push(newSub);

  createAuditLog('SUBSCRIBE_UPGRADE', req.user.username, req.user.role, `Direct subscription upgrade of ${req.user.username} to ${plan.name}`);
  res.json(newSub);
});

// Renew Subscription
app.post('/api/subscription/renew', checkAuth, (req, res) => {
  const activeSub = userSubscriptions.find(s => s.userId === req.user.id && s.status === 'ACTIVE');
  if (!activeSub) return res.status(404).json({ error: 'No active subscription to renew.' });

  const plan = subscriptionPlans.find(p => p.id === activeSub.planId);
  if (!plan) return res.status(404).json({ error: 'Original subscription plan not found.' });

  const start = new Date(activeSub.expiryDate);
  const expiry = new Date(start);
  expiry.setMonth(start.getMonth() + plan.durationMonths);

  activeSub.expiryDate = expiry.toISOString();
  activeSub.status = 'ACTIVE';

  createAuditLog('SUBSCRIBE_RENEW', req.user.username, req.user.role, `Subscription renewed for user ${req.user.username}. Plan: ${activeSub.planName}`);
  res.json({ success: true, subscription: activeSub });
});

// Cancel Subscription
app.post('/api/subscription/cancel', checkAuth, (req, res) => {
  const activeSub = userSubscriptions.find(s => s.userId === req.user.id && s.status === 'ACTIVE');
  if (!activeSub) return res.status(404).json({ error: 'No active subscription found.' });

  activeSub.autoRenew = false;
  createAuditLog('SUBSCRIBE_CANCEL', req.user.username, req.user.role, `Auto-renewal cancelled for user ${req.user.username}. Plan: ${activeSub.planName}`);
  res.json({ success: true, subscription: activeSub });
});

// Get User's payment history
app.get('/api/payment/history', checkAuth, (req, res) => {
  if (req.user.role === 'SUPER_ADMIN') {
    return res.json(payments);
  }
  const userHistory = payments.filter(p => p.userId === req.user.id);
  res.json(userHistory);
});

// Get Invoice details
app.get('/api/payment/invoice/:id', checkAuth, (req, res) => {
  const { id } = req.params;
  const invoice = invoices.find(inv => inv.id === id || inv.paymentId === id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

  if (req.user.role !== 'SUPER_ADMIN' && invoice.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied to this invoice.' });
  }

  res.json(invoice);
});

// GET coupon list (Admin Dashboard)
app.get('/api/super/coupons', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  res.json(coupons);
});

// POST coupon (Admin Dashboard)
app.post('/api/super/coupons', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  const { code, type, value, expiryDate, usageLimit, minPurchase, maxDiscount } = req.body;
  if (!code || !type || value === undefined || !expiryDate) {
    return res.status(400).json({ error: 'Code, type, value, and expiryDate are required.' });
  }

  const existing = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (existing) return res.status(400).json({ error: `Coupon ${code} already exists.` });

  const newCoupon = {
    code: code.toUpperCase(),
    type,
    value: Number(value),
    expiryDate,
    usageLimit: Number(usageLimit || 100),
    usageCount: 0,
    minPurchase: Number(minPurchase || 0),
    maxDiscount: Number(maxDiscount || 99999)
  };
  coupons.push(newCoupon);
  createAuditLog('CREATE_COUPON', 'SuperAdmin', 'SUPER_ADMIN', `Created coupon: "${code}" (${type} : ${value})`);
  res.status(201).json(newCoupon);
});

// DELETE coupon (Admin Dashboard)
app.delete('/api/super/coupons/:code', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  const { code } = req.params;
  const index = coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
  if (index === -1) return res.status(404).json({ error: 'Coupon not found.' });

  coupons.splice(index, 1);
  createAuditLog('DELETE_COUPON', 'SuperAdmin', 'SUPER_ADMIN', `Deleted coupon code: "${code}"`);
  res.json({ success: true });
});

// GET Subscription Plans List
app.get('/api/subscription/plans', (req, res) => {
  res.json(subscriptionPlans);
});

// PUT Subscription Plans (Admin Dashboard edit)
app.put('/api/super/plans/:id', checkAuth, checkRole(['SUPER_ADMIN']), (req, res) => {
  const { id } = req.params;
  const { price, features } = req.body;

  const plan = subscriptionPlans.find(p => p.id === id);
  if (!plan) return res.status(404).json({ error: 'Plan not found.' });

  if (price !== undefined) plan.price = Number(price);
  if (features) plan.features = features;

  createAuditLog('EDIT_PLAN', 'SuperAdmin', 'SUPER_ADMIN', `Modified subscription plan limits for ${plan.name}`);
  res.json(plan);
});

// ==========================================
// VITE OR STATIC SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SoulMate running with Node/Express + Vite integration on port ${PORT}`);
  });
}

startServer();
